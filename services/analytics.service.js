// services/analytics.service.js
'use strict';

const Donation    = require('../models/donation.model');
const Request     = require('../models/request.model');
const User        = require('../models/user.model');
const Medicine    = require('../models/medicine.model');
const Institution = require('../models/institution.model');


function dateGroupFormat(period) {
  switch (period) {
    case 'daily':   return '%Y-%m-%d';
    case 'weekly':  return '%Y-%U';   // year + week-of-year
    case 'yearly':  return '%Y';
    default:        return '%Y-%m';   // monthly (default)
  }
}

/**
 * Return a { from, to } date pair from query params, defaulting to the
 * last 6 months when nothing is supplied.
 */
function resolveDateRange(query) {
  const to   = query.to   ? new Date(query.to)   : new Date();
  const from = query.from
    ? new Date(query.from)
    : new Date(to.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
  return { from, to };
}

/* ═══════════════════════════════════════════════════════════════
   DONATION ANALYTICS
   ═══════════════════════════════════════════════════════════════ */

/**
 * High-level donation overview: totals by status + key percentages.
 */
async function getDonationAnalytics() {
  const [byStatus, totals] = await Promise.all([
    Donation.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort:  { count: -1 } },
    ]),
    Donation.aggregate([
      {
        $group: {
          _id: null,
          total:     { $sum: 1 },
          delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
          pending:   { $sum: { $cond: [{ $eq: ['$status', 'pending']   }, 1, 0] } },
          expired:   { $sum: { $cond: [{ $eq: ['$status', 'expired']   }, 1, 0] } },
          matched:   { $sum: { $cond: [{ $eq: ['$status', 'matched']   }, 1, 0] } },
        },
      },
    ]),
  ]);

  const t = totals[0] || { total: 0, delivered: 0, pending: 0, expired: 0, matched: 0 };
  const deliveryRate = t.total ? ((t.delivered / t.total) * 100).toFixed(1) + '%' : '0%';

  return {
    summary: {
      total:        t.total,
      delivered:    t.delivered,
      pending:      t.pending,
      expired:      t.expired,
      matched:      t.matched,
      deliveryRate,
    },
    byStatus,
  };
}

/**
 * Donation count over time grouped by period.
 * @param {object} query  – period, from, to, limit
 */
async function getDonationTrends(query) {
  const { from, to }  = resolveDateRange(query);
  const format        = dateGroupFormat(query.period);
  const limit         = parseInt(query.limit, 10) || 12;

  const data = await Donation.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to } } },
    {
      $group: {
        _id:   { $dateToString: { format, date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort:  { _id: 1 } },
    { $limit: limit },
    { $project: { period: '$_id', count: 1, _id: 0 } },
  ]);

  return { period: query.period || 'monthly', from, to, data };
}

/**
 * Donations grouped by medicine category (via lookup on Medicine).
 */
async function getDonationCategories() {
  const data = await Donation.aggregate([
    {
      $lookup: {
        from:         'medicines',
        localField:   'medicine',
        foreignField: '_id',
        as:           'medicineInfo',
      },
    },
    { $unwind: { path: '$medicineInfo', preserveNullAndEmptyArrays: false } },
    {
      $group: {
        _id:   { $ifNull: ['$medicineInfo.category', 'Uncategorized'] },
        count: { $sum: 1 },
        totalQuantity: { $sum: '$quantity.amount' },
      },
    },
    { $sort:  { count: -1 } },
    { $project: { category: '$_id', count: 1, totalQuantity: 1, _id: 0 } },
  ]);

  return { data };
}



/* ═══════════════════════════════════════════════════════════════
   INSTITUTION ANALYTICS
   ═══════════════════════════════════════════════════════════════ */

async function getInstitutionAnalytics() {
  // Institution profile stats (type, verification) from Institution model
  const [profileSummary, byVerification] = await Promise.all([
    Institution.aggregate([
      {
        $group: {
          _id:      null,
          total:    { $sum: 1 },
          verified: { $sum: { $cond: [{ $eq: ['$verificationStatus', 'verified'] }, 1, 0] } },
          pending:  { $sum: { $cond: [{ $eq: ['$verificationStatus', 'pending']  }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$verificationStatus', 'rejected'] }, 1, 0] } },
        },
      },
    ]),
    Institution.aggregate([
      { $group: { _id: '$verificationStatus', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } },
    ]),
  ]);

  // Active/inactive from User model (isActive flag)
  const userSummary = await User.aggregate([
    { $match: { role: 'institution' } },
    {
      $group: {
        _id:    null,
        active: { $sum: { $cond: ['$isActive', 1, 0] } },
        total:  { $sum: 1 },
      },
    },
  ]);

  const p = profileSummary[0] || { total: 0, verified: 0, pending: 0, rejected: 0 };
  const u = userSummary[0]    || { total: 0, active: 0 };

  return {
    summary: {
      total:    p.total,
      verified: p.verified,
      pending:  p.pending,
      rejected: p.rejected,
      active:   u.active,
      inactive: u.total - u.active,
    },
    byVerificationStatus: byVerification,
  };
}

/**
 * Institution breakdown by type using the real Institution model.
 * Types: hospital | pharmacy | clinic | charity | medical_center | ngo | other
 */
async function getInstitutionsByType() {
  const data = await Institution.aggregate([
    {
      $group: {
        _id:   '$type',
        count: { $sum: 1 },
      },
    },
    { $sort:  { count: -1 } },
    { $project: { type: '$_id', count: 1, _id: 0 } },
  ]);

  return { data };
}

/**
 * Per-institution performance: donations received + requests created/fulfilled.
 * Uses the Institution model (with real name, type, governorate) joined to User.
 */
async function getInstitutionPerformance(query) {
  const limit = parseInt(query.limit, 10) || 10;

  const data = await Institution.aggregate([
    // Join to User to get isActive
    {
      $lookup: {
        from:         'users',
        localField:   'user',
        foreignField: '_id',
        as:           'userInfo',
      },
    },
    { $unwind: { path: '$userInfo', preserveNullAndEmpty: false } },
    // Join donations matched to this institution
    {
      $lookup: {
        from:         'donations',
        localField:   'user',
        foreignField: 'matchedInstitution',
        as:           'receivedDonations',
      },
    },
    // Join requests created by this institution (institution field = user._id)
    {
      $lookup: {
        from:         'requests',
        localField:   'user',
        foreignField: 'institution',
        as:           'createdRequests',
      },
    },
    {
      $project: {
        name:               '$name',
        type:               '$type',
        verificationStatus: '$verificationStatus',
        governorate: {
          $ifNull: [
            { $arrayElemAt: ['$addresses.governorate', 0] },
            'Unknown',
          ],
        },
        isActive:          '$userInfo.isActive',
        donationsReceived: { $size: '$receivedDonations' },
        requestsCreated:   { $size: '$createdRequests' },
        fulfilledRequests: {
          $size: {
            $filter: {
              input: '$createdRequests',
              cond:  { $eq: ['$$this.status', 'fulfilled'] },
            },
          },
        },
        statsFromModel: '$stats',
      },
    },
    { $sort:  { donationsReceived: -1 } },
    { $limit: limit },
  ]);

  return { data };
}

/* ═══════════════════════════════════════════════════════════════
   REQUEST ANALYTICS
   ═══════════════════════════════════════════════════════════════ */

async function getRequestAnalytics() {
  const [byStatus, totals, byPriority] = await Promise.all([
    Request.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort:  { count: -1 } },
    ]),
    Request.aggregate([
      {
        $group: {
          _id:       null,
          total:     { $sum: 1 },
          open:      { $sum: { $cond: [{ $eq: ['$status', 'open']           }, 1, 0] } },
          fulfilled: { $sum: { $cond: [{ $eq: ['$status', 'fulfilled']      }, 1, 0] } },
          partial:   { $sum: { $cond: [{ $eq: ['$status', 'partially_fulfilled'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled']      }, 1, 0] } },
          expired:   { $sum: { $cond: [{ $eq: ['$status', 'expired']        }, 1, 0] } },
        },
      },
    ]),
    Request.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort:  { count: -1 } },
    ]),
  ]);

  const t = totals[0] || { total: 0, open: 0, fulfilled: 0, partial: 0, cancelled: 0, expired: 0 };
  const fulfilledRate = t.total ? ((t.fulfilled / t.total) * 100).toFixed(1) + '%' : '0%';

  return {
    summary: {
      total:         t.total,
      open:          t.open,
      fulfilled:     t.fulfilled,
      partial:       t.partial,
      cancelled:     t.cancelled,
      expired:       t.expired,
      fulfilledRate,
    },
    byStatus,
    byPriority,
  };
}

async function getRequestTrends(query) {
  const { from, to } = resolveDateRange(query);
  const format       = dateGroupFormat(query.period);
  const limit        = parseInt(query.limit, 10) || 12;

  const data = await Request.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to } } },
    {
      $group: {
        _id:   { $dateToString: { format, date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort:  { _id: 1 } },
    { $limit: limit },
    { $project: { period: '$_id', count: 1, _id: 0 } },
  ]);

  return { period: query.period || 'monthly', from, to, data };
}

async function getRequestFulfillment() {
  const data = await Request.aggregate([
    {
      $group: {
        _id:   null,
        total:              { $sum: 1 },
        fullyFulfilled:     { $sum: { $cond: [{ $eq: ['$status', 'fulfilled']           }, 1, 0] } },
        partiallyFulfilled: { $sum: { $cond: [{ $eq: ['$status', 'partially_fulfilled'] }, 1, 0] } },
        unfulfilled:        { $sum: { $cond: [{ $eq: ['$status', 'open']                }, 1, 0] } },
        avgFulfillmentPct:  {
          $avg: {
            $cond: [
              { $gt: ['$requiredQuantity.amount', 0] },
              { $multiply: [{ $divide: ['$fulfilledQuantity', '$requiredQuantity.amount'] }, 100] },
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        total: 1,
        fullyFulfilled: 1,
        partiallyFulfilled: 1,
        unfulfilled: 1,
        avgFulfillmentPct: { $round: ['$avgFulfillmentPct', 1] },
        fullFulfillmentRate: {
          $cond: [
            { $gt: ['$total', 0] },
            { $round: [{ $multiply: [{ $divide: ['$fullyFulfilled', '$total'] }, 100] }, 1] },
            0,
          ],
        },
      },
    },
  ]);

  return data[0] || {
    total: 0,
    fullyFulfilled: 0,
    partiallyFulfilled: 0,
    unfulfilled: 0,
    avgFulfillmentPct: 0,
    fullFulfillmentRate: 0,
  };
}

/* ═══════════════════════════════════════════════════════════════
   MATCHING ANALYTICS
   ═══════════════════════════════════════════════════════════════ */

async function getMatchingAnalytics() {
  const data = await Donation.aggregate([
    {
      $group: {
        _id:     null,
        total:   { $sum: 1 },
        matched: { $sum: { $cond: [{ $in: ['$status', ['matched', 'approved', 'delivered']] }, 1, 0] } },
        delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
        unmatched: { $sum: { $cond: [{ $in: ['$status', ['pending', 'admin_review', 'available']] }, 1, 0] } },
      },
    },
    {
      $project: {
        _id: 0,
        total: 1,
        matched: 1,
        delivered: 1,
        unmatched: 1,
        matchRate: {
          $cond: [
            { $gt: ['$total', 0] },
            { $round: [{ $multiply: [{ $divide: ['$matched', '$total'] }, 100] }, 1] },
            0,
          ],
        },
      },
    },
  ]);

  return data[0] || { total: 0, matched: 0, delivered: 0, unmatched: 0, matchRate: 0 };
}

async function getMatchingSuccessRate() {
  const [byStatus, overall] = await Promise.all([
    Donation.aggregate([
      { $match: { matchedInstitution: { $exists: true } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort:  { count: -1 } },
    ]),
    Donation.aggregate([
      { $match: { matchedInstitution: { $exists: true } } },
      {
        $group: {
          _id:           null,
          totalMatched:  { $sum: 1 },
          successfullyDelivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
          rejectedByInstitution: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          totalMatched: 1,
          successfullyDelivered: 1,
          rejectedByInstitution: 1,
          successRate: {
            $cond: [
              { $gt: ['$totalMatched', 0] },
              { $round: [{ $multiply: [{ $divide: ['$successfullyDelivered', '$totalMatched'] }, 100] }, 1] },
              0,
            ],
          },
        },
      },
    ]),
  ]);

  return {
    overall: overall[0] || { totalMatched: 0, successfullyDelivered: 0, rejectedByInstitution: 0, successRate: 0 },
    byStatus,
  };
}

/**
 * Average time (in hours) from donation creation to first match.
 */
async function getMatchingEfficiency() {
  const [avgMatchTime, distribution] = await Promise.all([
    Donation.aggregate([
      { $match: { matchedAt: { $exists: true } } },
      {
        $project: {
          hoursToMatch: {
            $divide: [
              { $subtract: ['$matchedAt', '$createdAt'] },
              1000 * 60 * 60, // ms → hours
            ],
          },
        },
      },
      {
        $group: {
          _id:          null,
          avgHours:     { $avg: '$hoursToMatch' },
          minHours:     { $min: '$hoursToMatch' },
          maxHours:     { $max: '$hoursToMatch' },
          totalMatched: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          avgHours:     { $round: ['$avgHours',  1] },
          minHours:     { $round: ['$minHours',  1] },
          maxHours:     { $round: ['$maxHours',  1] },
          totalMatched: 1,
        },
      },
    ]),
    // Bucket donations by match-time range
    Donation.aggregate([
      { $match: { matchedAt: { $exists: true } } },
      {
        $project: {
          hoursToMatch: {
            $divide: [{ $subtract: ['$matchedAt', '$createdAt'] }, 1000 * 60 * 60],
          },
        },
      },
      {
        $bucket: {
          groupBy:    '$hoursToMatch',
          boundaries: [0, 24, 72, 168, 720, Infinity],
          default:    'over_720h',
          output:     { count: { $sum: 1 } },
        },
      },
    ]),
  ]);

  return {
    efficiency: avgMatchTime[0] || { avgHours: 0, minHours: 0, maxHours: 0, totalMatched: 0 },
    distribution,
  };
}

/* ═══════════════════════════════════════════════════════════════
   USER ANALYTICS
   ═══════════════════════════════════════════════════════════════ */

async function getUserAnalytics() {
  const [byRole, totals] = await Promise.all([
    User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort:  { count: -1 } },
    ]),
    User.aggregate([
      {
        $group: {
          _id:      null,
          total:    { $sum: 1 },
          active:   { $sum: { $cond: ['$isActive',   1, 0] } },
          verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
          locked:   {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$lockUntil', new Date()] }] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
  ]);

  const t = totals[0] || { total: 0, active: 0, verified: 0, locked: 0 };

  return {
    summary: {
      total:    t.total,
      active:   t.active,
      inactive: t.total - t.active,
      verified: t.verified,
      locked:   t.locked,
    },
    byRole,
  };
}

async function getUserGrowth(query) {
  const { from, to } = resolveDateRange(query);
  const format       = dateGroupFormat(query.period);
  const limit        = parseInt(query.limit, 10) || 12;

  const data = await User.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to } } },
    {
      $group: {
        _id:   { $dateToString: { format, date: '$createdAt' } },
        total: { $sum: 1 },
        donors:       { $sum: { $cond: [{ $eq: ['$role', 'donor']       }, 1, 0] } },
        institutions: { $sum: { $cond: [{ $eq: ['$role', 'institution'] }, 1, 0] } },
      },
    },
    { $sort:  { _id: 1 } },
    { $limit: limit },
    { $project: { period: '$_id', total: 1, donors: 1, institutions: 1, _id: 0 } },
  ]);

  return { period: query.period || 'monthly', from, to, data };
}

/**
 * Engagement: last-login distribution + never-logged-in users.
 */
async function getUserEngagement() {
  const now         = new Date();
  const day30Ago    = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const day7Ago     = new Date(now - 7  * 24 * 60 * 60 * 1000);

  const [engagement, loginStats] = await Promise.all([
    User.aggregate([
      {
        $group: {
          _id:             null,
          total:           { $sum: 1 },
          activeThisWeek:  { $sum: { $cond: [{ $gte: ['$lastLogin', day7Ago]  }, 1, 0] } },
          activeThisMonth: { $sum: { $cond: [{ $gte: ['$lastLogin', day30Ago] }, 1, 0] } },
          neverLoggedIn:   { $sum: { $cond: [{ $not:  '$lastLogin'            }, 1, 0] } },
        },
      },
      { $project: { _id: 0, total: 1, activeThisWeek: 1, activeThisMonth: 1, neverLoggedIn: 1 } },
    ]),
    User.aggregate([
      { $match: { lastLogin: { $exists: true } } },
      {
        $group: {
          _id:        null,
          lastLogin:  { $max: '$lastLogin' },
          firstLogin: { $min: '$lastLogin' },
          avgLoginsPerUser: { $avg: '$failedLoginAttempts' }, // proxy – swap for a loginCount field if added
        },
      },
      { $project: { _id: 0, lastLogin: 1, firstLogin: 1 } },
    ]),
  ]);

  return {
    engagement:  engagement[0]  || { total: 0, activeThisWeek: 0, activeThisMonth: 0, neverLoggedIn: 0 },
    loginStats:  loginStats[0]  || { lastLogin: null, firstLogin: null },
  };
}

/* ─────────────────────────── exports ─────────────────────────── */
module.exports = {
  // Donations
  getDonationAnalytics,
  getDonationTrends,
  getDonationCategories,
  // Institutions
  getInstitutionAnalytics,
  getInstitutionsByType,
  getInstitutionPerformance,
  // Requests
  getRequestAnalytics,
  getRequestTrends,
  getRequestFulfillment,
  // Matching
  getMatchingAnalytics,
  getMatchingSuccessRate,
  getMatchingEfficiency,
  // Users
  getUserAnalytics,
  getUserGrowth,
  getUserEngagement,
};

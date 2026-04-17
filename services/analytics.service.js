// services/analytics.service.js
'use strict';

const Donation = require('../models/donation.model');
const Request  = require('../models/request.model');
const User     = require('../models/user.model');
const Medicine = require('../models/medicine.model');

/* ─────────────────────────── helpers ─────────────────────────── */
/**
 * Build a $dateToString format string from a human-readable period.
 * @param {'daily'|'weekly'|'monthly'|'yearly'} period
 */
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
    { $unwind: { path: '$medicineInfo', preserveNullAndEmpty: false } },
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

/**
 * Geographic distribution using the donor's phone-number prefix as a
 * proxy for Egyptian governorate.  If a proper location field is added
 * to User later, swap the grouping key.
 */
async function getDonationGeographic() {
  const data = await Donation.aggregate([
    { $match: { donor: { $exists: true } } },
    {
      $lookup: {
        from:         'users',
        localField:   'donor',
        foreignField: '_id',
        as:           'donorInfo',
      },
    },
    { $unwind: { path: '$donorInfo', preserveNullAndEmpty: false } },
    {
      $group: {
        _id:   { $substr: ['$donorInfo.phone', 0, 3] },  // 010 / 011 / 012 / 015
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    {
      $project: {
        phonePrefix: '$_id',
        count: 1,
        // Map prefix to carrier/region label
        carrier: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id', '010'] }, then: 'Vodafone' },
              { case: { $eq: ['$_id', '011'] }, then: 'Etisalat' },
              { case: { $eq: ['$_id', '012'] }, then: 'Orange' },
              { case: { $eq: ['$_id', '015'] }, then: 'WE' },
            ],
            default: 'Unknown',
          },
        },
        _id: 0,
      },
    },
  ]);

  return { data };
}

/* ═══════════════════════════════════════════════════════════════
   INSTITUTION ANALYTICS
   ═══════════════════════════════════════════════════════════════ */

async function getInstitutionAnalytics() {
  const [summary, byActivity] = await Promise.all([
    User.aggregate([
      { $match: { role: 'institution' } },
      {
        $group: {
          _id:      null,
          total:    { $sum: 1 },
          active:   { $sum: { $cond: ['$isActive',   1, 0] } },
          verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
        },
      },
    ]),
    User.aggregate([
      { $match: { role: 'institution' } },
      {
        $group: {
          _id:   '$isActive',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          status: { $cond: ['$_id', 'active', 'inactive'] },
          count: 1,
          _id: 0,
        },
      },
    ]),
  ]);

  const s = summary[0] || { total: 0, active: 0, verified: 0 };

  return {
    summary: {
      total:    s.total,
      active:   s.active,
      inactive: s.total - s.active,
      verified: s.verified,
    },
    byActivity,
  };
}

/**
 * Institution breakdown by role type (currently all are 'institution';
 * reserved for when sub-types such as hospital / pharmacy / clinic are added).
 */
async function getInstitutionsByType() {
  const data = await User.aggregate([
    { $match: { role: 'institution' } },
    {
      $group: {
        _id:   { $ifNull: ['$institutionType', 'general'] },
        count: { $sum: 1 },
      },
    },
    { $sort:  { count: -1 } },
    { $project: { type: '$_id', count: 1, _id: 0 } },
  ]);

  return { data };
}

/**
 * Per-institution performance: donations received + requests created.
 */
async function getInstitutionPerformance(query) {
  const limit = parseInt(query.limit, 10) || 10;

  const data = await User.aggregate([
    { $match: { role: 'institution' } },
    // Join donations matched to this institution
    {
      $lookup: {
        from:         'donations',
        localField:   '_id',
        foreignField: 'matchedInstitution',
        as:           'receivedDonations',
      },
    },
    // Join requests created by this institution
    {
      $lookup: {
        from:         'requests',
        localField:   '_id',
        foreignField: 'institution',
        as:           'createdRequests',
      },
    },
    {
      $project: {
        name:              { $concat: ['$firstName', ' ', '$lastName'] },
        email:             1,
        isActive:          1,
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
        matched: { $sum: { $cond: [{ $in: ['$status', ['matched', 'approved_by_institution', 'delivered']] }, 1, 0] } },
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
  getDonationGeographic,
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

'use strict';

const User = require('../models/user.model');
const Donation = require('../models/donation.model');
const Request = require('../models/request.model');

/**
 * Get top-level dashboard stats.
 * totalUsers, activeDonations, openRequests, successfulMatches
 */
exports.getStats = async () => {
    const [totalUsers, activeDonations, openRequests, matchedDonations] = await Promise.all([
        User.countDocuments(),
        Donation.countDocuments({ status: { $in: ['pending', 'admin_review', 'available'] } }),
        Request.countDocuments({ status: 'open' }),
        Donation.countDocuments({ status: { $in: ['matched', 'approved_by_institution', 'delivered'] } })
    ]);

    return {
        totalUsers,
        activeDonations,
        openRequests,
        successfulMatches: matchedDonations
    };
};

/**
 * Get recent activity feed across users, donations, and requests.
 */
exports.getRecentActivity = async () => {
    const limit = 5;
    const [recentUsers, recentDonations, recentRequests] = await Promise.all([
        User.find().sort({ createdAt: -1 }).limit(limit).select('firstName lastName role createdAt'),
        Donation.find().sort({ createdAt: -1 }).limit(limit).populate('donor', 'firstName lastName').populate('medicine', 'name'),
        Request.find().sort({ createdAt: -1 }).limit(limit).populate('institution', 'firstName lastName')
    ]);

    // Normalize and combine for a unified activity feed
    let activities = [];

    recentUsers.forEach(u => activities.push({
        type: 'NEW_USER',
        description: `New ${u.role}: ${u.firstName} ${u.lastName} joined.`,
        date: u.createdAt
    }));

    recentDonations.forEach(d => {
        const donorName = d.donor ? `${d.donor.firstName} ${d.donor.lastName}` : 'Unknown';
        const medName = d.medicine ? d.medicine.name : 'Unknown';
        activities.push({
            type: 'NEW_DONATION',
            description: `${donorName} donated ${d.quantity.amount} ${d.quantity.unit} of ${medName}.`,
            date: d.createdAt
        });
    });

    recentRequests.forEach(r => {
        const instName = r.institution ? `${r.institution.firstName} ${r.institution.lastName}` : 'Unknown';
        activities.push({
            type: 'NEW_REQUEST',
            description: `${instName} requested ${r.requiredQuantity.amount} ${r.requiredQuantity.unit} of ${r.medicineName}.`,
            date: r.createdAt
        });
    });

    activities.sort((a, b) => b.date - a.date);
    return activities.slice(0, 10);
};

/**
 * Get period-over-period summary (this month vs last month)
 */
exports.getSummary = async () => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());

    const getCount = async (model, from, to) => {
        return await model.countDocuments({ createdAt: { $gte: from, $lt: to } });
    };

    const [
        usersThisMonth, usersLastMonth,
        donationsThisMonth, donationsLastMonth,
        requestsThisMonth, requestsLastMonth
    ] = await Promise.all([
        getCount(User, oneMonthAgo, now),
        getCount(User, twoMonthsAgo, oneMonthAgo),
        getCount(Donation, oneMonthAgo, now),
        getCount(Donation, twoMonthsAgo, oneMonthAgo),
        getCount(Request, oneMonthAgo, now),
        getCount(Request, twoMonthsAgo, oneMonthAgo),
    ]);

    const calculateGrowth = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    return {
        users: {
            currentMonth: usersThisMonth,
            growth: calculateGrowth(usersThisMonth, usersLastMonth)
        },
        donations: {
            currentMonth: donationsThisMonth,
            growth: calculateGrowth(donationsThisMonth, donationsLastMonth)
        },
        requests: {
            currentMonth: requestsThisMonth,
            growth: calculateGrowth(requestsThisMonth, requestsLastMonth)
        }
    };
};

/**
 * Get system alerts requiring admin attention.
 */
exports.getAlerts = async () => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [expiringDonations, urgentRequests, lockedUsers] = await Promise.all([
        Donation.find({ status: { $in: ['pending', 'available'] }, expiryDate: { $lte: sevenDaysFromNow } })
            .select('expiryDate status quantity').populate('medicine', 'name'),
        Request.find({ status: 'open', priority: 'urgent' })
            .select('medicineName requiredQuantity createdAt').populate('institution', 'firstName lastName'),
        User.find({ failedLoginAttempts: { $gte: 5 }, lockUntil: { $gt: now } })
            .select('firstName lastName email lockUntil failedLoginAttempts')
    ]);

    const alerts = [];

    expiringDonations.forEach(d => alerts.push({
        level: 'warning',
        type: 'EXPIRING_DONATION',
        message: `Donation of ${d.medicine?.name} expires on ${d.expiryDate.toDateString()}`,
        referenceId: d._id
    }));

    urgentRequests.forEach(r => alerts.push({
        level: 'critical',
        type: 'URGENT_REQUEST',
        message: `Urgent request for ${r.medicineName} by ${r.institution?.firstName}`,
        referenceId: r._id
    }));

    lockedUsers.forEach(u => alerts.push({
        level: 'warning',
        type: 'LOCKED_USER',
        message: `User ${u.firstName} ${u.lastName} is locked due to multiple failed login attempts`,
        referenceId: u._id
    }));

    return alerts;
};

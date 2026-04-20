'use strict';

const User = require('../models/user.model');
const Donation = require('../models/donation.model');
const Request = require('../models/request.model');
const ExcelJS = require('exceljs');
const ApiError = require('../utils/apiError');

/**
 * List all users with pagination and optional filters
 */
exports.listUsers = async (query) => {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let filter = {};
    if (query.role) filter.role = query.role;
    if (query.status) filter.isActive = query.status === 'active';
    if (query.isVerified !== undefined) filter.isVerified = query.isVerified === 'true';
    if (query.search) {
        filter.$or = [
            { firstName: { $regex: query.search, $options: 'i' } },
            { lastName: { $regex: query.search, $options: 'i' } },
            { email: { $regex: query.search, $options: 'i' } },
            { phone: { $regex: query.search, $options: 'i' } }
        ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
        .select('-password -otp -passwordResetToken')
        .sort({ createdAt: -1 })
        .skip(startIndex)
        .limit(limit);

    return {
        users,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get detailed profile of a specific user
 */
exports.getUserDetails = async (userId) => {
    const user = await User.findById(userId).select('-password -otp -passwordResetToken');
    if (!user) throw new ApiError('User not found', 404);

    const [donationCount, requestCount] = await Promise.all([
        Donation.countDocuments({ donor: userId }),
        Request.countDocuments({ institution: userId })
    ]);

    return {
        ...user.toObject(),
        stats: {
            totalDonations: donationCount,
            totalRequests: requestCount
        }
    };
};

/**
 * Change the role of a user
 */
exports.changeUserRole = async (userId, newRole) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError('User not found', 404);

    if (newRole === 'superadmin') {
        throw new ApiError('Cannot assign superadmin role through this endpoint', 403);
    }

    user.role = newRole;
    await user.save();

    return user;
};

/**
 * Toggle user active status (activate/deactivate)
 */
exports.toggleUserStatus = async (userId, isActive) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError('User not found', 404);
    
    // Cannot deactivate superadmins easily here
    if (user.role === 'superadmin' && !isActive) {
        throw new ApiError('Cannot deactivate a superadmin', 403);
    }

    user.isActive = isActive;
    await user.save();

    return user;
};

/**
 * Hard delete a user
 */
exports.deleteUser = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError('User not found', 404);

    if (user.role === 'superadmin') {
        throw new ApiError('Cannot delete a superadmin', 403);
    }

    await User.findByIdAndDelete(userId);
    return null;
};

/**
 * Get recent activity log for a specific user
 */
exports.getUserActivity = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError('User not found', 404);

    const limit = 10;
    const [donations, requests] = await Promise.all([
        Donation.find({ donor: userId })
            .select('medicine quantity status createdAt')
            .populate('medicine', 'name')
            .sort({ createdAt: -1 })
            .limit(limit),
        Request.find({ institution: userId })
            .select('medicineName requiredQuantity status createdAt')
            .sort({ createdAt: -1 })
            .limit(limit)
    ]);

    let activities = [];

    donations.forEach(d => activities.push({
        type: 'DONATION',
        details: `Donated ${d.quantity.amount} ${d.quantity.unit} of ${d.medicine?.name || 'Unknown'}`,
        status: d.status,
        date: d.createdAt
    }));

    requests.forEach(r => activities.push({
        type: 'REQUEST',
        details: `Requested ${r.requiredQuantity.amount} ${r.requiredQuantity.unit} of ${r.medicineName}`,
        status: r.status,
        date: r.createdAt
    }));

    activities.sort((a, b) => b.date - a.date);
    return activities;
};

/**
 * Export specific or all users to Excel
 */
exports.exportUsers = async (query) => {
    const data = await this.listUsers({ ...query, limit: 10000 }); // fetch large amount
    const users = data.users;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    worksheet.columns = [
        { header: 'ID', key: '_id', width: 25 },
        { header: 'First Name', key: 'firstName', width: 20 },
        { header: 'Last Name', key: 'lastName', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Role', key: 'role', width: 15 },
        { header: 'Verified', key: 'isVerified', width: 12 },
        { header: 'Active', key: 'isActive', width: 12 },
        { header: 'Joined Date', key: 'createdAt', width: 20 }
    ];

    users.forEach(user => {
        worksheet.addRow({
            _id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isVerified: user.isVerified ? 'Yes' : 'No',
            isActive: user.isActive ? 'Active' : 'Inactive',
            createdAt: new Date(user.createdAt).toLocaleDateString()
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
};

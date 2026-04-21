'use strict';

const adminUserService = require('../services/adminUser.service');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const sendResponse = require('../utils/sendResponse');

exports.listUsers = asyncErrorHandler(async (req, res) => {
    const data = await adminUserService.listUsers(req.query);
    sendResponse(res, 200, 'success', 'Users listed successfully', data);
});

exports.getUserDetails = asyncErrorHandler(async (req, res) => {
    const data = await adminUserService.getUserDetails(req.params.id);
    sendResponse(res, 200, 'success', 'User details retrieved successfully', data);
});

exports.changeUserRole = asyncErrorHandler(async (req, res) => {
    const { role } = req.body;
    const data = await adminUserService.changeUserRole(req.params.id, role);
    sendResponse(res, 200, 'success', 'User role updated successfully', data);
});

exports.toggleUserStatus = asyncErrorHandler(async (req, res) => {
    const { isActive } = req.body;
    const data = await adminUserService.toggleUserStatus(req.params.id, isActive);
    sendResponse(res, 200, 'success', `User status updated to ${isActive ? 'active' : 'inactive'}`, data);
});

exports.deleteUser = asyncErrorHandler(async (req, res) => {
    await adminUserService.deleteUser(req.params.id);
    sendResponse(res, 200, 'success', 'User deleted successfully', null);
});

exports.getUserActivity = asyncErrorHandler(async (req, res) => {
    const data = await adminUserService.getUserActivity(req.params.id);
    sendResponse(res, 200, 'success', 'User activity retrieved successfully', data);
});

exports.exportUsers = asyncErrorHandler(async (req, res) => {
    const buffer = await adminUserService.exportUsers(req.query);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=users_export.xlsx');
    
    res.status(200).send(buffer);
});

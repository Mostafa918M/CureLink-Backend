const asyncErrorHandler = require("../utils/asyncErrorHandler");
const ApiError = require("../utils/apiError");
const sendResponse = require("../utils/sendResponse");
const notificationService = require("../services/notification.service");


class NotificationController {
  async getAll(req, res) {

    const filters={
      limit:req.query.limit,
      page: req.query.page
    }

   const notificationList=await notificationService.getAllNotification(req.userId,filters)
    
    return sendResponse(
      res,
      200,
      "success", 
      "Notifications fetched successfully", 
      notificationList);
  }


  async getOne(req, res) {
    let notificationId=req.params.id
    const notification=await notificationService.getNotificationById(notificationId,req.userId)

    return sendResponse(
      res, 
      200, 
      "success", 
      "Notification fetched successfully", 
      notification);
  }


  async markOneAsRead(req, res) {
    let notificationId=req.params.id
    const notification=await notificationService.updateReadOne(notificationId,req.userId)

    return sendResponse(
      res, 
      200, 
      "success", 
      "Notification marked as read", 
      notification);
  }


  async markAllAsRead(req, res) {
    const updatedCount=await notificationService.updateReadMany(req.userId)

    return sendResponse(
      res, 
      200, 
      "success", 
      updatedCount.message, 
      updatedCount.updatedCount);
  }


  async unreadCountNotification(req, res) {
    const unreadCount=await notificationService.unreadCount(req.userId)

    return sendResponse(
      res, 
      200, 
      "success", 
      "Unreaded notifications count", 
      {unreadCount});
  }

  async deleteOne(req, res) {
    const notificationId=req.params.id
    const deletedNotification=await notificationService.deleteNotification(notificationId,req.userId)

    return sendResponse(
      res, 
      200, 
      "success", 
      "Notification deleted successfully",
      deletedNotification);
  }

  async deleteAll(req, res) {
    const users_notification=req.params.userID
    const deletedNotifications=await notificationService.deleteAllNotifications(users_notification,req.userId)

    return sendResponse(
      res, 
      200, 
      "success", 
      deletedNotifications.message,
      deletedNotifications.deletedCount);
  }

}

const controller = new NotificationController();

module.exports = {
  getAll: asyncErrorHandler(controller.getAll.bind(controller)),
  getOne: asyncErrorHandler(controller.getOne.bind(controller)),
  markOneAsRead: asyncErrorHandler(controller.markOneAsRead.bind(controller)),
  markAllAsRead: asyncErrorHandler(controller.markAllAsRead.bind(controller)),
  unreadCountNotification:asyncErrorHandler(controller.unreadCountNotification.bind(controller)),
  deleteOne: asyncErrorHandler(controller.deleteOne.bind(controller)),
  deleteAll: asyncErrorHandler(controller.deleteAll.bind(controller)),
};

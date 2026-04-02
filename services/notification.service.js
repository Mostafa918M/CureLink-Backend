const Notification = require("../models/notification.model");
const notificationTemplate = require("../models/notificationTemplate.model");
const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

const ApiError = require("../utils/apiError");

class NotificationService {

  async createNotification({userId,type,data={}}) {
    const template=await notificationTemplate.findOne({type})
    if(!template){
      throw new ApiError('Template not found',404);
    }

    let title=template.title
    let message=template.message

    Object.keys(data).forEach(key=>{
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      message=message.replace(
        new RegExp(`{{${escapedKey}}}`,'g'),
        data[key])
    })

    //save notification in DB 
    const notification=await Notification.create({
      user:userId,
      title,
      type,
      message,
      isRead:false
    })
    return notification
  }
  

  async getAllNotification(userId,{page,limit}) {
    const currentPage=parseInt(page)|| 1
    const perPage=Math.min(parseInt(limit)|| 10, 50)

    const notifications=await Notification.find({user:userId,isDeleted:false})
    .select("title message isRead createdAt")
    .sort({ createdAt: -1 })
    .skip((currentPage-1)* perPage)
    .limit(perPage)
    .lean()

    notifications.map(single_notification=>{
      single_notification.createdAtFormatted=dayjs(single_notification.createdAt).fromNow();
    })
    return notifications
  }


  async getNotificationById(notificationId,userId) {
    let notification=await Notification.findOne({
      _id:notificationId,
      user:userId,
      isDeleted:false
    })
   .select(" type title message isRead createdAt")
   .lean()
    if(!notification){
      throw new ApiError('notification not found',404);
    }

    notification.createdAtFormatted = dayjs(notification.createdAt).fromNow();
    return notification
  }

  
  async updateReadOne(notificationId, userId) {
    const notification=await Notification.findOneAndUpdate(
      {_id:notificationId,user:userId,isRead: false,isDeleted:false },
      {isRead:true},
      { new: true }
    )

    if (!notification) {
      throw new ApiError('notification not found',404);
    }
    return  notification
  }



  async updateReadMany(userId) {
    const notifications=await Notification.updateMany(
      {user:userId,isRead: false,isDeleted:false },
      {isRead:true},
      { new: true }
    )

    if (!notifications) {
      throw new ApiError('notification not found',404);
    }

    return{
      updatedCount: notifications.modifiedCount,
      message:notifications.modifiedCount >0 ? 
      "All notifications marked as read"
      :"No notifications found to read"  
    } 
  }


  async unreadCount(userId) {
    const notificationsCount=await Notification.countDocuments({
      user:userId,
      isRead:false,
      isDeleted:false
    })

    return notificationsCount
  }


  async deleteNotification(notificationId,adminId) {
    // Soft delete keep notification in DB but hide it from regular fetch operations
    const notification=await Notification.findOneAndUpdate(
      {
        _id:notificationId,
        isDeleted:false
      },
      {
      isDeleted:true,
      deletedBy:adminId,
      deletedAt:new Date()
      },
      { new: true })

      if(! notification){
      throw new ApiError('notification not found or already deleted',404);
     }

    return notification
  }


  async deleteAllNotifications(users_notification,adminId) {
    let notificatiocs = await Notification.updateMany(
      { user:users_notification,isDeleted:false},
      {isDeleted:true,deletedBy:adminId,deletedAt:new Date()}
    )
    return {
      deletedCount: notificatiocs.modifiedCount,
      message:notificatiocs.modifiedCount >0 ? 
      "Notifications deleted successfully"
      : "No notifications found to delete"    
    }
  }





}




module.exports = new NotificationService();
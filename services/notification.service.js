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

    const formattedNotifications=notifications.map(single_notification=>({
      ...single_notification,
      createdAtFormatted:dayjs(single_notification.createdAt).fromNow()
    }))

    return formattedNotifications
  }


  async getNotificationById(notificationId,userId,role) {

    const isAdmin = ['admin', 'superadmin'].includes(role)
    const filter = {
      _id: notificationId,
      isDeleted: false
    }

    if(!isAdmin){
      filter.user=userId
    }

    let notification=await Notification.findOne(filter)
   .select(" type title message isRead createdAt")
   .lean()
    if(!notification){
      throw new ApiError('notification not found',404);
    }

    notification.createdAtFormatted = dayjs(notification.createdAt).fromNow();
    return notification
  }

  
  async updateReadOne(notificationId, userId) {
    const notification=await Notification.findOne({_id:notificationId,user:userId,isDeleted:false })

    if (!notification) {
      throw new ApiError('notification not found',404);
    }
    
    if(notification.isRead){
      return{
        notification,
        message:"Notification is already marked as read"
      }
    }

    notification.isRead=true
    await notification.save()
    return  {
      notification,
      message:"Notification marked as read successfully"
    }
  }



  async updateReadMany(userId) {
    const notifications=await Notification.updateMany(
      {user:userId,isRead: false,isDeleted:false },
      {$set:{isRead:true}},
    )

    if (!notifications) {
      throw new ApiError('notification not found',404);
    }

    return{
      updatedCount: notifications.modifiedCount,
      message:notifications.modifiedCount >0 ? 
      "All notifications marked as read"
      :"All notifications are already read"  
    } 
  }


  async unreadCount(userId) {
    const notificationsCount=await Notification.countDocuments({
      user:userId,
      isRead:false,
      isDeleted:false
    })

    return {
      notificationsCount,
      allRead:notificationsCount === 0
    }
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

  async getAllDeletedNotification(adminIdId,{page,limit}) {
    const currentPage=parseInt(page)|| 1
    const perPage=Math.min(parseInt(limit)|| 10, 50)

    const filter = {
    isDeleted: true,
    deletedBy: adminIdId
    }

    const [notifications, deletedCount] = await Promise.all([
      Notification.find(filter)
        .select("title type message createdAt deletedAt")
        .sort({ deletedAt: -1 })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .lean(),

    Notification.countDocuments(filter)
  ])

    return {
      notifications,
      deletedCount,
      message:deletedCount >0 ? 
      "deleted Notifications fetched successfully"
      : "No deleted notifications"    
     }
    }

    async restoreNotification(notificationId,adminId,adminRole) {
      const filter={
        _id:notificationId,
        isDeleted:true,
      }

      if(adminRole==="admin"){
        filter.deletedBy=adminId
      }


     const notification=await Notification.findOneAndUpdate(
      filter,
      {
      isDeleted:false,
      deletedAt: null,
      deletedBy: null
      },
      { new: true })
      .select("title type message createdAt ")
      .lean()

      if(! notification){
      throw new ApiError("Notification not found or not deleted",404);
     }

    return notification
  }

}




module.exports = new NotificationService();
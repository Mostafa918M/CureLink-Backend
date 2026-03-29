const mongoose = require("mongoose");

const notificationSchema=new mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },

        title:{
            type:String

        },
        type:{
            type: String,
            required: true
        },
        message:{
            type:String,
            required: true
        },
        isRead:{
            type:Boolean,
            default:false
        },
        isDeleted: {
             type: Boolean, 
             default: false
        },
        deletedAt: {
             type: Date 
        },                      
        deletedBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User" 
        } 

},{ timestamps: true })

notificationSchema.index({user:1 ,isRead: 1,isDeleted:1})

module.exports=mongoose.model("Notification",notificationSchema)
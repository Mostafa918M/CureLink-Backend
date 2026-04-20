const mongoose = require("mongoose");

const notificationTemplateSchema=new mongoose.Schema({
    type:{
        type:String,
        required:true,
        unique:true
    },
    title:{
        type: String
    },
    message:{
        type: String,
        required: true 
    }
}, { timestamps: true })


// notificationTemplateSchema.index({type:1})

module.exports=mongoose.model("notificationTemplate",notificationTemplateSchema)



const refreshTokenModel = require("../models/refreshToken.model");
const User = require("../models/user.model");
const ApiError = require("../utils/apiError");
 const { uploadImage, deleteImage } = require("./imagestorage.service");


class UserService {

  async getProfile(userId) {
    const user=await User.findById(userId).select("firstName lastName email phone role avatar").lean()
    if(!user){
      throw new ApiError("user not found", 404);
    }
    return user
  }

  async updateProfile(userId,updatedData) {
    const user=await User.findById(userId)
    if(!user){
      throw new ApiError("user not found", 404);
    }
    const allowedFields=["email","phone"]
    const newData={}
  
    Object.keys(updatedData).forEach(ele=>{
      if(allowedFields.includes(ele) && updatedData[ele]){
        newData[ele]=updatedData[ele]
      }
    })

    if(Object.keys(newData).length===0){
      throw new ApiError("No valid fields provided for update", 400);
    }
    const updatedProfile=await User.findByIdAndUpdate(
      userId,
      newData,
      {new: true}
    )
    .select("firstName lastName email phone role avatar")
    .lean()
    return updatedProfile
  }

  async uploadPicture(userId,picture) {
    if (!picture) {
    throw new ApiError("No file uploaded", 400);
    }
    const user=await User.findById(userId)
    if(!user){
      throw new ApiError("user not found", 404);
    }
    const uploaded_photo=await uploadImage(picture,"user/picture")

    if (user.avatar && user.avatar.public_id) {
      await deleteImage(user.avatar.public_id);
    }

    user.avatar = {
    url: uploaded_photo.url,
    public_id: uploaded_photo.publicId
    };

    await user.save()

    return user.avatar  
  }

  async delete(userId) {
    const user = await User.findById(userId);
    if(!user){
      throw new ApiError("user not found", 404);
    }

    if(user.avatar?.public_id){
      await deleteImage(user.avatar.public_id) 
    }

    user.avatar={
      url:null,
      public_id:null
    }
    await user.save()

    return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar
  };
  }

  async change_Password(userId,passwords) {
    const user=await User.findById(userId).select("+password");
    if(!user){
      throw new ApiError("user not found", 404);
    }
    
    const match=await user.comparePassword(passwords.old_password)
    if(!match){
      throw new ApiError("Wrong password", 400);
    }

    user.password=passwords.new_password
    await user.save()
      
     // logout from all devices   
    await refreshTokenModel.updateMany(
      {user:userId,isActive: true},
      {$set:{isActive:false,revokedAt:new Date()}}
    )

    return{
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role
  }
  }


  async getActiveSessions(userId){
    const refreshToken=await refreshTokenModel.find({user:userId,isActive:true,expiresAt:{ $gt:new Date() }})
    .select("createdAt createdByIp expiresAt isActive ")
    .lean()
    if(refreshToken.length===0){
      throw new ApiError("session not found", 404);
    }
    return refreshToken.map(token => {
    const isExpired = Date.now() >= token.expiresAt;
    const isValid = token.isActive !== false && !token.revokedAt && !isExpired;

    return {
      id: token._id,
      createdAt: token.createdAt,
      createdByIp: token.createdByIp,
      expiresAt: token.expiresAt,
      isExpired,
      isValid,
     }
  })
  }


  async deleteSession(userId,sessionId,ip){
    const refreshToken=await refreshTokenModel.findOne({_id:sessionId,user:userId,isActive:true,expiresAt:{ $gt: Date.now() }})
    .select("createdAt createdByIp isActive revokedAt revokedByIp")
     if(!refreshToken){
      throw new ApiError("session not found", 404)
    }

    refreshToken.revokedAt=Date.now()
    refreshToken.revokedByIp=ip
    refreshToken.isActive=false

    await refreshToken.save()
    return refreshToken
  }


  async deleteAllSessions(userId,ip){
    const result = await refreshTokenModel.updateMany(
    {user: userId,isActive: true},
    {$set: { isActive: false, revokedAt: new Date(), revokedByIp: ip }}
  )

  return {
    modifiedCount: result.modifiedCount,
   };
   }

}

module.exports = new UserService();

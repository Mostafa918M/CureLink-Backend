const asyncErrorHandler = require("../utils/asyncErrorHandler");
const ApiError = require("../utils/apiError");
const sendResponse = require("../utils/sendResponse");
const userService = require("../services/user.service");


class UserController {
  async getOne(req, res) {
    const profile=await userService.getProfile(req.userId)

    return sendResponse(
      res, 
      200, 
      "success", 
      "User profile fetched successfully", 
      profile);
  }

  async update(req, res) {
    const updates={
      email:req.body.email,
      phone:req.body.phone,
      avatar:req.file?.buffer
    }
    const updated_profile=await userService.updateProfile(req.userId,updates)

    return sendResponse(
      res, 
      200, 
      "success", 
      "User profile updated successfully",
      updated_profile);
  }

  async uploadPicture(req, res) {
    const user_picture=req.file?.buffer
    const profile_picture=await userService.uploadPicture(req.userId,user_picture)
    
    return sendResponse(
      res, 
      201, 
      "success", 
      "User picture created successfully", 
      profile_picture);
  }

  async delete(req, res) {
    const profileAfterDelete=await userService.delete(req.userId)

    return sendResponse(
      res, 
      200, 
      "success", 
      "User picture deleted successfully",
      profileAfterDelete);
  }

  async changePassword(req,res){
    const passwords={
      old_password:req.body.oldPassword,
      new_password:req.body.newPassword
    }
    const afterUpdate=await userService.change_Password(req.userId,passwords)
    return sendResponse(
      res, 
      200, 
      "success", 
      "password changed successfully",
      afterUpdate);
  }

  async activeSessions(req,res){
    const getSessions=await userService.getActiveSessions(req.userId)

    return sendResponse(
      res, 
      200, 
      "success", 
      "sessions fetched successfully",
      getSessions);
  }

  async deleteSession(req,res){
    const refreshTokenId=req.params.id
     const ip=req.ip
    const deletedSession=await userService.deleteSession(req.userId,refreshTokenId,ip)
      return sendResponse(
      res, 
      200, 
      "success", 
      "session deleted successfully",
      deletedSession);
  }

  async deleteAllSessions(req,res){
    const ip=req.ip
    const deletedSessions=await userService.deleteAllSessions(req.userId,ip)
     return sendResponse(
      res, 
      200, 
      "success", 
      "sessions deleted successfully",
      deletedSessions);
  }

}

const controller = new UserController();

module.exports = {
  getOne: asyncErrorHandler(controller.getOne.bind(controller)),
  uploadPicture: asyncErrorHandler(controller.uploadPicture.bind(controller)),
  update: asyncErrorHandler(controller.update.bind(controller)),
  delete: asyncErrorHandler(controller.delete.bind(controller)),
  changePassword: asyncErrorHandler(controller.changePassword.bind(controller)),
  activeSessions: asyncErrorHandler(controller.activeSessions.bind(controller)),
  deleteSession: asyncErrorHandler(controller.deleteSession.bind(controller)),
  deleteAllSessions: asyncErrorHandler(controller.deleteAllSessions.bind(controller)),
};

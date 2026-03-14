const Institution = require("../models/institution.model");
const institutionDocs=require("../models/ins-documents.model")
const ApiError = require("../utils/apiError");
const { uploadImage, deleteImage } = require("./imagestorage.service");
const { REQUIRED_DOCUMENTS_BY_TYPE } = require("../config/documentRules");
class InstitutionService {

   async register(data,owner) {
    // verify of user role
    // if (owner.role !== "institution") {
    //   throw new ApiError("Only users with role 'institution' can register an institution",403);
    // }

    let{name,type,licenseNumber,description,addresses,logo}=data

    const existingInstitution = await Institution.findOne({user:owner})

    if (existingInstitution) {
    throw new ApiError("Institution already registered for this user", 400);
    }

    let uploadLogo=null
    if(logo){
       uploadLogo=await uploadImage(logo.buffer,"institutions/logo")
    }
   
    const institution=await Institution.create({
      user:owner,
      name,
      type,
      licenseNumber,
      description,
      addresses,
      logo:uploadLogo? uploadLogo.url : null,
      logoPublicId:uploadLogo? uploadLogo.publicId : null
    })

    // const populated=await Institution.findById(institution._id)
    // .populate({
    //   path:"user",
    //   select:"firstName lastName email phone createdAt"
    // })
    // .lean()

    return {
      institutionData:{
        institutionId:institution._id,
        name: institution.name,
        type: institution.type,
        licenseNumber: institution.licenseNumber,
        description: institution.description,
        addresses: institution.addresses,
        logo: institution.logo,
        owner:institution.user
        // owner:populated.user
      }
    }
  }


  async getProfile(userId) {    
    // if(userId.role!=="institution"){
    //   throw new ApiError("Access denied - only institutions can view profiles denied", 403);
    // }

    let existingInstitution=await Institution.findOne({user:userId})
    .select(
        'name type description logo addresses licenseNumber  '
      )
    .lean();
    if(!existingInstitution){
      throw new ApiError("Institution not found", 404);
    }

    return{
      institutionData:existingInstitution
    }
  } 

   async updateProfile(userID,updateData) {

    let existingInstitution=await Institution.findOne({user:userID})
    
    if(!existingInstitution){
      throw new ApiError("Institution not found", 404);
    }

    const updates=Object.keys(updateData)  
    updates.forEach(ele => {
      if(updateData[ele]=== undefined || updateData[ele]===""){
        delete updateData[ele]
      }
    });   

    const legalFields = ['licenseNumber'];
    const replacingLegalData = legalFields.some(field =>
      updates.includes(field) && updateData[field] !== existingInstitution[field]
      );

    //Prevent editing legal data after approval
    if(existingInstitution.verificationStatus === "verified" && replacingLegalData){
      updateData.verificationStatus="pending"
    }


    if(updateData.logo){
      // delete old logo if exists
      if(existingInstitution.logoPublicId){
        //delete from cloudinary
        await deleteImage(existingInstitution.logoPublicId)
        //delete from DB
        existingInstitution.logo=null
        existingInstitution.logoPublicId=null
        await existingInstitution.save()
      }
      const uploadedLogo = await uploadImage(updateData.logo,"institutions/logo")
      updateData.logo=uploadedLogo.url
      updateData.logoPublicId=uploadedLogo.publicId
    }

    const updatedInstitution= await Institution.findOneAndUpdate(
      {user:userID},
      {$set:updateData},
      {new: true}
    )

    return {
      name: updatedInstitution.name,
      type: updatedInstitution.type,
      description: updatedInstitution.description,
      logo: updatedInstitution.logo,
      addresses: updatedInstitution.addresses,
      licenseNumber: updatedInstitution.licenseNumber,
      // verificationStatus: updatedInstitution.verificationStatus
    };
  }


  async getAllInstitutions({search, page, limit }) {
    const filter={
      verificationStatus:"verified"
    }

    if(search){
      filter.$text={$search:search}
    }

    const currentPage = Math.max(parseInt(page) || 1, 1)
    const perPage = Math.min(parseInt(limit) || 10, 50)
    const skip = (currentPage - 1) * perPage


    let query= Institution.find(filter).select("name description logo addresses")
       .populate({
        path:"user",
        select:"email phone"})
       .limit(perPage)
       .skip(skip)


    if(search){
      query=query
      .sort({ score: { $meta: "textScore" }})
      .select({ score: { $meta: "textScore" } })
    }
    else{
      query=query.sort({ createdAt: -1 })
    }

    let allInstitutions=await query

    return {
      all_institutions:allInstitutions
    }
  }


  async getOneInstitution(institutionID) {
    const existingInstitution=await Institution.findOne({
      _id: institutionID,
      verificationStatus: "verified"
    })
    .populate({
      path:"user",
      select:"email phone"
    }).lean()
    if(!existingInstitution){
      throw new ApiError("Institution not found", 404);
    }

    return {
      institutionData:{
        name: existingInstitution.name,
        type: existingInstitution.type,
        description: existingInstitution.description,
        addresses: existingInstitution.addresses,
        logo: existingInstitution.logo,
        email:existingInstitution.user?.email,
        phone:existingInstitution.user?.phone,
        joinedAt:existingInstitution.createdAt
      }
    }
  }






  //each institution has many  documents of file in DB   relation : 1-> many
  async postDocuments(userID,files) {
    if(!files || Object.keys(files).length==0){
      throw new ApiError("No files were uploaded", 400)
    }
   
   const existingInstitution = await Institution.findOne({ user: userID });
   if (!existingInstitution) throw new ApiError('Institution not found', 404)

   const institutionID=existingInstitution._id
   const saved_doc=[]
//    files = {
//      tax_card:[file1],
//      commercial_register:[file2]
//     }

   for(const[fieldName,filesArray]of Object.entries(files)){
    if(!institutionDocs.schema.path("type").enumValues.includes(fieldName)){
      throw new ApiError(`Invalid document type '${fieldName}'`,400)
    }

    // the institution can upload one or multiple files of types other & prevent institutions from uploading files that are not allowed for them
     if(fieldName!=="other" && ! REQUIRED_DOCUMENTS_BY_TYPE[existingInstitution.type].includes(fieldName)){
        throw new ApiError(`Document type '${fieldName}' is not allowed for this institution`,400)
      }
      
    for(const file of filesArray){
      if(file!=="other"){
        const existDoc=await institutionDocs.findOne({
          institution:institutionID,
          type:fieldName
        })

        if(existDoc){
          await institutionDocs.deleteOne(existDoc)
        }
      }
        const uploaded=await uploadImage(file.buffer,"institutions/documents")

        const doc=await institutionDocs.create({
          institution:institutionID,
          type:fieldName,
          file:uploaded.url
        })

        saved_doc.push(doc)
    }
  }

  const isUploaded = await institutionDocs.getRequiredUploaded(institutionID);
  //return array of object like
  // {
  // type: "tax_card",
  // uploaded: true  //   false if file not uploaded
  //  }

  const allRequiredUploaded=isUploaded.every(d=>d.uploaded)

  if(allRequiredUploaded && existingInstitution.verificationStatus=="pending"){
        existingInstitution.verificationStatus = "under_review"
        await existingInstitution.save()
  }

  return{
    AllDocuments:saved_doc,
    allIsUploaded:allRequiredUploaded
   }
  }


  
  async getDocuments(userId) {
    const existingInstitution=await Institution.findOne({user:userId})
    if(!existingInstitution)  throw new ApiError('Institution not found', 404)
    const institutionId=existingInstitution._id
    const instDocs=await institutionDocs
    .find({institution:institutionId})
    .select("file type createdAt")
    .sort({ createdAt: -1 })
    .lean()

    if (!instDocs.length) {
      throw new ApiError("No documents found for this institution", 404);
    }

    const isUploaded = await institutionDocs.getRequiredUploaded(institutionId);
    const allRequiredUploaded=isUploaded.every(d=>d.uploaded)

    return{
      institutionDocs:instDocs,
      allIsUploaded:allRequiredUploaded
    }  
  }
}

module.exports = new InstitutionService();
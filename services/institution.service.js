const Institution = require("../models/institution.model");
const ApiError = require("../utils/apiError");
class InstitutionService {

   async register(data,owner) {
    // verify of user role
    if (owner.role !== "institution") {
      throw new ApiError("Only users with role 'institution' can register an institution",403);
    }

    let{name,type,licenseNumber,commercialRegister,taxCard,description,addresses,logo}=data

    const existingInstitution = await Institution.findOne({user:owner.id})

    if (existingInstitution) {
    throw new ApiError("Institution already registered for this user", 400);
    }

    const institution=await Institution.create({
      user:owner.id,
      name,
      type,
      licenseNumber,
      commercialRegister,
      taxCard,
      description,
      addresses,
      logo
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
        description: institution.description,
        addresses: institution.addresses,
        logo: institution.logo,
        owner:institution.user
        // owner:populated.user
      }
    }
  }


  async getProfile(payload) {    
    if(payload.role!=="institution"){
      throw new ApiError("Access denied - only institutions can view profiles denied", 403);
    }

    let existingInstitution=await Institution.findOne({user:payload.id})
    .select(
        'name type description logo addresses ' +
        'licenseNumber commercialRegister taxCard '
      )
    .lean();
    if(!existingInstitution){
      throw new ApiError("Institution not found", 404);
    }

    return{
      institutionData:existingInstitution
    }
  } 

   async updateProfile(payload,updateData) {
    if(payload.role!=="institution"){
      throw new ApiError("Access denied - only institutions can update their profile", 403);
    }

    let existingInstitution=await Institution.findOne({user:payload.id})
    
    if(!existingInstitution){
      throw new ApiError("Institution not found", 404);
    }

    const updates=Object.keys(updateData)     

    const legalFields = ['commercialRegister', 'taxCard', 'licenseNumber'];
    const replacingLegalData = legalFields.some(field =>
      updates.includes(field) && updateData[field] !== existingInstitution[field]
      );

    //Prevent editing legal data after approval
    if(existingInstitution.verificationStatus === "verified" && replacingLegalData){
      updateData.verificationStatus="pending"
    }

    const updatedInstitution= await Institution.findOneAndUpdate(
      {user:payload.id},
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
      commercialRegister: updatedInstitution.commercialRegister,
      taxCard: updatedInstitution.taxCard,
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






  async getOneInstitution(id) {
    return `this action gets Institution by #${id}`;
  }

  async postDocuments(id) {
    return `this action upload  Institution documents`;
  }

  async getDocuments(id) {
    return `this action gets Institution documents by #${id}`;
  }
}

module.exports = new InstitutionService();

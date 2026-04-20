const mongoose = require('mongoose');
const { REQUIRED_DOCUMENTS_BY_TYPE } = require("../config/documentRules");

const InstitutionDocumentSchema = new mongoose.Schema({
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    required: true,
    index: true,           
  },


  file: {
    type: String,               // file url in cloudinary
    required: [true, 'File URL is required'],
    trim: true,
  },

  //document type
  type: {
    type: String,
    enum: [
      "commercial_register",     
      "tax_card",                 
      "licenseNumber",        
      "founding_decision",       
      "association_registration",  
      "other"                     
    ],
     required: [true, 'Document type is required'],
  },

}, { timestamps: true });

InstitutionDocumentSchema.index({ institution: 1, type: 1 });      

InstitutionDocumentSchema.statics.getRequiredUploaded=async function (institutionID) {
  // get model that name is institution & get document with institutionID and return type of this document
  const institution =await mongoose.model("Institution").findById(institutionID,"type")
 if (!institution) throw new ApiError("Institution not found", 404);
 const required=REQUIRED_DOCUMENTS_BY_TYPE[institution.type] || ['commercial_register']

 const docs=await this.find(
  {institution:institutionID,type: {$in:required} },
  'type ')

// [
//   { type: "tax_card" },
//   { type: "commercial_register"} ]


  const allDocs={}
  docs.forEach(ele => {
    allDocs[ele.type]=true
  });
  return required.map(doc=> ({
    type:doc,
    uploaded: !!allDocs[doc],
  }))

  // بيرجع object فيه:
  // {
  // type: "tax_card",
  // uploaded: true  // أو false لو مش موجود
  // }
  
}

module.exports = mongoose.model("InstitutionDocument", InstitutionDocumentSchema);
const mongoose = require('mongoose');
const ApiError = require('../utils/apiError');
const InstitutionSchema = new mongoose.Schema({
    //owner (if role == institution)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
    },

    name: {
      type: String,
       required: [true, "Institution name is required"],
       trim: true,
       maxLength: [50, "Institution name cannot be more than 50 characters"],
    },

    type: {
        type: String,
        enum: ["hospital", "pharmacy", "clinic", "charity","medical_center", "ngo","other"],
        required: [true, "Institution type is required"],
    },

    licenseNumber: {
        type: String,
        required: [true, " licenseNumber is required"],
        unique: true,
        trim: true,
        uppercase: true, // ← ده اللي هيحول small → capital تلقائيًا
        minlength: [5, "licenseNumber can't be less than 5 characters"],
        maxlength: [30, " licenseNumber can't be more than 30 characters "],
        match: [
          /^[A-Z0-9\-\/ ]{5,30}$/,
          "Invalid license number format. Allowed: numbers, uppercase letters, hyphens (-), slashes (/), and spaces only. Example: EG-MOH-12345 or 567/2025"
      ]
    },

    description: {
      type: String,
      required: [true, "Institution description is required"],
      trim: true,
    },

     //array of object if institution has more than one address
    addresses: [{    
      type: { type: String, enum: ['main', 'branch'] },
      governorate: {
         type: String,
         trim: true,
         required: [true, 'governorate is required']
      },
      city:{
          type: String,
          trim: true,
        },
      street: {
          type: String,
          trim: true,
        },
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: {
        type: [Number],  // [longitude, latitude]
        default: [0, 0]
      }
     }
   }],

    logo: {
      type: String,
      default:null
    },

    logoPublicId:{
      type: String,
      default:null
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "under_review", "verified", "rejected"],
      default: "pending",
    },

    rejectionReason:{    //Institution verification rejection
        type: String,
        trim: true
    },

     stats: {
      donationsReceived: { type: Number, default: 0 },
      requestsCompleted: { type: Number, default: 0 },
    },
  },
  { timestamps: true }

)


InstitutionSchema.index({
  name: "text",
  "addresses.governorate": "text",
  "addresses.city": "text",
  "addresses.street": "text",
});


InstitutionSchema.pre("save",async function( ) {
  if(!this.addresses || this.addresses.length==0){
    throw new ApiError("Institution must have at least one address", 400)
  }

 // number of main address
 let mainAddress=this.addresses.filter(addr=> addr.type=="main")   
 if(mainAddress.length>1){   
   throw new ApiError ("Only one main address is allowed",404)
 }

 if(mainAddress.length === 0){    
    this.addresses[0].type="main" 
 }
})


module.exports = mongoose.model('Institution', InstitutionSchema);

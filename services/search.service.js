const donationModel = require("../models/donation.model");
const medicineModel = require("../models/medicine.model");
const donationService = require('./donation.service');

const ApiError = require("../utils/apiError");
class SearchService {

  async donationSearch(query,search) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    if(!search || search.trim() ===""){
      return donationService.getAllDonations(query)
    }

    const medicines = await medicineModel.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { genericName: { $regex: search, $options: "i" } },
        { manufacturer: { $regex: search, $options: "i" } },
        { dosageForm:{ $regex: search, $options: "i" }}
      ]})
      .select('_id').lean()

    const medicineIds = medicines.map(m => m._id);
    
    if(medicineIds.length===0){
      return {
        donations: [],
        pagination: {total: 0,page,limit,pages: 0},
        message: "No matching donations found"
        }
      }

    const filter={
       status:{$in: ["approved", "available"]},
       medicine:{$in:medicineIds},
       deletedAt: null,
    }

    const donations = await donationModel.find(filter).select("-statusHistory")
    .populate('donor', 'firstName lastName email phone')
    .populate('medicine', 'name strength dosageForm category')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
    
    const total = await donationModel.countDocuments(filter)

    return {
      donations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      message:donations.length ? "Approved donations fetched successfully" : "No matching donations found"
    };
  }
  
}

module.exports = new SearchService();

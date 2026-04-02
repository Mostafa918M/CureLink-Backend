const Institution = require("../models/institution.model");
const ApiError = require("../utils/apiError");
const notificationService = require("./notification.service");

class AdminInstitutionService {
    async getAllInstitutions({ page, limit }) {
        const currentPage = Math.max(parseInt(page) || 1, 1);
        const perPage = Math.min(parseInt(limit) || 10, 50);
        const skip = (currentPage - 1) * perPage;

        const institutions = await Institution.find()
            .populate({ path: "user", select: "firstName lastName email phone" })
            .sort({ createdAt: -1 })
            .limit(perPage)
            .skip(skip)
            .lean();

        const total = await Institution.countDocuments();

        return {
            institutions,
            pagination: { total, page: currentPage, totalPages: Math.ceil(total / perPage) }
        };
    }

    async getPendingInstitutions({ page, limit }) {
        const currentPage = Math.max(parseInt(page) || 1, 1);
        const perPage = Math.min(parseInt(limit) || 10, 50);
        const skip = (currentPage - 1) * perPage;

        const filter = { verificationStatus: "pending" };
        const institutions = await Institution.find(filter)
            .populate({ path: "user", select: "firstName lastName email phone" })
            .sort({ createdAt: -1 })
            .limit(perPage)
            .skip(skip)
            .lean();

        const total = await Institution.countDocuments(filter);

        return {
            institutions,
            pagination: { total, page: currentPage, totalPages: Math.ceil(total / perPage) }
        };
    }

    async getInstitutionDetails(id) {
        const institution = await Institution.findById(id)
            .populate({ path: "user", select: "firstName lastName email phone" })
            .lean();

        if (!institution) {
            throw new ApiError("Institution not found", 404);
        }

        return institution;
    }

    async verifyInstitution(id) {
        const institution = await Institution.findByIdAndUpdate(
            id,
            {
                $set: { verificationStatus: "verified" },
                $unset: { rejectionReason: 1 }
            },
            { new: true, runValidators: true }
        );

        if (!institution) {
            throw new ApiError("Institution not found", 404);
        }

        //send notification from admin to institution if institution approved
        try{
            await notificationService.createNotification({
                userId:institution._id,
                type:"institution_approved"
            })
        }catch(err){
            console.error("Failed to send notification:", err);
        }

        return institution;
    }

    async rejectInstitution(id, reason) {
        const institution = await Institution.findByIdAndUpdate(
            id,
            { $set: { verificationStatus: "rejected", rejectionReason: reason || "Unspecified reason" } },
            { new: true, runValidators: true }
        );

        if (!institution) {
            throw new ApiError("Institution not found", 404);
        }

        //send notification from admin to institution if institution rejected
         try{
            await notificationService.createNotification({
                userId:institution._id,
                type:"institution_rejected",
                data:{rejectionReason:institution.rejectionReason}
            })
        }catch(err){
            console.error("Failed to send notification:", err);
        }

        return institution;
    }
}

module.exports = new AdminInstitutionService();

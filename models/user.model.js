const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
        maxLength: [50, "First name cannot be more than 50 characters"],
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
        maxLength: [50, "Last name cannot be more than 50 characters"],
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: [true, "Email is required"],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please provide a valid email",
        ],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters"],
        select: false,
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        match: [/^(010|011|012|015)\d{8}$/, "Invalid phone number format."],
    },

    role: {
        type: String,
        enum: ["donor", "admin", "superadmin", "institution"],
        default: "donor",
    },
    avatar: {
        public_id: { type: String, default: null },
        url: { type: String, default: null },
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
        maxLength: [6, "OTP must be 6 digits"],
    },
    otpExpiry: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    isActive: {
        type: Boolean,
        default: true,
    },
    lastLogin: Date,
    failedLoginAttempts: {
        type: Number,
        default: 0,
    },
    lockUntil: Date,
},
    {
        timestamps: true,
    }
);

userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

userSchema.virtual("isLocked").get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.incLoginAttempts = function () {
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $set: { failedLoginAttempts: 1 },
            $unset: { lockUntil: 1 },
        });
    }

    const updates = { $inc: { failedLoginAttempts: 1 } };
    const maxAttempts = 5;
    const lockTime = 1 * 60 * 60 * 1000;

    if (this.failedLoginAttempts + 1 >= maxAttempts && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + lockTime };
    }

    return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function () {
    return this.updateOne({
        $set: { failedLoginAttempts: 0 },
        $unset: { lockUntil: 1 },
    });
};

module.exports = mongoose.model("User", userSchema);


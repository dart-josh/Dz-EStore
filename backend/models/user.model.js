import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    fullname: { type: String },
    dob: { type: String },
    contactNumber: { type: String },
    deliveryDetails: [
      {
        address: { type: String, required: true },
        region: { type: String, required: true },
        city: { type: String, required: true },
        additionalInfo: { type: String },
        contactNo: { type: String, required: true },
        default: { type: Boolean, default: true },
      },
    ],
    paymentDetails: [{}],
    lastLogin: { type: Date, default: Date.now },
    lastPurchase: { type: Date },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    userRole: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    isAdmin: { type: Boolean, default: false },
    likedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        qty: { type: Number },
      },
    ],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],

    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;

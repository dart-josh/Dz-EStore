import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    reviewText: { type: String },
    rating: { type: Number },
    customerName: { type: String },
    customerEmail: { type: String },
    customerPhone: { type: String },
    reviewTimestamp: { type: Date },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;

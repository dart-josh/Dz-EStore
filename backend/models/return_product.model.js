import mongoose from "mongoose";

const returnProductSchema = new mongoose.Schema(
  {
    orderDetails: { type: Map },
    returnedDate: { type: Date },
    reason: { type: String },
    additionalInfo: { type: String },
    returnStatus: {type: String},
    refundStatus: {type: String},
    returnId: { type: String },
  },
  { timestamps: true }
);

const ReturnedProduct = mongoose.model("ReturnedProduct", returnProductSchema);

export default ReturnedProduct;

import mongoose from "mongoose";

const deletedProductSchema = new mongoose.Schema(
  {
    productDetails: { type: Map },
    deletedDate: { type: Date },
    deletedBy: { type: String },
    reason: { type: String },
  },
  { timestamps: true }
);

const DeletedProduct = mongoose.model("DeletedProduct", deletedProductSchema);

export default DeletedProduct;

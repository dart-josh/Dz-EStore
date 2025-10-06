import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, unique: true },
    link: { type: String, required: true, unique: true },
    productName: { type: String, required: true },
    productCode: { type: String },
    slogan: { type: String },
    price: { type: Number },
    discountPrice: { type: Number },
    costPrice: { type: Number },
    category: { type: String },
    tags: { type: String },
    introText: { type: String },
    description: { type: String },
    images: [{ String }],
    whats_in_the_box: [{ Map }],
    productStatus: { type: String },
    isAvailable: { type: Boolean, default: true },
    productType: { type: String, enum: ["Supply", "Produce"] }, // perishable
    likes: {
      type: Number,
      default: 0,
    },
    ratings: { type: Map },
    quantitySold: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;

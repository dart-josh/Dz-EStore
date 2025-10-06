import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    orderDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date, default: null },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        costPrice: {
          type: Number,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    totalQuantity: { type: Number, required: true },
    orderCost: { type: Number, required: true },
    deliveryFee: { type: Number },
    totalCost: { type: Number },
    discount: { type: Number },
    customerId: { type: String },
    customerName: { type: String },
    customerPhone: { type: String },
    customerEmail: { type: String },
    orderStatus: { type: String, enum: ['Order sent', 'Cancelled', 'Accepted', 'Rejected', 'Processing', 'Ready for pickup', 'Dispatched', 'Delivered', 'Returned']},
    paymentStatus: { type: String },
    paymentDetails: { type: Map },
    deliveryDetails: { type: Map },
    dispatchDetails: { type: Map },

    orderRejectedReason: String,
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;

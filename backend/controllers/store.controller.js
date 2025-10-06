import User from "../models/user.model.js";

import mongoose from "mongoose";
import { nanoid } from "nanoid";
import Order from "../models/order.model.js";
import Review from "../models/review.model.js";
import ReturnedProduct from "../models/return_product.model.js";



export const placeOrder = async (req, res) => {
  const { orderDetails } = req.body;

  try {
    // check details
    if (!orderDetails.products) {
      throw new Error("No items");
    }

    if (!orderDetails.orderCost || !orderDetails.products) {
      throw new Error("Invalid order");
    }

    for (let index = 0; index < orderDetails.products.length; index++) {
      const element = orderDetails.products[index];

      if (
        !element.name ||
        !element.price ||
        !element.quantity ||
        !element.product ||
        !mongoose.Types.ObjectId.isValid(element.product)
      ) {
        throw new Error("Invalid product");
      }
    }

    // create order
    const orderId = generate_order_id();
    const totalQuantity = orderDetails.products.reduce((acc, product) => {
      return acc + product.quantity;
    }, 0);

    const orderDate = new Date();
    // convert date to local timezone
    orderDate.setMinutes(
      orderDate.getMinutes() - orderDate.getTimezoneOffset()
    );

    const order = new Order({
      orderId,
      orderDate,
      totalQuantity,
      ...orderDetails,
      paymentStatus: "Pending",
      orderStatus: "Order sent",
    });

    await order.save();

    // save orderId to profile
    if (orderDetails.customerId) {
      await User.updateOne(
        {
          userId: orderDetails.customerId,
        },
        { $push: { orders: order._id }, $set: { lastPurchase: orderDate } }
      );
    }

    //todo send order details to store

    res.json({ message: "Order Sent", order });
  } catch (error) {
    console.log("error in placeOrder ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = Order.findOne({ orderId });

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.log("error in store getOrder ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const makePayment = async (req, res) => {
  const { orderId, paymentDetails } = req.body;

  try {
    const order = Order.findOne({ orderId });

    if (!order) {
      return res.status(400).json({ success: false, message: "Invalid Order" });
    }

    order.paymentStatus = "Completed";
    order.paymentDetails = paymentDetails;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment completed",
      order: {
        ...order._doc,
      },
    });
  } catch (error) {
    console.log("error in store makePayment ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const cancelOrder = async (req, res) => {
  const { orderId } = req.body;

  try {
    const order = Order.findOne({ orderId });

    if (!order) {
      return res.status(400).json({ success: false, message: "Invalid Order" });
    }

    // check if order is accepted
    if (order.orderStatus != "Order sent") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid operation" });
    }

    order.orderStatus = "Cancelled";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled",
      order: {
        ...order._doc,
      },
    });
  } catch (error) {
    console.log("error in store cancelOrder ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const returnProduct = async (req, res) => {
  const { orderId, orderDetails, reason, additionalInfo } = req.body;

  try {
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(400).json({ success: false, message: "Invalid Order" });
    }

    const returnId = orderId;

    const returnedDate = new Date();
    returnedDate.setMinutes(
      returnedDate.getMinutes() - returnedDate.getTimezoneOffset()
    );

    const _return = new ReturnedProduct({
      orderDetails,
      returnedDate,
      reason,
      additionalInfo,
      returnStatus: "Request sent",
      refundStatus: "Pending",
      returnId,
    });

    await _return.save();

    order.orderStatus = "Returned";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Return request sent",
      order: {
        ..._return._doc,
      },
    });
  } catch (error) {
    console.log("error in store returnProduct ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getReturn = async (req, res) => {
  const { returnId } = req.params;

  try {
    const _return = ReturnedProduct.findOne({ returnId });

    res.status(200).json({ success: true, _return });
  } catch (error) {
    console.log("error in store getReturn ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const sendReview = async (req, res) => {
  const {
    product,
    reviewText,
    rating,
    customerName,
    customerEmail,
    customerPhone,
  } = req.body;

  try {
    if (!reviewText && !rating) {
      throw new Error("No feedback");
    }

    const reviewTimestamp = new Date();
    reviewTimestamp.setMinutes(
      reviewTimestamp.getMinutes() - reviewTimestamp.getTimezoneOffset()
    );

    const review = new Review({
      product,
      reviewText,
      rating,
      customerName,
      customerEmail,
      customerPhone,
      reviewTimestamp,
    });

    await review.save();

    res.status(200).json({ success: false, message: "Feedback sent" });
  } catch (error) {
    console.log("error in sendReview ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getReviews = async (req, res) => {
  try {
    const reviews = Review.find({});

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.log("error in store getReviews ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//================

//? UTILS

// generate order Id
export const generate_order_id = () => {
  return "" + nanoid(11);
};

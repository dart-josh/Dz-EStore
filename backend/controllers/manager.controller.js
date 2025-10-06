import { Category, Tag } from "../models/category.model.js";
import DeletedProduct from "../models/delete_product.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import cloudinary from "../lib/cloudinary.js";
import mongoose from "mongoose";
import { redis } from "../lib/redis.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.log("error in manager getAllProducts ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const addUpdateProduct = async (req, res) => {
  // productId,
  //   link,
  //   productName,
  //   productCode,
  //   slogan,
  //   price,
  //   discountPrice,
  //   costPrice,
  //   category,
  //   tags,
  //   introText,
  //   description,
  //   images,
  //   quantity,
  //   restockLimit,
  //   whats_in_the_box,
  //   productStatus,
  //   isAvailable,
  //   productType,
  //   likes,
  //   ratings,
  //   quantitySold,

  const { id, product } = req.body;

  if (!product.productId || !product.link || !!product.productName) {
    throw new Error("Invalid product");
  }

  try {
    const productName = product.productName;
    const link = product.link;
    const productId = product.productId;

    const productExists = await Product.findOne({
      $or: [
        { productName: new RegExp(`^${productName}$`, "i") },
        { link: new RegExp(`^${link}$`, "i") },
        { productId },
      ],
    });

    const raw_images = product.images;

    const images = [];
    if (raw_images) {
      for (let index = 0; index < raw_images.length; index++) {
        const element = raw_images[index];

        const imageUrl = await addUpdateProductImage(element);
        if (imageUrl) {
          images.push(imageUrl);
        }
      }
    }

    product.images = images;

    // if id is undefined CREATE
    if (!id) {
      // if name already exist return error
      if (productExists) {
        return res.status(500).json({ message: "Product already exist" });
      }

      const new_product = await Product.create({
        ...product,
      });

      res.json({ message: "Product Created Successfully", new_product });
    }

    // else UPDATE
    else {
      // check if _id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "ID not valid" });
      }

      // Check if product exist
      const productIdExists = await Product.findById(id);
      if (!productIdExists) {
        return res.status(500).json({ message: "Product does not exist" });
      }

      // if name already exist return error
      if (productExists && productExists._id != id) {
        return res.status(500).json({ message: "Product already exist" });
      }

      const product = await Product.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            ...product,
          },
        },
        { new: true }
      );
      res.json({ message: "Product Updated Successfully", product });
    }
  } catch (error) {
    console.log("Error in addUpdateProduct: ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const { productDetails, deletedBy, reason } = req.body;

  if (!id) {
    return res.status(500).json({ message: "Product ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Product ID not valid" });
  }

  try {
    // Check if product exist
    const productExists = await Product.findById(id);
    if (!productExists) {
      return res.status(404).json({ message: "Product does not exist" });
    }

    // move to deleted products
    const deletedDate = new Date();
    deletedDate.setMinutes(
      deletedDate.getMinutes() - deletedDate.getTimezoneOffset()
    );
    const deletedProduct = new DeletedProduct({
      productDetails,
      deletedDate,
      deletedBy,
      reason,
    });
    await deletedProduct.save();

    if (productExists.images) {
      for (let index = 0; index < productExists.images.length; index++) {
        const element = productExists.images[index];
        await deleteProductImage(element);
      }
    }

    await Product.findByIdAndDelete(id);

    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.log("Error in deleteProduct: ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  const { id } = req.params.id;

  try {
    if (!id) {
      throw new Error("No product");
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isFeatured = !product.isFeatured;
    const updatedProduct = await product.save();

    const featuredProducts = await Product.find({
      isAvailable,
      isFeatured: true,
    })
      .select("-costPrice")
      .lean();

    // store in redis
    if (featuredProducts) {
      await redis.set("featured_products", JSON.stringify(featuredProducts));
    }

    res.json(updatedProduct);
  } catch (error) {
    console.log("Error in toggleFeaturedProduct: ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const category = await Category.find({});
    res.status(200).json({ success: true, category });
  } catch (error) {
    console.log("error in manager getCategories ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const addUpdateCategory = async (req, res) => {
  const { id, category, sort } = req.body;

  if (!category) {
    return res.status(500).json({ message: "Category required" });
  }

  if (!sort) {
    return res.status(500).json({ message: "Sort required" });
  }

  try {
    const categoryExists = await Category.findOne({
      category: new RegExp(`^${category}$`, "i"),
    });

    // if id is undefined CREATE
    if (!id) {
      // if category already exist
      if (categoryExists) {
        return res.status(500).json({ message: "Category already exist" });
      }

      const newCategory = await Category.create({
        category,
        sort,
      });

      res.json({ message: "Category Added", newCategory });
    }

    // else UPDATE
    else {
      // check if id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "ID not valid" });
      }

      // Check if category exist
      const categoryIdExists = await Category.findById(id);
      if (!categoryIdExists) {
        return res.status(500).json({ message: "Category does not exist" });
      }

      // if category already exist
      if (categoryExists && categoryExists._id != id) {
        return res.status(500).json({ message: "Category already exist" });
      }

      const newCategory = await Category.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            category,
            sort,
          },
        },
        { new: true }
      );
      res.json({ message: "Category Updated", newCategory });
    }
  } catch (error) {
    console.log("Error in addUpdateCategory: ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(500).json({ message: "Category ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Category ID not valid" });
  }

  try {
    // Check if category exist
    const categoryExists = await Category.findById(id);
    if (!categoryExists) {
      return res.status(500).json({ message: "Category does not exist" });
    }

    await Category.findByIdAndDelete(id);

    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.log("Error in deleteCategory: ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getTags = async (req, res) => {
  try {
    const tag = await Tag.find({});
    res.status(200).json({ success: true, tag });
  } catch (error) {
    console.log("error in manager getTags ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const addUpdateTag = async (req, res) => {
  const { id, tag, sort } = req.body;

  if (!tag) {
    return res.status(500).json({ message: "Tag required" });
  }

  if (!sort) {
    return res.status(500).json({ message: "Sort required" });
  }

  try {
    const tagExists = await Tag.findOne({
      tag: new RegExp(`^${tag}$`, "i"),
    });

    // if id is undefined CREATE
    if (!id) {
      // if tag already exist
      if (tagExists) {
        return res.status(500).json({ message: "Tag already exist" });
      }

      const newTag = await Tag.create({
        tag,
        sort,
      });

      res.json({ message: "Tag Added", newTag });
    }

    // else UPDATE
    else {
      // check if id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "ID not valid" });
      }

      // Check if tag exist
      const tagIdExists = await Tag.findById(id);
      if (!tagIdExists) {
        return res.status(500).json({ message: "Tag does not exist" });
      }

      // if tag already exist
      if (tagExists && tagExists._id != id) {
        return res.status(500).json({ message: "Tag already exist" });
      }

      const newTag = await Tag.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            tag,
            sort,
          },
        },
        { new: true }
      );
      res.json({ message: "Tag Updated", newTag });
    }
  } catch (error) {
    console.log("Error in addUpdateTag: ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteTag = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(500).json({ message: "Tag ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Tag ID not valid" });
  }

  try {
    // Check if tag exist
    const tagExists = await Tag.findById(id);
    if (!tagExists) {
      return res.status(500).json({ message: "Tag does not exist" });
    }

    await Tag.findByIdAndDelete(id);

    res.json({ success: true, message: "Tag deleted" });
  } catch (error) {
    console.log("Error in deleteTag: ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({});
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.log("error in manager getAllOrders ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getActiveOrders = async (req, res) => {
  const activeStatuses = ['Accepted', 'Processing', 'Ready for pickup', 'Dispatched', 'Order sent'];

  try {
    const orders = await Order.find({
      orderStatus: { $in: activeStatuses }
    });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.log("error in manager getAllOrders ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { orderId, orderStatus } = req.body;

  try {
    const order = Order.findOne({ orderId });

    if (!order) {
      return res.status(400).json({ success: false, message: "Invalid Order" });
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Status updated",
      order: {
        ...order._doc,
      },
    });
  } catch (error) {
    console.log("error in manager updateOrderStatus ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const assignDispatcher = async (req, res) => {
  const { orderId, dispatchDetails } = req.body;

  try {
    const order = Order.findOne({ orderId });

    if (!order) {
      return res.status(400).json({ success: false, message: "Invalid Order" });
    }

    order.dispatchDetails = dispatchDetails;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Dispatcher assigned",
      order: {
        ...order._doc,
      },
    });
  } catch (error) {
    console.log("error in manager assignDispatcher ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const rejectOrder = async (req, res) => {
  const { orderId, orderRejectedReason } = req.body;

  try {
    const order = Order.findOne({ orderId });

    if (!order) {
      return res.status(400).json({ success: false, message: "Invalid Order" });
    }

    order.orderRejectedReason = orderRejectedReason;
    order.orderStatus = "Rejected";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order rejected",
      order: {
        ...order._doc,
      },
    });
  } catch (error) {
    console.log("error in manager rejectOrder ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteOrder = async (req, res) => {
  const { orderId } = req.params;
  const { orderDetails } = req.body;

  if (!orderId) {
    return res.status(500).json({ message: "Order ID required" });
  }

  try {
    // Check if product exist
    const orderExists = await Order.findOne({ orderId });
    if (!orderExists) {
      return res.status(500).json({ message: "Invalid order" });
    }

    if (
      orderDetails.paymentStatus != "Pending" ||
      orderDetails.orderStatus != "Order sent"
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid operation" });
    }

    await orderExists.deleteOne();

    res.json({ success: true, message: "Order deleted" });
  } catch (error) {
    console.log("Error in deleteOrder: ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteCancelledOrders = async (req, res) => {
  try {
    const result = await Order.deleteMany({ orderStatus: "Cancelled" });

    return res.status(400).json({
      success: false,
      message: `${result.deletedCount} cancelled orders deleted.`,
    });
  } catch (error) {
    console.log("Error in deleteCancelledOrders: ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const fulfilOrder = async (req, res) => {
  const { orderId } = req.body;

  try {
    const order = Order.findOne({ orderId });

    if (!order) {
      return res.status(400).json({ success: false, message: "Invalid Order" });
    }

    const deliveryDate = new Date();
    // convert date to local timezone
    deliveryDate.setMinutes(
      deliveryDate.getMinutes() - deliveryDate.getTimezoneOffset()
    );

    order.orderStatus = 'Delivered';
    order.deliveryDate = deliveryDate;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order Delivered",
      order: {
        ...order._doc,
      },
    });
  } catch (error) {
    console.log("error in manager fulfilOrder ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//? --- OTHERS

export const changeDelivery = async (req, res) => {
  const { orderId, deliveryDetails } = req.body;

  try {
    const order = Order.findOne({ orderId });

    if (!order) {
      return res.status(400).json({ success: false, message: "Invalid Order" });
    }

    order.deliveryDetails = deliveryDetails;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Delivery updated",
      order: {
        ...order._doc,
      },
    });
  } catch (error) {
    console.log("error in manager changeDelivery ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const revokePayment = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = Order.findOne({ orderId });

    if (!order) {
      return res.status(400).json({ success: false, message: "Invalid Order" });
    }

    order.paymentStatus = "Revoked";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment revoked",
      order: {
        ...order._doc,
      },
    });
  } catch (error) {
    console.log("error in manager revokePayment ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ?

export const addUpdateProductImage = async (image) => {
  try {
    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader(image, {
        folder: "products",
      });
    }

    return cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "";
  } catch (error) {
    console.log("Error in addUpdateProductImage: ", error);
    return "";
  }
};

export const deleteProductImage = async (image) => {
  try {
    if (image) {
      const publicId = await image.split("/").pop().split(".")[0];

      await cloudinary.uploader.destroy(`products/${publicId}`);
    }

    return true;
  } catch (error) {
    console.log("Error in deleteProductImage: ", error);
    return false;
  }
};

import mongoose from "mongoose";
import Product from "../models/product.model.js";

export const updateCart = async (req, res) => {
  const { userId, cart } = req.body;

  if (!userId) {
    throw new Error("Invalid operation");
  }

  if (!cart && cart != []) {
    throw new Error("Invalid cart");
  }

  //   verify each product
  for (let index = 0; index < cart.length; index++) {
    const element = cart[index];

    if (!element.product || !element.qty) {
      throw new Error("Invalid cart");
    }

    if (!mongoose.Types.ObjectId.isValid(element.product)) {
      throw new Error("Invalid cart");
    }
  }

  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid User" });
    }

    user.cart = cart;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Cart Updated",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in updateCart ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const addToCart = async (req, res) => {
  const { productId } = req.body;

  try {
    if (!productId) {
      throw new Error("No product");
    }

    const user = req.user;

    const existing = user.cart.find((item) => item.product === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      user.cart.push(productId);
    }

    await user.save();

    res.status(200).json(user.cart);
  } catch (error) {
    console.log("error in addToCart ", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  try {
    if (!productId) {
      throw new Error("No product");
    }

    const user = req.user;

    const existing = user.cart.find((item) => item.product === productId);
    if (existing) {
      if (quantity === 0) {
        user.cart = user.cart.filter((item) => item.product !== productId);
        await user.save();
        return res.json(user.cart);
      }

      existing.quantity = quantity;
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("error in updateQuantity ", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const clearCart = async (req, res) => {
  const { productId } = req.body;

  try {
    const user = req.user;

    if (productId) {
      const existing = user.cart.find((item) => item.product === productId);
      if (existing) {
        user.cart = user.cart.filter((item) => item.product !== productId);
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } else {
      user.cart = [];
    }

    await user.save();

    res.status(200).json(user.cart);
  } catch (error) {
    console.log("error in clearCart ", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCartItems = async (req, res) => {
  try {
    const products = await Product.find({ _id: { $in: req.user.cart } });

    // add quantity
    const cartItems = products.map((product) => {
      const item = req.user.cart.find((item) => item.product === product._id);
      return { ...product.toJSON(), quantity: item.quantity };
    });

    res.json(cartItems);
  } catch (error) {
    console.log("error in getCartItems ", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

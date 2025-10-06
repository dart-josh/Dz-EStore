import Product from "../models/product.model.js";

import { redis } from "../lib/redis.js";

// get all available products
export const getAvailableProducts = async (req, res) => {
  const isAvailable = true;

  try {
    const products = await Product.find({ isAvailable }).select("-costPrice");
    res.status(200).json(products);
  } catch (error) {
    console.log("error in store getProducts ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getFeaturedProducts = async (req, res) => {
  const isAvailable = true;

  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.json(featuredProducts);
    }

    featuredProducts = await Product.find({ isAvailable, isFeatured: true })
      .select("-costPrice")
      .lean();

    if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
    }

    // store in redis
    await redis.set("featured_products", JSON.stringify(featuredProducts));

    res.json(featuredProducts);
  } catch (error) {
    console.log("error in store getFeaturedProducts ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getProduct = async (req, res) => {
  const { link } = req.param;

  try {
    const product = await Product.findOne({ link }).select("-costPrice");
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.log("error in store getProduct ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const likeProduct = async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    throw new Error("Invalid operation");
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID");
  }

  try {
    const product = await Product.findByIdAndUpdate(
      productId,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!product) throw new Error("Product not found");

    // Step 2: Add productId to user's likedProducts if not already present
    const user = req.user;

    const isLiked = user.likedProducts.find((item) => item === productId);

    if (!isLiked) user.likedProducts.push(productId);
    else {
      user.likeProduct = user.likedProducts.filter(
        (item) => item !== productId
      );
    }

    await user.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("error in likeProduct ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const searchProducts = async (req, res) => {
  const { query } = req.body;

  try {
    const products = await Product.find({
      isAvailable,
      $or: [
        { productName: new RegExp(`^${query}$`, "i") },
        { link: new RegExp(`^${link}$`, "i") },
        { productId: query },
      ],
    }).select("-costPrice");

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.log("Error in searchProducts: ", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getRelatedProducts = async (req, res) => {
  const isAvailable = true;
  const { link } = req.param;

  try {
    const product = await Product.findOne({ link }).select("-costPrice");
    if (!product) {
      res.status(404).json({ message: "Product not found" });
    }

    const products = await Product.find({
      isAvailable,
      $or: [{ tags: product.tags }, { category: product.category }],
    })
      .select("-costPrice")
      .limit(6);

    res.json(products);
  } catch (error) {
    console.log("error in store getRelatedProducts ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

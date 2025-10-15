import express from "express";
import { getAvailableProducts, getFeaturedProducts, getProduct, getRelatedProducts, likeProduct, searchProducts } from "../controllers/product.controller.js";

const router = express.Router();

router.post('/getAvailableProducts', getAvailableProducts)
router.post('/searchProducts', searchProducts)
router.post('/getFeaturedProducts', getFeaturedProducts)
router.post('/getProduct', getProduct)
router.post('/getRelatedProducts', getRelatedProducts)
router.post('/likeProduct', likeProduct)

export default router;
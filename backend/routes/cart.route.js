import express from "express";
import { addToCart, clearCart, getCartItems, updateCart, updateQuantity } from "../controllers/cart.controller";

const router = express.Router();

router.post('/updateCart', updateCart)
router.post('/addToCart', addToCart)
router.get('/getCartItems', getCartItems)
router.post('/clearCart', clearCart)
router.post('/updateQuantity', updateQuantity)

export default router;
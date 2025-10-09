import express from "express";
import { cancelOrder, getOrder, getReturn, getReviews, makePayment, placeOrder, returnProduct, sendReview } from "../controllers/store.controller.js";

const router = express.Router();

router.get('/placeOrder',placeOrder );
router.get('/makePayment',makePayment );
router.get('/getReviews',getReviews );
router.get('/sendReview', sendReview);
router.get('/getOrder',getOrder );
router.get('/cancelOrder',cancelOrder );
router.get('/returnProduct',returnProduct );
router.get('/getReturn',getReturn );

export default router;
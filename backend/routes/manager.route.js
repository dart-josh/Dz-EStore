import express from "express";
import {
  addUpdateCategory,
  addUpdateProduct,
  addUpdateTag,
  assignDispatcher,
  changeDelivery,
  deleteCancelledOrders,
  deleteCategory,
  deleteOrder,
  deleteProduct,
  deleteTag,
  fulfilOrder,
  getActiveOrders,
  getAllOrders,
  getAllProducts,
  getCategories,
  getTags,
  rejectOrder,
  revokePayment,
  toggleFeaturedProduct,
  updateOrderStatus,
} from "../controllers/manager.controller";

const router = express.Router();

router.get("/getAllProducts", getAllProducts);
router.post("/addUpdateProduct", addUpdateProduct);
router.delete("/deleteProduct", deleteProduct);
router.get("/toggleFeaturedProduct", toggleFeaturedProduct);

router.get("/getCategories", getCategories);
router.get("/addUpdateCategory", addUpdateCategory);
router.get("/deleteCategory", deleteCategory);
router.get("/getTags", getTags);
router.get("/addUpdateTag", addUpdateTag);
router.get("/deleteTag", deleteTag);

router.get("/getAllOrders", getAllOrders);
router.get("/getActiveOrders", getActiveOrders);
router.get("/updateOrderStatus", updateOrderStatus);
router.get("/assignDispatcher", assignDispatcher);
router.get("/rejectOrder", rejectOrder);
router.get("/deleteOrder", deleteOrder);
router.get("/deleteCancelledOrders", deleteCancelledOrders);
router.get("/fulfilOrder", fulfilOrder);
router.get("/changeDelivery", changeDelivery);
router.get("/revokePayment", revokePayment);

export default router;

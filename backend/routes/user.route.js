import express from "express";
import { changeEmail, changePassword, createProfile, deactivateUser, deleteAccount, editProfile, getUser, getUsers, updateDeliveryDetails, updatePaymentDetails } from "../controllers/user.controller";

const router = express.Router();

router.get('/createProfile',createProfile );
router.get('/editProfile', editProfile);
router.get('/changeEmail',changeEmail );
router.get('/changePassword',changePassword );
router.get('/updateDeliveryDetails',updateDeliveryDetails );
router.get('/updatePaymentDetails',updatePaymentDetails );
router.get('/getUsers', getUsers);
router.get('/getUser', getUser);
router.get('/deactivateUser', deactivateUser);
router.get('/deleteAccount', deleteAccount);

export default router;
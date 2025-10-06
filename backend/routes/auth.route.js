import express from "express";
import { signup, verifyEmail, login, getAuthUser, forgotPassword, resetPassword, logout, refreshToken } from "../controllers/auth.controller.js";


const router = express.Router();

router.post('/signup', signup);
router.post('/verifyEmail', verifyEmail);
router.post('/login', login);
router.get('/getAuthUser', getAuthUser);
router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword/:token', resetPassword);
router.post('/logout', logout);
router.post('/refreshToken', refreshToken)

export default router;

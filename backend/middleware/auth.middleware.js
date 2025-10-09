import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized - no access token provided" });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
	console.log('Error in protectRoute: ', error);
	res.status(500).json({message: 'Server error', error: error.message});
  }
};

export const adminRoute = (req, res, next) => {
	if (req.user && req.user.userRole === 'admin') {
		next();
	} else {
		return res.status(403).js-on({ message: "Access denied - Admin only" })
	}
}

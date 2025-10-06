import bcryptjs from "bcryptjs";
import mongoose from "mongoose";

import User from "../models/user.model.js";
import DeletedUser from "../models/deleted_user.model.js";

export const createProfile = async (req, res) => {
  const { email, fullname, contactNumber } = req.body;

  if (!fullname) {
    throw new Error("Name is required");
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid User" });
    }

    user.fullname = fullname;
    user.contactNumber = contactNumber;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile Created successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in createProfile ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const editProfile = async (req, res) => {
  const { email, password, fullname, contactNumber } = req.body;

  if (!password) {
    throw new Error("Enter password");
  }

  if (!fullname) {
    throw new Error("Name is required");
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid User" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    user.fullname = fullname;
    user.contactNumber = contactNumber;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile Updated successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in editProfile ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const changeEmail = async (req, res) => {
  const { email, password, newEmail } = req.body;

  if (!password) {
    throw new Error("Enter password");
  }

  if (!newEmail) {
    throw new Error("Enter email");
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid User" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    user.email = newEmail;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email Updated successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in changeEmail ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const changePassword = async (req, res) => {
  const { email, password, newPassword } = req.body;

  if (!password) {
    throw new Error("Enter old password");
  }

  if (!newPassword) {
    throw new Error("Enter new password");
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid User" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in changePassword ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateDeliveryDetails = async (req, res) => {
  // address, region, city, additionalInfo, contactNo, default
  const { email, deliveryDetails } = req.body;

  if (!deliveryDetails && deliveryDetails != []) {
    throw new Error("Invalid address");
  }

  //   verify each address
  for (let index = 0; index < deliveryDetails.length; index++) {
    const element = deliveryDetails[index];

    if (
      !element.address ||
      !element.region ||
      !element.city ||
      !element.address
    ) {
      throw new Error("Invalid address");
    }
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid User" });
    }

    user.deliveryDetails = deliveryDetails;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Delivery details Updated",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in updateDeliveryDetails ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updatePaymentDetails = async (req, res) => {
  //todo LIST
  const { email, paymentDetails } = req.body;

  if (!paymentDetails && paymentDetails != []) {
    throw new Error("Invalid address");
  }

  //   verify each address
  for (let index = 0; index < paymentDetails.length; index++) {
    const element = paymentDetails[index];

    //todo LIST
    if (
      !element.address ||
      !element.region ||
      !element.city ||
      !element.address
    ) {
      throw new Error("Invalid address");
    }
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid User" });
    }

    user.paymentDetails = paymentDetails;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Payment details Updated",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in updatePaymentDetails ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.log("error in getUsers ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUser = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new Error("No User");
  }

  try {
    const users = await User.findOne({ userId }).select("-password");
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.log("error in getUser ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deactivateUser = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      throw new Error("Invalid user");
    }

    const user = await User.findOne({ userId });

    if (!user) {
      throw new Error("User does not exist");
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User deactivated",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in deactivateUser ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteAccount = async (req, res) => {
  const { id } = req.params;
  const { userDetails, deletedBy, reason } = req.body;

  if (!id) {
    return res.status(500).json({ message: "Invalid Account" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Invalid Account" });
  }

  try {
    // Check if user exist
    const userExists = await User.findById(id);
    if (!userExists) {
      return res.status(500).json({ message: "Account does not exist" });
    }

    // move to deleted users
    const deletedDate = new Date();
    deletedDate.setMinutes(
      deletedDate.getMinutes() - deletedDate.getTimezoneOffset()
    );
    const deletedUser = new DeletedUser({
      userDetails,
      deletedDate,
      deletedBy,
      reason,
    });
    await deletedUser.save();

    await userExists.deleteOne();

    // await User.findByIdAndDelete(id);

    res.json({ success: true, message: "Account deleted" });
  } catch (error) {
    console.log("Error in deleteAccount: ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

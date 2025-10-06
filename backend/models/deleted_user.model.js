import mongoose from "mongoose";

const deletedUserSchema = new mongoose.Schema(
  {
    userDetails: { type: Map },
    deletedDate: { type: Date },
    deletedBy: { type: String },
    reason: { type: String },
  },
  { timestamps: true }
);

const DeletedUser = mongoose.model("DeletedUser", deletedUserSchema);

export default DeletedUser;

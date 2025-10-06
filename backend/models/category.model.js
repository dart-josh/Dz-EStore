import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    category: {type: String, required: true},
    sort: {type: Number, default: 0},
});

const tagSchema = new mongoose.Schema({
    tag: {type: String, required: true},
    sort: {type: Number, default: 0},
});

export const Category = mongoose.model('Category', categorySchema);
export const Tag = mongoose.model('Tag', tagSchema);
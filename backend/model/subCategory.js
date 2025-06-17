// models/subcategory.model.js
const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    profile: { type: String, default: "" },
    sort_order: { type: Number, required: true, unique: true, min: 1 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'EventCategory', required: true },
    
}, { timestamps: true });

module.exports = mongoose.model('SubCategory', subCategorySchema);

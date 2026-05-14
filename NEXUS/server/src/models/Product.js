const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, trim: true },
    price:      { type: Number, required: true },
    mrp:        { type: Number, required: true },
    image:      { type: String, required: true },
    source:     { type: String, required: true, enum: ['blinkit', 'zepto', 'instamart', 'bigbasket'] },
    productUrl: { type: String, required: true },
    category:   { type: String, required: true },
    quantity:   { type: String }, // display string e.g. "1 kg"
    badge:      { type: String, default: null },
    inStock:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', category: 1 });

module.exports = mongoose.model('Product', ProductSchema);

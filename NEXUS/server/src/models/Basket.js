const mongoose = require('mongoose');
const crypto   = require('crypto');

const MemberSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  name:     { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
  isHost:   { type: Boolean, default: false },
});

const BasketItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  addedBy:  { type: String, required: true }, // user name
  quantity: { type: Number, default: 1, min: 1 },
  addedAt:  { type: Date, default: Date.now },
});

const BasketSchema = new mongoose.Schema(
  {
    shareCode:  {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(3).toString('hex').toUpperCase(),
    },
    hostName:   { type: String, required: true },
    status:     { type: String, enum: ['active', 'locked', 'completed'], default: 'active' },
    members:    [MemberSchema],
    items:      [BasketItemSchema],
    totalPrice: { type: Number, default: 0 },
    expiresAt:  { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }, // 24h
  },
  { timestamps: true }
);

// Auto-compute totalPrice before save
BasketSchema.pre('save', async function (next) {
  if (this.isModified('items')) {
    const Product = mongoose.model('Product');
    let total = 0;
    for (const item of this.items) {
      const p = await Product.findById(item.product).select('price');
      if (p) total += p.price * item.quantity;
    }
    this.totalPrice = total;
  }
  next();
});

module.exports = mongoose.model('Basket', BasketSchema);

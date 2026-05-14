const Basket = require('../models/Basket');
const Product = require('../models/Product');

// POST /api/baskets — Create a new group basket
exports.createBasket = async (req, res) => {
  try {
    const { hostName } = req.body;
    if (!hostName) return res.status(400).json({ success: false, message: 'hostName required' });

    const basket = await Basket.create({
      hostName,
      members: [{ name: hostName, isHost: true }],
    });
    res.status(201).json({ success: true, data: basket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/baskets/:shareCode — Get basket details
exports.getBasket = async (req, res) => {
  try {
    const basket = await Basket.findOne({ shareCode: req.params.shareCode })
      .populate('items.product', 'name price image source productUrl');
    if (!basket) return res.status(404).json({ success: false, message: 'Basket not found' });
    res.json({ success: true, data: basket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/baskets/:shareCode/join — Join a basket as a member
exports.joinBasket = async (req, res) => {
  try {
    const { guestName } = req.body;
    if (!guestName) return res.status(400).json({ success: false, message: 'guestName required' });

    const basket = await Basket.findOne({ shareCode: req.params.shareCode });
    if (!basket) return res.status(404).json({ success: false, message: 'Basket not found' });
    if (basket.status !== 'active') return res.status(400).json({ success: false, message: 'Basket is no longer active' });

    const alreadyJoined = basket.members.find((m) => m.name === guestName);
    if (!alreadyJoined) {
      basket.members.push({ name: guestName, isHost: false });
      await basket.save();
    }

    res.json({ success: true, data: basket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/baskets/:shareCode/items — Add/increment an item
exports.addItem = async (req, res) => {
  try {
    const { productId, addedBy } = req.body;
    const basket = await Basket.findOne({ shareCode: req.params.shareCode });
    if (!basket) return res.status(404).json({ success: false, message: 'Basket not found' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const existing = basket.items.find((i) => i.product.toString() === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      basket.items.push({ product: productId, addedBy, quantity: 1 });
    }

    await basket.save();
    const populated = await basket.populate('items.product', 'name price image source productUrl');
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/baskets/:shareCode/items/:itemId — Decrease or remove item
exports.removeItem = async (req, res) => {
  try {
    const basket = await Basket.findOne({ shareCode: req.params.shareCode });
    if (!basket) return res.status(404).json({ success: false, message: 'Basket not found' });

    const itemIndex = basket.items.findIndex((i) => i._id.toString() === req.params.itemId);
    if (itemIndex === -1) return res.status(404).json({ success: false, message: 'Item not found' });

    if (basket.items[itemIndex].quantity > 1) {
      basket.items[itemIndex].quantity -= 1;
    } else {
      basket.items.splice(itemIndex, 1);
    }

    await basket.save();
    res.json({ success: true, data: basket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

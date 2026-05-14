const Product = require('../models/Product');

// GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const { category, source, q, page = 1, limit = 20 } = req.query;
    const filter = { inStock: true };

    if (category && category !== 'all') filter.category = category;
    if (source)   filter.source = source;
    if (q)        filter.$text = { $search: q };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

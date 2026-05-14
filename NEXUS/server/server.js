const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve the frontend files automatically
app.use(express.static(path.join(__dirname, '../')));

// ─── IN-MEMORY DATABASE ────────────────────────────────────────────────────────
const products = [
  { _id: 'm1', category: 'dairy', source: 'Blinkit', name: 'Amul Taaza Toned Milk', quantity: '1 L', price: 68, mrp: 72, discount: 5, image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/assets/products/sliding_images/jpeg/1c0db977-31ab-4d8e-abf3-d42e4a4b4632.jpg' },
  { _id: 'm2', category: 'dairy', source: 'Instamart', name: 'Farm Fresh White Eggs', quantity: '12 pcs', price: 89, mrp: 96, discount: 7, image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/assets/products/sliding_images/jpeg/09f58356-ccae-48f6-be11-bb035c678a10.jpg' },
  { _id: 'm3', category: 'fruits', source: 'Zepto', name: 'Harvest Gold White Bread', quantity: '400 g', price: 40, mrp: 40, discount: 0, image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/assets/products/sliding_images/jpeg/5ee4441d-9109-48fa-9343-f5ce82b905a6.jpg' },
  { _id: 'm4', category: 'fruits', source: 'BigBasket', name: 'Robusta Bananas', quantity: '500 g', price: 45, mrp: 55, discount: 18, image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/assets/products/sliding_images/jpeg/443c5b5d-9fcb-4d40-ba7a-9774de90efb2.jpg' },
  { _id: 'm5', category: 'snacks', source: 'Blinkit', name: 'Britannia Good Day Cashew Cookies', quantity: '600 g', price: 120, mrp: 135, discount: 11, image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/assets/products/sliding_images/jpeg/e9833f44-fc0b-47e0-94cb-5dece4d98d28.jpg' },
  { _id: 'm6', category: 'drinks', source: 'Instamart', name: 'Coca-Cola Can', quantity: '300 ml', price: 40, mrp: 40, discount: 0, image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/assets/products/sliding_images/jpeg/028db9dd-5c58-450f-90e9-b6951910cf93.jpg' }
];

let baskets = {}; // Store all baskets in memory

// ─── API Routes ───────────────────────────────────────────────────────────────

// 1. GET Products
app.get('/api/products', (req, res) => {
  res.json({ success: true, data: products });
});

// 2. CREATE Basket
app.post('/api/baskets', (req, res) => {
  const { hostName } = req.body;
  const shareCode = Math.random().toString(36).slice(2, 8).toUpperCase();
  
  baskets[shareCode] = {
    shareCode,
    hostName,
    members: [{ name: hostName }],
    items: [],
    createdAt: new Date()
  };
  
  res.json({ success: true, data: baskets[shareCode] });
});

// 3. JOIN Basket
app.post('/api/baskets/:shareCode/join', (req, res) => {
  const { shareCode } = req.params;
  const { name } = req.body;
  const basket = baskets[shareCode];
  
  if (!basket) return res.status(404).json({ success: false, message: 'Invalid Code' });
  
  if (!basket.members.find(m => m.name === name)) {
    basket.members.push({ name });
  }
  
  res.json({ success: true, data: basket });
});

// 4. GET Basket
app.get('/api/baskets/:shareCode', (req, res) => {
  const { shareCode } = req.params;
  const basket = baskets[shareCode];
  if (!basket) return res.status(404).json({ success: false, message: 'Not Found' });
  
  res.json({ success: true, data: basket });
});

// 5. ADD Item
app.post('/api/baskets/:shareCode/items', (req, res) => {
  const { shareCode } = req.params;
  const { productId, addedBy } = req.body;
  const basket = baskets[shareCode];
  
  if (!basket) return res.status(404).json({ success: false, message: 'Not Found' });
  
  const product = products.find(p => p._id === productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product Not Found' });

  // Check if item already exists
  const existingItem = basket.items.find(i => i.product._id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
    existingItem.addedBy = addedBy;
  } else {
    basket.items.push({
      _id: crypto.randomUUID(),
      product,
      quantity: 1,
      addedBy
    });
  }
  
  res.json({ success: true, data: basket });
});

// 6. DELETE Item
app.delete('/api/baskets/:shareCode/items/:itemId', (req, res) => {
  const { shareCode, itemId } = req.params;
  const basket = baskets[shareCode];
  
  if (!basket) return res.status(404).json({ success: false });
  
  const existingItem = basket.items.find(i => i._id === itemId);
  if (existingItem) {
    existingItem.quantity -= 1;
    if (existingItem.quantity <= 0) {
      basket.items = basket.items.filter(i => i._id !== itemId);
    }
  }
  
  res.json({ success: true, data: basket });
});

let orders = []; // In-memory orders store

// 7. CREATE Order
app.post('/api/orders', (req, res) => {
  const { user, items, total, address, paymentMethod } = req.body;
  const newOrder = {
    _id: 'ORD' + Math.floor(100000 + Math.random() * 900000),
    user: user || 'Guest',
    items,
    total,
    address,
    paymentMethod,
    status: 'Confirmed',
    createdAt: new Date()
  };
  orders.push(newOrder);
  res.json({ success: true, data: newOrder });
});

// 8. GET Orders
app.get('/api/orders', (req, res) => {
  const { user } = req.query;
  const userOrders = orders.filter(o => o.user === user).sort((a, b) => b.createdAt - a.createdAt);
  res.json({ success: true, data: userOrders });
});

// Fallback to serve index.html for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Zero-config NEXUS API running on http://localhost:${PORT}`);
  console.log(`✅ MongoDB dependency REMOVED. Running entirely in-memory.`);
});

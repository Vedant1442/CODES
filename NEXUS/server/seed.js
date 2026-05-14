require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const Product = require('./src/models/Product');

const products = [
  // DAIRY
  { category: 'dairy', source: 'blinkit', name: 'Amul Taaza Toned Milk', quantity: '1 L', price: 68, mrp: 72, badge: '5% OFF', inStock: true, image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/assets/products/sliding_images/jpeg/1c0db977-31ab-4d8e-abf3-d42e4a4b4632.jpg', productUrl: 'https://blinkit.com/prn/amul-taaza-toned-milk/prid/14588' },
  { category: 'dairy', source: 'instamart', name: 'Farm Fresh White Eggs', quantity: '12 pcs', price: 89, mrp: 96, badge: '7% OFF', inStock: true, image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/assets/products/sliding_images/jpeg/09f58356-ccae-48f6-be11-bb035c678a10.jpg', productUrl: 'https://www.swiggy.com/instamart/item/farm-fresh-white-eggs-12-pcs' },
  { category: 'dairy', source: 'zepto', name: 'Harvest Gold White Bread', quantity: '400 g', price: 40, mrp: 40, badge: null, inStock: true, image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/assets/products/sliding_images/jpeg/5ee4441d-9109-48fa-9343-f5ce82b905a6.jpg', productUrl: 'https://www.zeptonow.com/pn/harvest-gold-white-bread/123' },
  
  // FRUITS
  { category: 'fruits', source: 'bigbasket', name: 'Robusta Bananas', quantity: '500 g', price: 45, mrp: 55, badge: '18% OFF', inStock: true, image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/assets/products/sliding_images/jpeg/443c5b5d-9fcb-4d40-ba7a-9774de90efb2.jpg', productUrl: 'https://www.bigbasket.com/pd/10000031/fresho-banana-robusta-500-g/' },
  { category: 'fruits', source: 'blinkit', name: 'Fuji Apples (Premium)', quantity: '4 pcs', price: 120, mrp: 150, badge: '20% OFF', inStock: true, image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/assets/products/sliding_images/jpeg/4020a594-526d-476c-8bb3-72213501a357.jpg', productUrl: 'https://blinkit.com/prn/fuji-apples-premium/prid/34567' },
  { category: 'fruits', source: 'instamart', name: 'Fresh Tomatoes', quantity: '500 g', price: 29, mrp: 35, badge: '17% OFF', inStock: true, image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/assets/products/sliding_images/jpeg/4808c10d-27b3-4606-bdba-fa853e5d326e.jpg', productUrl: 'https://www.swiggy.com/instamart/item/fresh-tomatoes-500-g' },
  
  // SNACKS
  { category: 'snacks', source: 'zepto', name: 'Haldiram\'s Aloo Bhujia', quantity: '200 g', price: 55, mrp: 60, badge: '8% OFF', inStock: true, image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/assets/products/sliding_images/jpeg/3fa59543-85b4-4328-97ff-2e6fca7cd7d2.jpg', productUrl: 'https://www.zeptonow.com/pn/haldirams-aloo-bhujia/456' },
  { category: 'snacks', source: 'blinkit', name: 'Britannia Good Day Cashew Cookies', quantity: '600 g', price: 120, mrp: 135, badge: '11% OFF', inStock: true, image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/assets/products/sliding_images/jpeg/e9833f44-fc0b-47e0-94cb-5dece4d98d28.jpg', productUrl: 'https://blinkit.com/prn/britannia-good-day-cashew-cookies/prid/56789' },

  // DRINKS
  { category: 'drinks', source: 'instamart', name: 'Coca-Cola Can', quantity: '300 ml', price: 40, mrp: 40, badge: null, inStock: true, image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/assets/products/sliding_images/jpeg/028db9dd-5c58-450f-90e9-b6951910cf93.jpg', productUrl: 'https://www.swiggy.com/instamart/item/coca-cola-can-300-ml' },
  { category: 'drinks', source: 'zepto', name: 'Red Bull Energy Drink', quantity: '250 ml', price: 125, mrp: 125, badge: null, inStock: true, image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/assets/products/sliding_images/jpeg/34a41f6d-db0b-4f40-8456-cc55f553a1ec.jpg', productUrl: 'https://www.zeptonow.com/pn/red-bull-energy-drink/789' },
  { category: 'drinks', source: 'blinkit', name: 'Paper Boat Aamras', quantity: '200 ml', price: 30, mrp: 30, badge: null, inStock: true, image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/assets/products/sliding_images/jpeg/cae2d931-15cf-4ba8-bac7-9d7a2cebd3c2.jpg', productUrl: 'https://blinkit.com/prn/paper-boat-aamras/prid/98765' }
];

const seedDB = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    console.log('✅ Previous products removed');
    await Product.insertMany(products);
    console.log('✅ Database Seeded Successfully');
    process.exit();
  } catch (err) {
    console.error('❌ Error seeding DB:', err);
    process.exit(1);
  }
};

seedDB();

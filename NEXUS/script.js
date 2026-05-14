// ── DATA: REALISTIC CATALOG ──
let allProducts = [];
const mockProducts = [
  { _id: 'm1', cat: 'dairy', source: 'Blinkit', name: 'Amul Taaza Toned Milk', quantity: '1 L', price: 68, mrp: 72, discount: 5, image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/assets/products/sliding_images/jpeg/1c0db977-31ab-4d8e-abf3-d42e4a4b4632.jpg', url: 'https://blinkit.com/prn/amul-taaza-toned-milk/prid/14588' },
  { _id: 'm2', cat: 'dairy', source: 'Instamart', name: 'Farm Fresh White Eggs', quantity: '12 pcs', price: 89, mrp: 96, discount: 7, image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/assets/products/sliding_images/jpeg/09f58356-ccae-48f6-be11-bb035c678a10.jpg', url: 'https://www.swiggy.com/instamart/item/farm-fresh-white-eggs-12-pcs' },
  { _id: 'm3', cat: 'fruits', source: 'Zepto', name: 'Harvest Gold White Bread', quantity: '400 g', price: 40, mrp: 40, discount: 0, image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/assets/products/sliding_images/jpeg/5ee4441d-9109-48fa-9343-f5ce82b905a6.jpg', url: 'https://www.zeptonow.com/pn/harvest-gold-white-bread/123' },
  { _id: 'm4', cat: 'fruits', source: 'BigBasket', name: 'Robusta Bananas', quantity: '500 g', price: 45, mrp: 55, discount: 18, image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/assets/products/sliding_images/jpeg/443c5b5d-9fcb-4d40-ba7a-9774de90efb2.jpg', url: 'https://www.bigbasket.com/pd/10000031/fresho-banana-robusta-500-g/' }
];

let cart = {}; // id -> qty
let currentCat = 'all';

// ── BACKEND SYNC LOGIC ──
const API_URL = '/api';
let myName = 'Guest';
let activeBasketCode = null;
let members = []; 
let itemAddedBy = {};

async function loadProducts() {
  try {
    const res = await fetch(`${API_URL}/products`);
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      allProducts = data.data;
    } else {
      allProducts = mockProducts;
    }
  } catch (err) {
    console.log("Backend offline, using mock data.");
    allProducts = mockProducts;
  }
  refreshAll();
}

// Polling for group cart updates
setInterval(async () => {
  if (activeBasketCode) {
    try {
      const res = await fetch(`${API_URL}/baskets/${activeBasketCode}`);
      const data = await res.json();
      if (data.success) {
        syncCartFromDB(data.data);
      }
    } catch (e) {}
  }
}, 3000);

function syncCartFromDB(basketData) {
  members = basketData.members;
  cart = {};
  itemAddedBy = {};
  basketData.items.forEach(item => {
    cart[item.product._id] = item.quantity;
    itemAddedBy[item.product._id] = item.addedBy;
  });
  refreshAll();
  updateGroupBasketUI();
}

// ── INIT & RENDER ──

function getFiltered() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  return allProducts.filter(p => {
    const matchCat = currentCat === 'all' || p.category === currentCat || p.cat === currentCat;
    const matchSearch = !q || p.name.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });
}

function renderGrid(products, containerId) {
  const el = document.getElementById(containerId);
  el.innerHTML = '';
  products.forEach(p => { el.appendChild(makeCard(p)); });
}

function makeCard(p) {
  const id = p._id;
  const qty = cart[id] || 0;
  
  const srcUrl = p.productUrl || p.url || '#';
  const discount = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : p.discount;

  const div = document.createElement('div');
  div.className = 'prod-card';
  div.onclick = () => openProduct(id);

  div.innerHTML = `
    <div class="prod-img-wrap">
      <img src="${p.image}" class="prod-img" alt="${p.name}">
      ${discount ? `<span class="prod-discount">${discount}% OFF</span>` : ''}
      <a href="${srcUrl}" target="_blank" class="gc-open-btn" onclick="event.stopPropagation()">↗ Open ${p.source}</a>
    </div>
    <div class="prod-info">
      <div class="prod-src">via ${p.source}</div>
      <div class="prod-name">${p.name}</div>
      <div class="prod-weight">${p.quantity}</div>
      <div class="prod-price-row">
        <div class="ppr-left">
          <span class="prod-price">₹${p.price}</span>
          ${p.mrp > p.price ? `<span class="prod-mrp">₹${p.mrp}</span>` : ''}
        </div>
        ${qty === 0
          ? `<button class="add-btn" onclick="addItem('${id}',event)">ADD</button>`
          : `<div class="qty-ctrl">
              <button onclick="removeItem('${id}',event)">−</button>
              <span class="qty-num">${qty}</span>
              <button onclick="addItem('${id}',event)">+</button>
            </div>`
        }
      </div>
    </div>
  `;
  return div;
}

// ── CART LOGIC ──
async function addItem(id, e) {
  if (e) e.stopPropagation();
  cart[id] = (cart[id] || 0) + 1;
  itemAddedBy[id] = activeBasketCode ? myName : 'You';
  refreshAll();
  showToast(`Added to cart 🛒`);

  if (activeBasketCode) {
    try {
      await fetch(`${API_URL}/baskets/${activeBasketCode}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, addedBy: myName })
      });
    } catch (e) {}
  }
}

async function removeItem(id, e) {
  if (e) e.stopPropagation();
  if (cart[id] > 0) cart[id]--;
  if (cart[id] === 0) { delete cart[id]; delete itemAddedBy[id]; }
  refreshAll();

  if (activeBasketCode) {
    try {
      // Find the specific basket item ID for this product
      const res = await fetch(`${API_URL}/baskets/${activeBasketCode}`);
      const data = await res.json();
      const basketItem = data.data.items.find(i => i.product._id === id);
      if (basketItem) {
        await fetch(`${API_URL}/baskets/${activeBasketCode}/items/${basketItem._id}`, {
          method: 'DELETE'
        });
      }
    } catch (e) {}
  }
}

function refreshAll() {
  renderGrid(getFiltered(), 'mainGrid');
  updateCartBar();
  updateCartModal();
  
  if(window.currentOpenProductId) {
    populateProductModal(window.currentOpenProductId);
  }
}

function updateCartBar() {
  const ids = Object.keys(cart);
  const totalQty = ids.reduce((s,id)=>s+cart[id],0);
  const totalAmt = ids.reduce((s,id)=>{
    const p = allProducts.find(x=>x._id===id);
    return s + (p ? p.price * cart[id] : 0);
  },0);
  
  document.getElementById('cbCount').textContent = totalQty;
  document.getElementById('cbItems').textContent = `${totalQty} item${totalQty!==1?'s':''}`;
  document.getElementById('cbTotal').textContent = `₹${totalAmt}`;
  
  const bar = document.getElementById('cartBar');
  if (totalQty > 0) bar.classList.remove('hidden');
  else bar.classList.add('hidden');
}

function updateCartModal() {
  const ids = Object.keys(cart);
  const list = document.getElementById('cartItemsList');
  list.innerHTML = '';
  let subtotal = 0;
  
  ids.forEach(id => {
    const p = allProducts.find(x=>x._id===id);
    if (!p) return;
    const linePrice = p.price * cart[id];
    subtotal += linePrice;
    
    const addedByTxt = activeBasketCode ? `<div style="font-size:10px; color:var(--green); font-weight:bold;">by ${itemAddedBy[id] || 'Unknown'}</div>` : '';
    
    list.innerHTML += `
      <div class="cart-item">
        <img src="${p.image}" class="ci-img">
        <div class="ci-info">
          <div class="ci-name">${p.name}</div>
          <div style="font-size:11px; color:var(--light);">${p.quantity}</div>
          ${addedByTxt}
        </div>
        <div class="ci-qty">
          <button onclick="removeItem('${p._id}')">−</button>
          <span class="cq-num">${cart[id]}</span>
          <button onclick="addItem('${p._id}')">+</button>
        </div>
        <div class="ci-price">₹${linePrice}</div>
      </div>
    `;
  });
  
  const summary = document.getElementById('cartSummary');
  const deliveryFee = activeBasketCode && members.length > 0 ? Math.round(25 / members.length) : 25;
  const savings = 25 - deliveryFee;
  const savingsHtml = savings > 0 ? `<div class="cs-row" style="color:var(--green); font-size:12px;"><span>Group Savings</span><span>-₹${savings}</span></div>` : '';

  summary.innerHTML = `
    <div class="cs-row"><span>Item Total</span><span>₹${subtotal}</span></div>
    <div class="cs-row"><span>Delivery Fee (Your Split)</span><span>₹${deliveryFee}</span></div>
    ${savingsHtml}
    <div class="cs-row total"><span>Grand Total</span><span>₹${subtotal + deliveryFee}</span></div>
  `;
  
  if (ids.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:30px;color:var(--light);">Cart is empty</div>`;
    summary.innerHTML = '';
  }
}

// ── GROUP BASKET MODAL FUNCTIONS ──
function openGroupBasket() {
  closeAllModals();
  updateGroupBasketUI();
  document.getElementById('groupBasketModal').classList.add('open');
}

function updateGroupBasketUI() {
  const btn = document.getElementById('groupBasketBtn');
  if (activeBasketCode) {
    btn.innerHTML = `<span style="font-size:14px;">👥</span> ${members.length} joined`;
    btn.style.background = '#dcfce7';
    document.getElementById('gbCreateJoinSection').style.display = 'none';
    document.getElementById('gbActiveSection').style.display = 'block';
    document.getElementById('gbActiveCode').textContent = activeBasketCode;
    
    document.getElementById('gbMembersList').innerHTML = members.map(m => 
      `<span style="background:var(--bg); padding:4px 8px; border-radius:12px; font-size:11px; font-weight:bold; color:var(--dark); border:1px solid var(--border);">${m.name}</span>`
    ).join('');
  } else {
    btn.innerHTML = `<span style="font-size:14px;">👥</span> Group Cart`;
    btn.style.background = '#e8f5ea';
    document.getElementById('gbCreateJoinSection').style.display = 'block';
    document.getElementById('gbActiveSection').style.display = 'none';
  }
}

async function handleCreateBasket() {
  const name = document.getElementById('gbNameInput').value.trim();
  if (!name) return showToast('Please enter your name');
  myName = name;
  
  try {
    const res = await fetch(`${API_URL}/baskets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostName: myName })
    });
    const data = await res.json();
    if (data.success) {
      activeBasketCode = data.data.shareCode;
      syncCartFromDB(data.data);
      showToast('Basket created!');
    }
  } catch (err) {
    showToast('Failed to connect to backend. Starting local basket.');
    activeBasketCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    members = [{ name: myName }];
    updateGroupBasketUI();
  }
}

async function handleJoinBasket() {
  const name = document.getElementById('gbNameInput').value.trim();
  const code = document.getElementById('gbCodeInput').value.trim().toUpperCase();
  if (!name || !code) return showToast('Enter name and code');
  myName = name;
  
  try {
    const res = await fetch(`${API_URL}/baskets/${code}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: myName })
    });
    const data = await res.json();
    if (data.success) {
      activeBasketCode = code;
      syncCartFromDB(data.data);
      showToast('Joined basket!');
    } else {
      showToast('Invalid Code');
    }
  } catch (err) {
    showToast('Failed to connect to backend');
  }
}

function leaveBasket() {
  cart = {}; activeBasketCode = null; members = []; itemAddedBy = {};
  refreshAll(); updateGroupBasketUI(); showToast('Left the basket');
}

// ── MODALS ──

function openCart() {
  document.getElementById('cartModal').classList.add('open');
}

function openLocation() {
  document.getElementById('locationModal').classList.add('open');
}

function selectLocation(title, full) {
  document.getElementById('locNameDisplay').textContent = title;
  document.getElementById('locFullDisplay').textContent = full;
  closeAllModals();
  showToast(`Location updated to ${title}`);
}

function useGPS() {
  showToast('Locating...');
  setTimeout(() => {
    selectLocation('Current Location', 'GPS Detected Address');
  }, 1000);
}

// ── BLINKIT-STYLE PRODUCT DETAIL MODAL ──

function openProduct(id) {
  window.currentOpenProductId = id;
  populateProductModal(id);
  document.getElementById('productModal').classList.add('open');
}

function populateProductModal(id) {
  const p = allProducts.find(x=>x._id===id);
  if (!p) return;
  const qty = cart[id] || 0;
  
  const html = `
    <div class="pd-close" onclick="closeAllModals()">✕</div>
    <div class="pd-image-wrap">
      <img src="${p.image}" class="pd-image">
    </div>
    <div class="pd-info">
      <div class="pd-src-tag">SOURCED VIA ${p.source ? p.source.toUpperCase() : 'UNKNOWN'}</div>
      <div class="pd-name">${p.name}</div>
      <div class="pd-weight">${p.quantity}</div>
      
      <div class="pd-price-wrap">
        <div>
          <span class="pd-price">₹${p.price}</span>
          ${p.mrp > p.price ? `<span class="pd-mrp" style="margin-left:6px;">₹${p.mrp}</span>` : ''}
        </div>
        ${qty === 0
          ? `<button class="add-btn" style="width:100px;" onclick="addItem('${p._id}',event)">ADD</button>`
          : `<div class="qty-ctrl" style="width:100px; justify-content:space-between;">
              <button onclick="removeItem('${p._id}',event)">−</button>
              <span class="qty-num">${qty}</span>
              <button onclick="addItem('${p._id}',event)">+</button>
            </div>`
        }
      </div>

      <div class="pd-desc-title">Product Description</div>
      <div class="pd-desc">${p.desc || 'Best quality product sourced directly.'}</div>
    </div>
  `;
  document.getElementById('productDetailContent').innerHTML = html;
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  window.currentOpenProductId = null;
}

function closeModalOutside(e, id) {
  if (e.target.id === id) closeAllModals();
}

// ── AUTH & PROFILE ──

function openAuth() {
  const user = localStorage.getItem('nexusUser');
  if (user) {
    openProfile();
  } else {
    closeAllModals();
    document.getElementById('authModal').classList.add('open');
  }
}

function handleLogin() {
  const phone = document.getElementById('phoneInput').value;
  if(phone.length !== 10) {
    showToast('Enter a valid 10-digit number');
    return;
  }
  
  localStorage.setItem('nexusUser', phone);
  // Default name for demo
  localStorage.setItem('nexusName', 'Vedant');
  
  updateProfileState();
  closeAllModals();
  showToast('Logged in successfully!');
}

function handleLogout() {
  localStorage.removeItem('nexusUser');
  localStorage.removeItem('nexusName');
  updateProfileState();
  closeAllModals();
  showToast('Logged out');
}

function updateProfileState() {
  const user = localStorage.getItem('nexusUser');
  if(user) {
    document.getElementById('userAvatar').style.background = 'var(--green)';
    document.getElementById('userAvatar').style.color = '#fff';
    document.getElementById('userAvatar').style.borderRadius = '50%';
    document.getElementById('userAvatar').textContent = localStorage.getItem('nexusName')?.[0] || 'U';
  } else {
    document.getElementById('userAvatar').style.background = 'none';
    document.getElementById('userAvatar').style.color = 'var(--dark)';
    document.getElementById('userAvatar').textContent = '👤';
  }
}

async function openProfile() {
  closeAllModals();
  document.getElementById('profileInitials').textContent = localStorage.getItem('nexusName')?.[0] || 'U';
  document.getElementById('profileNameDisplay').textContent = localStorage.getItem('nexusName') || 'User';
  document.getElementById('profilePhoneDisplay').textContent = '+91 ' + localStorage.getItem('nexusUser');
  
  document.getElementById('profileModal').classList.add('open');
  
  // Load Orders
  try {
    const res = await fetch(`${API_URL}/orders?user=${localStorage.getItem('nexusUser')}`);
    const data = await res.json();
    const list = document.getElementById('ordersList');
    if (data.success && data.data.length > 0) {
      list.innerHTML = data.data.map(o => `
        <div style="border:1px solid var(--border); border-radius:12px; padding:12px; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span style="font-weight:bold; font-size:13px;">Order ${o._id}</span>
            <span style="color:var(--green); font-size:12px; font-weight:bold;">${o.status}</span>
          </div>
          <div style="font-size:11px; color:var(--light); margin-bottom:5px;">
            ${new Date(o.createdAt).toLocaleDateString()} • ₹${o.total}
          </div>
        </div>
      `).join('');
    } else {
      list.innerHTML = `<p style="font-size:12px; color:var(--light); text-align:center;">No recent orders</p>`;
    }
  } catch (e) {}
}

// ── CHECKOUT & ORDERS ──

let currentCheckoutTotal = 0;

function placeOrder() {
  const ids = Object.keys(cart);
  if (ids.length === 0) return;
  
  if (!localStorage.getItem('nexusUser')) {
    showToast('Please login to continue');
    openAuth();
    return;
  }

  const subtotal = ids.reduce((s,id)=>{
    const p = allProducts.find(x=>x._id===id);
    return s + (p ? p.price * cart[id] : 0);
  }, 0);
  const deliveryFee = activeBasketCode && members.length > 0 ? Math.round(25 / members.length) : 25;
  currentCheckoutTotal = subtotal + deliveryFee;

  document.getElementById('checkoutTotalDisplay').textContent = `₹${currentCheckoutTotal}`;
  document.getElementById('checkoutAddress').value = document.getElementById('locFullDisplay').textContent;
  
  closeAllModals();
  document.getElementById('checkoutModal').classList.add('open');
}

async function processPayment() {
  const address = document.getElementById('checkoutAddress').value;
  const payMethod = document.querySelector('input[name="payMethod"]:checked').value;
  
  if (!address || address === 'Select your address') {
    return showToast('Please enter a valid delivery address');
  }

  showToast('Processing Payment...');
  
  try {
    await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: localStorage.getItem('nexusUser'),
        items: cart,
        total: currentCheckoutTotal,
        address,
        paymentMethod: payMethod
      })
    });
  } catch (e) {}

  setTimeout(() => {
    cart = {};
    if (activeBasketCode) leaveBasket(); // Clear group basket if active
    refreshAll();
    closeAllModals();
    showToast('🎉 Order Placed Successfully! Arriving in 10 mins.');
  }, 1000);
}

// ── NAVIGATION & FILTERS ──

function filterCat(cat, el) {
  currentCat = cat;
  document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  refreshAll();
}

function handleSearch(val) {
  refreshAll();
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2000);
}

// ── LOCATION LOGIC ──
function openLocation() {
  closeAllModals();
  document.getElementById('locationModal').classList.add('open');
}

function selectLocation(title, fullAddress) {
  document.getElementById('locNameDisplay').textContent = title;
  document.getElementById('locFullDisplay').textContent = fullAddress;
  closeAllModals();
  showToast(`Location set to ${title}`);
}

function useGPS() {
  showToast('Detecting location...');
  setTimeout(() => {
    selectLocation('Current Location', 'GPS Coordinates 19.07, 72.87');
  }, 1000);
}

// Initialize Map (Real API Autocomplete - No Key Required)
function initMap() {
  const input = document.getElementById('gmapSearch');
  if (!input) return;

  let resultsDiv = document.createElement('div');
  resultsDiv.id = 'mockLocResults';
  resultsDiv.style.cssText = 'background:#fff; border:1px solid var(--border); border-radius:12px; margin-top:10px; overflow:hidden; display:none; max-height:250px; overflow-y:auto;';
  input.parentNode.parentNode.insertBefore(resultsDiv, input.parentNode.nextSibling);

  let timeout = null;

  input.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (!val) {
      resultsDiv.style.display = 'none';
      return;
    }
    
    // Show loading state
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = `<div style="padding:12px 16px; font-size:13px; color:var(--light);">Searching across India...</div>`;

    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      try {
        // Use free OpenStreetMap Nominatim API restricted to India
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&countrycodes=in&limit=5`);
        const data = await res.json();
        
        if (data && data.length > 0) {
          resultsDiv.innerHTML = data.map(m => {
            const parts = m.display_name.split(',');
            const title = parts[0];
            const full = parts.slice(1).join(',').trim() || m.display_name;
            return `
            <div style="padding:12px 16px; border-bottom:1px solid var(--border); cursor:pointer;" onclick="selectLocation('${title.replace(/'/g, "\\'")}', '${full.replace(/'/g, "\\'")}'); document.getElementById('gmapSearch').value=''; document.getElementById('mockLocResults').style.display='none';">
              <div style="font-weight:bold; font-size:14px; color:var(--dark);">${title}</div>
              <div style="font-size:12px; color:var(--light); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${full}</div>
            </div>
          `}).join('');
        } else {
          resultsDiv.innerHTML = `
            <div style="padding:12px 16px; cursor:pointer;" onclick="selectLocation('${val.replace(/'/g, "\\'")}', '${val.replace(/'/g, "\\'")}, India'); document.getElementById('gmapSearch').value=''; document.getElementById('mockLocResults').style.display='none';">
              <div style="font-weight:bold; font-size:14px; color:var(--green);">Search "${val}"</div>
              <div style="font-size:12px; color:var(--light); margin-top:2px;">Tap to use this as custom address</div>
            </div>
          `;
        }
      } catch (err) {
        // Fallback on error
        resultsDiv.innerHTML = `
          <div style="padding:12px 16px; cursor:pointer;" onclick="selectLocation('${val.replace(/'/g, "\\'")}', '${val.replace(/'/g, "\\'")}, India'); document.getElementById('gmapSearch').value=''; document.getElementById('mockLocResults').style.display='none';">
            <div style="font-weight:bold; font-size:14px; color:var(--green);">Use "${val}"</div>
          </div>
        `;
      }
    }, 500); // 500ms debounce to avoid API spam
  });
}

// ── BOOTSTRAP ──
updateProfileState();
loadProducts();
initMap();
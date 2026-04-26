// ── DATA ──
const allProducts = [
  // dairy
  {id:1,cat:'dairy',emoji:'🥛',name:'Amul Full Cream Milk',weight:'1 L',price:68,mrp:72,discount:6,nexus:true,src:'Zepto'},
  {id:2,cat:'dairy',emoji:'🧀',name:'Amul Processed Cheese',weight:'200 g',price:105,mrp:120,discount:13,nexus:false,src:'Blinkit'},
  {id:3,cat:'dairy',emoji:'🥚',name:'Farm Fresh Eggs',weight:'12 pcs',price:89,mrp:96,discount:7,nexus:true,src:'Instamart'},
  {id:4,cat:'dairy',emoji:'🧈',name:'Amul Butter',weight:'100 g',price:55,mrp:58,discount:5,nexus:false,src:'BigBasket'},
  {id:5,cat:'dairy',emoji:'🍦',name:'Amul Masti Dahi',weight:'400 g',price:52,mrp:56,discount:7,nexus:true,src:'Zepto'},
  {id:6,cat:'dairy',emoji:'🥛',name:'Mother Dairy Toned Milk',weight:'500 ml',price:30,mrp:32,discount:6,nexus:false,src:'Instamart'},
  // fruits
  {id:7,cat:'fruits',emoji:'🍌',name:'Cavendish Bananas',weight:'6 pcs',price:45,mrp:52,discount:13,nexus:true,src:'Blinkit'},
  {id:8,cat:'fruits',emoji:'🍎',name:'Shimla Apple',weight:'4 pcs ~500g',price:89,mrp:99,discount:10,nexus:false,src:'BigBasket'},
  {id:9,cat:'fruits',emoji:'🍊',name:'Nagpur Orange',weight:'4 pcs',price:55,mrp:60,discount:8,nexus:true,src:'Zepto'},
  // veg
  {id:10,cat:'veg',emoji:'🍅',name:'Tomatoes',weight:'500 g',price:29,mrp:35,discount:17,nexus:true,src:'Instamart'},
  {id:11,cat:'veg',emoji:'🥦',name:'Broccoli',weight:'300 g',price:45,mrp:55,discount:18,nexus:false,src:'Blinkit'},
  {id:12,cat:'veg',emoji:'🧅',name:'Onions',weight:'1 kg',price:38,mrp:45,discount:16,nexus:true,src:'BigBasket'},
  // snacks
  {id:13,cat:'snacks',emoji:'🍪',name:"Britannia Marie Gold",weight:'250 g',price:30,mrp:32,discount:6,nexus:false,src:'Zepto'},
  {id:14,cat:'snacks',emoji:'🥜',name:'Haldiram Aloo Bhujia',weight:'200 g',price:65,mrp:72,discount:10,nexus:true,src:'Instamart'},
  {id:15,cat:'snacks',emoji:'🍿',name:'ACT II Popcorn',weight:'70 g',price:28,mrp:30,discount:7,nexus:false,src:'Blinkit'},
  // bread
  {id:16,cat:'bread',emoji:'🍞',name:'Harvest Gold Bread',weight:'400 g',price:42,mrp:45,discount:7,nexus:true,src:'Zepto'},
  {id:17,cat:'bread',emoji:'🫓',name:'English Muffins',weight:'6 pcs',price:89,mrp:99,discount:10,nexus:false,src:'BigBasket'},
  // drinks
  {id:18,cat:'drinks',emoji:'🥤',name:'Paper Boat Aamras',weight:'250 ml',price:30,mrp:35,discount:14,nexus:false,src:'Instamart'},
  {id:19,cat:'drinks',emoji:'🧃',name:'Real Fruit Juice',weight:'1 L',price:95,mrp:105,discount:10,nexus:true,src:'Blinkit'},
  {id:20,cat:'drinks',emoji:'☕',name:'Bru Instant Coffee',weight:'50 g',price:78,mrp:85,discount:8,nexus:false,src:'Zepto'},
  // household
  {id:21,cat:'household',emoji:'🧴',name:'Vim Dishwash Liquid',weight:'500 ml',price:89,mrp:99,discount:10,nexus:true,src:'Instamart'},
  {id:22,cat:'household',emoji:'🧹',name:'Lizol Floor Cleaner',weight:'500 ml',price:115,mrp:125,discount:8,nexus:false,src:'BigBasket'},
  {id:23,cat:'household',emoji:'🪥',name:'Colgate MaxFresh',weight:'150 g',price:65,mrp:75,discount:13,nexus:true,src:'Blinkit'},
];

const aiProducts = [1,3,16,7,10,13].map(id => allProducts.find(p=>p.id===id));
const popularIds = [3,7,10,1,14,19];
const popularProducts = popularIds.map(id => allProducts.find(p=>p.id===id));

let cart = {}; // id -> qty
let currentCat = 'all';

function getFiltered() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  return allProducts.filter(p => {
    const matchCat = currentCat === 'all' || p.cat === currentCat;
    const matchSearch = !q || p.name.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });
}

function renderGrid(products, containerId, cols=3) {
  const el = document.getElementById(containerId);
  el.innerHTML = '';
  products.forEach(p => { el.appendChild(makeCard(p)); });
}

function makeCard(p) {
  const qty = cart[p.id] || 0;
  const div = document.createElement('div');
  div.className = 'prod-card';
  div.innerHTML = `
    <div class="prod-img-wrap">
      <span class="prod-img">${p.emoji}</span>
      ${p.discount ? `<span class="prod-discount">${p.discount}% OFF</span>` : ''}
      ${p.nexus ? `<span class="nexus-badge">NEXUS</span>` : ''}
    </div>
    <div class="prod-info">
      <div style="font-size:9px; font-weight:800; color:var(--light); text-transform:uppercase; margin-bottom:2px;">via ${p.src || 'Nexus'}</div>
      <div class="prod-weight">${p.weight}</div>
      <div class="prod-name">${p.name}</div>
      <div class="prod-price-row">
        <span class="prod-price">₹${p.price}</span>
        <span class="prod-mrp">₹${p.mrp}</span>
      </div>
      ${qty === 0
        ? `<button class="add-btn" onclick="addItem(${p.id},event)">+ Add</button>`
        : `<div class="qty-ctrl">
            <button onclick="removeItem(${p.id},event)">−</button>
            <span class="qty-num">${qty}</span>
            <button onclick="addItem(${p.id},event)">+</button>
          </div>`
      }
    </div>
  `;
  return div;
}

function addItem(id, e) {
  e && e.stopPropagation();
  cart[id] = (cart[id] || 0) + 1;
  refreshAll();
  showToast(`Added to cart 🛒`);
}
function removeItem(id, e) {
  e && e.stopPropagation();
  if (cart[id] > 0) cart[id]--;
  if (cart[id] === 0) delete cart[id];
  refreshAll();
}

function refreshAll() {
  renderGrid(getFiltered(), 'mainGrid');
  renderGrid(aiProducts, 'aiGrid');
  renderGrid(popularProducts, 'popularGrid');
  updateCartBar();
  updateCartModal();
}

function updateCartBar() {
  const ids = Object.keys(cart);
  const totalQty = ids.reduce((s,id)=>s+cart[id],0);
  const totalAmt = ids.reduce((s,id)=>{
    const p = allProducts.find(x=>x.id==id);
    return s + (p ? p.price * cart[id] : 0);
  },0);
  document.getElementById('cartBadge').textContent = totalQty;
  document.getElementById('cbCount').textContent = totalQty;
  document.getElementById('cbItems').textContent = `${totalQty} item${totalQty!==1?'s':''}`;
  document.getElementById('cbTotal').textContent = `₹${totalAmt}`;
  document.getElementById('cbSaving').textContent = totalAmt > 0 ? `Delivery: ₹0 🎉 (Nexus)` : `Add items to save!`;
  const bar = document.getElementById('cartBar');
  if (totalQty > 0) bar.classList.remove('hidden');
  else bar.classList.add('hidden');
}

function updateCartModal() {
  const ids = Object.keys(cart);
  const list = document.getElementById('cartItemsList');
  list.innerHTML = '';
  let subtotal = 0, savings = 0;
  ids.forEach(id => {
    const p = allProducts.find(x=>x.id==id);
    if (!p) return;
    const linePrice = p.price * cart[id];
    const lineMrp = p.mrp * cart[id];
    subtotal += linePrice;
    savings += (lineMrp - linePrice);
    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `
      <div class="ci-emoji">${p.emoji}</div>
      <div class="ci-info">
        <div class="ci-name">${p.name}</div>
        <div class="ci-weight">${p.weight}</div>
      </div>
      <div class="ci-qty">
        <button onclick="removeItem(${p.id})">−</button>
        <span class="cq-num">${cart[id]}</span>
        <button onclick="addItem(${p.id})">+</button>
      </div>
      <div class="ci-price">₹${linePrice}</div>
    `;
    list.appendChild(item);
  });
  const delivery = 0;
  const total = subtotal + delivery;
  const summary = document.getElementById('cartSummary');
  summary.innerHTML = `
    <div class="cs-row"><span>Subtotal</span><span>₹${subtotal}</span></div>
    <div class="cs-row"><span>Product savings</span><span class="saving">−₹${savings}</span></div>
    <div class="cs-row"><span>Delivery (Nexus group)</span><span class="saving">₹0 🎉</span></div>
    <div class="cs-row total"><span>Total</span><span>₹${total}</span></div>
  `;
  if (ids.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:32px 0;color:var(--light);font-size:14px;">🛒<br><br>Your cart is empty.<br>Add some items!</div>`;
    summary.innerHTML = '';
  }
}

function openCart() {
  document.getElementById('cartModal').classList.add('open');
  updateCartModal();
}
function closeCartOutside(e) {
  if (e.target === document.getElementById('cartModal')) {
    document.getElementById('cartModal').classList.remove('open');
  }
}

function placeOrder() {
  const ids = Object.keys(cart);
  if (ids.length === 0) { showToast('Add items first!'); return; }
  document.getElementById('cartModal').classList.remove('open');
  cart = {};
  refreshAll();
  showToast('🎉 Order placed! Delivering in 10 min via Nexus group batch');
}

function filterCat(cat, el) {
  currentCat = cat;
  document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  refreshAll();
}

function handleSearch(val) {
  renderGrid(getFiltered(), 'mainGrid');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2200);
}

function openLocation() {
  document.getElementById('locationModal').classList.add('open');
}
function closeLocationOutside(e) {
  if (e.target === document.getElementById('locationModal')) {
    document.getElementById('locationModal').classList.remove('open');
  }
}
function selectLocation(name, full, families) {
  document.getElementById('locNameDisplay').textContent = name;
  document.getElementById('locFullDisplay').textContent = full;
  document.getElementById('sbTitleDisplay').textContent = `${name} · ${families} families ordering`;
  document.getElementById('smSubtitleDisplay').textContent = `${name} • ${families} families ordering`;
  document.getElementById('nsbSub').textContent = `${families} neighbors in your batch — delivery is ₹0`;
  
  const locCards = document.getElementById('locationModal').querySelectorAll('.cart-sheet > div:last-child > div');
  locCards.forEach(card => {
    if (card.innerText.includes(name)) {
      card.style.border = '1px solid var(--orange)';
      card.style.background = 'var(--orange-bg)';
      if (!card.querySelector('span')) {
        card.children[0].innerHTML += ` <span style="font-size:10px; background:var(--orange); color:#fff; padding:2px 6px; border-radius:4px; margin-left:8px;">Current</span>`;
      }
    } else {
      card.style.border = '1px solid var(--border)';
      card.style.background = 'none';
      const badge = card.querySelector('span');
      if (badge) badge.remove();
    }
  });
  
  document.getElementById('locationModal').classList.remove('open');
  showToast(`Location updated to ${name}`);
}

function openSociety() {
  document.getElementById('societyModal').classList.add('open');
}
function closeSocietyOutside(e) {
  if (e.target === document.getElementById('societyModal')) {
    document.getElementById('societyModal').classList.remove('open');
  }
}

function addCombo() {
  addItem(1);
  addItem(3);
  addItem(16);
  showToast('Combo added to cart! 🥛🥚🍞');
}

document.querySelectorAll('.bn-item').forEach(item => {
  if(!item.hasAttribute('onclick')) {
    item.addEventListener('click', function() {
      document.querySelectorAll('.bn-item').forEach(i => {
        i.classList.remove('active');
        const lbl = i.querySelector('.bn-label');
        if (lbl) lbl.style.color = 'var(--light)';
      });
      this.classList.add('active');
      const label = this.querySelector('.bn-label');
      if (label) label.style.color = 'var(--orange)';
      
      const text = label ? label.innerText : '';
      if (text === 'Home') window.scrollTo({top:0, behavior:'smooth'});
      else showToast(text + ' view coming soon!');
    });
  }
});

let autocomplete;
function initMap() {
  const input = document.getElementById('gmapSearch');
  if (window.google) {
    autocomplete = new google.maps.places.Autocomplete(input, { types: ['geocode'] });
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const name = place.name || 'Custom Location';
        const full = place.formatted_address || place.name;
        selectLocation(name, full, Math.floor(Math.random()*20)+5);
        document.getElementById('gmapSearch').value = '';
      }
    });
  }
}

// Fallback if Google Maps fails to load or API key is missing
document.getElementById('gmapSearch').addEventListener('keypress', function(e) {
  if(e.key === 'Enter' && this.value.trim() !== '') {
    selectLocation(this.value.trim(), this.value.trim() + ' (Map API Key Required)', Math.floor(Math.random()*20)+5);
    this.value = '';
  }
});

function useGPS() {
  if (navigator.geolocation) {
    showToast('Locating your GPS position...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(4);
        const lng = pos.coords.longitude.toFixed(4);
        selectLocation('GPS Location', `Lat: ${lat}, Lng: ${lng}`, Math.floor(Math.random()*15)+5);
      },
      (err) => {
        showToast('Please enable GPS access in browser');
      }
    );
  } else {
    showToast('GPS not supported on this device');
  }
}

// INIT
refreshAll();
const express = require("express");
const http = require("http");
const ws = require("ws");
const cors = require("cors");
const puppet = require("puppeteer");
const axios = require("axios");
const morgan = require("morgan");
require("dotenv").config();

// Import Extractors (Only Blinkit for now)
const extractors = [
  require("./extractors/blinkit")
];

const app = express();
const srv = http.createServer(app);
const wss = new ws.Server({ server: srv });

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// ── GLOBAL STATE ─────────────────────────────────────────────────────────────
const globalPages = {};
const globalCoords = { lat: 19.076, lon: 72.877 };

// ── WARP POOL ────────────────────────────────────────────────────────────────
async function initPool() {
  console.log("🚀 Warming up NEXUS V2 (Blinkit Mode) Warp Pool...");
  try {
    const b = await puppet.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"]
    });
    
    for (const ex of extractors) {
      const p = await b.newPage();
      await p.setRequestInterception(true);
      p.on("request", (req) => {
        if (["image", "media", "font"].includes(req.resourceType())) req.abort();
        else req.continue();
      });
      
      const home = "https://blinkit.com/";
      await p.goto(home, { waitUntil: "domcontentloaded", timeout: 60000 });
      globalPages[ex.name] = p;
      console.log(`✅ ${ex.name} pooled and ready`);
    }
  } catch (e) {
    console.error("❌ Warp pool failed:", e.message);
  }
}

initPool();

// ── WEBSOCKET ────────────────────────────────────────────────────────────────
wss.on("connection", (socket) => {
  const cid = Math.random().toString(36).slice(2, 10);
  console.log(`[${cid}] Connected`);

  socket.on("message", async (raw) => {
    let data;
    try { data = JSON.parse(raw); } catch { return; }
    
    if (data.action === "getHomeContent") {
      const page = globalPages["blinkit"];
      if (!page) return;
      try {
        console.log(`[${cid}] Fetching Home Content...`);
        const homeData = await page.evaluate(async () => {
          const resp = await fetch("https://blinkit.com/v5/layout/?lat=19.076&lon=72.877", {
            headers: { 'app_client': 'consumer_web' }
          });
          return await resp.json();
        });

        const widgets = homeData?.widgets || [];
        const categories = [];
        const featuredProducts = [];

        widgets.forEach(w => {
          if (w.type === "category_grid" || w.type === "pa_category_grid") {
            (w.data?.items || []).forEach(item => {
              categories.push({ name: item.name, image: item.image_url, id: item.action?.url?.split("/")?.pop() || Math.random() });
            });
          }
          if (w.type === "product_carousel") {
            (w.data?.items || []).forEach(item => {
              if (featuredProducts.length < 12) {
                featuredProducts.push({ id: item.id || Math.random(), name: item.name, price: item.price || 0, imageUrl: item.image_url || "", source: "blinkit" });
              }
            });
          }
        });

        trySend(socket, { action: "homeContent", categories, products: featuredProducts });
      } catch (e) { 
        console.error("Home Error:", e.message);
        // Fallback for UI stability
        const fallbackCats = [
          { name: "Dairy & Eggs", image: "https://cdn.grofers.com/app/images/category/cms_images/rc-upload-1700735371138-2", id: "1" },
          { name: "Fruits & Veg", image: "https://cdn.grofers.com/app/images/category/cms_images/rc-upload-1702384236960-4", id: "2" },
          { name: "Snacks", image: "https://cdn.grofers.com/app/images/category/cms_images/rc-upload-1700735371138-13", id: "3" }
        ];
        trySend(socket, { action: "homeContent", categories: fallbackCats, products: [] });
      }
    }

    if (data.action === "search") {
      const { searchTerm } = data;
      console.log(`[${cid}] Search: "${searchTerm}"`);
      
      const page = globalPages["blinkit"];
      const ex = extractors[0];
      
      if (!page) return;

      performScrape(page, searchTerm, ex, globalCoords)
        .then(prods => {
          trySend(socket, { action: "streamUpdate", source: "blinkit", products: prods });
          trySend(socket, { action: "searchResults", products: { blinkit: prods } });
        })
        .catch(err => console.error("Search Error:", err.message));
    }
  });
});

async function performScrape(page, query, ex, coords) {
  return new Promise(async (resolve) => {
    let done = false;
    const timeout = setTimeout(() => { if(!done) { done=true; resolve([]); } }, 15000);

    const handler = async (res) => {
      if (done) return;
      if (ex.match(res.url())) {
        try {
          const json = await res.json();
          const prods = ex.extract(json);
          if (prods.length > 0) {
            done = true;
            clearTimeout(timeout);
            page.off("response", handler);
            resolve(prods);
          }
        } catch {}
      }
    };

    page.on("response", handler);
    try {
      await page.goto(ex.url(query), { waitUntil: "commit", timeout: 12000 });
    } catch (e) {}
  });
}

function trySend(socket, obj) {
  if (socket.readyState === ws.OPEN) socket.send(JSON.stringify(obj));
}

const PORT = 5000;
srv.listen(PORT, "0.0.0.0", () => console.log(`🚀 NEXUS V2 Blinkit Core on ${PORT}`));

// Renders a test "shelf photo" with three real product labels, for testing label reading (no stock photos).
import { chromium } from "playwright";
const out = process.argv[2] || "shelf.jpg";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: 1200, height: 800 } });
const bottle = (bg, brand, name, sub, h) => `<div style="width:300px;height:${h}px;background:${bg};border-radius:28px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:20px;box-shadow:0 20px 40px rgba(0,0,0,.25);font-family:Arial">
<div style="font-weight:800;font-size:30px;color:#123">${brand}</div><div style="font-size:24px;margin-top:10px;color:#222">${name}</div><div style="font-size:16px;margin-top:8px;color:#555">${sub}</div></div>`;
await p.setContent(`<body style="margin:0;background:linear-gradient(#e8ddd5,#cbb8aa);display:flex;gap:40px;align-items:flex-end;justify-content:center;height:800px;padding-bottom:60px;box-sizing:border-box">
${bottle("#fff", "CeraVe", "HYDRATING FACIAL CLEANSER", "with ceramides & hyaluronic acid", 520)}
${bottle("#f4f1ea", "The Ordinary.", "Retinol 0.5% in Squalane", "30ml", 420)}
${bottle("#fbfbfb", "Paula's Choice", "SKIN PERFECTING 2% BHA Liquid Exfoliant", "salicylic acid", 560)}
</body>`);
await p.screenshot({ path: out, type: "jpeg", quality: 85 });
await b.close();

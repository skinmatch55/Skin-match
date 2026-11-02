import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage();
const drops = `<path d="M12.5 7.5c2.6 3.4 5 6.4 5 9.6a5 5 0 0 1-10 0c0-3.2 2.4-6.2 5-9.6Z" fill="#F6E4DD"/><path d="M20 12c2.3 3 4.4 5.6 4.4 8.4a4.4 4.4 0 0 1-8.8 0c0-2.8 2.1-5.4 4.4-8.4Z" fill="#C8FF3D"/>`;
for (const [name, size, rx] of [["icon-192.png", 192, 10], ["icon-512.png", 512, 10], ["maskable-512.png", 512, 0], ["apple-touch-icon.png", 180, 0]]) {
  const inner = rx === 0 ? `<g transform="translate(4 4) scale(0.75)">${drops}</g>` : drops;
  await p.setViewportSize({ width: size, height: size });
  await p.setContent(`<html><body style="margin:0;background:transparent"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}"><rect width="32" height="32" rx="${rx}" fill="#2A1D1A"/>${inner}</svg></body></html>`);
  await p.screenshot({ path: `public/icons/${name}`, omitBackground: true });
}
await b.close();

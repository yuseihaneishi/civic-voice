import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const BASE = "http://localhost:3030";
const OUT = resolve(process.cwd(), "../screenshots");
mkdirSync(OUT, { recursive: true });

const pages = [
  { name: "01-login", path: "/" },
  { name: "02-citizen-home", path: "/citizen" },
  { name: "03-citizen-history", path: "/citizen/history" },
  { name: "04-staff-inbox", path: "/staff" },
  { name: "05-staff-issues", path: "/staff/issues" },
  { name: "06-staff-issue-detail", path: "/staff/issues/ISS-004" },
  { name: "07-staff-inquiry-detail", path: "/staff/inquiries/INQ-2026-0419" },
  { name: "08-staff-proposals", path: "/staff/proposals" },
  { name: "09-mayor-dashboard", path: "/mayor" },
  { name: "10-mayor-issues", path: "/mayor/issues" },
  { name: "11-mayor-proposals", path: "/mayor/proposals" },
];

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  locale: "ja-JP",
});
const page = await context.newPage();

for (const p of pages) {
  console.log(`Capturing ${p.name} -> ${p.path}`);
  await page.goto(`${BASE}${p.path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({
    path: resolve(OUT, `${p.name}.png`),
    fullPage: true,
  });
}

await browser.close();
console.log("done");

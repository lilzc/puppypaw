const { chromium } = require('playwright');
const BASE = 'http://localhost:5173';
const OUT  = __dirname + '/../docs/screenshots';

async function shot(pg, route, file) {
  await pg.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 15000 });
  await pg.waitForTimeout(1500);
  await pg.screenshot({ path: `${OUT}/${file}` });
  console.log(`✓ ${file}`);
}

async function loginAs(browser, role) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const pg  = await ctx.newPage();
  await pg.goto(`${BASE}/auth`, { waitUntil: 'networkidle', timeout: 15000 });
  await pg.getByText(role === 'owner' ? '宠物主 Demo' : '遛狗师 Demo').click();
  await pg.waitForTimeout(400);
  await pg.locator('button[type="submit"]').click();
  await pg.waitForURL(url => !url.pathname.includes('/auth'), { timeout: 10000 });
  return { ctx, pg };
}

async function main() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  // ── Public pages ──────────────────────────────────────────
  const pub = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const pubPg = await pub.newPage();
  await shot(pubPg, '/',         'landing.png');
  await shot(pubPg, '/booking',  'booking.png');
  await shot(pubPg, '/dog-map',  'dog-map.png');
  await pub.close();

  // ── Owner pages ───────────────────────────────────────────
  const { ctx: ownerCtx, pg: ownerPg } = await loginAs(browser, 'owner');
  await shot(ownerPg, '/walkers',  'walkers.png');
  await shot(ownerPg, '/tracking', 'tracking.png');
  await shot(ownerPg, '/review',   'review.png');
  await ownerCtx.close();

  // ── Walker pages ──────────────────────────────────────────
  const { ctx: walkerCtx, pg: walkerPg } = await loginAs(browser, 'walker');

  // 我的订单 tab (default)
  await shot(walkerPg, '/walker', 'walker-orders.png');

  // 附近订单 tab
  await walkerPg.goto(`${BASE}/walker`, { waitUntil: 'networkidle', timeout: 15000 });
  await walkerPg.waitForTimeout(800);
  await walkerPg.getByText('附近订单').click();
  await walkerPg.waitForTimeout(800);
  await walkerPg.screenshot({ path: `${OUT}/walker-nearby.png` });
  console.log('✓ walker-nearby.png');

  // 信用档案 tab
  await walkerPg.getByText('信用档案').click();
  await walkerPg.waitForTimeout(800);
  await walkerPg.screenshot({ path: `${OUT}/walker-credit.png` });
  console.log('✓ walker-credit.png');

  await walkerCtx.close();
  await browser.close();
  console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); });

const { chromium } = require('playwright');

const BASE = 'http://localhost:5173';
const OUT = __dirname + '/../docs/screenshots';

async function loginAndShot(browser, role, routes) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const pg = await ctx.newPage();

  // Login
  await pg.goto(`${BASE}/auth`, { waitUntil: 'networkidle', timeout: 15000 });
  const demoText = role === 'owner' ? '宠物主 Demo' : '遛狗师 Demo';
  await pg.getByText(demoText).click();
  await pg.waitForTimeout(400);
  await pg.locator('button[type="submit"]').click();
  // Wait for redirect away from /auth
  await pg.waitForURL(url => !url.pathname.includes('/auth'), { timeout: 10000 });
  console.log(`Logged in as ${role}, now at: ${pg.url()}`);

  // Navigate to each route and screenshot
  for (const { route, file } of routes) {
    await pg.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 15000 });
    await pg.waitForTimeout(1500);
    await pg.screenshot({ path: `${OUT}/${file}` });
    console.log(`✓ ${file}`);
  }

  await ctx.close();
}

async function main() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  // Landing page — no auth needed
  const pub = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const pubPg = await pub.newPage();
  await pubPg.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  await pubPg.waitForTimeout(1000);
  await pubPg.screenshot({ path: `${OUT}/landing.png` });
  console.log('✓ landing.png');
  await pub.close();

  // Owner pages
  await loginAndShot(browser, 'owner', [
    { route: '/walkers',  file: 'walkers.png'  },
    { route: '/tracking', file: 'tracking.png' },
    { route: '/review',   file: 'review.png'   },
  ]);

  // Walker page
  await loginAndShot(browser, 'walker', [
    { route: '/walker', file: 'walker.png' },
  ]);

  await browser.close();
  console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); });

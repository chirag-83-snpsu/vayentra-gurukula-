import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ARTIFACT_DIR = '/Users/yashvanthkrishnamurthy/.gemini/antigravity/brain/9ac1acc9-9787-4e8a-9fa7-a2a35fe11e84/screenshots';
if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function capture() {
  console.log('🚀 Launching Headless Chrome on port 9277...');
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9277',
    '--disable-gpu',
    '--window-size=1440,900'
  ]);

  await sleep(2000);

  let versionData;
  try {
    const vRes = await fetch('http://127.0.0.1:9277/json/version');
    versionData = await vRes.json();
  } catch (err) {
    console.error('Failed to connect to Chrome debugging port:', err);
    chrome.kill();
    return;
  }

  const ws = new WebSocket(versionData.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const callbacks = new Map();
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (callbacks.has(m.id)) {
      callbacks.get(m.id)(m);
      callbacks.delete(m.id);
    }
  };

  const send = (method, params = {}) => new Promise(res => {
    const mId = id++;
    callbacks.set(mId, res);
    ws.send(JSON.stringify({ id: mId, method, params }));
  });

  const t = await send('Target.createTarget', { url: 'about:blank' });
  const targets = await (await fetch('http://127.0.0.1:9277/json')).json();
  const pt = targets.find(x => x.id === t.result.targetId);
  const pws = new WebSocket(pt.webSocketDebuggerUrl);
  await new Promise(r => pws.onopen = r);

  let pid = 1;
  const pcb = new Map();
  pws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (pcb.has(m.id)) {
      pcb.get(m.id)(m);
      pcb.delete(m.id);
    }
  };

  const sendP = (method, params = {}) => new Promise(res => {
    const mId = pid++;
    pcb.set(mId, res);
    pws.send(JSON.stringify({ id: mId, method, params }));
  });

  await sendP('Page.enable');
  await sendP('DOM.enable');

  async function takeShot(url, filename, evaluateScript = null) {
    console.log(`📸 Capturing ${url} -> ${filename}...`);
    await sendP('Page.navigate', { url });
    await sleep(2500);

    if (evaluateScript) {
      await sendP('Runtime.evaluate', { expression: evaluateScript });
      await sleep(1500);
    }

    const shot = await sendP('Page.captureScreenshot', { format: 'png' });
    const fullPath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(fullPath, Buffer.from(shot.result.data, 'base64'));
    console.log(`✅ Saved: ${fullPath} (${(shot.result.data.length / 1024).toFixed(1)} KB)`);
  }

  try {
    // 1. Pricing Page (₹599)
    await takeShot('http://localhost:3000/pricing', 'prod_1_pricing_page_599_1440.png');

    // 2. Admissions Page (Instant Admission Tab)
    await takeShot('http://localhost:3000/admissions', 'prod_2_admissions_instant_tab_1440.png');

    // 3. Checkout Page
    await takeShot('http://localhost:3000/checkout?admissionId=ADM-2026-DEMO', 'prod_3_checkout_ledger_1440.png');

    // 4. Terms of Service Page
    await takeShot('http://localhost:3000/terms', 'prod_4_terms_legal_page_1440.png');

    // 5. Student Learn Hub (Student login - verified clean role navigation)
    await takeShot('http://localhost:3000/login', 'prod_5_student_login_1440.png');

    // 6. Public Home page with new navigation items
    await takeShot('http://localhost:3000/', 'prod_6_landing_page_updated_1440.png');

    console.log('🎉 All production integration screenshots captured successfully!');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    pws.close();
    ws.close();
    chrome.kill();
  }
}

capture();

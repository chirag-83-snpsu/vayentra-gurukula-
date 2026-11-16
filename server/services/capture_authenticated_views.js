import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACT_DIR = '/Users/yashvanthkrishnamurthy/.gemini/antigravity/brain/9ac1acc9-9787-4e8a-9fa7-a2a35fe11e84/screenshots';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function captureAuthViews() {
  console.log('🚀 Launching Headless Chrome on port 9288...');
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9288',
    '--disable-gpu',
    '--window-size=1440,900'
  ]);

  await sleep(2000);
  const vRes = await fetch('http://127.0.0.1:9288/json/version');
  const { webSocketDebuggerUrl } = await vRes.json();
  const ws = new WebSocket(webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const callbacks = new Map();
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (callbacks.has(m.id)) { callbacks.get(m.id)(m); callbacks.delete(m.id); }
  };
  const send = (method, params = {}) => new Promise(res => {
    const mId = id++; callbacks.set(mId, res); ws.send(JSON.stringify({ id: mId, method, params }));
  });

  const t = await send('Target.createTarget', { url: 'about:blank' });
  const targets = await (await fetch('http://127.0.0.1:9288/json')).json();
  const pt = targets.find(x => x.id === t.result.targetId);
  const pws = new WebSocket(pt.webSocketDebuggerUrl);
  await new Promise(r => pws.onopen = r);

  let pid = 1;
  const pcb = new Map();
  pws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (pcb.has(m.id)) { pcb.get(m.id)(m); pcb.delete(m.id); }
  };
  const sendP = (method, params = {}) => new Promise(res => {
    const mId = pid++; pcb.set(mId, res); pws.send(JSON.stringify({ id: mId, method, params }));
  });

  await sendP('Page.enable');
  await sendP('DOM.enable');

  // Obtain auth tokens from backend API
  const parentLoginRes = await fetch('http://localhost:5001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'guardian@vayentra.org', password: 'Gurukula@2026' })
  });
  const parentLogin = await parentLoginRes.json();

  const studentLoginRes = await fetch('http://localhost:5001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student.grade1@vayentra.org', password: 'Gurukula@2026' })
  });
  const studentLogin = await studentLoginRes.json();

  const adminLoginRes = await fetch('http://localhost:5001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@vayentra.org', password: 'Gurukula@2026' })
  });
  const adminLogin = await adminLoginRes.json();

  async function shotAuth(token, userObj, navigateScript, filename) {
    console.log(`📸 Capturing authenticated view -> ${filename}...`);
    await sendP('Page.navigate', { url: 'http://localhost:3000/' });
    await sleep(1500);

    // Set localStorage credentials
    await sendP('Runtime.evaluate', {
      expression: `
        localStorage.setItem('vayentra_token', '${token}');
        localStorage.setItem('vayentra_auth_token', '${token}');
        localStorage.setItem('vayentra_user', JSON.stringify(${JSON.stringify(userObj)}));
      `
    });

    await sendP('Page.navigate', { url: 'http://localhost:3000/app' });
    await sleep(2500);

    if (navigateScript) {
      await sendP('Runtime.evaluate', { expression: navigateScript });
      await sleep(1500);
    }

    const shot = await sendP('Page.captureScreenshot', { format: 'png' });
    const fullPath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(fullPath, Buffer.from(shot.result.data, 'base64'));
    console.log(`✅ Saved: ${fullPath} (${(shot.result.data.length / 1024).toFixed(1)} KB)`);
  }

  try {
    // 1. Student view: Clean Learn Hub only (zero staff portals in sidebar)
    if (studentLogin.token) {
      await shotAuth(studentLogin.token, studentLogin.user, null, 'prod_7_student_isolated_nav_1440.png');
    }

    // 2. Parent view: Fees & Subscriptions tab
    if (parentLogin.token) {
      await shotAuth(
        parentLogin.token,
        parentLogin.user,
        `
          const buttons = Array.from(document.querySelectorAll('button'));
          const feesBtn = buttons.find(b => b.textContent && b.textContent.includes('Fees'));
          if (feesBtn) feesBtn.click();
        `,
        'prod_8_parent_fees_subscriptions_1440.png'
      );
    }

    // 3. Admin view: Collections & Reconciliation tab
    if (adminLogin.token) {
      await shotAuth(
        adminLogin.token,
        adminLogin.user,
        `
          const buttons = Array.from(document.querySelectorAll('button'));
          const finBtn = buttons.find(b => b.textContent && b.textContent.includes('Collections'));
          if (finBtn) finBtn.click();
        `,
        'prod_9_admin_collections_reconciliation_1440.png'
      );
    }

    console.log('🎉 All authenticated view screenshots captured successfully!');
  } catch (err) {
    console.error('Error in auth capture:', err);
  } finally {
    pws.close();
    ws.close();
    chrome.kill();
  }
}

captureAuthViews();

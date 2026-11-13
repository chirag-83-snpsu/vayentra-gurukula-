import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ARTIFACT_DIR = '/Users/yashvanthkrishnamurthy/.gemini/antigravity/brain/9ac1acc9-9787-4e8a-9fa7-a2a35fe11e84/screenshots';
if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function capture() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9265',
    '--disable-gpu',
    '--window-size=1440,900'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  const vRes = await fetch('http://127.0.0.1:9265/json/version');
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
  const targets = await (await fetch('http://127.0.0.1:9265/json')).json();
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
  await sendP('Runtime.enable');

  async function snap(filename, width = 1440, height = 900) {
    await sendP('Emulation.setDeviceMetricsOverride', {
      width, height, deviceScaleFactor: 1, mobile: width < 600
    });
    await new Promise(r => setTimeout(r, 600));
    const ss = await sendP('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, filename), Buffer.from(ss.result.data, 'base64'));
    console.log('Saved screenshot:', filename);
  }

  // 1. Milo Sharma (Grade 1 CBSE) Launchpad
  console.log('--- Step 1: Milo Sharma Launchpad ---');
  const g1Res = await fetch('http://127.0.0.1:5001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student.grade1@vayentra.org', password: 'Gurukula@2026' })
  });
  const g1 = await g1Res.json();
  await sendP('Page.navigate', { url: 'http://localhost:3000/' });
  await new Promise(r => setTimeout(r, 1200));
  await sendP('Runtime.evaluate', {
    expression: `
      localStorage.setItem('vayentra_token', '${g1.token}');
      localStorage.setItem('vayentra_auth_token', '${g1.token}');
      localStorage.setItem('vayentra_current_user', JSON.stringify(${JSON.stringify(g1.user)}));
      localStorage.setItem('vayentra_grade', '1');
      localStorage.setItem('vayentra_board', 'CBSE');
    `
  });
  await sendP('Page.navigate', { url: 'http://localhost:3000/app' });
  await new Promise(r => setTimeout(r, 2200));
  await snap('class1_milo_launchpad_clean_1440.png');

  // 2. Class 1 Explorer (All subjects published)
  console.log('--- Step 2: Class 1 Explorer ---');
  await sendP('Runtime.evaluate', {
    expression: `
      const exp = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Explore Class 1 Subjects'));
      if (exp) exp.click();
    `
  });
  await new Promise(r => setTimeout(r, 2200));
  await snap('class1_subjects_published_clean_1440.png');

  // 3. Open Chapter 1 English
  console.log('--- Step 3: Class 1 English Chapter 1 Lesson ---');
  await sendP('Runtime.evaluate', {
    expression: `
      const openBtn = document.querySelector('.vg1-open');
      if (openBtn) openBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 2500));
  await snap('class1_english_ch1_published_lesson_1440.png');

  // 4. Mobile view for Class 1 (390px)
  console.log('--- Step 4: Class 1 Mobile View ---');
  await snap('class1_english_mobile_390.png', 390, 844);

  // 5. Dhruv Rao (Grade 2 CBSE) Launchpad & Explorer
  console.log('--- Step 5: Dhruv Rao Class 2 Launchpad ---');
  const g2Res = await fetch('http://127.0.0.1:5001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student.grade2@vayentra.org', password: 'Gurukula@2026' })
  });
  const g2 = await g2Res.json();
  await sendP('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await sendP('Runtime.evaluate', {
    expression: `
      localStorage.setItem('vayentra_token', '${g2.token}');
      localStorage.setItem('vayentra_auth_token', '${g2.token}');
      localStorage.setItem('vayentra_current_user', JSON.stringify(${JSON.stringify(g2.user)}));
      localStorage.setItem('vayentra_grade', '2');
      localStorage.setItem('vayentra_board', 'CBSE');
    `
  });
  await sendP('Page.navigate', { url: 'http://localhost:3000/app' });
  await new Promise(r => setTimeout(r, 2200));
  await snap('class2_dhruv_launchpad_1440.png');

  // Open Class 2 Subjects
  console.log('--- Step 6: Class 2 Subjects Explorer ---');
  await sendP('Runtime.evaluate', {
    expression: `
      const exp2 = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Explore Class 2 Subjects'));
      if (exp2) exp2.click();
    `
  });
  await new Promise(r => setTimeout(r, 2500));
  await snap('class2_cbse_explorer_1440.png');

  // Open Chapter 1 English ("My Bicycle")
  console.log('--- Step 7: Class 2 English Chapter 1 Lesson with Scene ---');
  await sendP('Runtime.evaluate', {
    expression: `
      const openBtn = document.querySelector('.vg2-open');
      if (openBtn) openBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 2500));
  await snap('class2_english_ch1_visual_scene_1440.png');

  // 8. Class 2 Mobile View (390px)
  console.log('--- Step 8: Class 2 Mobile View ---');
  await snap('class2_english_mobile_390.png', 390, 844);

  // 9. Guardian Preview: Ananya Varma (Class 2 Karnataka State Board)
  console.log('--- Step 9: Guardian Preview (Ananya Varma) ---');
  const parRes = await fetch('http://127.0.0.1:5001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'guardian@vayentra.org', password: 'Gurukula@2026' })
  });
  const par = await parRes.json();
  await sendP('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await sendP('Runtime.evaluate', {
    expression: `
      localStorage.setItem('vayentra_token', '${par.token}');
      localStorage.setItem('vayentra_auth_token', '${par.token}');
      localStorage.setItem('vayentra_current_user', JSON.stringify(${JSON.stringify(par.user)}));
    `
  });
  await sendP('Page.navigate', { url: 'http://localhost:3000/app' });
  await new Promise(r => setTimeout(r, 2000));
  
  // Switch child to Ananya Varma in Navbar
  await sendP('Runtime.evaluate', {
    expression: `
      const sel = document.querySelector('select');
      if (sel) {
        sel.value = 'stu-002';
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
    `
  });
  await new Promise(r => setTimeout(r, 2200));
  await snap('class2_ananya_guardian_preview_1440.png');

  pws.close(); ws.close(); chrome.kill();
  console.log('=== ALL SCREENSHOTS COMPLETED SUCCESSFULLY ===');
}

capture().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capture() {
  console.log('Logging in student.grade1@vayentra.org...');
  const loginRes = await fetch('http://localhost:5001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student.grade1@vayentra.org', password: 'Gurukula@2026' })
  });
  const { token, user } = await loginRes.json();
  console.log('Logged in as:', user?.name);

  const port = 9260;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--disable-gpu',
    '--window-size=1440,1200'
  ]);

  let versionRes;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      versionRes = await res.json();
      break;
    } catch {
      await wait(300);
    }
  }

  if (!versionRes) throw new Error('Chrome failed to start');
  const ws = new WebSocket(versionRes.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));

  let id = 1;
  const callbacks = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (callbacks.has(m.id)) {
      callbacks.get(m.id)(m);
      callbacks.delete(m.id);
    }
  };
  const send = (method, params = {}) =>
    new Promise((res) => {
      const mId = id++;
      callbacks.set(mId, res);
      ws.send(JSON.stringify({ id: mId, method, params }));
    });

  const t = await send('Target.createTarget', { url: 'http://localhost:3000/' });
  const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const pt = targets.find((x) => x.id === t.result.targetId);
  const pws = new WebSocket(pt.webSocketDebuggerUrl);
  await new Promise((r) => (pws.onopen = r));

  let pid = 1;
  const pcb = new Map();
  pws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (pcb.has(m.id)) {
      pcb.get(m.id)(m);
      pcb.delete(m.id);
    }
  };
  const sendP = (method, params = {}) =>
    new Promise((res) => {
      const mId = pid++;
      pcb.set(mId, res);
      pws.send(JSON.stringify({ id: mId, method, params }));
    });

  await sendP('Page.enable');
  await sendP('Runtime.enable');
  await sendP('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1200,
    deviceScaleFactor: 1,
    mobile: false
  });

  // Authenticate as Milo (Class 1)
  await sendP('Runtime.evaluate', {
    expression: `
      localStorage.setItem('vayentra_token', '${token}');
      localStorage.setItem('vayentra_auth_token', '${token}');
      localStorage.setItem('vayentra_current_user', JSON.stringify(${JSON.stringify(user)}));
      localStorage.setItem('vayentra_grade', '1');
      localStorage.setItem('vayentra_board', 'CBSE');
    `
  });

  const outDir = '/Users/yashvanthkrishnamurthy/.gemini/antigravity/brain/9ac1acc9-9787-4e8a-9fa7-a2a35fe11e84/screenshots';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // --- SCREENSHOT 1: Class 1 Launchpad without "Open existing Learning Hub" ---
  console.log('Navigating to http://localhost:3000/app ...');
  await sendP('Page.navigate', { url: 'http://localhost:3000/app' });
  await wait(2500);

  const ss1 = await sendP('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'verify_1_no_learning_hub_1440.png'), Buffer.from(ss1.result.data, 'base64'));
  console.log('Saved: verify_1_no_learning_hub_1440.png');

  // Navigate into Explorer
  await sendP('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const exploreBtn = btns.find(b => b.textContent && b.textContent.includes('Explore Class 1 Subjects'));
        if (exploreBtn) exploreBtn.click();
      })()
    `
  });
  await wait(2000);

  // --- SCREENSHOT 2: Kannada Subject Tab in Class 1 Explorer ---
  await sendP('Runtime.evaluate', {
    expression: `
      (() => {
        const subjects = Array.from(document.querySelectorAll('.vg1-subject'));
        const kannadaBtn = subjects.find(b => b.textContent && b.textContent.includes('Kannada'));
        if (kannadaBtn) kannadaBtn.click();
      })()
    `
  });
  await wait(1500);
  const ss2 = await sendP('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'verify_2_kannada_subject_tab_1440.png'), Buffer.from(ss2.result.data, 'base64'));
  console.log('Saved: verify_2_kannada_subject_tab_1440.png');

  // --- SCREENSHOT 3: English Clean Chapters without AI Animated Video Badges ---
  await sendP('Runtime.evaluate', {
    expression: `
      (() => {
        const subjects = Array.from(document.querySelectorAll('.vg1-subject'));
        const engBtn = subjects.find(b => b.textContent && b.textContent.includes('English'));
        if (engBtn) engBtn.click();
      })()
    `
  });
  await wait(1500);
  const ss3 = await sendP('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'verify_3_english_clean_no_badges_1440.png'), Buffer.from(ss3.result.data, 'base64'));
  console.log('Saved: verify_3_english_clean_no_badges_1440.png');

  // --- SCREENSHOT 4: Hindi Published Chapters (19 Published · 19 Mapped) ---
  await sendP('Runtime.evaluate', {
    expression: `
      (() => {
        const subjects = Array.from(document.querySelectorAll('.vg1-subject'));
        const hindiBtn = subjects.find(b => b.textContent && b.textContent.includes('Hindi'));
        if (hindiBtn) hindiBtn.click();
      })()
    `
  });
  await wait(1500);
  const ss4 = await sendP('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'verify_4_hindi_19_published_1440.png'), Buffer.from(ss4.result.data, 'base64'));
  console.log('Saved: verify_4_hindi_19_published_1440.png');

  pws.close();
  ws.close();
  chrome.kill();
  console.log('All 4 verification screenshots saved!');
}

capture().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});

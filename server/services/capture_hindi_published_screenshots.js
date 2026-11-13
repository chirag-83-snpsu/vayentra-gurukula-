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
  console.log('Logged in as:', user.name);

  const port = 9272;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--disable-gpu',
    '--user-data-dir=/tmp/chrome_test_profile_hindi',
    '--no-first-run',
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

  // Seed authenticated localStorage
  await sendP('Runtime.evaluate', {
    expression: `
      localStorage.setItem('vayentra_token', '${token}');
      localStorage.setItem('vayentra_auth_token', '${token}');
      localStorage.setItem('vayentra_current_user', JSON.stringify(${JSON.stringify(user)}));
      localStorage.setItem('vayentra_grade', '1');
      localStorage.setItem('vayentra_board', 'CBSE');
    `
  });

  console.log('Navigating to http://localhost:3000/app ...');
  await sendP('Page.navigate', { url: 'http://localhost:3000/app' });
  await wait(2500);

  // Click 'Explore Class 1 Subjects'
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

  // Click 'Hindi' tab in Class 1
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

  const outDir = '/Users/yashvanthkrishnamurthy/.gemini/antigravity/brain/9ac1acc9-9787-4e8a-9fa7-a2a35fe11e84/screenshots';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Screenshot 1: Published Hindi chapters list
  const ss1 = await sendP('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'class1_hindi_published_chapters_1440.png'), Buffer.from(ss1.result.data, 'base64'));
  console.log('Saved Screenshot 1: class1_hindi_published_chapters_1440.png');

  // Click 'Open learning activity' on Chapter 1 (मीना का परिवार)
  await sendP('Runtime.evaluate', {
    expression: `
      (() => {
        const openBtns = Array.from(document.querySelectorAll('.vg1-open'));
        if (openBtns.length > 0) openBtns[0].click();
      })()
    `
  });
  await wait(2000);

  // Screenshot 2: Active Hindi Lesson 1
  const ss2 = await sendP('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'class1_hindi_lesson_meena_parivar_1440.png'), Buffer.from(ss2.result.data, 'base64'));
  console.log('Saved Screenshot 2: class1_hindi_lesson_meena_parivar_1440.png');

  // Now login as Class 2 student to verify Class 2 Hindi publication
  const loginG2 = await fetch('http://localhost:5001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student.grade2@vayentra.org', password: 'Gurukula@2026' })
  });
  const g2Data = await loginG2.json();

  await sendP('Runtime.evaluate', {
    expression: `
      localStorage.setItem('vayentra_token', '${g2Data.token}');
      localStorage.setItem('vayentra_auth_token', '${g2Data.token}');
      localStorage.setItem('vayentra_current_user', JSON.stringify(${JSON.stringify(g2Data.user)}));
      localStorage.setItem('vayentra_grade', '2');
      localStorage.setItem('vayentra_board', 'CBSE');
    `
  });

  await sendP('Page.navigate', { url: 'http://localhost:3000/app' });
  await wait(2500);

  // Click 'Explore Class 2 Subjects'
  await sendP('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const exploreBtn = btns.find(b => b.textContent && b.textContent.includes('Explore Class 2 Subjects'));
        if (exploreBtn) exploreBtn.click();
      })()
    `
  });
  await wait(2000);

  // Click 'Hindi' in Class 2
  await sendP('Runtime.evaluate', {
    expression: `
      (() => {
        const tabs = Array.from(document.querySelectorAll('.vg2-subject-card'));
        const hindiTab = tabs.find(t => t.textContent && t.textContent.includes('Hindi'));
        if (hindiTab) hindiTab.click();
      })()
    `
  });
  await wait(1500);

  // Screenshot 3: Class 2 Hindi Explorer
  const ss3 = await sendP('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'class2_hindi_sarangi_explorer_1440.png'), Buffer.from(ss3.result.data, 'base64'));
  console.log('Saved Screenshot 3: class2_hindi_sarangi_explorer_1440.png');

  pws.close();
  ws.close();
  chrome.kill();
  console.log('All Hindi screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});

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

  const port = 9289;
  const profileDir = `/tmp/chrome_profile_${Date.now()}`;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--disable-gpu',
    `--user-data-dir=${profileDir}`,
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

  // Click on Mathematics subject card
  console.log('Selecting Mathematics tab...');
  await sendP('Runtime.evaluate', {
    expression: `
      (() => {
        const subjects = Array.from(document.querySelectorAll('.vg1-subject'));
        const mathBtn = subjects.find(c => c.textContent && c.textContent.includes('Mathematics'));
        if (mathBtn) mathBtn.click();
      })()
    `
  });
  await wait(2000);

  const outDir = '/Users/yashvanthkrishnamurthy/.gemini/antigravity/brain/9ac1acc9-9787-4e8a-9fa7-a2a35fe11e84/screenshots';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Screenshot 1: Published 13 Mathematics chapters
  const ss1 = await sendP('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'class1_maths_13_chapters_published_1440.png'), Buffer.from(ss1.result.data, 'base64'));
  console.log('Saved Screenshot 1: class1_maths_13_chapters_published_1440.png');

  // Click 'Open learning activity' on Chapter 2 (What is Long?)
  console.log('Opening Chapter 2 activity...');
  await sendP('Runtime.evaluate', {
    expression: `
      (() => {
        const openBtns = Array.from(document.querySelectorAll('.vg1-open'));
        if (openBtns.length > 1) {
          openBtns[1].click();
        } else if (openBtns.length > 0) {
          openBtns[0].click();
        }
      })()
    `
  });
  await wait(2000);

  // Screenshot 2: Active Lesson
  const ss2 = await sendP('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'class1_maths_ch2_active_lesson_1440.png'), Buffer.from(ss2.result.data, 'base64'));
  console.log('Saved Screenshot 2: class1_maths_ch2_active_lesson_1440.png');

  // Mobile viewport
  await sendP('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await wait(1000);

  const ss3 = await sendP('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'class1_maths_ch2_mobile_390.png'), Buffer.from(ss3.result.data, 'base64'));
  console.log('Saved Screenshot 3: class1_maths_ch2_mobile_390.png');

  chrome.kill();
  console.log('Finished capturing Class 1 Mathematics screenshots.');
  process.exit(0);
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});

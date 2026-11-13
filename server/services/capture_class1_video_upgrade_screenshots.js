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

  // Click 'English' tab if not already active
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

  const outDir = '/Users/yashvanthkrishnamurthy/.gemini/antigravity/brain/9ac1acc9-9787-4e8a-9fa7-a2a35fe11e84/screenshots';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Screenshot 1: Clean Chapter List (No AI Animated Video badge chips)
  const ss1 = await sendP('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'class1_english_clean_chapter_list_1440.png'), Buffer.from(ss1.result.data, 'base64'));
  console.log('Saved Screenshot 1: class1_english_clean_chapter_list_1440.png');

  // Open Chapter 1: Two Little Hands
  await sendP('Runtime.evaluate', {
    expression: `
      (() => {
        const openBtns = Array.from(document.querySelectorAll('.vg1-open'));
        if (openBtns.length > 0) openBtns[0].click();
      })()
    `
  });
  await wait(2000);

  // Scroll to video container
  await sendP('Runtime.evaluate', {
    expression: `
      (() => {
        const player = document.querySelector('.vg1-video-container');
        if (player) {
          player.scrollIntoView({ behavior: 'instant', block: 'center' });
        }
      })()
    `
  });
  await wait(1200);

  // Screenshot 2: Chapter 1 Video Player (Desktop 1440px)
  const ss2 = await sendP('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'class1_english_ch1_video_player_active_1440.png'), Buffer.from(ss2.result.data, 'base64'));
  console.log('Saved Screenshot 2: class1_english_ch1_video_player_active_1440.png');

  // Set Mobile Viewport (390px - iPhone 14 / modern smartphone)
  await sendP('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await wait(1500);

  // Scroll to video container on mobile
  await sendP('Runtime.evaluate', {
    expression: `
      (() => {
        const player = document.querySelector('.vg1-video-container');
        if (player) {
          player.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      })()
    `
  });
  await wait(1000);

  // Screenshot 3: Mobile Viewport (390px)
  const ss3 = await sendP('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'class1_english_ch1_video_player_mobile_390.png'), Buffer.from(ss3.result.data, 'base64'));
  console.log('Saved Screenshot 3: class1_english_ch1_video_player_mobile_390.png');

  pws.close();
  ws.close();
  chrome.kill();
  console.log('All screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});

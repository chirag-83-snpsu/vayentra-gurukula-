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

  const port = 9250;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--disable-gpu',
    '--window-size=1440,1400'
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

  // Screenshot 1: English Chapters with AI Animated Video badges
  const ss1 = await sendP('Page.captureScreenshot', { format: 'png' });
  const outDir = '/Users/yashvanthkrishnamurthy/.gemini/antigravity/brain/9ac1acc9-9787-4e8a-9fa7-a2a35fe11e84/screenshots';
  fs.writeFileSync(path.join(outDir, 'class1_english_ai_video_badges_1440.png'), Buffer.from(ss1.result.data, 'base64'));
  console.log('Saved screenshot 1: class1_english_ai_video_badges_1440.png');

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

  // Scroll so controls and tabs are nicely framed
  await sendP('Runtime.evaluate', {
    expression: `
      (() => {
        const player = document.querySelector('.vg1-video-player');
        if (player) {
          const rect = player.getBoundingClientRect();
          window.scrollBy({ top: rect.top - 60, behavior: 'instant' });
        }
      })()
    `
  });
  await wait(1200);

  // Capture full element of the player
  const clipEval = await sendP('Runtime.evaluate', {
    expression: `
      (() => {
        const el = document.querySelector('.vg1-video-player');
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      })()
    `,
    returnByValue: true
  });
  if (clipEval.result.value) {
    const clip = clipEval.result.value;
    const playerShot = await sendP('Page.captureScreenshot', {
      format: 'png',
      clip: { x: clip.x, y: clip.y, width: clip.width, height: clip.height, scale: 1 }
    });
    fs.writeFileSync(path.join(outDir, 'class1_english_ai_video_player_controls_1440.png'), Buffer.from(playerShot.result.data, 'base64'));
    console.log('Saved focused player element shot: class1_english_ai_video_player_controls_1440.png');
  }

  // Click back to subjects
  await sendP('Runtime.evaluate', {
    expression: `
      (() => {
        const backBtn = Array.from(document.querySelectorAll('.vg1-minibutton')).find(b => b.textContent && b.textContent.includes('Back to subjects'));
        if (backBtn) backBtn.click();
      })()
    `
  });
  await wait(1500);

  // Open Chapter 4: The Cap Seller and the Monkeys (index 3)
  await sendP('Runtime.evaluate', {
    expression: `
      (() => {
        const openBtns = Array.from(document.querySelectorAll('.vg1-open'));
        if (openBtns.length >= 4) openBtns[3].click();
      })()
    `
  });
  await wait(2000);

  await sendP('Runtime.evaluate', {
    expression: `
      (() => {
        const player = document.querySelector('.vg1-video-player');
        if (player) player.scrollIntoView({ behavior: 'instant', block: 'start' });
      })()
    `
  });
  await wait(1200);

  // Screenshot 3: Chapter 4 Cap Seller and the Monkeys AI Video
  const ss3 = await sendP('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'class1_english_ch4_capseller_ai_video_1440.png'), Buffer.from(ss3.result.data, 'base64'));
  console.log('Saved screenshot 3: class1_english_ch4_capseller_ai_video_1440.png');

  // Click back to subjects
  await sendP('Runtime.evaluate', {
    expression: `
      (() => {
        const backBtn = Array.from(document.querySelectorAll('.vg1-minibutton')).find(b => b.textContent && b.textContent.includes('Back to subjects'));
        if (backBtn) backBtn.click();
      })()
    `
  });
  await wait(1500);

  // Open Chapter 9: Anandi's Rainbow (index 8)
  await sendP('Runtime.evaluate', {
    expression: `
      (() => {
        const openBtns = Array.from(document.querySelectorAll('.vg1-open'));
        if (openBtns.length >= 9) openBtns[8].click();
      })()
    `
  });
  await wait(2000);

  await sendP('Runtime.evaluate', {
    expression: `
      (() => {
        const player = document.querySelector('.vg1-video-player');
        if (player) player.scrollIntoView({ behavior: 'instant', block: 'start' });
      })()
    `
  });
  await wait(1200);

  // Screenshot 4: Chapter 9 Anandi's Rainbow AI Video
  const ss4 = await sendP('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'class1_english_ch9_rainbow_ai_video_1440.png'), Buffer.from(ss4.result.data, 'base64'));
  console.log('Saved screenshot 4: class1_english_ch9_rainbow_ai_video_1440.png');

  pws.close();
  ws.close();
  chrome.kill();
  console.log('All screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});

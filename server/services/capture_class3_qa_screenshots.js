import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capture() {
  console.log('Logging in student.grade3@vayentra.org (Kabir Patel)...');
  const loginRes = await fetch('http://localhost:5001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student.grade3@vayentra.org', password: 'Gurukula@2026' })
  });
  const { token, user } = await loginRes.json();
  console.log('Logged in as:', user.name);

  console.log('Logging in admin@vayentra.org...');
  const adminLoginRes = await fetch('http://localhost:5001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@vayentra.org', password: 'Gurukula@2026' })
  });
  const adminData = await adminLoginRes.json();
  const adminToken = adminData.token;
  const adminUser = adminData.user;
  console.log('Admin logged in as:', adminUser.name);

  const outDir = '/Users/yashvanthkrishnamurthy/.gemini/antigravity/brain/9ac1acc9-9787-4e8a-9fa7-a2a35fe11e84/screenshots';
  fs.mkdirSync(outDir, { recursive: true });

  const port = 9279;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--disable-gpu',
    '--user-data-dir=/tmp/chrome_test_profile_class3',
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

  const takeScreenshot = async (filename) => {
    const shot = await sendP('Page.captureScreenshot', { format: 'png' });
    const fullPath = path.join(outDir, filename);
    fs.writeFileSync(fullPath, Buffer.from(shot.result.data, 'base64'));
    console.log(`Saved screenshot: ${filename}`);
  };

  // 1. Kabir Patel Class 3 Launchpad (Desktop 1440px)
  await sendP('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1200,
    deviceScaleFactor: 1,
    mobile: false
  });

  await sendP('Page.navigate', { url: 'http://localhost:3000/app' });
  await wait(1000);

  await sendP('Runtime.evaluate', {
    expression: `
      localStorage.setItem('vayentra_token', '${token}');
      localStorage.setItem('vayentra_auth_token', '${token}');
      localStorage.setItem('vayentra_current_user', JSON.stringify(${JSON.stringify(user)}));
      localStorage.setItem('vayentra_grade', '3');
      localStorage.setItem('vayentra_board', 'CBSE');
      window.location.reload();
    `
  });
  await wait(3000);
  await takeScreenshot('class3_kabir_launchpad_all_subjects_1440.png');

  // 2. Class 3 Launchpad (Mobile 390px)
  await sendP('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await wait(1000);
  await takeScreenshot('class3_launchpad_mobile_390.png');

  // Reset desktop metrics
  await sendP('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1200,
    deviceScaleFactor: 1,
    mobile: false
  });
  await wait(800);

  // 3. Open Explorer for Class 3
  await sendP('Runtime.evaluate', {
    expression: `
      const buttons = Array.from(document.querySelectorAll('button'));
      const exploreBtn = buttons.find(b => b.textContent && b.textContent.includes('Explore Class 3'));
      if (exploreBtn) exploreBtn.click();
    `
  });
  await wait(2000);
  await takeScreenshot('class3_universal_explorer_maths_1440.png');

  // 4. Switch to Hindi in Universal Explorer
  await sendP('Runtime.evaluate', {
    expression: `
      const buttons = Array.from(document.querySelectorAll('button'));
      const hindiBtn = buttons.find(b => b.textContent && b.textContent.includes('Hindi'));
      if (hindiBtn) hindiBtn.click();
    `
  });
  await wait(2000);
  await takeScreenshot('class3_universal_explorer_hindi_1440.png');

  // 5. Switch to Kannada in Universal Explorer
  await sendP('Runtime.evaluate', {
    expression: `
      const buttons = Array.from(document.querySelectorAll('button'));
      const kanBtn = buttons.find(b => b.textContent && b.textContent.includes('Kannada'));
      if (kanBtn) kanBtn.click();
    `
  });
  await wait(2000);
  await takeScreenshot('class3_universal_explorer_kannada_1440.png');

  // 6. Switch to English in Universal Explorer
  await sendP('Runtime.evaluate', {
    expression: `
      const buttons = Array.from(document.querySelectorAll('button'));
      const engBtn = buttons.find(b => b.textContent && b.textContent.includes('English'));
      if (engBtn) engBtn.click();
    `
  });
  await wait(2000);
  await takeScreenshot('class3_universal_explorer_english_1440.png');

  // 7. Admin View — Curriculum Matrix & Publishing Studio
  await sendP('Runtime.evaluate', {
    expression: `
      localStorage.setItem('vayentra_token', '${adminToken}');
      localStorage.setItem('vayentra_auth_token', '${adminToken}');
      localStorage.setItem('vayentra_current_user', JSON.stringify(${JSON.stringify(adminUser)}));
      window.location.reload();
    `
  });
  await wait(3000);

  // Switch to curriculum_matrix tab
  await sendP('Runtime.evaluate', {
    expression: `
      const buttons = Array.from(document.querySelectorAll('button'));
      const matrixTab = buttons.find(b => b.textContent && b.textContent.includes('Curriculum Matrix'));
      if (matrixTab) matrixTab.click();
    `
  });
  await wait(2500);
  await takeScreenshot('admin_curriculum_matrix_and_publishing_studio_1440.png');

  // Filter matrix to Class 3
  await sendP('Runtime.evaluate', {
    expression: `
      const gradeSelect = document.querySelector('#matrix-grade');
      if (gradeSelect) {
        gradeSelect.value = '3';
        gradeSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    `
  });
  await wait(2000);
  await takeScreenshot('admin_curriculum_matrix_class3_filter_1440.png');

  chrome.kill();
  console.log('All QA screenshots captured successfully!');
  process.exit(0);
}

capture().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});

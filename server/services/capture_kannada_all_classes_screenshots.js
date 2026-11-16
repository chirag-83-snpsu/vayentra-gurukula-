import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capture() {
  const outDir = '/Users/yashvanthkrishnamurthy/.gemini/antigravity/brain/9ac1acc9-9787-4e8a-9fa7-a2a35fe11e84/screenshots';
  fs.mkdirSync(outDir, { recursive: true });

  const port = 9260;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--disable-gpu',
    '--window-size=1440,1200'
  ]);

  try {
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

    async function evaluate(expression) {
      const res = await sendP('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      return res.result?.result?.value;
    }

    async function takeScreenshot(filename) {
      await wait(800);
      const res = await sendP('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(res.result.data, 'base64');
      const filepath = path.join(outDir, filename);
      fs.writeFileSync(filepath, buffer);
      console.log('Saved screenshot:', filepath);
    }

    // -------------------------------------------------------------
    // SCENARIO 1: Class 1 Explorer with Kannada Subject Card
    // -------------------------------------------------------------
    console.log('--- Scenario 1: Class 1 Milo Sharma (CBSE) ---');
    const loginG1 = await fetch('http://localhost:5001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student.grade1@vayentra.org', password: 'Gurukula@2026' })
    });
    const { token: tokenG1, user: userG1 } = await loginG1.json();

    await sendP('Page.navigate', { url: 'http://localhost:3000/app' });
    await wait(2000);

    await evaluate(`
      localStorage.setItem('vayentra_token', '${tokenG1}');
      localStorage.setItem('vayentra_auth_token', '${tokenG1}');
      localStorage.setItem('vayentra_current_user', JSON.stringify(${JSON.stringify(userG1)}));
      localStorage.setItem('vayentra_grade', '1');
      localStorage.setItem('vayentra_board', 'CBSE');
      window.location.reload();
    `);
    await wait(2500);

    // Click 'Explore Class 1 Subjects'
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const exploreBtn = btns.find(b => b.textContent && b.textContent.includes('Explore Class 1 Subjects'));
        if (exploreBtn) exploreBtn.click();
      })()
    `);
    await wait(2000);

    // Screenshot: Class 1 Subject Cards showing Kannada
    await takeScreenshot('class1_subjects_with_kannada_1440.png');

    // Click on Kannada subject card
    await evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('.vg1-subject'));
        const kanCard = cards.find(b => b.textContent && b.textContent.includes('Kannada'));
        if (kanCard) kanCard.click();
      })()
    `);
    await wait(1500);

    // Screenshot: Class 1 Kannada chapters list
    await takeScreenshot('class1_kannada_chapters_list_1440.png');

    // Open first Kannada lesson (ಅಕ್ಷರ ಲೋಕ)
    await evaluate(`
      (() => {
        const openBtns = Array.from(document.querySelectorAll('.vg1-open'));
        if (openBtns.length > 0) openBtns[0].click();
      })()
    `);
    await wait(2000);

    // Screenshot: Class 1 Kannada Lesson View
    await takeScreenshot('class1_kannada_akshara_loka_lesson_1440.png');

    // -------------------------------------------------------------
    // SCENARIO 2: Class 2 Explorer with Kannada Subject Card
    // -------------------------------------------------------------
    console.log('--- Scenario 2: Class 2 Dhruv Rao (CBSE) ---');
    const loginG2 = await fetch('http://localhost:5001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student.grade2@vayentra.org', password: 'Gurukula@2026' })
    });
    const { token: tokenG2, user: userG2 } = await loginG2.json();

    await evaluate(`
      localStorage.setItem('vayentra_token', '${tokenG2}');
      localStorage.setItem('vayentra_auth_token', '${tokenG2}');
      localStorage.setItem('vayentra_current_user', JSON.stringify(${JSON.stringify(userG2)}));
      localStorage.setItem('vayentra_grade', '2');
      localStorage.setItem('vayentra_board', 'CBSE');
      window.location.reload();
    `);
    await wait(2500);

    // Click Explore Class 2 Subjects
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const exploreBtn = btns.find(b => b.textContent && b.textContent.includes('Explore Class 2 Subjects'));
        if (exploreBtn) exploreBtn.click();
      })()
    `);
    await wait(2000);

    // Click on Kannada subject card
    await evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('.vg1-subject'));
        const kanCard = cards.find(b => b.textContent && b.textContent.includes('Kannada'));
        if (kanCard) kanCard.click();
      })()
    `);
    await wait(1500);

    // Screenshot: Class 2 Kannada Explorer
    await takeScreenshot('class2_kannada_savirudi_explorer_1440.png');

    // -------------------------------------------------------------
    // SCENARIO 3: Class 7 Aarav Varma with Kannada Subject Space
    // -------------------------------------------------------------
    console.log('--- Scenario 3: Class 7 Aarav Varma (CBSE) ---');
    const loginG7 = await fetch('http://localhost:5001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@vayentra.org', password: 'Gurukula@2026' })
    });
    const { token: tokenG7, user: userG7 } = await loginG7.json();

    await evaluate(`
      localStorage.setItem('vayentra_token', '${tokenG7}');
      localStorage.setItem('vayentra_auth_token', '${tokenG7}');
      localStorage.setItem('vayentra_current_user', JSON.stringify(${JSON.stringify(userG7)}));
      localStorage.setItem('vayentra_grade', '7');
      localStorage.setItem('vayentra_board', 'CBSE');
      window.location.reload();
    `);
    await wait(2500);

    // Screenshot: Class 7 Launchpad showing Kannada in verified subjects
    await takeScreenshot('class7_launchpad_with_kannada_1440.png');

    // Click on Kannada verified subject or Explore Class 7 Subjects
    await evaluate(`
      (() => {
        const kanSubjBtn = Array.from(document.querySelectorAll('.vg-one-subject')).find(b => b.textContent && b.textContent.includes('Kannada'));
        if (kanSubjBtn) {
          kanSubjBtn.click();
        } else {
          const expBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Explore Class 7 Subjects'));
          if (expBtn) expBtn.click();
        }
      })()
    `);
    await wait(2000);

    // Ensure Kannada tab is selected in OneUniversalGradeExplorer
    await evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('.vg1-subject'));
        const kanTab = cards.find(b => b.textContent && b.textContent.includes('Kannada'));
        if (kanTab) kanTab.click();
      })()
    `);
    await wait(1500);

    // Screenshot: Class 7 Universal Explorer showing Kannada
    await takeScreenshot('class7_universal_kannada_subject_1440.png');

    // Open Class 7 Kannada Concept Class
    await evaluate(`
      (() => {
        const openConceptBtn = document.querySelector('.vg1-open');
        if (openConceptBtn) openConceptBtn.click();
      })()
    `);
    await wait(2000);

    // Screenshot: Class 7 Kannada Sandhi Concept Class
    await takeScreenshot('class7_kannada_sandhi_concept_class_1440.png');

    pws.close();
    ws.close();
    chrome.kill();
    console.log('All screenshots captured successfully!');
  } catch (err) {
    chrome.kill();
    console.error('Screenshot capture failed:', err);
  }
}

capture();

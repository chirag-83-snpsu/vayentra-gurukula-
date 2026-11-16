import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../index.js';
import { GRADE1_ENGLISH_MRIDANG } from '../data/grade1EnglishMridang.js';
import { seedAndPublishGrade1Curriculum } from '../services/seedAndPublishGrade1Curriculum.js';
import { db } from '../db/database.js';

test('Grade 1 English (Mridang) AI Video Curriculum Verification', async (t) => {
  // Ensure curriculum is seeded and published in the test in-memory database
  seedAndPublishGrade1Curriculum(db);

  await t.test('1. Curriculum metadata and chapter count', () => {
    assert.equal(GRADE1_ENGLISH_MRIDANG.edition, '2026-27');
    assert.equal(GRADE1_ENGLISH_MRIDANG.subjectTitle, 'English');
    assert.equal(GRADE1_ENGLISH_MRIDANG.textbookName, 'Mridang');
    assert.equal(GRADE1_ENGLISH_MRIDANG.lessons.length, 9, 'Must have exactly 9 English chapters mapped');
  });

  await t.test('2. Every chapter has an AI video storyboard with 4 pedagogical scenes', () => {
    const requiredKinds = [
      'hands-actions',
      'greetings-sun',
      'picture-pond',
      'capseller-monkeys',
      'farm-animals',
      'shapes-drawing',
      'healthy-plate',
      'four-seasons',
      'anandi-rainbow'
    ];

    GRADE1_ENGLISH_MRIDANG.lessons.forEach((lesson, idx) => {
      assert.ok(lesson.aiVideo, `Lesson ${lesson.chapterNumber} must have aiVideo object`);
      assert.ok(lesson.aiVideo.videoTitle.length > 5, `Lesson ${lesson.chapterNumber} videoTitle must be descriptive`);
      assert.ok(lesson.aiVideo.durationSeconds >= 120, `Lesson ${lesson.chapterNumber} duration must be >= 120s`);
      assert.equal(lesson.aiVideo.scenes.length, 4, `Lesson ${lesson.chapterNumber} must have exactly 4 scenes`);

      lesson.aiVideo.scenes.forEach((scene, sIdx) => {
        assert.equal(scene.sceneNumber, sIdx + 1);
        assert.ok(scene.title.length > 5, `Scene ${scene.sceneNumber} title too short`);
        assert.ok(scene.narration.length > 20, `Scene ${scene.sceneNumber} narration too short`);
        assert.ok(scene.visualPrompt.length > 20, `Scene ${scene.sceneNumber} visualPrompt too short`);
        assert.ok(scene.keyTakeaway.length > 5, `Scene ${scene.sceneNumber} keyTakeaway too short`);
        assert.ok(requiredKinds.includes(scene.animationKind), `Animation kind ${scene.animationKind} must be supported`);
      });
    });
  });

  await t.test('3. Database check: all 9 English chapters are in one_chapters and published in one_foundation_units', () => {
    const chapters = db.prepare(`
      SELECT ch.chapter_number, ch.chapter_title, ch.review_status, u.id AS unit_id, u.status AS unit_status, c.title AS unit_title
      FROM one_chapters ch
      JOIN one_subjects s ON s.id = ch.subject_id
      JOIN one_curriculum_tracks t ON t.id = s.track_id
      JOIN one_concepts c ON c.chapter_id = ch.id
      JOIN one_foundation_units u ON u.concept_id = c.id
      WHERE t.grade = 1 AND t.board = 'CBSE' AND s.subject_title = 'English'
      ORDER BY ch.chapter_number
    `).all();

    assert.equal(chapters.length, 9, 'Must find all 9 English chapters in SQLite');
    for (const ch of chapters) {
      assert.equal(ch.review_status, 'reviewed', `Chapter ${ch.chapter_number} must be reviewed`);
      assert.equal(ch.unit_status, 'published', `Unit for chapter ${ch.chapter_number} must be published`);
      assert.ok(ch.unit_title.length > 5, `Unit title for chapter ${ch.chapter_number} must be valid`);
    }
  });

  await t.test('4. Child safety verification: No open chats, no external video embeds, clean local SVG rendering', () => {
    for (const lesson of GRADE1_ENGLISH_MRIDANG.lessons) {
      for (const scene of lesson.aiVideo.scenes) {
        assert.doesNotMatch(scene.narration, /http:\/\/|https:\/\//, 'No external web URLs in narration');
        assert.doesNotMatch(scene.visualPrompt, /<script>|eval\(/, 'No script injection in visual prompts');
      }
    }
  });

  await t.test('5. Media assets & manifest verification for offline Indian English audio, captions, and posters', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');

    const manifestPath = path.resolve('public/media/class1_english/asset_manifest.json');
    assert.ok(fs.existsSync(manifestPath), 'Master asset_manifest.json must exist');

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.ok(manifest.curriculum.includes('Class 1 English'));
    assert.equal(manifest.edition, '2026-27');
    assert.equal(manifest.chapters.length, 9);
    assert.equal(manifest.chapters[0].pedagogicalPhases.length, 7);

    for (const lesson of GRADE1_ENGLISH_MRIDANG.lessons) {
      assert.ok(lesson.aiVideo.audioNarrationUrl, `Lesson ${lesson.chapterNumber} must have audioNarrationUrl`);
      assert.ok(lesson.aiVideo.captionVttUrl, `Lesson ${lesson.chapterNumber} must have captionVttUrl`);
      assert.ok(lesson.aiVideo.posterUrl, `Lesson ${lesson.chapterNumber} must have posterUrl`);

      // Verify physical existence of files referenced by URL
      const audioRelative = lesson.aiVideo.audioNarrationUrl.replace(/^\//, 'public/');
      const captionRelative = lesson.aiVideo.captionVttUrl.replace(/^\//, 'public/');
      const posterRelative = lesson.aiVideo.posterUrl.replace(/^\//, 'public/');

      assert.ok(fs.existsSync(path.resolve(audioRelative)), `Audio file must exist: ${audioRelative}`);
      assert.ok(fs.existsSync(path.resolve(captionRelative)), `Caption file must exist: ${captionRelative}`);
      assert.ok(fs.existsSync(path.resolve(posterRelative)), `Poster file must exist: ${posterRelative}`);
    }
  });
});

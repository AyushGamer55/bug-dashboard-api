const express = require('express');
const router = express.Router();
const Bug = require('../models/Bug');

// -------------------- CRUD --------------------

// GET all
router.get('/', async (req, res) => {
  try {
    const bugs = await Bug.find().sort({ ScenarioID: 1 });
    res.json(bugs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bugs', error: err.message });
  }
});

// -------------------- SUMMARY --------------------
router.get('/summary', async (req, res) => {
  try {
    const total = await Bug.countDocuments();

    if (total === 0) {
      return res.json({
        total,
        byStatus: {},
        byPriority: {},
        bySeverity: {},
        byArea: {}
      });
    }

    const aggCount = (field) =>
      Bug.aggregate([
        {
          $group: {
            _id: { $ifNull: [`$${field}`, 'Unknown'] },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        {
          $project: {
            _id: 0,
            k: '$_id',
            v: '$count'
          }
        }
      ]);

    const [statusArr, priorityArr, severityArr] = await Promise.all([
      aggCount('Status'),
      aggCount('Priority'),
      aggCount('Severity')
    ]);

    const toObj = (arr) =>
      Object.fromEntries(arr.map(({ k, v }) => [k, v]));

    // Area categories from keywords
    const areaCategories = {
      Livestream: /\blivestream\b/i,
      Timeline: /\btimeline\b/i,
      Teams: /\bteams\b/i,
      "Apps/URL": /\b(apps?|url)\b/i,
      Screenshots: /\bscreenshot(s)?\b/i
    };

    const allBugs = await Bug.find();
    const areaCounts = {};
    for (const [area, regex] of Object.entries(areaCategories)) {
      areaCounts[area] = allBugs.filter(bug =>
        regex.test(bug.ScenarioDescription || bug.Description || "")
      ).length;
    }

    res.json({
      total,
      byStatus: toObj(statusArr),
      byPriority: toObj(priorityArr),
      bySeverity: toObj(severityArr),
      byArea: areaCounts
    });

  } catch (err) {
    res.status(500).json({ message: 'Failed to build summary', error: err.message });
  }
});

// -------------------- DELETE ALL --------------------
router.delete('/delete-all', async (req, res) => {
  try {
    const result = await Bug.deleteMany({});
    res.json({ ok: true, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete all', error: err.message });
  }
});

// -------------------- CREATE --------------------
router.post('/', async (req, res) => {
  try {
    const bug = await Bug.create(req.body);
    res.status(201).json(bug);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create bug', error: err.message });
  }
});

// -------------------- UPDATE --------------------
router.patch('/:id', async (req, res) => {
  try {
    const updated = await Bug.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Bug not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update bug', error: err.message });
  }
});

// -------------------- DELETE ONE --------------------
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Bug.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Bug not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete bug', error: err.message });
  }
});

module.exports = router;

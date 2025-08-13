// backend/routes/bugRoutes.js
const express = require('express');
const router = express.Router();
const Bug = require('../models/Bug');

// -------------------- CRUD --------------------

// GET all
router.get('/', async (req, res) => {
  try {
    const bugs = await Bug.find().sort({ ScenarioID: 1 }); // keep your existing sort
    res.json(bugs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bugs', error: err.message });
  }
});

// CREATE
router.post('/', async (req, res) => {
  try {
    const bug = await Bug.create(req.body);
    res.status(201).json(bug);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create bug', error: err.message });
  }
});

// DELETE all (keep this BEFORE '/:id' so it doesn't get treated as an id)
router.delete('/delete-all', async (req, res) => {
  try {
    await Bug.deleteMany({});
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete all', error: err.message });
  }
});

// UPDATE (PATCH)
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

// DELETE one
router.delete('/:id', async (req, res) => {
  try {
    await Bug.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete bug', error: err.message });
  }
});

// -------------------- SUMMARY --------------------
// GET /api/bugs/summary
router.get('/summary', async (req, res) => {
  try {
    const total = await Bug.countDocuments();

    if (total === 0) {
      return res.json({
        total,
        byStatus: {},
        byPriority: {},
        bySeverity: {},
        byArea: {} // <- uses TestCaseID as Category
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

    const [statusArr, priorityArr, severityArr, areaArr] = await Promise.all([
      aggCount('Status'),
      aggCount('Priority'),
      aggCount('Severity'),
      aggCount('TestCaseID') // <-- CATEGORY source
    ]);

    const toObj = (arr) => Object.fromEntries(arr.map(({ k, v }) => [k, v]));

    res.json({
      total,
      byStatus: toObj(statusArr),
      byPriority: toObj(priorityArr),
      bySeverity: toObj(severityArr),
      byArea: toObj(areaArr) // <-- returns { "Livestream": 5, "Screenshots": 3, ... }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to build summary', error: err.message });
  }
});

module.exports = router;

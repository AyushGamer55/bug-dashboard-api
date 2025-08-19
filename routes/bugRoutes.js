const express = require('express');
const router = express.Router();
const Bug = require('../models/Bug');

// -------------------- CRUD --------------------

// GET all bugs for a device
router.get('/', async (req, res) => {
  try {
    const { deviceId } = req.query;
    if (!deviceId) return res.status(400).json({ message: 'deviceId is required' });

    const bugs = await Bug.find({ deviceId }).sort({ ScenarioID: 1 });
    res.json(bugs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bugs', error: err.message });
  }
});

// CREATE a bug (must include deviceId in body)
router.post('/', async (req, res) => {
  try {
    const { deviceId } = req.body;
    if (!deviceId) return res.status(400).json({ message: 'deviceId is required in body' });

    const bug = await Bug.create(req.body);
    res.status(201).json(bug);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create bug', error: err.message });
  }
});

// DELETE all bugs for a device
router.delete('/delete-all', async (req, res) => {
  try {
    const { deviceId } = req.query;
    if (!deviceId) return res.status(400).json({ message: 'deviceId is required' });

    const result = await Bug.deleteMany({ deviceId });
    res.json({ ok: true, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete all', error: err.message });
  }
});

// UPDATE a bug (PATCH) only if deviceId matches
router.patch('/:id', async (req, res) => {
  try {
    const { deviceId } = req.body;
    if (!deviceId) return res.status(400).json({ message: 'deviceId is required in body' });

    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ message: 'Bug not found' });
    if (bug.deviceId !== deviceId) return res.status(403).json({ message: 'Forbidden: wrong deviceId' });

    const updated = await Bug.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update bug', error: err.message });
  }
});

// DELETE a bug only if deviceId matches
router.delete('/:id', async (req, res) => {
  try {
    const { deviceId } = req.query;
    if (!deviceId) return res.status(400).json({ message: 'deviceId is required' });

    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ message: 'Bug not found' });
    if (bug.deviceId !== deviceId) return res.status(403).json({ message: 'Forbidden: wrong deviceId' });

    await Bug.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete bug', error: err.message });
  }
});

// -------------------- SUMMARY --------------------
// GET /api/bugs/summary?deviceId=...
router.get('/summary', async (req, res) => {
  try {
    const { deviceId } = req.query;
    if (!deviceId) return res.status(400).json({ message: 'deviceId is required' });

    const total = await Bug.countDocuments({ deviceId });
    if (total === 0) {
      return res.json({ total, byStatus: {}, byPriority: {}, bySeverity: {}, byArea: {} });
    }

    const aggCount = (field) =>
      Bug.aggregate([
        { $match: { deviceId } },
        { $group: { _id: { $ifNull: [`$${field}`, 'Unknown'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, k: '$_id', v: '$count' } }
      ]);

    const [statusArr, priorityArr, severityArr, areaArr] = await Promise.all([
      aggCount('Status'),
      aggCount('Priority'),
      aggCount('Severity'),
      aggCount('TestCaseID')
    ]);

    const toObj = (arr) => Object.fromEntries(arr.map(({ k, v }) => [k, v]));

    res.json({
      total,
      byStatus: toObj(statusArr),
      byPriority: toObj(priorityArr),
      bySeverity: toObj(severityArr),
      byArea: toObj(areaArr)
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to build summary', error: err.message });
  }
});

module.exports = router;

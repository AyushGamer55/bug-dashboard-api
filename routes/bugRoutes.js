const express = require('express');
const router = express.Router();
const Bug = require('../models/Bug');

// Get all bugs
router.get('/', async (req, res) => {
  try {
    const bugs = await Bug.find().sort({ ScenarioID: 1 });
    res.json(bugs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create bug
router.post('/', async (req, res) => {
  try {
    const newBug = await Bug.create(req.body);
    res.status(201).json(newBug);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update bug
router.patch('/:id', async (req, res) => {
  try {
    const updated = await Bug.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ message: 'Bug not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Summary route
router.get('/summary', async (req, res) => {
  try {
    const total = await Bug.countDocuments();
    if (total === 0) {
      return res.json({
        total: 0,
        byStatus: {},
        byPriority: {},
        bySeverity: {},
        byArea: {}
      });
    }

    const aggregateCount = async (field) => {
      const results = await Bug.aggregate([
        { $group: { _id: $${field}, count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      return results.reduce((acc, cur) => {
        acc[cur._id || 'Unknown'] = cur.count;
        return acc;
      }, {});
    };

    const [byStatus, byPriority, bySeverity] = await Promise.all([
      aggregateCount('Status'),
      aggregateCount('Priority'),
      aggregateCount('Severity')
    ]);

    // Area detection from description text
    const areaCategories = ['Livestream', 'Timeline', 'Teams', 'Apps', 'URL', 'Screenshots'];
    const byArea = Object.fromEntries(areaCategories.map(area => [area, 0]));

    const bugs = await Bug.find({}, { Description: 1 });
    bugs.forEach((bug) => {
      const desc = (bug.Description || '').toLowerCase();
      areaCategories.forEach((area) => {
        if (desc.includes(area.toLowerCase())) {
          byArea[area]++;
        }
      });
    });

    res.json({
      total,
      byStatus,
      byPriority,
      bySeverity,
      byArea
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete all bugs
router.delete('/delete-all', async (req, res) => {
  try {
    await Bug.deleteMany({});
    res.json({ message: 'All bugs deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete single bug
router.delete('/:id', async (req, res) => {
  try {
    await Bug.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bug deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

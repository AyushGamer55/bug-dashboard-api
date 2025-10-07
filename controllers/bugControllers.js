const Bug = require('../models/Bug');

// Normalize StepsToExecute
const normalizeSteps = steps => {
  if (!steps) {
    return [];
  }
  if (typeof steps === 'string') {
    return steps
      .split('\n')
      .map(line => line.trim())
      .filter(line => line);
  } else if (Array.isArray(steps)) {
    return steps
      .map(line => (typeof line === 'string' ? line.trim() : line))
      .filter(line => line);
  }
  return [];
};

// 📌 Get all bugs (by user & device)
exports.getAllBugs = async (req, res) => {
  try {
    const { deviceId } = req.query;

    const bugs = await Bug.find({ deviceId, createdBy: req.user._id }).sort({
      ScenarioID: 1
    });
    res.json(bugs);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to fetch bugs', error: err.message });
  }
};

// 📌 Create new bug (prevent duplicates)
exports.addBug = async (req, res) => {
  try {
    const { deviceId, ScenarioID } = req.body;

    req.body.StepsToExecute = normalizeSteps(req.body.StepsToExecute);

    // App-level duplicate guard (in case index hasn't built yet):
    if (ScenarioID) {
      const existing = await Bug.findOne({
        deviceId,
        ScenarioID,
        createdBy: req.user._id
      }).lean();

      if (existing) {
        return res
          .status(409)
          .json({ message: 'This Bug already exists for your device' });
      }
    }

    const bug = await Bug.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(bug);
  } catch (err) {
    if (err.code === 11000) {
      // Mongo duplicate key error (index enforced)
      return res
        .status(409)
        .json({ message: 'This Bug already exists for your device' });
    }
    res
      .status(400)
      .json({ message: 'Failed to create bug', error: err.message });
  }
};

// 📌 Delete all bugs for a device
exports.deleteAllBugs = async (req, res) => {
  try {
    const { deviceId } = req.query;

    const result = await Bug.deleteMany({ deviceId, createdBy: req.user._id });
    res.json({ ok: true, deletedCount: result.deletedCount });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to delete all bugs', error: err.message });
  }
};

// 📌 Update a bug (prevent duplicate-on-update)
exports.updateBug = async (req, res) => {
  try {
    let bug = await Bug.findById(req.params.id);
    if (!bug) {
      return res.status(404).json({ message: 'Bug not found' });
    }

    if (bug.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // If ScenarioID is being changed/added, ensure no clash with another bug
    if (
      typeof req.body.ScenarioID === 'string' &&
      req.body.ScenarioID.trim() !== ''
    ) {
      const clash = await Bug.findOne({
        _id: { $ne: bug._id },
        deviceId: bug.deviceId, // keep same device context
        createdBy: bug.createdBy, // keep same user context
        ScenarioID: req.body.ScenarioID.trim()
      }).lean();

      if (clash) {
        return res.status(409).json({
          message:
            'Another bug with this ScenarioID already exists for this device & user'
        });
      }
    }

    req.body.StepsToExecute = normalizeSteps(req.body.StepsToExecute);

    bug = await Bug.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    res.json(bug);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: 'Duplicate bug not allowed', error: err.keyValue });
    }
    res
      .status(400)
      .json({ message: 'Failed to update bug', error: err.message });
  }
};

// 📌 Delete a bug
exports.deleteBug = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) {
      return res.status(404).json({ message: 'Bug not found' });
    }

    if (bug.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Bug.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res
      .status(400)
      .json({ message: 'Failed to delete bug', error: err.message });
  }
};

// 📌 Bug Summary
exports.getBugSummary = async (req, res) => {
  try {
    const { deviceId } = req.query;

    const total = await Bug.countDocuments({
      deviceId,
      createdBy: req.user._id
    });
    if (total === 0) {
      return res.json({
        total,
        byStatus: {},
        byPriority: {},
        bySeverity: {},
        byArea: {}
      });
    }

    const aggCount = field =>
      Bug.aggregate([
        { $match: { deviceId, createdBy: req.user._id } },
        {
          $group: {
            _id: { $ifNull: [`$${field}`, 'Unknown'] },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $project: { _id: 0, k: '$_id', v: '$count' } }
      ]);

    const [statusArr, priorityArr, severityArr, areaArr] = await Promise.all([
      aggCount('Status'),
      aggCount('Priority'),
      aggCount('Severity'),
      aggCount('Category')
    ]);

    const toObj = arr => Object.fromEntries(arr.map(({ k, v }) => [k, v]));

    res.json({
      total,
      byStatus: toObj(statusArr),
      byPriority: toObj(priorityArr),
      bySeverity: toObj(severityArr),
      byArea: toObj(areaArr)
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to build summary', error: err.message });
  }
};

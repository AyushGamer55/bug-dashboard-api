const Bug = require("../models/Bug"); // <-- adjust path if your model is elsewhere

// 📌 Get all bugs
exports.getAllBugs = async (req, res) => {
  try {
    const bugs = await Bug.find();
    res.json(bugs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch bugs" });
  }
};

// 📌 Add new bug
exports.addBug = async (req, res) => {
  try {
    const bug = new Bug(req.body);
    const savedBug = await bug.save();
    res.status(201).json(savedBug);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to add bug" });
  }
};

// 📌 Delete bug by ID
exports.deleteBug = async (req, res) => {
  try {
    await Bug.findByIdAndDelete(req.params.id);
    res.json({ message: "Bug deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete bug" });
  }
};

// 📌 Delete all bugs
exports.deleteAllBugs = async (req, res) => {
  try {
    await Bug.deleteMany({});
    res.json({ message: "All bugs deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete all bugs" });
  }
};

// 📌 Update bug
exports.updateBug = async (req, res) => {
  try {
    const updatedBug = await Bug.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedBug);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update bug" });
  }
};

// 📌 SUMMARY endpoint
exports.getBugSummary = async (req, res) => {
  try {
    const summary = await Bug.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ["$Status", "Open"] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ["$Status", "Closed"] }, 1, 0] } },
          priorityList: { $push: "$Priority" }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1,
          open: 1,
          closed: 1,
          priority: {
            high: {
              $size: {
                $filter: {
                  input: "$priorityList",
                  as: "p",
                  cond: { $eq: ["$$p", "High"] }
                }
              }
            },
            medium: {
              $size: {
                $filter: {
                  input: "$priorityList",
                  as: "p",
                  cond: { $eq: ["$$p", "Medium"] }
                }
              }
            },
            low: {
              $size: {
                $filter: {
                  input: "$priorityList",
                  as: "p",
                  cond: { $eq: ["$$p", "Low"] }
                }
              }
            }
          }
        }
      }
    ]);

    if (!summary.length) {
      return res.json({
        total: 0,
        open: 0,
        closed: 0,
        priority: { high: 0, medium: 0, low: 0 }
      });
    }

    res.json(summary[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get bug summary" });
  }
};

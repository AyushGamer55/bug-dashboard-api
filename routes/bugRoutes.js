const express = require('express')
const router = express.Router()
const Bug = require('../models/Bug')

// GET all bugs
router.get('/', async (req, res) => {
  const bugs = await Bug.find().sort({ createdAt: -1 })
  res.json(bugs)
})

// POST a new bug
router.post('/', async (req, res) => {
  try {
    const bug = new Bug(req.body)
    await bug.save()
    res.status(201).json(bug)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// DELETE all bugs
router.delete('/delete-all', async (req, res) => {
  try {
    await Bug.deleteMany({})
    res.json({ message: "All bugs deleted successfully" })
  } catch (err) {
    res.status(500).json({ error: "Failed to delete all bugs" })
  }
})

// DELETE one bug by ID
router.delete('/:id', async (req, res) => {
  try {
    await Bug.findByIdAndDelete(req.params.id)
    res.json({ message: "Bug deleted" })
  } catch (err) {
    res.status(500).json({ error: "Delete failed" })
  }
})

// PATCH (Edit) a bug by ID
router.patch('/:id', async (req, res) => {
  try {
    const updatedBug = await Bug.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    )
    res.json(updatedBug)
  } catch (err) {
    res.status(500).json({ error: "Failed to update bug" })
  }
})

module.exports = router

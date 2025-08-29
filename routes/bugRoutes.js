const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const bugController = require("../controllers/bugControllers");

// ✅ Protect all routes
router.use(authMiddleware);

// Bug routes
router.get("/", bugController.getAllBugs);
router.post("/", bugController.addBug);
router.delete("/delete-all", bugController.deleteAllBugs);
router.patch("/:id", bugController.updateBug);
router.delete("/:id", bugController.deleteBug);
router.get("/summary", bugController.getBugSummary);

module.exports = router;

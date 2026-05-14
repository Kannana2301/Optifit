const { Progress } = require("../models");
const { publicUploadPath } = require("../middleware/upload");
const mongoose = require("mongoose");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function listProgress(req, res) {
  const rows = await Progress.find({ user_id: req.user.userId })
    .sort({ tracked_on: -1 })
    .lean();
  res.json(rows);
}

async function addProgress(req, res) {
  const { tracked_on, weight, chest, waist, hips, calories_burned, before_image, after_image, notes } = req.body;
  if (!tracked_on) return res.status(400).json({ error: "tracked_on date is required." });

  await Progress.findOneAndUpdate(
    { user_id: req.user.userId, tracked_on },
    {
      user_id: req.user.userId,
      tracked_on,
      weight: weight || null,
      chest: chest || null,
      waist: waist || null,
      hips: hips || null,
      calories_burned: calories_burned || 0,
      before_image: before_image || null,
      after_image: after_image || null,
      notes: notes || null
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({ message: "Progress saved." });
}

async function updateProgress(req, res) {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: "Invalid progress ID." });
  const { tracked_on, weight, chest, waist, hips, calories_burned, before_image, after_image, notes } = req.body;
  await Progress.updateOne(
    { _id: req.params.id, user_id: req.user.userId },
    {
      ...(tracked_on != null ? { tracked_on } : {}),
      weight: weight || null,
      chest: chest || null,
      waist: waist || null,
      hips: hips || null,
      calories_burned: calories_burned || 0,
      before_image: before_image || null,
      after_image: after_image || null,
      notes: notes || null
    }
  );
  res.json({ message: "Progress updated." });
}

async function deleteProgress(req, res) {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: "Invalid progress ID." });
  await Progress.deleteOne({ _id: req.params.id, user_id: req.user.userId });
  res.json({ message: "Progress entry deleted." });
}

async function uploadProgressImage(req, res) {
  const { progress_id, image_type = "after" } = req.body;
  if (!req.file) return res.status(400).json({ error: "Progress image is required." });
  if (!progress_id) return res.status(400).json({ error: "progress_id is required." });
  if (!isValidId(progress_id)) return res.status(400).json({ error: "Invalid progress ID." });

  const column = image_type === "before" ? "before_image" : "after_image";
  const imagePath = publicUploadPath(req.file);

  await Progress.updateOne(
    { _id: progress_id, user_id: req.user.userId },
    { [column]: imagePath }
  );

  res.json({ message: "Progress image uploaded.", image_url: imagePath });
}

async function progressAnalytics(req, res) {
  const boundaryDate = new Date();
  boundaryDate.setDate(boundaryDate.getDate() - 84);
  const dateKey = boundaryDate.toISOString().slice(0, 10);

  const rows = await Progress.find({
    user_id: req.user.userId,
    tracked_on: { $gte: dateKey }
  })
    .sort({ tracked_on: 1 })
    .lean();

  const first = rows[0] || {};
  const last = rows[rows.length - 1] || {};

  res.json({
    entries: rows,
    summary: {
      weightChange: first.weight != null && last.weight != null ? Number((last.weight - first.weight).toFixed(1)) : 0,
      waistChange: first.waist != null && last.waist != null ? Number((last.waist - first.waist).toFixed(1)) : 0,
      caloriesBurned: rows.reduce((sum, row) => sum + Number(row.calories_burned || 0), 0)
    }
  });
}

module.exports = { listProgress, addProgress, updateProgress, deleteProgress, uploadProgressImage, progressAnalytics };

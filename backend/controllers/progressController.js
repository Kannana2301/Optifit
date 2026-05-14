const { ProgressTracking } = require("../models");
const { publicUploadPath } = require("../middleware/upload");

async function listProgress(req, res) {
  const rows = await ProgressTracking.find({ user_id: req.user.userId })
    .sort({ tracked_on: -1 }).limit(30).lean();
  res.json(rows);
}

async function addProgress(req, res) {
  const { tracked_on, weight, chest, waist, hips, calories_burned, before_image, after_image, notes } = req.body;
  if (!tracked_on) return res.status(400).json({ error: "tracked_on date is required." });
  await ProgressTracking.findOneAndUpdate(
    { user_id: req.user.userId, tracked_on },
    { $set: { weight: weight || null, chest: chest || null, waist: waist || null, hips: hips || null, calories_burned: calories_burned || 0, before_image: before_image || null, after_image: after_image || null, notes: notes || null } },
    { upsert: true }
  );
  res.status(201).json({ message: "Progress saved." });
}

async function updateProgress(req, res) {
  const { tracked_on, weight, chest, waist, hips, calories_burned, before_image, after_image, notes } = req.body;
  const update = {};
  if (tracked_on) update.tracked_on = tracked_on;
  if (weight !== undefined) update.weight = weight;
  if (chest !== undefined) update.chest = chest;
  if (waist !== undefined) update.waist = waist;
  if (hips !== undefined) update.hips = hips;
  if (calories_burned !== undefined) update.calories_burned = calories_burned;
  if (before_image !== undefined) update.before_image = before_image;
  if (after_image !== undefined) update.after_image = after_image;
  if (notes !== undefined) update.notes = notes;
  await ProgressTracking.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user.userId },
    { $set: update }
  );
  res.json({ message: "Progress updated." });
}

async function deleteProgress(req, res) {
  await ProgressTracking.findOneAndDelete({ _id: req.params.id, user_id: req.user.userId });
  res.json({ message: "Progress entry deleted." });
}

async function uploadProgressImage(req, res) {
  const { progress_id, image_type = "after" } = req.body;
  if (!req.file) return res.status(400).json({ error: "Progress image is required." });
  if (!progress_id) return res.status(400).json({ error: "progress_id is required." });

  const column = image_type === "before" ? "before_image" : "after_image";
  const imagePath = publicUploadPath(req.file);
  await ProgressTracking.findOneAndUpdate(
    { _id: progress_id, user_id: req.user.userId },
    { $set: { [column]: imagePath } }
  );
  res.json({ message: "Progress image uploaded.", image_url: imagePath });
}

async function progressAnalytics(req, res) {
  const rows = await ProgressTracking.find({
    user_id: req.user.userId,
    tracked_on: { $gte: new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000) }
  }).sort({ tracked_on: 1 }).lean();

  const first = rows[0] || {};
  const last = rows[rows.length - 1] || {};
  res.json({
    entries: rows,
    summary: {
      weightChange: first.weight && last.weight ? Number((last.weight - first.weight).toFixed(1)) : 0,
      waistChange: first.waist && last.waist ? Number((last.waist - first.waist).toFixed(1)) : 0,
      caloriesBurned: rows.reduce((sum, row) => sum + Number(row.calories_burned || 0), 0)
    }
  });
}

module.exports = { listProgress, addProgress, updateProgress, deleteProgress, uploadProgressImage, progressAnalytics };

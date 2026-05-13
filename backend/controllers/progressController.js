const { db } = require("../config/db");
const { publicUploadPath } = require("../middleware/upload");

async function listProgress(req, res) {
  const [rows] = await db.query(
    "SELECT * FROM progress_tracking WHERE user_id = ? ORDER BY tracked_on DESC LIMIT 30",
    [req.user.userId]
  );
  res.json(rows);
}

async function addProgress(req, res) {
  const { tracked_on, weight, chest, waist, hips, calories_burned, before_image, after_image, notes } = req.body;
  if (!tracked_on) return res.status(400).json({ error: "tracked_on date is required." });
  await db.query(
    `INSERT INTO progress_tracking (user_id, tracked_on, weight, chest, waist, hips, calories_burned, before_image, after_image, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE weight = VALUES(weight), chest = VALUES(chest), waist = VALUES(waist), hips = VALUES(hips), calories_burned = VALUES(calories_burned), before_image = VALUES(before_image), after_image = VALUES(after_image), notes = VALUES(notes)`,
    [req.user.userId, tracked_on, weight || null, chest || null, waist || null, hips || null, calories_burned || 0, before_image || null, after_image || null, notes || null]
  );
  res.status(201).json({ message: "Progress saved." });
}

async function updateProgress(req, res) {
  const { tracked_on, weight, chest, waist, hips, calories_burned, before_image, after_image, notes } = req.body;
  await db.query(
    `UPDATE progress_tracking SET tracked_on = COALESCE(?, tracked_on), weight = ?, chest = ?, waist = ?, hips = ?, calories_burned = ?, before_image = COALESCE(?, before_image), after_image = COALESCE(?, after_image), notes = ?
     WHERE id = ? AND user_id = ?`,
    [tracked_on || null, weight || null, chest || null, waist || null, hips || null, calories_burned || 0, before_image || null, after_image || null, notes || null, req.params.id, req.user.userId]
  );
  res.json({ message: "Progress updated." });
}

async function deleteProgress(req, res) {
  await db.query("DELETE FROM progress_tracking WHERE id = ? AND user_id = ?", [req.params.id, req.user.userId]);
  res.json({ message: "Progress entry deleted." });
}

async function uploadProgressImage(req, res) {
  const { progress_id, image_type = "after" } = req.body;
  if (!req.file) return res.status(400).json({ error: "Progress image is required." });
  if (!progress_id) return res.status(400).json({ error: "progress_id is required." });

  const column = image_type === "before" ? "before_image" : "after_image";
  const imagePath = publicUploadPath(req.file);
  await db.query(`UPDATE progress_tracking SET ${column} = ? WHERE id = ? AND user_id = ?`, [imagePath, progress_id, req.user.userId]);
  res.json({ message: "Progress image uploaded.", image_url: imagePath });
}

async function progressAnalytics(req, res) {
  const [rows] = await db.query(
    `SELECT tracked_on, weight, waist, calories_burned
     FROM progress_tracking
     WHERE user_id = ? AND tracked_on >= DATE_SUB(CURDATE(), INTERVAL 12 WEEK)
     ORDER BY tracked_on`,
    [req.user.userId]
  );
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

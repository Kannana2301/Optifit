const bcrypt = require("bcrypt");
const { db } = require("../config/db");
const { publicUploadPath } = require("../middleware/upload");

async function getProfile(req, res) {
  const [[user]] = await db.query("SELECT id, email, name, phone, height, weight, age, gender, activity_level, goal, profile_picture FROM users WHERE id = ?", [req.user.userId]);
  res.json(user);
}

async function updateProfile(req, res) {
  const { name, phone, height, weight, age, gender, activity_level, goal, profile_picture } = req.body;
  await db.query(
    `UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), height = COALESCE(?, height), weight = COALESCE(?, weight),
     age = COALESCE(?, age), gender = COALESCE(?, gender), activity_level = COALESCE(?, activity_level), goal = COALESCE(?, goal), profile_picture = COALESCE(?, profile_picture)
     WHERE id = ?`,
    [name || null, phone || null, height || null, weight || null, age || null, gender || null, activity_level || null, goal || null, profile_picture || null, req.user.userId]
  );
  res.json({ message: "Profile updated." });
}

async function changePassword(req, res) {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password || new_password.length < 6) return res.status(400).json({ error: "Current password and a 6+ character new password are required." });
  const [[user]] = await db.query("SELECT password FROM users WHERE id = ?", [req.user.userId]);
  const valid = await bcrypt.compare(current_password, user.password);
  if (!valid) return res.status(401).json({ error: "Current password is incorrect." });
  const hashed = await bcrypt.hash(new_password, 10);
  await db.query("UPDATE users SET password = ? WHERE id = ?", [hashed, req.user.userId]);
  res.json({ message: "Password updated." });
}

async function uploadProfilePicture(req, res) {
  if (!req.file) return res.status(400).json({ error: "Profile image is required." });
  const profilePicture = publicUploadPath(req.file);
  await db.query("UPDATE users SET profile_picture = ? WHERE id = ?", [profilePicture, req.user.userId]);
  res.json({ message: "Profile picture uploaded.", profile_picture: profilePicture });
}

module.exports = { getProfile, updateProfile, changePassword, uploadProfilePicture };

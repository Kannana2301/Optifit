const bcrypt = require("bcrypt");
const { User } = require("../models");
const { publicUploadPath } = require("../middleware/upload");

async function getProfile(req, res) {
  const user = await User.findById(req.user.userId)
    .select("email name phone height weight age gender activity_level goal profile_picture")
    .lean();
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json(user);
}

async function updateProfile(req, res) {
  const { name, phone, height, weight, age, gender, activity_level, goal, profile_picture } = req.body;
  await User.findByIdAndUpdate(req.user.userId, {
    ...(name != null ? { name } : {}),
    ...(phone != null ? { phone } : {}),
    ...(height != null ? { height } : {}),
    ...(weight != null ? { weight } : {}),
    ...(age != null ? { age } : {}),
    ...(gender != null ? { gender } : {}),
    ...(activity_level != null ? { activity_level } : {}),
    ...(goal != null ? { goal } : {}),
    ...(profile_picture != null ? { profile_picture } : {})
  });
  res.json({ message: "Profile updated." });
}

async function changePassword(req, res) {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password || new_password.length < 6) return res.status(400).json({ error: "Current password and a 6+ character new password are required." });

  const user = await User.findById(req.user.userId).lean();
  if (!user) return res.status(404).json({ error: "User not found." });

  const valid = await bcrypt.compare(current_password, user.password);
  if (!valid) return res.status(401).json({ error: "Current password is incorrect." });

  const hashed = await bcrypt.hash(new_password, 10);
  await User.findByIdAndUpdate(req.user.userId, { password: hashed });
  res.json({ message: "Password updated." });
}

async function uploadProfilePicture(req, res) {
  if (!req.file) return res.status(400).json({ error: "Profile image is required." });
  const profilePicture = publicUploadPath(req.file);
  await User.findByIdAndUpdate(req.user.userId, { profile_picture: profilePicture });
  res.json({ message: "Profile picture uploaded.", profile_picture: profilePicture });
}

module.exports = { getProfile, updateProfile, changePassword, uploadProfilePicture };

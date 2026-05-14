const bcrypt = require("bcrypt");
const { User } = require("../models");
const { publicUploadPath } = require("../middleware/upload");

async function getProfile(req, res) {
  const user = await User.findById(req.user.userId)
    .select("id email name phone height weight age gender activity_level goal profile_picture").lean();
  res.json(user);
}

async function updateProfile(req, res) {
  const { name, phone, height, weight, age, gender, activity_level, goal, profile_picture } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (phone !== undefined) update.phone = phone;
  if (height !== undefined) update.height = height;
  if (weight !== undefined) update.weight = weight;
  if (age !== undefined) update.age = age;
  if (gender !== undefined) update.gender = gender;
  if (activity_level !== undefined) update.activity_level = activity_level;
  if (goal !== undefined) update.goal = goal;
  if (profile_picture !== undefined) update.profile_picture = profile_picture;
  await User.findByIdAndUpdate(req.user.userId, { $set: update });
  res.json({ message: "Profile updated." });
}

async function changePassword(req, res) {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password || new_password.length < 6) return res.status(400).json({ error: "Current password and a 6+ character new password are required." });
  const user = await User.findById(req.user.userId).select("password").lean();
  const valid = await bcrypt.compare(current_password, user.password);
  if (!valid) return res.status(401).json({ error: "Current password is incorrect." });
  const hashed = await bcrypt.hash(new_password, 10);
  await User.findByIdAndUpdate(req.user.userId, { $set: { password: hashed } });
  res.json({ message: "Password updated." });
}

async function uploadProfilePicture(req, res) {
  if (!req.file) return res.status(400).json({ error: "Profile image is required." });
  const profilePicture = publicUploadPath(req.file);
  await User.findByIdAndUpdate(req.user.userId, { $set: { profile_picture: profilePicture } });
  res.json({ message: "Profile picture uploaded.", profile_picture: profilePicture });
}

module.exports = { getProfile, updateProfile, changePassword, uploadProfilePicture };

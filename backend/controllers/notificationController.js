const { Notification } = require("../models");

async function listNotifications(req, res) {
  const rows = await Notification.find({ user_id: req.user.userId })
    .sort({ remind_at: -1, created_at: -1 }).limit(50).lean();
  res.json(rows);
}

async function createNotification(req, res) {
  const { type, title, message, remind_at } = req.body;
  if (!type || !title) return res.status(400).json({ error: "type and title are required." });
  const doc = await Notification.create({ user_id: req.user.userId, type, title, message: message || null, remind_at: remind_at || null });
  res.status(201).json(doc.toObject());
}

async function markRead(req, res) {
  await Notification.findOneAndUpdate({ _id: req.params.id, user_id: req.user.userId }, { $set: { is_read: true } });
  res.json({ message: "Notification marked read." });
}

module.exports = { listNotifications, createNotification, markRead };

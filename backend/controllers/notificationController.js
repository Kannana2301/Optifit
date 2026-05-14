const { Notification } = require("../models");

async function listNotifications(req, res) {
  const rows = await Notification.find({ user_id: req.user.userId }).sort({ createdAt: -1 }).lean();
  rows.sort((a, b) => {
    const aDate = a.remind_at || a.createdAt;
    const bDate = b.remind_at || b.createdAt;
    return bDate - aDate;
  });
  res.json(rows);
}

async function createNotification(req, res) {
  const { type, title, message, remind_at } = req.body;
  if (!type || !title) return res.status(400).json({ error: "type and title are required." });

  const notification = await Notification.create({
    user_id: req.user.userId,
    type,
    title,
    message: message || null,
    remind_at: remind_at ? new Date(remind_at) : null,
    is_read: false
  });

  res.status(201).json({ id: notification._id, type, title, message, remind_at, is_read: false });
}

async function markRead(req, res) {
  await Notification.updateOne({ _id: req.params.id, user_id: req.user.userId }, { is_read: true });
  res.json({ message: "Notification marked read." });
}

module.exports = { listNotifications, createNotification, markRead };

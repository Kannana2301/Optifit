const { db } = require("../config/db");

async function listNotifications(req, res) {
  const [rows] = await db.query("SELECT * FROM notifications WHERE user_id = ? ORDER BY COALESCE(remind_at, created_at) DESC LIMIT 50", [req.user.userId]);
  res.json(rows);
}

async function createNotification(req, res) {
  const { type, title, message, remind_at } = req.body;
  if (!type || !title) return res.status(400).json({ error: "type and title are required." });
  const [result] = await db.query(
    "INSERT INTO notifications (user_id, type, title, message, remind_at) VALUES (?, ?, ?, ?, ?)",
    [req.user.userId, type, title, message || null, remind_at || null]
  );
  res.status(201).json({ id: result.insertId, type, title, message, remind_at, is_read: false });
}

async function markRead(req, res) {
  await db.query("UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND id = ?", [req.user.userId, req.params.id]);
  res.json({ message: "Notification marked read." });
}

module.exports = { listNotifications, createNotification, markRead };

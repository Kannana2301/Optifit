const { db } = require("../config/db");
const { calculateBmi, calculateCalories, macrosFromCalories } = require("../services/metrics");

async function getDashboard(req, res) {
  const userId = req.user.userId;
  const [[user]] = await db.query("SELECT id, name, email, height, weight, age, gender, activity_level, goal, profile_picture FROM users WHERE id = ?", [userId]);
  if (!user) return res.status(404).json({ error: "User not found." });

  const [progress] = await db.query(
    "SELECT tracked_on, weight, calories_burned FROM progress_tracking WHERE user_id = ? ORDER BY tracked_on DESC LIMIT 12",
    [userId]
  );
  const [waterRows] = await db.query(
    "SELECT glasses, target_glasses FROM water_tracking WHERE user_id = ? AND tracked_on = CURDATE()",
    [userId]
  );
  const [workoutLogs] = await db.query(
    "SELECT DATE(completed_at) AS completed_on, COUNT(*) AS sessions, SUM(calories_burned) AS calories FROM workout_logs WHERE user_id = ? AND completed_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY DATE(completed_at) ORDER BY completed_on",
    [userId]
  );
  const [notificationRows] = await db.query("SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = FALSE", [userId]);

  const weightHistory = progress.length
    ? progress.reverse().map((item) => ({ date: item.tracked_on, weight: item.weight || user.weight }))
    : Array.from({ length: 6 }, (_, index) => ({ date: `Week ${index + 1}`, weight: Number(user.weight) + (5 - index) * 0.3 }));

  const calories = calculateCalories(user);
  const water = waterRows[0] || { glasses: 4, target_glasses: 8 };

  res.json({
    user,
    bmi: calculateBmi(user.weight, user.height),
    dailyCalories: calories,
    macros: macrosFromCalories(calories, user.goal),
    water,
    streak: workoutLogs.length,
    unreadNotifications: notificationRows[0].unread,
    progress: {
      workoutCompletion: Math.min(100, workoutLogs.length * 12),
      waterCompletion: Math.round((water.glasses / water.target_glasses) * 100),
      calorieCompletion: 82
    },
    cards: [
      { label: "Current weight", value: `${user.weight} kg`, tone: "green" },
      { label: "BMI", value: calculateBmi(user.weight, user.height), tone: "blue" },
      { label: "Daily target", value: `${calories} kcal`, tone: "orange" },
      { label: "Workout streak", value: `${workoutLogs.length} days`, tone: "purple" }
    ],
    charts: {
      weight: weightHistory,
      workouts: workoutLogs
    }
  });
}

async function upsertWater(req, res) {
  const glasses = Number(req.body.glasses);
  const target = Number(req.body.target_glasses || 8);
  if (!Number.isFinite(glasses) || glasses < 0) return res.status(400).json({ error: "Valid glasses value is required." });

  await db.query(
    `INSERT INTO water_tracking (user_id, tracked_on, glasses, target_glasses)
     VALUES (?, CURDATE(), ?, ?)
     ON DUPLICATE KEY UPDATE glasses = VALUES(glasses), target_glasses = VALUES(target_glasses)`,
    [req.user.userId, glasses, target]
  );
  res.json({ message: "Water tracking updated.", glasses, target_glasses: target });
}

module.exports = { getDashboard, upsertWater };

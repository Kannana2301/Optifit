const { db } = require("../config/db");

async function createDailyReminder(userId, type, title, message, hour) {
  const [existing] = await db.query(
    `SELECT id FROM notifications
     WHERE user_id = ? AND type = ? AND title = ? AND DATE(COALESCE(remind_at, created_at)) = CURDATE()
     LIMIT 1`,
    [userId, type, title]
  );
  if (existing.length) return;

  await db.query(
    "INSERT INTO notifications (user_id, type, title, message, remind_at) VALUES (?, ?, ?, ?, TIMESTAMP(CURDATE(), MAKETIME(?, 0, 0)))",
    [userId, type, title, message, hour]
  );
}

async function runReminderSweep() {
  const [users] = await db.query("SELECT id, goal FROM users LIMIT 500");
  for (const user of users) {
    await createDailyReminder(user.id, "water", "Hydration check", "Log your water intake for today.", 10);
    await createDailyReminder(user.id, "meal", "Meal plan review", "Review and schedule your meals for the day.", 8);

    const [workouts] = await db.query(
      "SELECT id FROM workout_logs WHERE user_id = ? AND DATE(completed_at) = CURDATE() LIMIT 1",
      [user.id]
    );
    if (!workouts.length) {
      await createDailyReminder(user.id, "workout", "Training reminder", "Complete a planned workout or log an active recovery session.", 18);
    }
  }
}

function startReminderScheduler() {
  runReminderSweep().catch((error) => console.error("Reminder sweep failed:", error.message));
  setInterval(() => {
    runReminderSweep().catch((error) => console.error("Reminder sweep failed:", error.message));
  }, 60 * 60 * 1000);
}

module.exports = { startReminderScheduler, runReminderSweep };

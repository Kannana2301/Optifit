const { User, WorkoutLog, Notification } = require("../models");

async function createDailyReminder(userId, type, title, message, hour) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const existing = await Notification.findOne({
    user_id: userId, type, title,
    createdAt: { $gte: todayStart }
  }).lean();
  if (existing) return;

  const remindAt = new Date();
  remindAt.setHours(hour, 0, 0, 0);
  await Notification.create({ user_id: userId, type, title, message, remind_at: remindAt });
}

async function runReminderSweep() {
  const users = await User.find().limit(500).lean();
  for (const user of users) {
    await createDailyReminder(user._id, "water", "Hydration check", "Log your water intake for today.", 10);
    await createDailyReminder(user._id, "meal", "Meal plan review", "Review and schedule your meals for the day.", 8);

    const workout = await WorkoutLog.findOne({
      user_id: user._id,
      completed_at: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    }).lean();

    if (!workout) {
      await createDailyReminder(user._id, "workout", "Training reminder", "Complete a planned workout or log an active recovery session.", 18);
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

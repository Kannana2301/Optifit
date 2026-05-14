const { User, WorkoutLog, Notification } = require("../models");

function getTodayStart() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function getReminderTime(hour) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  date.setMilliseconds(0);
  return date;
}

async function createDailyReminder(userId, type, title, message, hour) {
  const existing = await Notification.findOne({
    user_id: userId,
    type,
    title,
    createdAt: { $gte: getTodayStart() }
  });

  if (existing) return;

  await Notification.create({
    user_id: userId,
    type,
    title,
    message,
    remind_at: getReminderTime(hour)
  });
}

async function runReminderSweep() {
  const users = await User.find().limit(500).lean();
  const todayStart = getTodayStart();

  for (const user of users) {
    await createDailyReminder(user._id, "water", "Hydration check", "Log your water intake for today.", 10);
    await createDailyReminder(user._id, "meal", "Meal plan review", "Review and schedule your meals for the day.", 8);

    const hasWorkoutToday = await WorkoutLog.exists({
      user_id: user._id,
      completed_at: { $gte: todayStart }
    });

    if (!hasWorkoutToday) {
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

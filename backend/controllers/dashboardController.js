const { User, ProgressTracking, WaterTracking, WorkoutLog, Notification } = require("../models");
const { calculateBmi, calculateCalories, macrosFromCalories } = require("../services/metrics");

async function getDashboard(req, res) {
  const userId = req.user.userId;
  const user = await User.findById(userId).lean();
  if (!user) return res.status(404).json({ error: "User not found." });

  const progress = await ProgressTracking.find({ user_id: userId })
    .sort({ tracked_on: -1 }).limit(12).lean();

  const waterDoc = await WaterTracking.findOne({ user_id: userId, tracked_on: new Date().toISOString().slice(0, 10) }).lean();
  const workoutLogs = await WorkoutLog.find({
    user_id: userId,
    completed_at: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  }).lean();

  const workoutDays = {};
  for (const log of workoutLogs) {
    const day = new Date(log.completed_at).toISOString().slice(0, 10);
    if (!workoutDays[day]) workoutDays[day] = { sessions: 0, calories: 0 };
    workoutDays[day].sessions++;
    workoutDays[day].calories += (log.calories_burned || 0);
  }
  const workoutSummary = Object.entries(workoutDays).map(([date, data]) => ({
    completed_on: date, ...data
  }));

  const unreadCount = await Notification.countDocuments({ user_id: userId, is_read: false });

  const weightHistory = progress.length
    ? progress.reverse().map((item) => ({ date: item.tracked_on, weight: item.weight || user.weight }))
    : Array.from({ length: 6 }, (_, index) => ({ date: `Week ${index + 1}`, weight: Number(user.weight) + (5 - index) * 0.3 }));

  const calories = calculateCalories(user);
  const water = waterDoc || { glasses: 4, target_glasses: 8 };

  res.json({
    user,
    bmi: calculateBmi(user.weight, user.height),
    dailyCalories: calories,
    macros: macrosFromCalories(calories, user.goal),
    water,
    streak: workoutLogs.length,
    unreadNotifications: unreadCount,
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
      workouts: workoutSummary
    }
  });
}

async function upsertWater(req, res) {
  const glasses = Number(req.body.glasses);
  const target = Number(req.body.target_glasses || 8);
  if (!Number.isFinite(glasses) || glasses < 0) return res.status(400).json({ error: "Valid glasses value is required." });

  const today = new Date().toISOString().slice(0, 10);
  await WaterTracking.findOneAndUpdate(
    { user_id: req.user.userId, tracked_on: today },
    { $set: { glasses, target_glasses: target } },
    { upsert: true }
  );
  res.json({ message: "Water tracking updated.", glasses, target_glasses: target });
}

module.exports = { getDashboard, upsertWater };

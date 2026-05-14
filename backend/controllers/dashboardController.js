const { Progress, WaterTracking, WorkoutLog, Notification, User } = require("../models");
const { calculateBmi, calculateCalories, macrosFromCalories } = require("../services/metrics");

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

async function getDashboard(req, res) {
  const user = await User.findById(req.user.userId)
    .select("name email height weight age gender activity_level goal profile_picture")
    .lean();

  if (!user) return res.status(404).json({ error: "User not found." });

  const progress = await Progress.find({ user_id: user._id })
    .sort({ tracked_on: -1 })
    .limit(12)
    .lean();

  const water = await WaterTracking.findOne({ user_id: user._id, tracked_on: getDateKey() }).lean();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  const workoutEntries = await WorkoutLog.find({
    user_id: user._id,
    completed_at: { $gte: startDate }
  }).lean();

  const workoutsByDay = workoutEntries.reduce((acc, entry) => {
    const dateKey = entry.completed_at.toISOString().slice(0, 10);
    if (!acc[dateKey]) acc[dateKey] = { completed_on: dateKey, sessions: 0, calories: 0 };
    acc[dateKey].sessions += 1;
    acc[dateKey].calories += Number(entry.calories_burned || 0);
    return acc;
  }, {});

  const workoutLogs = Object.values(workoutsByDay).sort((a, b) => a.completed_on.localeCompare(b.completed_on));
  const unreadNotifications = await Notification.countDocuments({ user_id: user._id, is_read: false });

  const weightHistory = progress.length
    ? progress.reverse().map((item) => ({ date: item.tracked_on, weight: item.weight ?? user.weight }))
    : Array.from({ length: 6 }, (_, index) => ({ date: `Week ${index + 1}`, weight: Number(user.weight) + (5 - index) * 0.3 }));

  const calories = calculateCalories(user);
  const waterStats = water || { glasses: 4, target_glasses: 8 };

  res.json({
    user,
    bmi: calculateBmi(user.weight, user.height),
    dailyCalories: calories,
    macros: macrosFromCalories(calories, user.goal),
    water: waterStats,
    streak: workoutLogs.length,
    unreadNotifications,
    progress: {
      workoutCompletion: Math.min(100, workoutLogs.length * 12),
      waterCompletion: Math.round((waterStats.glasses / waterStats.target_glasses) * 100),
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

  await WaterTracking.findOneAndUpdate(
    { user_id: req.user.userId, tracked_on: getDateKey() },
    { glasses, target_glasses: target },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json({ message: "Water tracking updated.", glasses, target_glasses: target });
}

module.exports = { getDashboard, upsertWater };

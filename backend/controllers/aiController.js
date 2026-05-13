const { db } = require("../config/db");
const { calculateCalories, macrosFromCalories } = require("../services/metrics");

function localCoachResponse(prompt, user) {
  const calories = calculateCalories(user);
  const macros = macrosFromCalories(calories, user.goal);
  return [
    `Target ${calories} kcal with roughly ${macros.protein}g protein, ${macros.carbs}g carbs, and ${macros.fat}g fat.`,
    "Train 3-5 days per week, keep two reps in reserve on strength sets, and add 20-30 minutes of easy cardio on recovery days.",
    `For your goal (${String(user.goal).replace("_", " ")}), focus on weekly consistency before aggressive changes.`,
    prompt ? `Your question: ${prompt}` : ""
  ].filter(Boolean).join(" ");
}

async function aiCoach(req, res) {
  const { prompt = "" } = req.body;
  const [[user]] = await db.query("SELECT * FROM users WHERE id = ?", [req.user.userId]);
  const response = localCoachResponse(prompt, user);
  await db.query("INSERT INTO ai_chat_history (user_id, prompt, response) VALUES (?, ?, ?)", [req.user.userId, prompt, response]);
  res.json({ response, provider: "local-rule-engine" });
}

async function chatHistory(req, res) {
  const [rows] = await db.query(
    "SELECT id, prompt, response, created_at FROM ai_chat_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 25",
    [req.user.userId]
  );
  res.json(rows);
}

async function generateWorkout(req, res) {
  const { difficulty = "beginner", days = 3 } = req.body;
  const [exercises] = await db.query("SELECT * FROM exercise_library WHERE difficulty = ? LIMIT 8", [difficulty]);
  const plan = Array.from({ length: Number(days) || 3 }, (_, index) => ({
    day: index + 1,
    title: `${difficulty} training day ${index + 1}`,
    exercises: exercises.slice(index, index + 4).map((item) => ({
      name: item.name,
      sets: difficulty === "advanced" ? 4 : 3,
      reps: difficulty === "beginner" ? "10-12" : "8-12"
    }))
  }));
  res.json({ plan });
}

async function generateMealPlan(req, res) {
  const [[user]] = await db.query("SELECT * FROM users WHERE id = ?", [req.user.userId]);
  const calories = calculateCalories(user);
  const [meals] = await db.query("SELECT * FROM meals ORDER BY ABS(calories - ?) LIMIT 4", [Math.round(calories / 4)]);
  res.json({ calories, macros: macrosFromCalories(calories, user.goal), meals });
}

async function progressInsights(req, res) {
  const [entries] = await db.query(
    "SELECT tracked_on, weight, waist, calories_burned FROM progress_tracking WHERE user_id = ? ORDER BY tracked_on DESC LIMIT 8",
    [req.user.userId]
  );
  const latest = entries[0];
  const oldest = entries[entries.length - 1];
  const insights = [];
  if (latest && oldest && latest.weight && oldest.weight) {
    const change = Number((latest.weight - oldest.weight).toFixed(1));
    insights.push(change < 0 ? `You are down ${Math.abs(change)} kg across recent logs.` : `You are up ${change} kg across recent logs.`);
  }
  const burn = entries.reduce((sum, item) => sum + Number(item.calories_burned || 0), 0);
  insights.push(`Recent logged calorie burn totals ${burn} kcal.`);
  insights.push("Keep measurements on the same weekday and time of day for cleaner trend analysis.");
  res.json({ insights, entries });
}

module.exports = { aiCoach, chatHistory, generateWorkout, generateMealPlan, progressInsights };

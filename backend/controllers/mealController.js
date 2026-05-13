const { db } = require("../config/db");
const { calculateCalories, macrosFromCalories } = require("../services/metrics");

async function listMeals(req, res) {
  const { diet = "", meal_type = "", allergy = "" } = req.query;
  const filters = [];
  const params = [];
  if (diet) {
    filters.push("diet_type = ?");
    params.push(diet);
  }
  if (meal_type) {
    filters.push("meal_type = ?");
    params.push(meal_type);
  }
  if (allergy) {
    filters.push("(allergens IS NULL OR allergens NOT LIKE ?)");
    params.push(`%${allergy}%`);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const [rows] = await db.query(`SELECT * FROM meals ${where} ORDER BY meal_type, calories`, params);
  res.json(rows);
}

async function getMeal(req, res) {
  const [[meal]] = await db.query("SELECT * FROM meals WHERE id = ?", [req.params.id]);
  if (!meal) return res.status(404).json({ error: "Meal not found." });
  res.json(meal);
}

async function createMeal(req, res) {
  const { name, meal_type = "breakfast", diet_type = "vegetarian", calories, protein = 0, carbs = 0, fat = 0, allergens = "", ingredients = "" } = req.body;
  if (!name || !calories) return res.status(400).json({ error: "Meal name and calories are required." });
  const [result] = await db.query(
    "INSERT INTO meals (name, meal_type, diet_type, calories, protein, carbs, fat, allergens, ingredients) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [name, meal_type, diet_type, calories, protein, carbs, fat, allergens, ingredients]
  );
  res.status(201).json({ id: result.insertId, name, meal_type, diet_type, calories, protein, carbs, fat, allergens, ingredients });
}

async function updateMeal(req, res) {
  const { name, meal_type = "breakfast", diet_type = "vegetarian", calories, protein = 0, carbs = 0, fat = 0, allergens = "", ingredients = "" } = req.body;
  if (!name || !calories) return res.status(400).json({ error: "Meal name and calories are required." });
  await db.query(
    "UPDATE meals SET name = ?, meal_type = ?, diet_type = ?, calories = ?, protein = ?, carbs = ?, fat = ?, allergens = ?, ingredients = ? WHERE id = ?",
    [name, meal_type, diet_type, calories, protein, carbs, fat, allergens, ingredients, req.params.id]
  );
  res.json({ message: "Meal updated." });
}

async function deleteMeal(req, res) {
  await db.query("DELETE FROM meals WHERE id = ?", [req.params.id]);
  res.json({ message: "Meal deleted." });
}

async function recommendations(req, res) {
  const [[user]] = await db.query("SELECT * FROM users WHERE id = ?", [req.user.userId]);
  const calories = calculateCalories(user);
  const macros = macrosFromCalories(calories, user.goal);
  const [meals] = await db.query("SELECT * FROM meals ORDER BY ABS(calories - ?) LIMIT 4", [Math.round(calories / 4)]);
  const groceryList = [...new Set(meals.flatMap((meal) => String(meal.ingredients || "").split(",").map((item) => item.trim()).filter(Boolean)))];
  res.json({ calories, macros, meals, groceryList });
}

async function scheduleMeal(req, res) {
  const { meal_id, plan_date, scheduled_time, servings = 1 } = req.body;
  if (!meal_id || !plan_date) return res.status(400).json({ error: "meal_id and plan_date are required." });
  const [result] = await db.query(
    "INSERT INTO meal_plans (user_id, meal_id, plan_date, scheduled_time, servings) VALUES (?, ?, ?, ?, ?)",
    [req.user.userId, meal_id, plan_date, scheduled_time || null, servings]
  );
  res.status(201).json({ id: result.insertId, meal_id, plan_date, scheduled_time, servings });
}

async function listScheduledMeals(req, res) {
  const [rows] = await db.query(
    `SELECT mp.*, m.name, m.meal_type, m.calories, m.protein, m.carbs, m.fat
     FROM meal_plans mp
     JOIN meals m ON m.id = mp.meal_id
     WHERE mp.user_id = ?
     ORDER BY mp.plan_date DESC, mp.scheduled_time`,
    [req.user.userId]
  );
  res.json(rows);
}

async function deleteScheduledMeal(req, res) {
  await db.query("DELETE FROM meal_plans WHERE id = ? AND user_id = ?", [req.params.id, req.user.userId]);
  res.json({ message: "Scheduled meal removed." });
}

module.exports = { listMeals, getMeal, createMeal, updateMeal, deleteMeal, recommendations, scheduleMeal, listScheduledMeals, deleteScheduledMeal };

const { Meal, MealPlan, User } = require("../models");
const { calculateCalories, macrosFromCalories } = require("../services/metrics");
const mongoose = require("mongoose");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function listMeals(req, res) {
  const { diet = "", meal_type = "", allergy = "" } = req.query;
  const filters = {};
  if (diet) filters.diet_type = diet;
  if (meal_type) filters.meal_type = meal_type;
  if (allergy) {
    filters.$or = [
      { allergens: { $exists: false } },
      { allergens: "" },
      { allergens: { $not: new RegExp(allergy, "i") } }
    ];
  }

  const rows = await Meal.find(filters).sort({ meal_type: 1, calories: 1 }).lean();
  res.json(rows);
}

async function getMeal(req, res) {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: "Invalid meal ID." });
  const meal = await Meal.findById(req.params.id).lean();
  if (!meal) return res.status(404).json({ error: "Meal not found." });
  res.json(meal);
}

async function createMeal(req, res) {
  const { name, meal_type = "breakfast", diet_type = "vegetarian", calories, protein = 0, carbs = 0, fat = 0, allergens = "", ingredients = "" } = req.body;
  if (!name || !calories) return res.status(400).json({ error: "Meal name and calories are required." });

  const meal = await Meal.create({ name, meal_type, diet_type, calories, protein, carbs, fat, allergens, ingredients });
  res.status(201).json({ id: meal._id, name, meal_type, diet_type, calories, protein, carbs, fat, allergens, ingredients });
}

async function updateMeal(req, res) {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: "Invalid meal ID." });
  const { name, meal_type = "breakfast", diet_type = "vegetarian", calories, protein = 0, carbs = 0, fat = 0, allergens = "", ingredients = "" } = req.body;
  if (!name || !calories) return res.status(400).json({ error: "Meal name and calories are required." });

  await Meal.findByIdAndUpdate(req.params.id, { name, meal_type, diet_type, calories, protein, carbs, fat, allergens, ingredients }, { new: true });
  res.json({ message: "Meal updated." });
}

async function deleteMeal(req, res) {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: "Invalid meal ID." });
  await Meal.findByIdAndDelete(req.params.id);
  res.json({ message: "Meal deleted." });
}

async function recommendations(req, res) {
  const user = await User.findById(req.user.userId).lean();
  if (!user) return res.status(404).json({ error: "User not found." });

  const calories = calculateCalories(user);
  const macros = macrosFromCalories(calories, user.goal);
  const target = Math.round(calories / 4);

  const meals = await Meal.aggregate([
    { $addFields: { diff: { $abs: { $subtract: ["$calories", target] } } } },
    { $sort: { diff: 1 } },
    { $limit: 4 }
  ]);

  const groceryList = [...new Set(meals.flatMap((meal) => String(meal.ingredients || "").split(",").map((item) => item.trim()).filter(Boolean)))];
  res.json({ calories, macros, meals, groceryList });
}

async function scheduleMeal(req, res) {
  const { meal_id, plan_date, scheduled_time, servings = 1 } = req.body;
  if (!meal_id || !plan_date) return res.status(400).json({ error: "meal_id and plan_date are required." });

  const mealPlan = await MealPlan.create({
    user_id: req.user.userId,
    meal_id,
    plan_date,
    scheduled_time: scheduled_time || null,
    servings
  });

  res.status(201).json({ id: mealPlan._id, meal_id, plan_date, scheduled_time, servings });
}

async function listScheduledMeals(req, res) {
  const rows = await MealPlan.find({ user_id: req.user.userId })
    .sort({ plan_date: -1, scheduled_time: 1 })
    .populate("meal_id", "name meal_type calories protein carbs fat")
    .lean();

  const results = rows.map((row) => ({
    ...row,
    meal: row.meal_id || null,
    meal_id: row.meal_id?._id || null
  }));

  res.json(results);
}

async function deleteScheduledMeal(req, res) {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: "Invalid scheduled meal ID." });
  await MealPlan.deleteOne({ _id: req.params.id, user_id: req.user.userId });
  res.json({ message: "Scheduled meal removed." });
}

module.exports = { listMeals, getMeal, createMeal, updateMeal, deleteMeal, recommendations, scheduleMeal, listScheduledMeals, deleteScheduledMeal };

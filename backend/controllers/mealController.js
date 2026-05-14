const { User, Meal, MealPlan } = require("../models");
const { calculateCalories, macrosFromCalories } = require("../services/metrics");

async function listMeals(req, res) {
  const { diet = "", meal_type = "", allergy = "" } = req.query;
  const filter = {};
  if (diet) filter.diet_type = diet;
  if (meal_type) filter.meal_type = meal_type;
  if (allergy) filter.allergens = { $not: { $regex: allergy, $options: "i" } };
  const rows = await Meal.find(filter).sort({ meal_type: 1, calories: 1 }).lean();
  res.json(rows);
}

async function getMeal(req, res) {
  const meal = await Meal.findById(req.params.id).lean();
  if (!meal) return res.status(404).json({ error: "Meal not found." });
  res.json(meal);
}

async function createMeal(req, res) {
  const { name, meal_type = "breakfast", diet_type = "vegetarian", calories, protein = 0, carbs = 0, fat = 0, allergens = "", ingredients = "" } = req.body;
  if (!name || !calories) return res.status(400).json({ error: "Meal name and calories are required." });
  const doc = await Meal.create({ name, meal_type, diet_type, calories, protein, carbs, fat, allergens, ingredients });
  res.status(201).json(doc.toObject());
}

async function updateMeal(req, res) {
  const { name, meal_type = "breakfast", diet_type = "vegetarian", calories, protein = 0, carbs = 0, fat = 0, allergens = "", ingredients = "" } = req.body;
  if (!name || !calories) return res.status(400).json({ error: "Meal name and calories are required." });
  await Meal.findByIdAndUpdate(req.params.id, { $set: { name, meal_type, diet_type, calories, protein, carbs, fat, allergens, ingredients } });
  res.json({ message: "Meal updated." });
}

async function deleteMeal(req, res) {
  await Meal.findByIdAndDelete(req.params.id);
  res.json({ message: "Meal deleted." });
}

async function recommendations(req, res) {
  const user = await User.findById(req.user.userId).lean();
  const calories = calculateCalories(user);
  const macros = macrosFromCalories(calories, user.goal);
  const meals = await Meal.find().sort({ calories: 1 }).limit(4).lean();
  const groceryList = [...new Set(meals.flatMap((meal) => String(meal.ingredients || "").split(",").map((item) => item.trim()).filter(Boolean)))];
  res.json({ calories, macros, meals, groceryList });
}

async function scheduleMeal(req, res) {
  const { meal_id, plan_date, scheduled_time, servings = 1 } = req.body;
  if (!meal_id || !plan_date) return res.status(400).json({ error: "meal_id and plan_date are required." });
  const doc = await MealPlan.create({ user_id: req.user.userId, meal_id, plan_date, scheduled_time: scheduled_time || null, servings });
  res.status(201).json(doc.toObject());
}

async function listScheduledMeals(req, res) {
  const rows = await MealPlan.find({ user_id: req.user.userId })
    .populate("meal_id")
    .sort({ plan_date: -1, scheduled_time: -1 }).lean();
  res.json(rows);
}

async function deleteScheduledMeal(req, res) {
  await MealPlan.findOneAndDelete({ _id: req.params.id, user_id: req.user.userId });
  res.json({ message: "Scheduled meal removed." });
}

module.exports = { listMeals, getMeal, createMeal, updateMeal, deleteMeal, recommendations, scheduleMeal, listScheduledMeals, deleteScheduledMeal };

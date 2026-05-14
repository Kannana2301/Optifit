const {
  Exercise, Workout, Meal, DietPlan
} = require("../models");

async function initializeSchema() {
  await seedReferenceData();
}

async function seedReferenceData() {
  const exerciseCount = await Exercise.countDocuments();
  if (exerciseCount === 0) {
    await Exercise.insertMany([
      { name: "Push Up", muscle_group: "Chest", difficulty: "beginner", equipment: "Bodyweight", duration: 12, instructions: "Keep a straight line and lower under control.", youtube_url: "https://www.youtube.com/results?search_query=push+up+tutorial", calories_per_minute: 7 },
      { name: "Goblet Squat", muscle_group: "Legs", difficulty: "beginner", equipment: "Dumbbell", duration: 15, instructions: "Brace your core and sit between your hips.", youtube_url: "https://www.youtube.com/results?search_query=goblet+squat+tutorial", calories_per_minute: 8 },
      { name: "Lat Pulldown", muscle_group: "Back", difficulty: "intermediate", equipment: "Cable", duration: 12, instructions: "Pull elbows to ribs and pause briefly.", youtube_url: "https://www.youtube.com/results?search_query=lat+pulldown+tutorial", calories_per_minute: 6 },
      { name: "Romanian Deadlift", muscle_group: "Hamstrings", difficulty: "intermediate", equipment: "Barbell", duration: 15, instructions: "Hinge from hips with a neutral spine.", youtube_url: "https://www.youtube.com/results?search_query=romanian+deadlift+tutorial", calories_per_minute: 8 },
      { name: "Burpee Intervals", muscle_group: "Full Body", difficulty: "advanced", equipment: "Bodyweight", duration: 10, instructions: "Move quickly while keeping landing mechanics clean.", youtube_url: "https://www.youtube.com/results?search_query=burpee+tutorial", calories_per_minute: 11 }
    ]);
  }

  const workoutCount = await Workout.countDocuments();
  if (workoutCount === 0) {
    await Workout.insertMany([
      { title: "Beginner Full Body", description: "Simple strength base for new lifters.", difficulty: "beginner", muscle_group: "Full Body", day_of_week: "Monday", estimated_minutes: 35 },
      { title: "Upper Body Builder", description: "Chest, back, and shoulders hypertrophy.", difficulty: "intermediate", muscle_group: "Upper Body", day_of_week: "Wednesday", estimated_minutes: 50 },
      { title: "Advanced Conditioning", description: "High intensity metabolic session.", difficulty: "advanced", muscle_group: "Full Body", day_of_week: "Friday", estimated_minutes: 30 }
    ]);
  }

  const mealCount = await Meal.countDocuments();
  if (mealCount === 0) {
    await Meal.insertMany([
      { name: "Greek Yogurt Oats", meal_type: "breakfast", diet_type: "vegetarian", calories: 420, protein: 28, carbs: 52, fat: 10, allergens: "dairy", ingredients: "Greek yogurt, oats, berries, chia" },
      { name: "Paneer Power Bowl", meal_type: "lunch", diet_type: "vegetarian", calories: 610, protein: 34, carbs: 68, fat: 22, allergens: "dairy", ingredients: "Paneer, rice, vegetables, mint chutney" },
      { name: "Chicken Quinoa Plate", meal_type: "dinner", diet_type: "non_vegetarian", calories: 680, protein: 48, carbs: 58, fat: 24, allergens: "", ingredients: "Chicken breast, quinoa, salad, olive oil" },
      { name: "Protein Fruit Smoothie", meal_type: "snack", diet_type: "vegetarian", calories: 290, protein: 24, carbs: 34, fat: 6, allergens: "dairy", ingredients: "Whey, banana, milk, peanut butter" }
    ]);
  }

  const dietCount = await DietPlan.countDocuments();
  if (dietCount === 0) {
    const dietPlans = [
      { category: "allergy", condition_value: "lactose_intolerant", plan: { "Meal 1": "Oats with almond milk and banana", "Meal 3": "Rice bowl with tofu and vegetables", "Post-Workout": "Plant protein shake with fruit" } },
      { category: "allergy", condition_value: "milk_allergy", plan: { "Meal 1": "Besan chilla with chutney", "Meal 3": "Lentil curry with rice", "Post-Workout": "Peanut butter banana smoothie" } },
      { category: "allergy", condition_value: "high_cholesterol", plan: { "Meal 1": "Steel-cut oats with berries", "Meal 3": "Grilled paneer or tofu salad", "Post-Workout": "Sprouts and coconut water" } },
      { category: "age", condition_value: "15-20", plan: { "Meal 1": "Eggs or paneer toast with fruit", "Meal 3": "Chicken or dal rice bowl", "Post-Workout": "Milk or soy protein smoothie" } },
      { category: "age", condition_value: "21-30", plan: { "Meal 1": "Greek yogurt oats or soy oats", "Meal 3": "Quinoa bowl with lean protein", "Post-Workout": "Protein shake and banana" } },
      { category: "age", condition_value: "31-40", plan: { "Meal 1": "High-fiber oats with nuts", "Meal 3": "Millet roti with dal and vegetables", "Post-Workout": "Curd or soy snack bowl" } },
      { category: "age", condition_value: "41-50", plan: { "Meal 1": "Vegetable upma with protein", "Meal 3": "Brown rice with fish, tofu, or dal", "Post-Workout": "Roasted chana and fruit" } },
      { category: "age", condition_value: "50+", plan: { "Meal 1": "Soft oats with seeds", "Meal 3": "Khichdi with vegetables and curd", "Post-Workout": "Light protein smoothie" } },
      { category: "goal", condition_value: "lean_gain", plan: { "Meal 1": "Protein oats with berries", "Meal 3": "Lean protein bowl with rice", "Post-Workout": "Whey or plant protein with banana" } },
      { category: "goal", condition_value: "bulk_gain", plan: { "Meal 1": "Peanut butter oats and eggs", "Meal 3": "Large rice bowl with paneer or chicken", "Post-Workout": "High-calorie smoothie with nuts" } }
    ];
    await DietPlan.insertMany(dietPlans);
  }
}

module.exports = { initializeSchema };

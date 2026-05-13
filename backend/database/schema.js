const { db } = require("../config/db");

async function initializeSchema() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      height FLOAT NOT NULL,
      weight FLOAT NOT NULL,
      age INT DEFAULT 28,
      gender ENUM('male','female','other') DEFAULT 'male',
      activity_level FLOAT DEFAULT 1.55,
      goal ENUM('lose_weight','maintain','gain_muscle') DEFAULT 'maintain',
      profile_picture VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_users_email (email)
    )`,
    `CREATE TABLE IF NOT EXISTS exercise_library (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      muscle_group VARCHAR(80) NOT NULL,
      difficulty ENUM('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
      equipment VARCHAR(120) DEFAULT 'Bodyweight',
      duration INT DEFAULT 30,
      instructions TEXT,
      youtube_url VARCHAR(500),
      image_url VARCHAR(500),
      calories_per_minute DECIMAL(5,2) DEFAULT 6.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_exercise_search (name, muscle_group, difficulty)
    )`,
    `CREATE TABLE IF NOT EXISTS workouts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(160) NOT NULL,
      description TEXT,
      difficulty ENUM('beginner','intermediate','advanced') NOT NULL,
      muscle_group VARCHAR(80) NOT NULL,
      day_of_week VARCHAR(20),
      estimated_minutes INT DEFAULT 45,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_workouts_filter (difficulty, muscle_group)
    )`,
    `CREATE TABLE IF NOT EXISTS workout_exercises (
      workout_id INT NOT NULL,
      exercise_id INT NOT NULL,
      sets INT DEFAULT 3,
      reps VARCHAR(30) DEFAULT '10',
      rest_seconds INT DEFAULT 60,
      PRIMARY KEY (workout_id, exercise_id),
      FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercise_library(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS user_workouts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(160) NOT NULL,
      notes TEXT,
      scheduled_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_workouts_user_date (user_id, scheduled_date)
    )`,
    `CREATE TABLE IF NOT EXISTS workout_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      workout_id INT,
      user_workout_id INT,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      duration_minutes INT DEFAULT 0,
      calories_burned INT DEFAULT 0,
      notes TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE SET NULL,
      FOREIGN KEY (user_workout_id) REFERENCES user_workouts(id) ON DELETE SET NULL,
      INDEX idx_workout_logs_user_time (user_id, completed_at)
    )`,
    `CREATE TABLE IF NOT EXISTS progress_tracking (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      tracked_on DATE NOT NULL,
      weight FLOAT,
      chest FLOAT,
      waist FLOAT,
      hips FLOAT,
      calories_burned INT DEFAULT 0,
      before_image VARCHAR(500),
      after_image VARCHAR(500),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY uniq_user_progress_day (user_id, tracked_on),
      INDEX idx_progress_user_day (user_id, tracked_on)
    )`,
    `CREATE TABLE IF NOT EXISTS meals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      meal_type ENUM('breakfast','lunch','snack','dinner') NOT NULL,
      diet_type ENUM('vegetarian','non_vegetarian','vegan') DEFAULT 'vegetarian',
      calories INT NOT NULL,
      protein INT DEFAULT 0,
      carbs INT DEFAULT 0,
      fat INT DEFAULT 0,
      allergens VARCHAR(255),
      ingredients TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_meals_filter (meal_type, diet_type, calories)
    )`,
    `CREATE TABLE IF NOT EXISTS meal_plans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      meal_id INT NOT NULL,
      plan_date DATE NOT NULL,
      scheduled_time TIME,
      servings DECIMAL(4,2) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE,
      INDEX idx_meal_plans_user_date (user_id, plan_date)
    )`,
    `CREATE TABLE IF NOT EXISTS water_tracking (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      tracked_on DATE NOT NULL,
      glasses INT DEFAULT 0,
      target_glasses INT DEFAULT 8,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY uniq_user_water_day (user_id, tracked_on)
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      type ENUM('workout','water','meal','achievement') NOT NULL,
      title VARCHAR(160) NOT NULL,
      message TEXT,
      remind_at DATETIME,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_notifications_user_read (user_id, is_read, remind_at)
    )`,
    `CREATE TABLE IF NOT EXISTS ai_chat_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      prompt TEXT NOT NULL,
      response TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS diet_plans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category ENUM('allergy','age','goal') NOT NULL,
      condition_value VARCHAR(120) NOT NULL,
      plan JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_diet_condition (category, condition_value),
      INDEX idx_diet_plans_category (category, condition_value)
    )`
  ];

  for (const statement of statements) {
    await db.query(statement);
  }

  await migrateExistingUsersTable();
  await seedReferenceData();
}

async function columnExists(tableName, columnName) {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS count
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [tableName, columnName]
  );
  return rows[0].count > 0;
}

async function addColumnIfMissing(tableName, columnName, definition) {
  if (!(await columnExists(tableName, columnName))) {
    await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

async function migrateExistingUsersTable() {
  await addColumnIfMissing("users", "age", "INT DEFAULT 28");
  await addColumnIfMissing("users", "gender", "ENUM('male','female','other') DEFAULT 'male'");
  await addColumnIfMissing("users", "activity_level", "FLOAT DEFAULT 1.55");
  await addColumnIfMissing("users", "goal", "ENUM('lose_weight','maintain','gain_muscle') DEFAULT 'maintain'");
  await addColumnIfMissing("users", "profile_picture", "VARCHAR(500)");
  await addColumnIfMissing("users", "updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
  await addColumnIfMissing("exercise_library", "duration", "INT DEFAULT 30");
  await addColumnIfMissing("exercise_library", "image_url", "VARCHAR(500)");
}

async function seedReferenceData() {
  const [exerciseRows] = await db.query("SELECT COUNT(*) AS count FROM exercise_library");
  if (exerciseRows[0].count === 0) {
    await db.query(
      `INSERT INTO exercise_library (name, muscle_group, difficulty, equipment, duration, instructions, youtube_url, calories_per_minute) VALUES ?`,
      [[
        ["Push Up", "Chest", "beginner", "Bodyweight", 12, "Keep a straight line and lower under control.", "https://www.youtube.com/results?search_query=push+up+tutorial", 7],
        ["Goblet Squat", "Legs", "beginner", "Dumbbell", 15, "Brace your core and sit between your hips.", "https://www.youtube.com/results?search_query=goblet+squat+tutorial", 8],
        ["Lat Pulldown", "Back", "intermediate", "Cable", 12, "Pull elbows to ribs and pause briefly.", "https://www.youtube.com/results?search_query=lat+pulldown+tutorial", 6],
        ["Romanian Deadlift", "Hamstrings", "intermediate", "Barbell", 15, "Hinge from hips with a neutral spine.", "https://www.youtube.com/results?search_query=romanian+deadlift+tutorial", 8],
        ["Burpee Intervals", "Full Body", "advanced", "Bodyweight", 10, "Move quickly while keeping landing mechanics clean.", "https://www.youtube.com/results?search_query=burpee+tutorial", 11]
      ]]
    );
  }

  const [workoutRows] = await db.query("SELECT COUNT(*) AS count FROM workouts");
  if (workoutRows[0].count === 0) {
    await db.query(
      `INSERT INTO workouts (title, description, difficulty, muscle_group, day_of_week, estimated_minutes) VALUES ?`,
      [[
        ["Beginner Full Body", "Simple strength base for new lifters.", "beginner", "Full Body", "Monday", 35],
        ["Upper Body Builder", "Chest, back, and shoulders hypertrophy.", "intermediate", "Upper Body", "Wednesday", 50],
        ["Advanced Conditioning", "High intensity metabolic session.", "advanced", "Full Body", "Friday", 30]
      ]]
    );
  }

  const [mealRows] = await db.query("SELECT COUNT(*) AS count FROM meals");
  if (mealRows[0].count === 0) {
    await db.query(
      `INSERT INTO meals (name, meal_type, diet_type, calories, protein, carbs, fat, allergens, ingredients) VALUES ?`,
      [[
        ["Greek Yogurt Oats", "breakfast", "vegetarian", 420, 28, 52, 10, "dairy", "Greek yogurt, oats, berries, chia"],
        ["Paneer Power Bowl", "lunch", "vegetarian", 610, 34, 68, 22, "dairy", "Paneer, rice, vegetables, mint chutney"],
        ["Chicken Quinoa Plate", "dinner", "non_vegetarian", 680, 48, 58, 24, "", "Chicken breast, quinoa, salad, olive oil"],
        ["Protein Fruit Smoothie", "snack", "vegetarian", 290, 24, 34, 6, "dairy", "Whey, banana, milk, peanut butter"]
      ]]
    );
  }

  const [dietRows] = await db.query("SELECT COUNT(*) AS count FROM diet_plans");
  if (dietRows[0].count === 0) {
    const basicPlan = (meal1, meal3, postWorkout) => JSON.stringify({
      "Meal 1": meal1,
      "Meal 3": meal3,
      "Post-Workout": postWorkout
    });

    await db.query(
      `INSERT INTO diet_plans (category, condition_value, plan) VALUES ?`,
      [[
        ["allergy", "lactose_intolerant", basicPlan("Oats with almond milk and banana", "Rice bowl with tofu and vegetables", "Plant protein shake with fruit")],
        ["allergy", "milk_allergy", basicPlan("Besan chilla with chutney", "Lentil curry with rice", "Peanut butter banana smoothie")],
        ["allergy", "high_cholesterol", basicPlan("Steel-cut oats with berries", "Grilled paneer or tofu salad", "Sprouts and coconut water")],
        ["age", "15-20", basicPlan("Eggs or paneer toast with fruit", "Chicken or dal rice bowl", "Milk or soy protein smoothie")],
        ["age", "21-30", basicPlan("Greek yogurt oats or soy oats", "Quinoa bowl with lean protein", "Protein shake and banana")],
        ["age", "31-40", basicPlan("High-fiber oats with nuts", "Millet roti with dal and vegetables", "Curd or soy snack bowl")],
        ["age", "41-50", basicPlan("Vegetable upma with protein", "Brown rice with fish, tofu, or dal", "Roasted chana and fruit")],
        ["age", "50+", basicPlan("Soft oats with seeds", "Khichdi with vegetables and curd", "Light protein smoothie")],
        ["goal", "lean_gain", basicPlan("Protein oats with berries", "Lean protein bowl with rice", "Whey or plant protein with banana")],
        ["goal", "bulk_gain", basicPlan("Peanut butter oats and eggs", "Large rice bowl with paneer or chicken", "High-calorie smoothie with nuts")]
      ]]
    );
  }
}

module.exports = { initializeSchema };

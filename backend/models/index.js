const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, required: true, trim: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  age: { type: Number, default: 28 },
  gender: { type: String, enum: ["male", "female", "other"], default: "male" },
  activity_level: { type: Number, default: 1.55 },
  goal: { type: String, enum: ["lose_weight", "maintain", "gain_muscle"], default: "maintain" },
  profile_picture: { type: String }
}, { timestamps: true });

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  muscle_group: { type: String, required: true },
  difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
  equipment: { type: String, default: "Bodyweight" },
  duration: { type: Number, default: 30 },
  instructions: { type: String },
  youtube_url: { type: String },
  image_url: { type: String },
  calories_per_minute: { type: Number, default: 6 }
}, { timestamps: true });

const workoutSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], required: true },
  muscle_group: { type: String, required: true },
  day_of_week: { type: String },
  estimated_minutes: { type: Number, default: 45 },
  exercises: [{
    exercise_id: { type: mongoose.Schema.Types.ObjectId, ref: "Exercise" },
    sets: { type: Number, default: 3 },
    reps: { type: String, default: "10" },
    rest_seconds: { type: Number, default: 60 }
  }]
}, { timestamps: true });

const userWorkoutSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  notes: { type: String },
  scheduled_date: { type: Date }
}, { timestamps: true });

const workoutLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  workout_id: { type: mongoose.Schema.Types.ObjectId, ref: "Workout" },
  user_workout_id: { type: mongoose.Schema.Types.ObjectId, ref: "UserWorkout" },
  completed_at: { type: Date, default: Date.now },
  duration_minutes: { type: Number, default: 0 },
  calories_burned: { type: Number, default: 0 },
  notes: { type: String }
});

const progressSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tracked_on: { type: Date, required: true },
  weight: { type: Number },
  chest: { type: Number },
  waist: { type: Number },
  hips: { type: Number },
  calories_burned: { type: Number, default: 0 },
  before_image: { type: String },
  after_image: { type: String },
  notes: { type: String }
}, { timestamps: true });

progressSchema.index({ user_id: 1, tracked_on: 1 }, { unique: true });

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  meal_type: { type: String, enum: ["breakfast", "lunch", "snack", "dinner"], required: true },
  diet_type: { type: String, enum: ["vegetarian", "non_vegetarian", "vegan"], default: "vegetarian" },
  calories: { type: Number, required: true },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  allergens: { type: String },
  ingredients: { type: String }
}, { timestamps: true });

const mealPlanSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  meal_id: { type: mongoose.Schema.Types.ObjectId, ref: "Meal", required: true },
  plan_date: { type: Date, required: true },
  scheduled_time: { type: String },
  servings: { type: Number, default: 1 }
}, { timestamps: true });

const waterSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tracked_on: { type: Date, required: true },
  glasses: { type: Number, default: 0 },
  target_glasses: { type: Number, default: 8 }
}, { timestamps: true });

waterSchema.index({ user_id: 1, tracked_on: 1 }, { unique: true });

const notificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["workout", "water", "meal", "achievement"], required: true },
  title: { type: String, required: true },
  message: { type: String },
  remind_at: { type: Date },
  is_read: { type: Boolean, default: false }
}, { timestamps: true });

const chatHistorySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  prompt: { type: String, required: true },
  response: { type: String, required: true }
}, { timestamps: true });

const dietPlanSchema = new mongoose.Schema({
  category: { type: String, enum: ["allergy", "age", "goal"], required: true },
  condition_value: { type: String, required: true },
  plan: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

dietPlanSchema.index({ category: 1, condition_value: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
const Exercise = mongoose.model("Exercise", exerciseSchema);
const Workout = mongoose.model("Workout", workoutSchema);
const UserWorkout = mongoose.model("UserWorkout", userWorkoutSchema);
const WorkoutLog = mongoose.model("WorkoutLog", workoutLogSchema);
const ProgressTracking = mongoose.model("ProgressTracking", progressSchema);
const Meal = mongoose.model("Meal", mealSchema);
const MealPlan = mongoose.model("MealPlan", mealPlanSchema);
const WaterTracking = mongoose.model("WaterTracking", waterSchema);
const Notification = mongoose.model("Notification", notificationSchema);
const AIChatHistory = mongoose.model("AIChatHistory", chatHistorySchema);
const DietPlan = mongoose.model("DietPlan", dietPlanSchema);

module.exports = {
  User, Exercise, Workout, UserWorkout, WorkoutLog,
  ProgressTracking, Meal, MealPlan, WaterTracking,
  Notification, AIChatHistory, DietPlan
};

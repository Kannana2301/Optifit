const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
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
userSchema.index({ email: 1 }, { unique: true });

const exerciseSchema = new Schema({
  name: { type: String, required: true, trim: true },
  muscle_group: { type: String, required: true, trim: true },
  difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
  equipment: { type: String, default: "Bodyweight", trim: true },
  duration: { type: Number, default: 30 },
  instructions: { type: String, default: "" },
  youtube_url: { type: String, default: "" },
  image_url: { type: String, default: "" },
  calories_per_minute: { type: Number, default: 6.0 }
}, { timestamps: true });

const workoutExerciseSchema = new Schema({
  exercise_id: { type: Schema.Types.ObjectId, ref: "Exercise", required: true },
  sets: { type: Number, default: 3 },
  reps: { type: String, default: "10-12" },
  rest_seconds: { type: Number, default: 60 }
}, { _id: false });

const workoutSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
  muscle_group: { type: String, default: "Full Body", trim: true },
  day_of_week: { type: String, trim: true },
  estimated_minutes: { type: Number, default: 45 },
  exercises: { type: [workoutExerciseSchema], default: [] }
}, { timestamps: true });

const userWorkoutSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true },
  notes: { type: String, default: "" },
  scheduled_date: { type: String }
}, { timestamps: true });

const workoutLogSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  workout_id: { type: Schema.Types.ObjectId, ref: "Workout" },
  user_workout_id: { type: Schema.Types.ObjectId, ref: "UserWorkout" },
  completed_at: { type: Date, default: () => new Date() },
  duration_minutes: { type: Number, default: 0 },
  calories_burned: { type: Number, default: 0 },
  notes: { type: String, default: "" }
}, { timestamps: true });

const progressSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  tracked_on: { type: String, required: true },
  weight: { type: Number },
  chest: { type: Number },
  waist: { type: Number },
  hips: { type: Number },
  calories_burned: { type: Number, default: 0 },
  before_image: { type: String, default: "" },
  after_image: { type: String, default: "" },
  notes: { type: String, default: "" }
}, { timestamps: true });
progressSchema.index({ user_id: 1, tracked_on: 1 }, { unique: true });

const mealSchema = new Schema({
  name: { type: String, required: true, trim: true },
  meal_type: { type: String, enum: ["breakfast", "lunch", "snack", "dinner"], default: "breakfast" },
  diet_type: { type: String, enum: ["vegetarian", "non_vegetarian", "vegan"], default: "vegetarian" },
  calories: { type: Number, required: true },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  allergens: { type: String, default: "" },
  ingredients: { type: String, default: "" }
}, { timestamps: true });

const mealPlanSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  meal_id: { type: Schema.Types.ObjectId, ref: "Meal", required: true },
  plan_date: { type: String, required: true },
  scheduled_time: { type: String },
  servings: { type: Number, default: 1 }
}, { timestamps: true });

const waterTrackingSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  tracked_on: { type: String, required: true },
  glasses: { type: Number, default: 0 },
  target_glasses: { type: Number, default: 8 }
}, { timestamps: true });
waterTrackingSchema.index({ user_id: 1, tracked_on: 1 }, { unique: true });

const notificationSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["workout", "water", "meal", "achievement"], required: true },
  title: { type: String, required: true, trim: true },
  message: { type: String, default: "" },
  remind_at: { type: Date },
  is_read: { type: Boolean, default: false }
}, { timestamps: true });

const aiChatHistorySchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  prompt: { type: String, default: "" },
  response: { type: String, default: "" }
}, { timestamps: true });

const dietPlanSchema = new Schema({
  category: { type: String, enum: ["allergy", "age", "goal"], required: true },
  condition_value: { type: String, required: true, trim: true },
  plan: { type: Schema.Types.Mixed, required: true }
}, { timestamps: true });
dietPlanSchema.index({ category: 1, condition_value: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
const Exercise = mongoose.model("Exercise", exerciseSchema);
const Workout = mongoose.model("Workout", workoutSchema);
const UserWorkout = mongoose.model("UserWorkout", userWorkoutSchema);
const WorkoutLog = mongoose.model("WorkoutLog", workoutLogSchema);
const Progress = mongoose.model("Progress", progressSchema);
const Meal = mongoose.model("Meal", mealSchema);
const MealPlan = mongoose.model("MealPlan", mealPlanSchema);
const WaterTracking = mongoose.model("WaterTracking", waterTrackingSchema);
const Notification = mongoose.model("Notification", notificationSchema);
const AiChatHistory = mongoose.model("AiChatHistory", aiChatHistorySchema);
const DietPlan = mongoose.model("DietPlan", dietPlanSchema);

module.exports = {
  User,
  Exercise,
  Workout,
  UserWorkout,
  WorkoutLog,
  Progress,
  Meal,
  MealPlan,
  WaterTracking,
  Notification,
  AiChatHistory,
  DietPlan
};

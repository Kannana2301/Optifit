const { Exercise, Workout, UserWorkout, WorkoutLog } = require("../models");
const { publicUploadPath } = require("../middleware/upload");
const mongoose = require("mongoose");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function normalizeExercisePayload(body) {
  return {
    name: body.name || body.title,
    instructions: body.instructions || body.description || "",
    muscle_group: body.muscle_group,
    difficulty: body.difficulty || "beginner",
    equipment: body.equipment || "Bodyweight",
    duration: Number(body.duration || 30),
    calories_per_minute: Number(body.calories_per_minute || body.calories_burned || 6),
    youtube_url: body.youtube_url || body.tutorial_url || "",
    image_url: body.image_url || ""
  };
}

async function listExercises(req, res) {
  const { search = "", muscle = "", difficulty = "" } = req.query;
  const filters = {};
  if (search) filters.name = new RegExp(search, "i");
  if (muscle) filters.muscle_group = muscle;
  if (difficulty) filters.difficulty = difficulty;

  const rows = await Exercise.find(filters).sort({ muscle_group: 1, name: 1 }).lean();
  res.json(rows);
}

async function getExercise(req, res) {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: "Invalid exercise ID." });
  const exercise = await Exercise.findById(req.params.id).lean();
  if (!exercise) return res.status(404).json({ error: "Exercise not found." });
  res.json(exercise);
}

async function createExercise(req, res) {
  const payload = normalizeExercisePayload(req.body);
  if (!payload.name || !payload.muscle_group) {
    return res.status(400).json({ error: "Exercise title and muscle group are required." });
  }

  const exercise = await Exercise.create(payload);
  res.status(201).json({ id: exercise._id, ...payload });
}

async function updateExercise(req, res) {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: "Invalid exercise ID." });
  const payload = normalizeExercisePayload(req.body);
  await Exercise.findByIdAndUpdate(req.params.id, payload, { new: true });
  res.json({ message: "Exercise updated." });
}

async function deleteExercise(req, res) {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: "Invalid exercise ID." });
  await Exercise.findByIdAndDelete(req.params.id);
  res.json({ message: "Exercise deleted." });
}

async function uploadExerciseImage(req, res) {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: "Invalid exercise ID." });
  if (!req.file) return res.status(400).json({ error: "Exercise image is required." });
  const imageUrl = publicUploadPath(req.file);
  await Exercise.findByIdAndUpdate(req.params.id, { image_url: imageUrl });
  res.json({ message: "Exercise image uploaded.", image_url: imageUrl });
}

const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

async function listWorkouts(req, res) {
  const { muscle = "", difficulty = "" } = req.query;
  const filters = {};
  if (muscle) filters.muscle_group = muscle;
  if (difficulty) filters.difficulty = difficulty;

  const rows = await Workout.find(filters).lean();
  rows.sort((a, b) => {
    const dayA = dayOrder.indexOf(a.day_of_week || "");
    const dayB = dayOrder.indexOf(b.day_of_week || "");
    if (dayA !== dayB) return dayA - dayB;
    return String(a.title || "").localeCompare(String(b.title || ""));
  });
  res.json(rows);
}

async function getWorkout(req, res) {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: "Invalid workout ID." });
  const workout = await Workout.findById(req.params.id).populate({
    path: "exercises.exercise_id",
    select: "name muscle_group difficulty equipment duration instructions youtube_url image_url calories_per_minute"
  }).lean();

  if (!workout) return res.status(404).json({ error: "Workout not found." });

  const exercises = workout.exercises.map((item) => {
    const exercise = item.exercise_id || {};
    return {
      exercise_id: exercise._id || null,
      name: exercise.name || "",
      muscle_group: exercise.muscle_group || "",
      difficulty: exercise.difficulty || "",
      equipment: exercise.equipment || "",
      duration: exercise.duration || 0,
      instructions: exercise.instructions || "",
      youtube_url: exercise.youtube_url || "",
      image_url: exercise.image_url || "",
      calories_per_minute: exercise.calories_per_minute || 0,
      sets: item.sets,
      reps: item.reps,
      rest_seconds: item.rest_seconds
    };
  });

  res.json({ ...workout, exercises });
}

async function createWorkout(req, res) {
  const { title, description = "", difficulty = "beginner", muscle_group = "Full Body", day_of_week = null, estimated_minutes = 45, exercise_ids = [] } = req.body;
  if (!title) return res.status(400).json({ error: "Workout title is required." });

  const exercises = Array.isArray(exercise_ids)
    ? exercise_ids.filter(Boolean).map((exercise_id) => ({ exercise_id, sets: 3, reps: "10-12", rest_seconds: 60 }))
    : [];

  const workout = await Workout.create({ title, description, difficulty, muscle_group, day_of_week, estimated_minutes, exercises });
  res.status(201).json({ id: workout._id, title, description, difficulty, muscle_group, day_of_week, estimated_minutes });
}

async function updateWorkout(req, res) {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: "Invalid workout ID." });
  const { title, description = "", difficulty = "beginner", muscle_group = "Full Body", day_of_week = null, estimated_minutes = 45, exercise_ids } = req.body;
  if (!title) return res.status(400).json({ error: "Workout title is required." });

  const update = { title, description, difficulty, muscle_group, day_of_week, estimated_minutes };
  if (Array.isArray(exercise_ids)) {
    update.exercises = exercise_ids
      .filter(Boolean)
      .map((exercise_id) => ({ exercise_id, sets: 3, reps: "10-12", rest_seconds: 60 }));
  }

  await Workout.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json({ message: "Workout updated." });
}

async function deleteWorkout(req, res) {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: "Invalid workout ID." });
  await Workout.findByIdAndDelete(req.params.id);
  res.json({ message: "Workout deleted." });
}

async function createCustomWorkout(req, res) {
  const { title, notes, scheduled_date } = req.body;
  if (!title) return res.status(400).json({ error: "Workout title is required." });

  const workout = await UserWorkout.create({
    user_id: req.user.userId,
    title,
    notes: notes || "",
    scheduled_date: scheduled_date || null
  });
  res.status(201).json({ id: workout._id, title, notes, scheduled_date });
}

async function completeWorkout(req, res) {
  const { workout_id, user_workout_id, duration_minutes = 30, calories_burned = 180, notes = "" } = req.body;
  await WorkoutLog.create({
    user_id: req.user.userId,
    workout_id: workout_id || null,
    user_workout_id: user_workout_id || null,
    duration_minutes,
    calories_burned,
    notes
  });
  res.status(201).json({ message: "Workout marked complete." });
}

async function workoutHistory(req, res) {
  const rows = await WorkoutLog.find({ user_id: req.user.userId })
    .sort({ completed_at: -1 })
    .limit(30)
    .populate("workout_id", "title")
    .populate("user_workout_id", "title")
    .lean();

  const result = rows.map((row) => ({
    ...row,
    title: row.workout_id?.title || row.user_workout_id?.title || "Custom workout",
    workout_id: row.workout_id?._id || null,
    user_workout_id: row.user_workout_id?._id || null
  }));
  res.json(result);
}

module.exports = {
  listExercises,
  getExercise,
  createExercise,
  updateExercise,
  deleteExercise,
  uploadExerciseImage,
  listWorkouts,
  getWorkout,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  createCustomWorkout,
  completeWorkout,
  workoutHistory
};

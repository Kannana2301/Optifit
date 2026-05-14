const { Exercise, Workout, UserWorkout, WorkoutLog } = require("../models");
const { publicUploadPath } = require("../middleware/upload");

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
  const filter = {};
  if (search) filter.name = { $regex: search, $options: "i" };
  if (muscle) filter.muscle_group = muscle;
  if (difficulty) filter.difficulty = difficulty;
  const rows = await Exercise.find(filter).sort({ muscle_group: 1, name: 1 }).lean();
  res.json(rows);
}

async function getExercise(req, res) {
  const exercise = await Exercise.findById(req.params.id).lean();
  if (!exercise) return res.status(404).json({ error: "Exercise not found." });
  res.json(exercise);
}

async function createExercise(req, res) {
  const payload = normalizeExercisePayload(req.body);
  if (!payload.name || !payload.muscle_group) {
    return res.status(400).json({ error: "Exercise title and muscle group are required." });
  }
  const doc = await Exercise.create(payload);
  res.status(201).json(doc.toObject());
}

async function updateExercise(req, res) {
  const payload = normalizeExercisePayload(req.body);
  await Exercise.findByIdAndUpdate(req.params.id, { $set: payload });
  res.json({ message: "Exercise updated." });
}

async function deleteExercise(req, res) {
  await Exercise.findByIdAndDelete(req.params.id);
  res.json({ message: "Exercise deleted." });
}

async function uploadExerciseImage(req, res) {
  if (!req.file) return res.status(400).json({ error: "Exercise image is required." });
  const imageUrl = publicUploadPath(req.file);
  await Exercise.findByIdAndUpdate(req.params.id, { $set: { image_url: imageUrl } });
  res.json({ message: "Exercise image uploaded.", image_url: imageUrl });
}

async function listWorkouts(req, res) {
  const { muscle = "", difficulty = "" } = req.query;
  const filter = {};
  if (muscle) filter.muscle_group = muscle;
  if (difficulty) filter.difficulty = difficulty;
  const rows = await Workout.find(filter).sort({ day_of_week: 1, title: 1 }).lean();
  res.json(rows);
}

async function getWorkout(req, res) {
  const workout = await Workout.findById(req.params.id).populate("exercises.exercise_id").lean();
  if (!workout) return res.status(404).json({ error: "Workout not found." });
  const exercises = (workout.exercises || []).map((we) => {
    const ex = we.exercise_id || {};
    return {
      id: ex._id,
      name: ex.name,
      instructions: ex.instructions,
      muscle_group: ex.muscle_group,
      difficulty: ex.difficulty,
      equipment: ex.equipment,
      duration: ex.duration,
      calories_per_minute: ex.calories_per_minute,
      youtube_url: ex.youtube_url,
      image_url: ex.image_url,
      sets: we.sets,
      reps: we.reps,
      rest_seconds: we.rest_seconds
    };
  });
  const { exercises: _, ...workoutData } = workout;
  res.json({ ...workoutData, exercises });
}

async function createWorkout(req, res) {
  const { title, description = "", difficulty = "beginner", muscle_group = "Full Body", day_of_week = null, estimated_minutes = 45, exercise_ids = [] } = req.body;
  if (!title) return res.status(400).json({ error: "Workout title is required." });
  const exercises = (exercise_ids || []).map((id) => ({
    exercise_id: id, sets: 3, reps: "10-12", rest_seconds: 60
  }));
  const doc = await Workout.create({ title, description, difficulty, muscle_group, day_of_week, estimated_minutes, exercises });
  res.status(201).json(doc.toObject());
}

async function updateWorkout(req, res) {
  const { title, description = "", difficulty = "beginner", muscle_group = "Full Body", day_of_week = null, estimated_minutes = 45, exercise_ids } = req.body;
  if (!title) return res.status(400).json({ error: "Workout title is required." });
  const update = { title, description, difficulty, muscle_group, day_of_week, estimated_minutes };
  if (Array.isArray(exercise_ids)) {
    update.exercises = exercise_ids.map((id) => ({
      exercise_id: id, sets: 3, reps: "10-12", rest_seconds: 60
    }));
  }
  await Workout.findByIdAndUpdate(req.params.id, { $set: update });
  res.json({ message: "Workout updated." });
}

async function deleteWorkout(req, res) {
  await Workout.findByIdAndDelete(req.params.id);
  res.json({ message: "Workout deleted." });
}

async function createCustomWorkout(req, res) {
  const { title, notes, scheduled_date } = req.body;
  if (!title) return res.status(400).json({ error: "Workout title is required." });
  const doc = await UserWorkout.create({
    user_id: req.user.userId, title, notes: notes || null, scheduled_date: scheduled_date || null
  });
  res.status(201).json(doc.toObject());
}

async function completeWorkout(req, res) {
  const { workout_id, user_workout_id, duration_minutes = 30, calories_burned = 180, notes = "" } = req.body;
  await WorkoutLog.create({
    user_id: req.user.userId, workout_id: workout_id || null, user_workout_id: user_workout_id || null,
    duration_minutes, calories_burned, notes
  });
  res.status(201).json({ message: "Workout marked complete." });
}

async function workoutHistory(req, res) {
  const logs = await WorkoutLog.find({ user_id: req.user.userId })
    .populate("workout_id user_workout_id")
    .sort({ completed_at: -1 }).limit(30).lean();

  const rows = logs.map((log) => {
    const title = (log.workout_id && log.workout_id.title) ||
      (log.user_workout_id && log.user_workout_id.title) || "Custom workout";
    return { ...log, title };
  });
  res.json(rows);
}

module.exports = {
  listExercises, getExercise, createExercise, updateExercise, deleteExercise, uploadExerciseImage,
  listWorkouts, getWorkout, createWorkout, updateWorkout, deleteWorkout,
  createCustomWorkout, completeWorkout, workoutHistory
};

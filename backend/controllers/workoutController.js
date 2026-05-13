const { db } = require("../config/db");
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
  const filters = [];
  const params = [];
  if (search) {
    filters.push("name LIKE ?");
    params.push(`%${search}%`);
  }
  if (muscle) {
    filters.push("muscle_group = ?");
    params.push(muscle);
  }
  if (difficulty) {
    filters.push("difficulty = ?");
    params.push(difficulty);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const [rows] = await db.query(`SELECT * FROM exercise_library ${where} ORDER BY muscle_group, name`, params);
  res.json(rows);
}

async function getExercise(req, res) {
  const [[exercise]] = await db.query("SELECT * FROM exercise_library WHERE id = ?", [req.params.id]);
  if (!exercise) return res.status(404).json({ error: "Exercise not found." });
  res.json(exercise);
}

async function createExercise(req, res) {
  const payload = normalizeExercisePayload(req.body);
  if (!payload.name || !payload.muscle_group) {
    return res.status(400).json({ error: "Exercise title and muscle group are required." });
  }
  const [result] = await db.query(
    `INSERT INTO exercise_library (name, muscle_group, difficulty, equipment, duration, instructions, youtube_url, image_url, calories_per_minute)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [payload.name, payload.muscle_group, payload.difficulty, payload.equipment, payload.duration, payload.instructions, payload.youtube_url, payload.image_url, payload.calories_per_minute]
  );
  res.status(201).json({ id: result.insertId, ...payload });
}

async function updateExercise(req, res) {
  const payload = normalizeExercisePayload(req.body);
  await db.query(
    `UPDATE exercise_library SET name = ?, muscle_group = ?, difficulty = ?, equipment = ?, duration = ?, instructions = ?, youtube_url = ?, image_url = ?, calories_per_minute = ?
     WHERE id = ?`,
    [payload.name, payload.muscle_group, payload.difficulty, payload.equipment, payload.duration, payload.instructions, payload.youtube_url, payload.image_url, payload.calories_per_minute, req.params.id]
  );
  res.json({ message: "Exercise updated." });
}

async function deleteExercise(req, res) {
  await db.query("DELETE FROM exercise_library WHERE id = ?", [req.params.id]);
  res.json({ message: "Exercise deleted." });
}

async function uploadExerciseImage(req, res) {
  if (!req.file) return res.status(400).json({ error: "Exercise image is required." });
  const imageUrl = publicUploadPath(req.file);
  await db.query("UPDATE exercise_library SET image_url = ? WHERE id = ?", [imageUrl, req.params.id]);
  res.json({ message: "Exercise image uploaded.", image_url: imageUrl });
}

async function listWorkouts(req, res) {
  const { muscle = "", difficulty = "" } = req.query;
  const filters = [];
  const params = [];
  if (muscle) {
    filters.push("muscle_group = ?");
    params.push(muscle);
  }
  if (difficulty) {
    filters.push("difficulty = ?");
    params.push(difficulty);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const [rows] = await db.query(`SELECT * FROM workouts ${where} ORDER BY FIELD(day_of_week, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), title`, params);
  res.json(rows);
}

async function getWorkout(req, res) {
  const [[workout]] = await db.query("SELECT * FROM workouts WHERE id = ?", [req.params.id]);
  if (!workout) return res.status(404).json({ error: "Workout not found." });
  const [exercises] = await db.query(
    `SELECT el.*, we.sets, we.reps, we.rest_seconds
     FROM workout_exercises we
     JOIN exercise_library el ON el.id = we.exercise_id
     WHERE we.workout_id = ?
     ORDER BY el.name`,
    [req.params.id]
  );
  res.json({ ...workout, exercises });
}

async function createWorkout(req, res) {
  const { title, description = "", difficulty = "beginner", muscle_group = "Full Body", day_of_week = null, estimated_minutes = 45, exercise_ids = [] } = req.body;
  if (!title) return res.status(400).json({ error: "Workout title is required." });
  const [result] = await db.query(
    "INSERT INTO workouts (title, description, difficulty, muscle_group, day_of_week, estimated_minutes) VALUES (?, ?, ?, ?, ?, ?)",
    [title, description, difficulty, muscle_group, day_of_week, estimated_minutes]
  );
  await assignExercisesToWorkout(result.insertId, exercise_ids);
  res.status(201).json({ id: result.insertId, title, description, difficulty, muscle_group, day_of_week, estimated_minutes });
}

async function updateWorkout(req, res) {
  const { title, description = "", difficulty = "beginner", muscle_group = "Full Body", day_of_week = null, estimated_minutes = 45, exercise_ids } = req.body;
  if (!title) return res.status(400).json({ error: "Workout title is required." });
  await db.query(
    "UPDATE workouts SET title = ?, description = ?, difficulty = ?, muscle_group = ?, day_of_week = ?, estimated_minutes = ? WHERE id = ?",
    [title, description, difficulty, muscle_group, day_of_week, estimated_minutes, req.params.id]
  );
  if (Array.isArray(exercise_ids)) {
    await db.query("DELETE FROM workout_exercises WHERE workout_id = ?", [req.params.id]);
    await assignExercisesToWorkout(req.params.id, exercise_ids);
  }
  res.json({ message: "Workout updated." });
}

async function deleteWorkout(req, res) {
  await db.query("DELETE FROM workouts WHERE id = ?", [req.params.id]);
  res.json({ message: "Workout deleted." });
}

async function assignExercisesToWorkout(workoutId, exerciseIds) {
  const ids = Array.isArray(exerciseIds) ? exerciseIds.filter(Boolean) : [];
  for (const exerciseId of ids) {
    await db.query(
      "INSERT IGNORE INTO workout_exercises (workout_id, exercise_id, sets, reps, rest_seconds) VALUES (?, ?, 3, '10-12', 60)",
      [workoutId, exerciseId]
    );
  }
}

async function createCustomWorkout(req, res) {
  const { title, notes, scheduled_date } = req.body;
  if (!title) return res.status(400).json({ error: "Workout title is required." });
  const [result] = await db.query(
    "INSERT INTO user_workouts (user_id, title, notes, scheduled_date) VALUES (?, ?, ?, ?)",
    [req.user.userId, title, notes || null, scheduled_date || null]
  );
  res.status(201).json({ id: result.insertId, title, notes, scheduled_date });
}

async function completeWorkout(req, res) {
  const { workout_id, user_workout_id, duration_minutes = 30, calories_burned = 180, notes = "" } = req.body;
  await db.query(
    "INSERT INTO workout_logs (user_id, workout_id, user_workout_id, duration_minutes, calories_burned, notes) VALUES (?, ?, ?, ?, ?, ?)",
    [req.user.userId, workout_id || null, user_workout_id || null, duration_minutes, calories_burned, notes]
  );
  res.status(201).json({ message: "Workout marked complete." });
}

async function workoutHistory(req, res) {
  const [rows] = await db.query(
    `SELECT wl.*, COALESCE(w.title, uw.title, 'Custom workout') AS title
     FROM workout_logs wl
     LEFT JOIN workouts w ON w.id = wl.workout_id
     LEFT JOIN user_workouts uw ON uw.id = wl.user_workout_id
     WHERE wl.user_id = ?
     ORDER BY wl.completed_at DESC
     LIMIT 30`,
    [req.user.userId]
  );
  res.json(rows);
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

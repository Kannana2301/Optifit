import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import AppLayout from "../components/AppLayout";
import AnimatedPage from "../components/AnimatedPage";
import Toast from "../components/Toast";
import SimpleChart from "../components/SimpleChart";
import api from "../api/client";

const blankExercise = {
  name: "",
  muscle_group: "Full Body",
  difficulty: "beginner",
  equipment: "Bodyweight",
  duration: 30,
  calories_per_minute: 6,
  youtube_url: "",
  image_url: "",
  instructions: ""
};

const blankWorkout = {
  title: "",
  description: "",
  difficulty: "beginner",
  muscle_group: "Full Body",
  day_of_week: "Monday",
  estimated_minutes: 45,
  exercise_ids: []
};

const blankMeal = {
  name: "",
  meal_type: "breakfast",
  diet_type: "vegetarian",
  calories: 400,
  protein: 25,
  carbs: 45,
  fat: 12,
  allergens: "",
  ingredients: ""
};

function AdminManage() {
  const [tab, setTab] = useState("exercises");
  const [exercises, setExercises] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [exerciseForm, setExerciseForm] = useState(blankExercise);
  const [workoutForm, setWorkoutForm] = useState(blankWorkout);
  const [mealForm, setMealForm] = useState(blankMeal);
  const [editing, setEditing] = useState({ type: "", id: null });
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [error, setError] = useState("");
  const [uploadFile, setUploadFile] = useState(null);

  const loadAll = async () => {
    try {
      const [exerciseRes, workoutRes, mealRes, analyticsRes] = await Promise.all([
        api.get("/api/exercises"),
        api.get("/api/workouts"),
        api.get("/api/meals"),
        api.get("/api/progress/analytics")
      ]);
      setExercises(exerciseRes.data);
      setWorkouts(workoutRes.data);
      setMeals(mealRes.data);
      setAnalytics(analyticsRes.data);
      setError("");
    } catch (err) {
      setError("Unable to load management data. Check that the backend is running and your session is valid.");
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const selectedExerciseNames = useMemo(() => {
    const ids = new Set(workoutForm.exercise_ids.map(String));
    return exercises.filter((item) => ids.has(String(item.id))).map((item) => item.name).join(", ");
  }, [exercises, workoutForm.exercise_ids]);

  const notify = (message, type = "success") => setToast({ message, type });

  const submitExercise = async (event) => {
    event.preventDefault();
    try {
      let exerciseId = editing.type === "exercise" ? editing.id : null;
      if (exerciseId) {
        await api.put(`/api/exercises/${exerciseId}`, exerciseForm);
      } else {
        const response = await api.post("/api/exercises", exerciseForm);
        exerciseId = response.data.id;
      }
      if (uploadFile && exerciseId) {
        const formData = new FormData();
        formData.append("image", uploadFile);
        await api.post(`/api/exercises/${exerciseId}/image`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      }
      setExerciseForm(blankExercise);
      setUploadFile(null);
      setEditing({ type: "", id: null });
      notify("Exercise saved.");
      loadAll();
    } catch (err) {
      notify("Exercise could not be saved.", "danger");
    }
  };

  const submitWorkout = async (event) => {
    event.preventDefault();
    try {
      if (editing.type === "workout") {
        await api.put(`/api/workouts/${editing.id}`, workoutForm);
      } else {
        await api.post("/api/workouts", workoutForm);
      }
      setWorkoutForm(blankWorkout);
      setEditing({ type: "", id: null });
      notify("Workout plan saved.");
      loadAll();
    } catch (err) {
      notify("Workout could not be saved.", "danger");
    }
  };

  const submitMeal = async (event) => {
    event.preventDefault();
    try {
      if (editing.type === "meal") {
        await api.put(`/api/meals/${editing.id}`, mealForm);
      } else {
        await api.post("/api/meals", mealForm);
      }
      setMealForm(blankMeal);
      setEditing({ type: "", id: null });
      notify("Meal saved.");
      loadAll();
    } catch (err) {
      notify("Meal could not be saved.", "danger");
    }
  };

  const removeItem = async (type, id) => {
    try {
      const endpoint = type === "exercise" ? "exercises" : type === "workout" ? "workouts" : "meals";
      await api.delete(`/api/${endpoint}/${id}`);
      notify(`${type} deleted.`);
      loadAll();
    } catch (err) {
      notify(`${type} could not be deleted.`, "danger");
    }
  };

  const toggleWorkoutExercise = (id) => {
    const current = workoutForm.exercise_ids.map(String);
    const next = current.includes(String(id)) ? current.filter((item) => item !== String(id)) : [...current, String(id)];
    setWorkoutForm({ ...workoutForm, exercise_ids: next });
  };

  return (
    <AppLayout>
      <AnimatedPage>
        <div className="op-page-head">
          <h1>Data management</h1>
          <p>Add your own exercises, workout plans, meals, and analytics data. Everything here is database-driven.</p>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="op-tabs">
          {["exercises", "workouts", "meals", "analytics"].map((item) => (
            <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>
          ))}
        </div>

        {tab === "exercises" && (
          <div className="op-grid op-grid-2 mt-4">
            <motion.section className="op-card" layout>
              <h2>{editing.type === "exercise" ? "Edit exercise" : "Add exercise"}</h2>
              <form className="op-form-grid" onSubmit={submitExercise}>
                <input className="form-control" placeholder="Title" value={exerciseForm.name} onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })} required />
                <input className="form-control" placeholder="Muscle group" value={exerciseForm.muscle_group} onChange={(e) => setExerciseForm({ ...exerciseForm, muscle_group: e.target.value })} required />
                <select className="form-select" value={exerciseForm.difficulty} onChange={(e) => setExerciseForm({ ...exerciseForm, difficulty: e.target.value })}>
                  <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
                </select>
                <input className="form-control" placeholder="Equipment" value={exerciseForm.equipment} onChange={(e) => setExerciseForm({ ...exerciseForm, equipment: e.target.value })} />
                <input className="form-control" type="number" placeholder="Duration" value={exerciseForm.duration} onChange={(e) => setExerciseForm({ ...exerciseForm, duration: e.target.value })} />
                <input className="form-control" type="number" step="0.1" placeholder="Calories/min" value={exerciseForm.calories_per_minute} onChange={(e) => setExerciseForm({ ...exerciseForm, calories_per_minute: e.target.value })} />
                <input className="form-control op-span-2" placeholder="YouTube tutorial URL" value={exerciseForm.youtube_url} onChange={(e) => setExerciseForm({ ...exerciseForm, youtube_url: e.target.value })} />
                <input className="form-control op-span-2" type="file" accept="image/*" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
                <textarea className="form-control op-span-2" placeholder="Description / instructions" value={exerciseForm.instructions} onChange={(e) => setExerciseForm({ ...exerciseForm, instructions: e.target.value })} />
                <button className="btn btn-success op-span-2">Save exercise</button>
              </form>
            </motion.section>
            <section className="op-card"><h2>Exercise library</h2>{exercises.map((item) => (
              <article className="op-list-item" key={item.id}>
                <div><strong>{item.name}</strong><p>{item.instructions}</p><small>{item.muscle_group} · {item.difficulty} · {item.equipment}</small></div>
                <div className="op-actions">
                  <button className="btn btn-outline-dark btn-sm" onClick={() => { setExerciseForm({ ...blankExercise, ...item }); setEditing({ type: "exercise", id: item.id }); }}>Edit</button>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => removeItem("exercise", item.id)}>Delete</button>
                </div>
              </article>
            ))}</section>
          </div>
        )}

        {tab === "workouts" && (
          <div className="op-grid op-grid-2 mt-4">
            <section className="op-card">
              <h2>{editing.type === "workout" ? "Edit workout plan" : "Create workout plan"}</h2>
              <form className="op-form-grid" onSubmit={submitWorkout}>
                <input className="form-control" placeholder="Title" value={workoutForm.title} onChange={(e) => setWorkoutForm({ ...workoutForm, title: e.target.value })} required />
                <input className="form-control" placeholder="Muscle group" value={workoutForm.muscle_group} onChange={(e) => setWorkoutForm({ ...workoutForm, muscle_group: e.target.value })} />
                <select className="form-select" value={workoutForm.difficulty} onChange={(e) => setWorkoutForm({ ...workoutForm, difficulty: e.target.value })}>
                  <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
                </select>
                <select className="form-select" value={workoutForm.day_of_week} onChange={(e) => setWorkoutForm({ ...workoutForm, day_of_week: e.target.value })}>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => <option key={day}>{day}</option>)}
                </select>
                <input className="form-control op-span-2" type="number" placeholder="Estimated minutes" value={workoutForm.estimated_minutes} onChange={(e) => setWorkoutForm({ ...workoutForm, estimated_minutes: e.target.value })} />
                <textarea className="form-control op-span-2" placeholder="Description" value={workoutForm.description} onChange={(e) => setWorkoutForm({ ...workoutForm, description: e.target.value })} />
                <div className="op-check-grid op-span-2">
                  {exercises.map((exercise) => (
                    <label key={exercise.id}><input type="checkbox" checked={workoutForm.exercise_ids.map(String).includes(String(exercise.id))} onChange={() => toggleWorkoutExercise(exercise.id)} /> {exercise.name}</label>
                  ))}
                </div>
                <small className="op-span-2 text-muted">Assigned: {selectedExerciseNames || "none"}</small>
                <button className="btn btn-success op-span-2">Save workout</button>
              </form>
            </section>
            <section className="op-card"><h2>Workout plans</h2>{workouts.map((item) => (
              <article className="op-list-item" key={item.id}>
                <div><strong>{item.title}</strong><p>{item.description}</p><small>{item.day_of_week} · {item.difficulty} · {item.estimated_minutes} min</small></div>
                <div className="op-actions">
                  <button className="btn btn-outline-dark btn-sm" onClick={() => { setWorkoutForm({ ...blankWorkout, ...item, exercise_ids: [] }); setEditing({ type: "workout", id: item.id }); }}>Edit</button>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => removeItem("workout", item.id)}>Delete</button>
                </div>
              </article>
            ))}</section>
          </div>
        )}

        {tab === "meals" && (
          <div className="op-grid op-grid-2 mt-4">
            <section className="op-card">
              <h2>{editing.type === "meal" ? "Edit meal" : "Add meal"}</h2>
              <form className="op-form-grid" onSubmit={submitMeal}>
                <input className="form-control" placeholder="Meal name" value={mealForm.name} onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })} required />
                <select className="form-select" value={mealForm.meal_type} onChange={(e) => setMealForm({ ...mealForm, meal_type: e.target.value })}>
                  <option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="snack">Snack</option><option value="dinner">Dinner</option>
                </select>
                <select className="form-select" value={mealForm.diet_type} onChange={(e) => setMealForm({ ...mealForm, diet_type: e.target.value })}>
                  <option value="vegetarian">Vegetarian</option><option value="non_vegetarian">Non-vegetarian</option><option value="vegan">Vegan</option>
                </select>
                <input className="form-control" type="number" placeholder="Calories" value={mealForm.calories} onChange={(e) => setMealForm({ ...mealForm, calories: e.target.value })} />
                {["protein", "carbs", "fat"].map((field) => <input key={field} className="form-control" type="number" placeholder={field} value={mealForm[field]} onChange={(e) => setMealForm({ ...mealForm, [field]: e.target.value })} />)}
                <input className="form-control op-span-2" placeholder="Allergy tags" value={mealForm.allergens} onChange={(e) => setMealForm({ ...mealForm, allergens: e.target.value })} />
                <textarea className="form-control op-span-2" placeholder="Ingredients / grocery items" value={mealForm.ingredients} onChange={(e) => setMealForm({ ...mealForm, ingredients: e.target.value })} />
                <button className="btn btn-success op-span-2">Save meal</button>
              </form>
            </section>
            <section className="op-card"><h2>Meals</h2>{meals.map((item) => (
              <article className="op-list-item" key={item.id}>
                <div><strong>{item.name}</strong><p>{item.ingredients}</p><small>{item.meal_type} · {item.diet_type} · {item.calories} kcal</small></div>
                <div className="op-actions">
                  <button className="btn btn-outline-dark btn-sm" onClick={() => { setMealForm({ ...blankMeal, ...item }); setEditing({ type: "meal", id: item.id }); }}>Edit</button>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => removeItem("meal", item.id)}>Delete</button>
                </div>
              </article>
            ))}</section>
          </div>
        )}

        {tab === "analytics" && (
          <div className="op-grid op-grid-2 mt-4">
            <section className="op-card">
              <h2>User analytics</h2>
              <SimpleChart data={analytics?.entries?.map((entry) => ({ date: entry.tracked_on, weight: entry.weight || 0 })) || []} />
            </section>
            <section className="op-card">
              <h2>Weekly summary</h2>
              <div className="op-grid op-grid-3">
                <div className="op-stat"><span>Weight change</span><strong>{analytics?.summary?.weightChange || 0} kg</strong></div>
                <div className="op-stat"><span>Waist change</span><strong>{analytics?.summary?.waistChange || 0} cm</strong></div>
                <div className="op-stat"><span>Calories burned</span><strong>{analytics?.summary?.caloriesBurned || 0}</strong></div>
              </div>
            </section>
          </div>
        )}
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />
      </AnimatedPage>
    </AppLayout>
  );
}

export default AdminManage;

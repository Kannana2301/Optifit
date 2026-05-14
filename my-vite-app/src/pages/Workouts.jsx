import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import LoadingState from "../components/LoadingState";
import api from "../api/client";

function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState({ search: "", muscle: "", difficulty: "" });
  const [loading, setLoading] = useState(true);
  const [custom, setCustom] = useState({ title: "", scheduled_date: "" });
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [workoutRes, exerciseRes, historyRes] = await Promise.all([
        api.get("/api/workouts", { params: { muscle: filters.muscle, difficulty: filters.difficulty } }),
        api.get("/api/exercises", { params: filters }),
        api.get("/api/workouts/history")
      ]);
      setWorkouts(workoutRes.data);
      setExercises(exerciseRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      setError("Unable to load workouts. Confirm the backend is running and you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filters.muscle, filters.difficulty]);

  const searchedExercises = useMemo(() => exercises.filter((item) => item.name.toLowerCase().includes(filters.search.toLowerCase())), [exercises, filters.search]);

  const completeWorkout = async (workout) => {
    try {
      await api.post("/api/workouts/complete", { workout_id: workout._id, duration_minutes: workout.estimated_minutes, calories_burned: workout.estimated_minutes * 7 });
      load();
    } catch (err) {
      setError("Unable to complete workout.");
    }
  };

  const createCustom = async (event) => {
    event.preventDefault();
    if (!custom.title.trim()) {
      setError("Workout title is required.");
      return;
    }
    try {
      await api.post("/api/workouts/custom", custom);
      setCustom({ title: "", scheduled_date: "" });
      load();
    } catch (err) {
      setError("Unable to create custom workout.");
    }
  };

  return (
    <AppLayout>
      <div className="op-page-head"><h1>Workout system</h1><p>Plans, exercise library, custom sessions, and completion history.</p></div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="op-filters">
        <input className="form-control" placeholder="Search exercises" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <select className="form-select" value={filters.muscle} onChange={(e) => setFilters({ ...filters, muscle: e.target.value })}>
          <option value="">All muscle groups</option><option>Chest</option><option>Legs</option><option>Back</option><option>Full Body</option><option>Upper Body</option>
        </select>
        <select className="form-select" value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}>
          <option value="">All levels</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
        </select>
      </div>
      {loading ? <LoadingState /> : (
        <div className="op-grid op-grid-2 mt-4">
          <section className="op-card"><h2>Weekly plans</h2>{workouts.map((workout) => (
            <article className="op-list-item" key={workout._id}>
              <div><strong>{workout.title}</strong><p>{workout.description}</p><small>{workout.day_of_week} · {workout.difficulty} · {workout.estimated_minutes} min</small></div>
              <button className="btn btn-success btn-sm" onClick={() => completeWorkout(workout)}>Complete</button>
            </article>
          ))}</section>
          <section className="op-card"><h2>Exercise library</h2>{searchedExercises.map((exercise) => (
            <article className="op-list-item-with-img" key={exercise._id}>
              <img
                className="op-img-exercise"
                src={exercise.image_url || `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&q=80`}
                alt={exercise.name}
                loading="lazy"
                onError={(e) => { e.target.style.display = "none"; }}
              />
              <div><strong>{exercise.name}</strong><p>{exercise.instructions}</p><small>{exercise.muscle_group} · {exercise.equipment}</small></div>
              {exercise.youtube_url && <a className="btn btn-outline-success btn-sm" href={exercise.youtube_url} target="_blank" rel="noreferrer">Tutorial</a>}
            </article>
          ))}</section>
          <section className="op-card">
            <h2>Custom workout</h2>
            <form className="op-form-inline" onSubmit={createCustom}>
              <input className="form-control" placeholder="Workout title" value={custom.title} onChange={(e) => setCustom({ ...custom, title: e.target.value })} />
              <input className="form-control" type="date" value={custom.scheduled_date} onChange={(e) => setCustom({ ...custom, scheduled_date: e.target.value })} />
              <button className="btn btn-success">Create</button>
            </form>
          </section>
          <section className="op-card"><h2>History</h2>{history.map((log) => <div className="op-history" key={log._id}><strong>{log.title}</strong><span>{log.duration_minutes} min · {log.calories_burned} kcal</span></div>)}</section>
        </div>
      )}
    </AppLayout>
  );
}

export default Workouts;

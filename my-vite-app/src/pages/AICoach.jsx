import React, { useState } from "react";
import AppLayout from "../components/AppLayout";
import api from "../api/client";

function AICoach() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState([]);
  const [insights, setInsights] = useState([]);
  const [generatedWorkout, setGeneratedWorkout] = useState(null);
  const [generatedMealPlan, setGeneratedMealPlan] = useState(null);
  const [error, setError] = useState("");

  const askCoach = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post("/api/ai-coach", { prompt });
      setAnswer(response.data.response);
      loadHistory();
      setError("");
    } catch (err) {
      setError("Unable to reach AI coach.");
    }
  };

  const loadHistory = async () => {
    const response = await api.get("/api/ai-coach/history");
    setHistory(response.data);
  };

  const loadInsights = async () => {
    const response = await api.get("/api/ai-progress-insights");
    setInsights(response.data.insights);
  };

  React.useEffect(() => {
    loadHistory().catch(() => {});
    loadInsights().catch(() => {});
  }, []);

  const createWorkout = async () => {
    try {
      const response = await api.post("/api/generate-workout", { difficulty: "intermediate", days: 4 });
      setGeneratedWorkout(response.data.plan);
      setError("");
    } catch (err) {
      setError("Unable to generate workout.");
    }
  };

  const createMealPlan = async () => {
    try {
      const response = await api.post("/api/generate-meal-plan", {});
      setGeneratedMealPlan(response.data);
      setError("");
    } catch (err) {
      setError("Unable to generate meal plan.");
    }
  };

  return (
    <AppLayout>
      <div className="op-page-head"><h1>AI fitness coach</h1><p>Personalized coaching, generated workouts, and generated meal plans.</p></div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="op-grid op-grid-2">
        <section className="op-card">
          <h2>Fitness Q&A</h2>
          <form className="op-form-grid" onSubmit={askCoach}>
            <textarea className="form-control op-span-2" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ask about training, nutrition, recovery, or goals" />
            <button className="btn btn-success op-span-2">Ask coach</button>
          </form>
          {answer && <p className="op-ai-answer">{answer}</p>}
          <div className="op-history-list">
            {history.map((item) => (
              <article className="op-history" key={item.id}>
                <strong>{item.prompt}</strong>
                <span>{item.response}</span>
              </article>
            ))}
          </div>
        </section>
        <section className="op-card">
          <h2>Generators</h2>
          <div className="d-flex gap-2 flex-wrap">
            <button className="btn btn-dark" onClick={createWorkout}>Generate workout</button>
            <button className="btn btn-success" onClick={createMealPlan}>Generate meal plan</button>
          </div>
          {generatedWorkout && generatedWorkout.map((day) => (
            <article className="op-history" key={day.day}>
              <strong>{day.title}</strong>
              <span>{day.exercises.map((item) => item.name).join(", ")}</span>
            </article>
          ))}
          {generatedMealPlan && (
            <article className="op-history">
              <strong>{generatedMealPlan.calories} kcal target</strong>
              <span>{generatedMealPlan.meals.map((meal) => meal.name).join(", ")}</span>
            </article>
          )}
          <hr />
          <h2>Progress insights</h2>
          {insights.map((item) => <span className="op-chip" key={item}>{item}</span>)}
        </section>
      </div>
    </AppLayout>
  );
}

export default AICoach;

import React, { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import api from "../api/client";

function MealPlanner() {
  const [plan, setPlan] = useState(null);
  const [filters, setFilters] = useState({ diet: "", allergy: "" });
  const [meals, setMeals] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const [recommendations, mealRows] = await Promise.all([
        api.get("/api/meal-planner/recommendations"),
        api.get("/api/meals", { params: filters })
      ]);
      setPlan(recommendations.data);
      setMeals(mealRows.data);
    } catch (err) {
      setError("Unable to load meal planner data.");
    }
  };

  useEffect(() => { load(); }, [filters.diet, filters.allergy]);

  const schedule = async (meal) => {
    try {
      await api.post("/api/meal-planner/schedule", { meal_id: meal.id, plan_date: new Date().toISOString().slice(0, 10), scheduled_time: "12:30" });
    } catch (err) {
      setError("Unable to schedule meal.");
    }
  };

  return (
    <AppLayout>
      <div className="op-page-head"><h1>Meal planner</h1><p>Calorie targets, macros, scheduling, filters, allergy handling, and grocery list.</p></div>
      {error && <div className="alert alert-danger">{error}</div>}
      {plan && <div className="op-grid op-grid-4">
        <div className="op-card op-stat"><span>Calories</span><strong>{plan.calories}</strong></div>
        <div className="op-card op-stat"><span>Protein</span><strong>{plan.macros.protein}g</strong></div>
        <div className="op-card op-stat"><span>Carbs</span><strong>{plan.macros.carbs}g</strong></div>
        <div className="op-card op-stat"><span>Fat</span><strong>{plan.macros.fat}g</strong></div>
      </div>}
      <div className="op-filters mt-4">
        <select className="form-select" value={filters.diet} onChange={(e) => setFilters({ ...filters, diet: e.target.value })}>
          <option value="">All diets</option><option value="vegetarian">Vegetarian</option><option value="non_vegetarian">Non-vegetarian</option><option value="vegan">Vegan</option>
        </select>
        <input className="form-control" placeholder="Exclude allergy, e.g. dairy" value={filters.allergy} onChange={(e) => setFilters({ ...filters, allergy: e.target.value })} />
      </div>
      <div className="op-grid op-grid-2 mt-4">
        <section className="op-card"><h2>Meal cards</h2>{meals.map((meal) => (
          <article className="op-list-item" key={meal.id}>
            <div><strong>{meal.name}</strong><p>{meal.ingredients}</p><small>{meal.meal_type} · {meal.calories} kcal · P{meal.protein} C{meal.carbs} F{meal.fat}</small></div>
            <button className="btn btn-success btn-sm" onClick={() => schedule(meal)}>Schedule</button>
          </article>
        ))}</section>
        <section className="op-card"><h2>Grocery list</h2>{plan?.groceryList.map((item) => <span className="op-chip" key={item}>{item}</span>)}</section>
      </div>
    </AppLayout>
  );
}

export default MealPlanner;

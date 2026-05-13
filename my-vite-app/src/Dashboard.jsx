import React, { useEffect, useState } from "react";
import AppLayout from "./components/AppLayout";
import StatCard from "./components/StatCard";
import SimpleChart from "./components/SimpleChart";
import LoadingState from "./components/LoadingState";
import api from "./api/client";

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      const response = await api.get("/api/dashboard");
      setData(response.data);
    } catch (err) {
      setError("Unable to load dashboard analytics.");
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const updateWater = async (glasses) => {
    await api.put("/api/dashboard/water", { glasses, target_glasses: data.water.target_glasses });
    loadDashboard();
  };

  if (!data && !error) return <AppLayout><LoadingState /></AppLayout>;

  return (
    <AppLayout>
      {error && <div className="alert alert-danger">{error}</div>}
      {data && (
        <>
          <section className="op-hero">
            <div>
              <p className="op-kicker">Today</p>
              <h1>{data.user.name}'s fitness dashboard</h1>
              <p>Track training, nutrition, hydration, and body progress from one workspace.</p>
            </div>
            <div className="op-hero-metrics">
              <div><span>BMI</span><strong>{data.bmi}</strong></div>
              <div><span>Calories</span><strong>{data.dailyCalories}</strong></div>
              <div><span>Streak</span><strong>{data.streak}</strong></div>
            </div>
          </section>

          <div className="op-grid op-grid-4 mt-4">
            {data.cards.map((card) => <StatCard key={card.label} {...card} />)}
          </div>

          <div className="op-grid op-grid-2 mt-4">
            <section className="op-card">
              <div className="op-section-head">
                <div>
                  <h2>Weight trend</h2>
                  <p>Latest body weight entries</p>
                </div>
              </div>
              <SimpleChart data={data.charts.weight} />
            </section>

            <section className="op-card">
              <div className="op-section-head">
                <div>
                  <h2>Daily progress</h2>
                  <p>Completion against today's goals</p>
                </div>
              </div>
              {Object.entries(data.progress).map(([key, value]) => (
                <div className="op-progress-row" key={key}>
                  <span>{key.replace(/([A-Z])/g, " $1")}</span>
                  <div className="progress">
                    <div className="progress-bar bg-success" style={{ width: `${value}%` }}>{value}%</div>
                  </div>
                </div>
              ))}
            </section>
          </div>

          <div className="op-grid op-grid-3 mt-4">
            <section className="op-card">
              <h2>Water intake</h2>
              <p className="text-muted">{data.water.glasses} of {data.water.target_glasses} glasses</p>
              <div className="op-stepper">
                <button onClick={() => updateWater(Math.max(0, data.water.glasses - 1))}>-</button>
                <strong>{data.water.glasses}</strong>
                <button onClick={() => updateWater(data.water.glasses + 1)}>+</button>
              </div>
            </section>
            <section className="op-card">
              <h2>Macro target</h2>
              <div className="op-macros">
                <span>Protein <strong>{data.macros.protein}g</strong></span>
                <span>Carbs <strong>{data.macros.carbs}g</strong></span>
                <span>Fat <strong>{data.macros.fat}g</strong></span>
              </div>
            </section>
            <section className="op-card">
              <h2>Goal summary</h2>
              <p className="text-capitalize mb-1">{data.user.goal.replace("_", " ")}</p>
              <p className="text-muted mb-0">{data.unreadNotifications} unread reminders</p>
            </section>
          </div>
        </>
      )}
    </AppLayout>
  );
}

export default Dashboard;

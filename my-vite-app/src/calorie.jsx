import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function CaloriesCalculator() {
  const [form, setForm] = useState({
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    activity: '1.2',
  });

  const [calories, setCalories] = useState(null);
  const [bulkCalories, setBulkCalories] = useState(null);
  const [cutCalories, setCutCalories] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calculateCalories = () => {
    const { age, gender, weight, height, activity } = form;

    if (!age || !weight || !height || age <= 0 || weight <= 0 || height <= 0) {
      alert('Please enter valid values');
      return;
    }

    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);

    let bmr = gender === 'male'
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;

    const maintenance = bmr * parseFloat(activity);
    setCalories(Math.round(maintenance));
    setBulkCalories(Math.round(maintenance + 300));   // 300 surplus
    setCutCalories(Math.round(maintenance - 500));    // 500 deficit
  };

  return (
    <div className="card p-5 rounded-4 shadow mx-auto mt-5" style={{ maxWidth: '600px' }}>
      <h2 className="text-center fw-bold text-success mb-4">Calorie Calculator</h2>

      <div className="mb-3">
        <label className="form-label">Age (years)</label>
        <input
          type="number"
          className="form-control"
          name="age"
          value={form.age}
          onChange={handleChange}
          placeholder="Enter your age"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Gender</label>
        <select
          className="form-select"
          name="gender"
          value={form.gender}
          onChange={handleChange}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Weight (kg)</label>
        <input
          type="number"
          className="form-control"
          name="weight"
          value={form.weight}
          onChange={handleChange}
          placeholder="Enter your weight"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Height (cm)</label>
        <input
          type="number"
          className="form-control"
          name="height"
          value={form.height}
          onChange={handleChange}
          placeholder="Enter your height"
        />
      </div>

      <div className="mb-4">
        <label className="form-label">Activity Level</label>
        <select
          className="form-select"
          name="activity"
          value={form.activity}
          onChange={handleChange}
        >
          <option value="1.2">Sedentary (little or no exercise)</option>
          <option value="1.375">Lightly active (1–3 days/week)</option>
          <option value="1.55">Moderately active (3–5 days/week)</option>
          <option value="1.725">Very active (6–7 days/week)</option>
          <option value="1.9">Super active (twice/day training)</option>
        </select>
      </div>

      <div className="d-grid mb-4">
        <button
          onClick={calculateCalories}
          className="btn btn-success btn-lg rounded-pill"
        >
          Calculate Calories
        </button>
      </div>

      {calories && (
        <div className="alert alert-success text-center">
          <p className="mb-1">🔹 <strong>Maintenance:</strong> {calories} kcal/day</p>
          <p className="mb-1">🔺 <strong>Bulking:</strong> {bulkCalories} kcal/day</p>
          <p className="mb-0">🔻 <strong>Cutting:</strong> {cutCalories} kcal/day</p>
        </div>
      )}
    </div>
  );
}

export default CaloriesCalculator;

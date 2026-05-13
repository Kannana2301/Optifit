import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from 'react-router-dom';

function BMICalculator() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmiResult, setBmiResult] = useState(null);
  const [bmiCategory, setBmiCategory] = useState('');
  const navigate = useNavigate();

  const calculateBMI = () => {
    if (!height || !weight || height <= 0 || weight <= 0) {
      alert('Please enter valid height and weight');
      return;
    }

    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    const roundedBMI = bmi.toFixed(1);

    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi >= 18.5 && bmi < 24.9) category = 'Normal weight';
    else if (bmi >= 25 && bmi < 29.9) category = 'Overweight';
    else category = 'Obese';

    setBmiResult(roundedBMI);
    setBmiCategory(category);
  };

  const getBmiColor = () => {
    switch (bmiCategory) {
      case 'Underweight': return 'text-warning';
      case 'Normal weight': return 'text-success';
      case 'Overweight': return 'text-orange';
      case 'Obese': return 'text-danger';
      default: return 'text-muted';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  return (
    <div
      className="min-vh-100"
      style={{
        background: 'linear-gradient(to right, #FFD400, #FF8C00, #FF5F00)',
        minHeight: '100vh',
      }}
    >
      <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm sticky-top">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            <i className="bi bi-heart-pulse me-2"></i>My Diet Meal Plan
          </Link>
          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link fw-medium px-3" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active px-3" to="/bmi-calculator">Calculator</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3" to="#">Pricing</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3" to="#">About</Link>
              </li>
            </ul>
            <div className="d-flex ms-lg-3">
              <button onClick={handleLogout} className="btn btn-light me-2">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="card border-0 shadow-sm rounded-3" style={{ backgroundColor: '#fff' }}>
              <div className="card-body p-5">
                <h2 className="text-center fw-bold text-success mb-4">BMI Calculator</h2>

                <div className="mb-3">
                  <label className="form-label">Height (cm)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="Enter your height"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Enter your weight"
                  />
                </div>

                <div className="d-grid mb-4">
                  <button
                    onClick={calculateBMI}
                    className="btn btn-success btn-lg rounded-pill shadow-sm"
                  >
                    Calculate BMI
                  </button>
                </div>

                {bmiResult && (
                  <div className="alert alert-success text-center">
                    Your BMI is <strong>{bmiResult}</strong> –{' '}
                    <span className={getBmiColor()}>{bmiCategory}</span>
                  </div>
                )}

                <div className="mt-4">
                  <h5 className="text-success">BMI Categories</h5>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Underweight</span> <span>&lt; 18.5</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Normal weight</span> <span>18.5 – 24.9</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Overweight</span> <span>25 – 29.9</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Obese</span> <span>&ge; 30</span>
                    </li>
                  </ul>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BMICalculator;

import React, { lazy, Suspense } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Signup from './signup';
import Login from './login';
import LoadingState from './components/LoadingState';

const Calculate = lazy(() => import('./Calculator'));
const Dashboard = lazy(() => import('./Dashboard'));
const BMICalculator = lazy(() => import('./BMI'));
const CaloriesCalculator = lazy(() => import('./calorie'));
const Workouts = lazy(() => import('./pages/Workouts'));
const Progress = lazy(() => import('./pages/Progress'));
const MealPlanner = lazy(() => import('./pages/MealPlanner'));
const Profile = lazy(() => import('./pages/Profile'));
const Notifications = lazy(() => import('./pages/Notifications'));
const AICoach = lazy(() => import('./pages/AICoach'));
const AdminManage = lazy(() => import('./pages/AdminManage'));
const Protein = lazy(() => import('./shop/protein'));
const Fatburner = lazy(() => import('./shop/fatburner'));
const Creatine = lazy(() => import('./shop/creatine'));
const Vitamin = lazy(() => import('./shop/vitamin'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('userToken');
  
  if (!token) {
    // Redirect to login if no token is found
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Reverse Protected Route (for login/signup when already authenticated)
const ReverseProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('userToken');
  
  if (token) {
    // Redirect to dashboard if token exists
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingState />}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <ReverseProtectedRoute>
                <Login />
              </ReverseProtectedRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <ReverseProtectedRoute>
                <Signup />
              </ReverseProtectedRoute>
            } 
          />

        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        <Route path="/workouts" element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
        <Route path="/exercise" element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
        <Route path="/excercise" element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
        <Route path="/meal-planner" element={<ProtectedRoute><MealPlanner /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/ai-coach" element={<ProtectedRoute><AICoach /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminManage /></ProtectedRoute>} />

        {/* Add the Protein Route */}
        <Route 
          path="/shop/protein"  // Define the path for Protein
          element={
            <ProtectedRoute>
              <Protein />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/shop/fatburner"  // Define the path for Protein
          element={
            <ProtectedRoute>
              <Fatburner />
            </ProtectedRoute>
          } 
        />

          <Route 
          path="/shop/creatine"  // Define the path for Protein
          element={
            <ProtectedRoute>
              <Creatine />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/shop/vitamin"  
          element={
            <ProtectedRoute>
              <Vitamin />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/bmi-calculator" 
          element={
            <ProtectedRoute>
              <div>
                <BMICalculator />
                <CaloriesCalculator />
              </div>
            </ProtectedRoute>
          } 
        />
        

        <Route 
          path="/calculate" 
          element={
            <ProtectedRoute>
              <Calculate />
            </ProtectedRoute>
          } 
        />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

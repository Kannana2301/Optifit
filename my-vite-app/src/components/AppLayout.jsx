import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

function AppLayout({ children }) {
  const navigate = useNavigate();
  const [theme, setTheme] = React.useState(localStorage.getItem("optiTheme") || "light");

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("optiTheme", theme);
  }, [theme]);

  const logout = () => {
    localStorage.removeItem("userToken");
    navigate("/login");
  };

  return (
    <div className="op-app">
      <nav className="navbar navbar-expand-lg op-nav sticky-top">
        <div className="container-fluid px-3 px-lg-4">
          <Link className="navbar-brand fw-bold" to="/">OptiFit</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#opNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="opNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item"><NavLink className="nav-link" to="/">Dashboard</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/workouts">Workouts</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/progress">Progress</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/meal-planner">Meals</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/profile">Profile</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/notifications">Alerts</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/ai-coach">AI Coach</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/admin">Manage</NavLink></li>
              <li className="nav-item dropdown">
                <button className="nav-link dropdown-toggle btn btn-link" data-bs-toggle="dropdown">Shop</button>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/shop/protein">Protein</Link></li>
                  <li><Link className="dropdown-item" to="/shop/creatine">Creatine</Link></li>
                  <li><Link className="dropdown-item" to="/shop/vitamin">Vitamins</Link></li>
                  <li><Link className="dropdown-item" to="/shop/fatburner">Fat Burners</Link></li>
                </ul>
              </li>
            </ul>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-dark btn-sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? "Light" : "Dark"}</button>
              <button className="btn btn-outline-dark btn-sm" onClick={logout}>Logout</button>
            </div>
          </div>
        </div>
      </nav>
      <motion.main className="container-fluid px-3 px-lg-4 py-4" layout>{children}</motion.main>
    </div>
  );
}

export default AppLayout;

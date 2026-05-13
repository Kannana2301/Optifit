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
            <div className="op-nav-btns">
              <button className="op-theme-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title={theme === "dark" ? "Switch to light" : "Switch to dark"}>
                {theme === "dark" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                )}
              </button>
              <button className="op-logout-btn" onClick={logout}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <motion.main
        className="container-fluid px-3 px-lg-4 py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {children}
      </motion.main>
    </div>
  );
}

export default AppLayout;

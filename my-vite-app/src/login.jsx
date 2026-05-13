import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import api from './api/client';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [loginStatus, setLoginStatus] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        const response = await api.post('/login', {
          email: formData.email,
          password: formData.password
        });

        // Save token to local storage
        localStorage.setItem('userToken', response.data.token);
        
        setLoginStatus('success');
        
        // Redirect to dashboard or home page after successful login
        navigate('/');
      } catch (error) {
        setLoginStatus('error');
      }
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-body p-5">
                <div className="text-center mb-4 flex flex-column align-items-center">
                  <img 
                    src="/src/assets/images/01-logo-dark.svg" 
                    alt="My Diet Meal Plan Logo" 
                    className="mb-3"
                    style={{ height: "50px" }}
                  />
                  <p className="text-5xl fw-bold text-success">Optifit</p>
                  <h2 className="fw-bold text-success">Welcome Back</h2>
                  <p className="text-secondary">Login to your account</p>
                </div>
                
                {loginStatus === 'error' && (
                  <div className="alert alert-danger">
                    Login failed. Please check your credentials.
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input 
                      type="password" 
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>
                  
                  <div className="d-flex justify-content-between mb-3">
                    <div className="form-check">
                      <input 
                        type="checkbox" 
                        className="form-check-input" 
                        id="rememberMe"
                      />
                      <label className="form-check-label" htmlFor="rememberMe">
                        Remember me
                      </label>
                    </div>
                    <a href="/forgot-password" className="text-success">Forgot Password?</a>
                  </div>
                  
                  <div className="d-grid">
                    <button 
                      type="submit" 
                      className="btn btn-success btn-lg rounded-pill shadow-sm"
                    >
                      Login
                    </button>
                  </div>
                  
                  <div className="text-center mt-3">
                    <p className="small text-secondary">
                      Don't have an account? <a href="/signup" className="text-success">Sign Up</a>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

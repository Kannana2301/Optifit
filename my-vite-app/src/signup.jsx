import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import api from './api/client';
import logoSvg from "./assets/images/01-logo-dark.svg";

function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    phone: '',
    height: '',
    weight: ''
  });

  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);

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
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.height || isNaN(parseFloat(formData.height)) || parseFloat(formData.height) <= 0) newErrors.height = 'Height is required';
    if (!formData.weight || isNaN(parseFloat(formData.weight)) || parseFloat(formData.weight) <= 0) newErrors.weight = 'Weight is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        const response = await api.post('/signup', {
          email: formData.email,
          name: formData.name,
          password: formData.password,
          phone: formData.phone,
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight)
        });

        setSubmitStatus('success');
        // Optional: Redirect to login or dashboard
      } catch (error) {
        const message = error.response?.data?.error || error.message || 'Signup failed. Please try again.';
        setErrors({ form: message });
        setSubmitStatus('error');
      }
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center"
      style={{
        background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80') center/cover fixed`,
      }}
    >
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="card border-0 shadow-sm rounded-3" style={{ backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.92)" }}>
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <img src={logoSvg} alt="OptiFit Logo" style={{ height: "50px" }} className="mb-3" />
                  <h2 className="fw-bold text-success mt-3">Create Your Account</h2>
                </div>
                
                {submitStatus === 'success' && (
                  <div className="alert alert-success">
                    Account created successfully!
                  </div>
                )}
                
                {submitStatus === 'error' && errors.form && (
                  <div className="alert alert-danger">
                    {errors.form}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>
                  
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
                      placeholder="Create a strong password"
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="height" className="form-label">Height (cm)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        className={`form-control ${errors.height ? 'is-invalid' : ''}`}
                        id="height"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        placeholder="Your height"
                      />
                      {errors.height && <div className="invalid-feedback">{errors.height}</div>}
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="weight" className="form-label">Weight (kg)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        className={`form-control ${errors.weight ? 'is-invalid' : ''}`}
                        id="weight"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        placeholder="Your weight"
                      />
                      {errors.weight && <div className="invalid-feedback">{errors.weight}</div>}
                    </div>
                  </div>
                  
                  <div className="d-grid">
                    <button 
                      type="submit" 
                      className="btn btn-success btn-lg rounded-pill shadow-sm"
                    >
                      Create Account
                    </button>
                  </div>
                  
                  <div className="text-center mt-3">
                    <p className="small text-secondary">
                      Already have an account? <a href="/login" className="text-success">Login</a>
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

export default Signup;

import { useState } from 'react'
import './App.css'
import api from './api/client';


function Calculate() {
  const [selectedAllergy, setSelectedAllergy] = useState('');
  const [selectedAge, setSelectedAge] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!selectedAllergy || !selectedAge || !selectedGoal) {
      setError("Please select all options before submitting");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const requestData = {
        allergy: selectedAllergy,
        age: selectedAge,
        goal: selectedGoal
      };
      
      const response = await api.post('/get-diet', requestData);
      setRecommendations(response.data);
    } catch (err) {
      setError(`Failed to fetch recommendations: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format the condition value for display
  const formatConditionValue = (value) => {
    if (!value) return '';
    
    // Replace underscores with spaces
    value = value.replace(/_/g, ' ');
    
    // Capitalize first letter of each word
    return value.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to format meal key for display
  const formatMealKey = (key) => {
    if (!key) return '';
    
    // Replace underscores with spaces
    key = key.replace(/_/g, ' ');
    
    // Capitalize first letter of each word
    return key.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Personalized Diet Recommendations</h1>
        <p>Select your dietary restrictions, age group, and fitness goals for customized meal suggestions</p>
      </header>
      
      <div className="form-container">
        <div className="dropdown">
          <label htmlFor="allergy">Allergies / Dietary Restrictions</label>
          <select 
            id="allergy" 
            value={selectedAllergy} 
            onChange={(e) => setSelectedAllergy(e.target.value)}
          >
            <option value="">Select an allergy/restriction</option>
            <option value="lactose_intolerant">Lactose Intolerant</option>
            <option value="milk_allergy">Milk Allergy</option>
            <option value="high_cholesterol">High Cholesterol</option>
          </select>
        </div>

        <div className="dropdown">
          <label htmlFor="age">Age Group</label>
          <select 
            id="age" 
            value={selectedAge} 
            onChange={(e) => setSelectedAge(e.target.value)}
          >
            <option value="">Select your age group</option>
            <option value="15-20">15-20 years</option>
            <option value="21-30">21-30 years</option>
            <option value="31-40">31-40 years</option>
            <option value="41-50">41-50 years</option>
            <option value="50+">50+ years</option>
          </select>
        </div>

        <div className="dropdown">
          <label htmlFor="goal">Fitness Goal</label>
          <select 
            id="goal" 
            value={selectedGoal} 
            onChange={(e) => setSelectedGoal(e.target.value)}
          >
            <option value="">Select your fitness goal</option>
            <option value="lean_gain">Lean Gain</option>
            <option value="bulk_gain">Bulk Gain</option>
          </select>
        </div>

        {error && <div className="error">{error}</div>}

        <button 
          className={`submit-btn ${isLoading ? 'loading' : ''}`} 
          onClick={handleSubmit} 
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Get Recommendations'}
        </button>
      </div>

      {recommendations && recommendations.length > 0 && (
        <div className="recommendations">
          <h2>Your Personalized Diet Recommendations</h2>
          
          {recommendations.map((item, index) => (
            <div className="recommendation-section" key={index}>
              <h3>For {formatConditionValue(item.condition_value)}:</h3>
              <ul>
                {Object.entries(item).map(([key, value]) => {
                  // Skip the condition_value property
                  if (key === 'condition_value') return null;
                  
                  return (
                    <li key={key}>
                      <strong>{formatMealKey(key)}:</strong> {value}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    
    </div>
  )
}

export default Calculate

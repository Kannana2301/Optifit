function calculateBmi(weightKg, heightCm) {
  if (!weightKg || !heightCm) return 0;
  return Number((weightKg / Math.pow(heightCm / 100, 2)).toFixed(1));
}

function calculateCalories(user) {
  const weight = Number(user.weight || 70);
  const height = Number(user.height || 170);
  const age = Number(user.age || 28);
  const activity = Number(user.activity_level || 1.55);
  const genderOffset = user.gender === "female" ? -161 : 5;
  const bmr = 10 * weight + 6.25 * height - 5 * age + genderOffset;
  const maintenance = Math.round(bmr * activity);
  const goalAdjustment = user.goal === "lose_weight" ? -450 : user.goal === "gain_muscle" ? 300 : 0;
  return Math.max(1200, maintenance + goalAdjustment);
}

function macrosFromCalories(calories, goal) {
  const proteinRatio = goal === "gain_muscle" ? 0.32 : 0.28;
  const fatRatio = 0.25;
  const carbsRatio = 1 - proteinRatio - fatRatio;
  return {
    protein: Math.round((calories * proteinRatio) / 4),
    carbs: Math.round((calories * carbsRatio) / 4),
    fat: Math.round((calories * fatRatio) / 9)
  };
}

module.exports = { calculateBmi, calculateCalories, macrosFromCalories };

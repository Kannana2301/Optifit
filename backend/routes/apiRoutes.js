const express = require("express");
const dashboard = require("../controllers/dashboardController");
const workouts = require("../controllers/workoutController");
const progress = require("../controllers/progressController");
const meals = require("../controllers/mealController");
const profile = require("../controllers/profileController");
const notifications = require("../controllers/notificationController");
const ai = require("../controllers/aiController");
const { upload } = require("../middleware/upload");

const router = express.Router();

router.get("/dashboard", dashboard.getDashboard);
router.put("/dashboard/water", dashboard.upsertWater);

router.get("/exercises", workouts.listExercises);
router.get("/exercises/:id", workouts.getExercise);
router.post("/exercises", workouts.createExercise);
router.put("/exercises/:id", workouts.updateExercise);
router.delete("/exercises/:id", workouts.deleteExercise);
router.post("/exercises/:id/image", upload.single("image"), workouts.uploadExerciseImage);

router.get("/workouts", workouts.listWorkouts);
router.get("/workouts/history", workouts.workoutHistory);
router.get("/workouts/:id", workouts.getWorkout);
router.post("/workouts", workouts.createWorkout);
router.put("/workouts/:id", workouts.updateWorkout);
router.delete("/workouts/:id", workouts.deleteWorkout);
router.post("/workouts/custom", workouts.createCustomWorkout);
router.post("/workouts/complete", workouts.completeWorkout);

router.get("/progress", progress.listProgress);
router.post("/progress", progress.addProgress);
router.put("/progress/:id", progress.updateProgress);
router.delete("/progress/:id", progress.deleteProgress);
router.get("/progress/analytics", progress.progressAnalytics);
router.post("/progress/image", upload.single("image"), progress.uploadProgressImage);

router.get("/meals", meals.listMeals);
router.get("/meals/:id", meals.getMeal);
router.post("/meals", meals.createMeal);
router.put("/meals/:id", meals.updateMeal);
router.delete("/meals/:id", meals.deleteMeal);
router.get("/meal-planner/recommendations", meals.recommendations);
router.get("/meal-planner/schedule", meals.listScheduledMeals);
router.post("/meal-planner/schedule", meals.scheduleMeal);
router.delete("/meal-planner/schedule/:id", meals.deleteScheduledMeal);

router.get("/profile", profile.getProfile);
router.put("/profile", profile.updateProfile);
router.put("/profile/password", profile.changePassword);
router.post("/profile/avatar", upload.single("image"), profile.uploadProfilePicture);
router.get("/notifications", notifications.listNotifications);
router.post("/notifications", notifications.createNotification);
router.patch("/notifications/:id/read", notifications.markRead);

router.post("/ai-coach", ai.aiCoach);
router.get("/ai-coach/history", ai.chatHistory);
router.post("/generate-workout", ai.generateWorkout);
router.post("/generate-meal-plan", ai.generateMealPlan);
router.get("/ai-progress-insights", ai.progressInsights);

module.exports = router;

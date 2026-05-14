require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, DietPlan } = require("./models");
const { connectDatabase } = require("./config/db");
const { initializeSchema } = require("./database/schema");
const { authenticate, SECRET_KEY } = require("./middleware/auth");
const apiRoutes = require("./routes/apiRoutes");
const { startReminderScheduler } = require("./services/reminderScheduler");

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

app.post("/get-diet", asyncHandler(async (req, res) => {
  const { allergy, age, goal } = req.body;
  const conditions = [];

  if (allergy) {
    conditions.push({ category: "allergy", condition_value: allergy });
  }
  if (age) {
    conditions.push({ category: "age", condition_value: age });
  }
  if (goal) {
    conditions.push({ category: "goal", condition_value: goal });
  }

  if (conditions.length === 0) {
    return res.status(400).json({ error: "Provide at least one filter (allergy, age, or goal)." });
  }

  const results = await DietPlan.find({ $or: conditions }).lean();
  if (!results.length) {
    return res.status(404).json({ message: "No matching diet plan found." });
  }

  const formattedResults = results.map((result) => ({
    condition_value: result.condition_value,
    meal_1: result.plan["Meal 1"],
    meal_3: result.plan["Meal 3"],
    post_workout: result.plan["Post-Workout"]
  }));

  res.json(formattedResults);
}));

app.post("/signup", asyncHandler(async (req, res) => {
  const { email, name, password, phone, height, weight } = req.body;

  if (!email || !name || !password || !phone || !height || !weight) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    return res.status(400).json({ error: "Email already registered." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    email: email.toLowerCase().trim(),
    name: name.trim(),
    password: hashedPassword,
    phone: phone.trim(),
    height: Number(height),
    weight: Number(weight)
  });

  res.status(201).json({ message: "User registered successfully!" });
}));

app.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = jwt.sign({ userId: user._id, email: user.email }, SECRET_KEY, { expiresIn: "8h" });
  res.json({ message: "Login successful!", token, user: { id: user._id, name: user.name, email: user.email } });
}));

app.use("/api", authenticate, apiRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: "Server error",
    details: process.env.NODE_ENV === "production" ? undefined : err.message
  });
});

async function start() {
  await connectDatabase();
  await initializeSchema();
  startReminderScheduler();
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error("Unable to start server:", error);
  process.exit(1);
});

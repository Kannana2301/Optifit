const express = require("express");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { db, ensureDatabase } = require("./config/db");
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
  const values = [];
  let query = "SELECT condition_value, plan FROM diet_plans WHERE";

  if (allergy) {
    conditions.push("(category = 'allergy' AND condition_value = ?)");
    values.push(allergy);
  }
  if (age) {
    conditions.push("(category = 'age' AND condition_value = ?)");
    values.push(age);
  }
  if (goal) {
    conditions.push("(category = 'goal' AND condition_value = ?)");
    values.push(goal);
  }

  if (conditions.length === 0) {
    return res.status(400).json({ error: "Provide at least one filter (allergy, age, or goal)." });
  }

  const [results] = await db.query(`${query} ${conditions.join(" OR ")}`, values);
  if (results.length === 0) {
    return res.status(404).json({ message: "No matching diet plan found." });
  }

  const formattedResults = results.map((result) => {
    let plan = result.plan;
    if (typeof plan === "string") plan = JSON.parse(plan);
    return {
      condition_value: result.condition_value,
      meal_1: plan["Meal 1"],
      meal_3: plan["Meal 3"],
      post_workout: plan["Post-Workout"]
    };
  });

  res.json(formattedResults);
}));

app.post("/signup", asyncHandler(async (req, res) => {
  const { email, name, password, phone, height, weight } = req.body;

  if (!email || !name || !password || !phone || !height || !weight) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const [existingUser] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
  if (existingUser.length > 0) {
    return res.status(400).json({ error: "Email already registered." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.query(
    "INSERT INTO users (email, name, password, phone, height, weight) VALUES (?, ?, ?, ?, ?, ?)",
    [email, name, hashedPassword, phone, height, weight]
  );

  res.status(201).json({ message: "User registered successfully!" });
}));

app.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  if (users.length === 0) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const user = users[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, { expiresIn: "8h" });
  res.json({ message: "Login successful!", token, user: { id: user.id, name: user.name, email: user.email } });
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
  await ensureDatabase();
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

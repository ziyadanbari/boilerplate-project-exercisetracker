const express = require("express");
const app = express();
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const bodyParser = require("body-parser");
const { user, exercise } = require("./models/user.js");

require("dotenv").config();
mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
app.post("/api/users", async (req, res) => {
  const { username } = req.body || {};
  if (!username) return res.json({ error: "Username required" });
  const newUser = await user.create({
    username,
  });
  return res.json({ _id: newUser._id, username });
});
app.get("/api/users", async (req, res) => {
  const users = await user.find({}).select("_id username");
  res.json(users);
});
app.post("/api/users/:_id/exercises", async (req, res) => {
  const { _id, description, duration, date } = { ...req.body, ...req.params };
  if (!_id || !description || !duration)
    return res.json({ error: "Fields missed" });
  const fetchedUser = await user.findById(_id);
  if (!fetchedUser) return res.json({ error: "user not found" });
  const newExercise = await exercise.create({
    user: new mongoose.Types.ObjectId(_id),
    description,
    date: new Date(date || Date.now()),
    duration: parseInt(duration),
  });
  return res.json({
    username: fetchedUser.username,
    _id: fetchedUser._id,
    duration: parseInt(duration),
    date: new Date(date || Date.now()).toDateString(),
    description,
  });
});

app.get("/api/users/:_id/logs", async (req, res) => {
  try {
    const { _id } = req.params;
    const from = req.query.from || new Date(0);
    const to = req.query.to || new Date(Date.now());
    const limit = Number(req.query.limit) || 0;
    const fetchedUser = await user.findById(_id);
    const userExercises = await exercise
      .find({
        user: _id,
        date: { $gte: from, $lte: to },
      })
      .populate("user")
      .limit(limit);
    if (!userExercises) return res.json({ error: "user not found" });
    const log = userExercises.map((exercise) => {
      const { duration, date, description } = exercise;
      return { duration, date: new Date(date).toDateString(), description };
    });
    return res.status(200).json({
      count: userExercises.length,
      _id,
      username: fetchedUser.username,
      log,
    });
  } catch (err) {
    console.log(err);
  }
});

const listener = app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
  console.log("Your app is listening on port " + listener.address().port);
});

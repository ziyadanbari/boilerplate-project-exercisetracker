const { Schema, models, model } = require("mongoose");

const exerciseSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  exercises: [
    new Schema({
      description: {
        type: String,
        required: true,
      },
      duration: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        required: false,
        default: Date.now,
      },
    }),
  ],
});

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
});
const user = model("users", userSchema);
const exercise = model("exercise", exerciseSchema);
module.exports = { user, exercise };

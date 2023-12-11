const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  session_token: { type: String, required: false },
  weight: { type: mongoose.SchemaTypes.Number, required: false },
  height: { type: mongoose.SchemaTypes.Number, required: false },
  imc: { type: mongoose.SchemaTypes.Number, required: false },
});

const User = mongoose.model("User", userSchema);

module.exports = User;

const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  user: { type: mongoose.SchemaTypes.ObjectId, ref: "User", required: true },
  date: { type: mongoose.SchemaTypes.Date, required: true },
  uuid: { type: mongoose.SchemaTypes.String, required: true },
  summary: { type: mongoose.SchemaTypes.String, required: false },
  messages: { type: mongoose.SchemaTypes.Array, required: false },
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;

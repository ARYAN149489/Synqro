const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ group: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;

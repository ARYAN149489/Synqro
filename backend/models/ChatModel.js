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
      
    },
  },
  {
    timestamps: true,
  }
);

// 1. Compound Index (Highest priority for this app)
messageSchema.index({ group: 1, createdAt: 1 });

// 2. Single Field Index
messageSchema.index({ sender: 1 });

// 3. Text Index (For future add on's functionality)
messageSchema.index({ content: 'text' });

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;

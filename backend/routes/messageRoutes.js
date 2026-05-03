const express = require('express');
const mongoose = require('mongoose');
const Message = require('../models/ChatModel');
const { protect } = require('../middleware/authMiddleware');

const messageRouter = express.Router();

// send message
messageRouter.post('/', protect, async (req, resp) => {
    try {
        const { content, groupId } = req.body;
        const message = await Message.create({
            sender: req.user._id,
            content,
            group: groupId,
        })
        const populatedMessage = await Message.findById(message._id).populate("sender", "username email");
        resp.json(populatedMessage);
    } catch (error) {
        resp.status(400).json({ message: error.Message });
    }
})

// search messages in a group using text index
messageRouter.get('/:groupId/search', protect, async (req, resp) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length === 0) {
            return resp.status(400).json({ message: "Search query is required" });
        }
        const messages = await Message.find(
            { group: req.params.groupId, $text: { $search: q } },
            { score: { $meta: "textScore" } }
        )
            .sort({ score: { $meta: "textScore" } })
            .populate("sender", "username email");
        resp.json(messages);
    } catch (error) {
        resp.status(400).json({ message: error.message });
    }
})

// Group chat analytics using aggregation pipelines
// Uses: $match, $group, $lookup, $unwind, $project, $sort, $limit, $addToSet, $dateToString
messageRouter.get('/:groupId/stats', protect, async (req, resp) => {
    try {
        const groupId = new mongoose.Types.ObjectId(req.params.groupId);

        // Pipeline 1: Top senders in the group
        const topSenders = await Message.aggregate([
            { $match: { group: groupId } },
            {
                $group: {
                    _id: "$sender",
                    messageCount: { $sum: 1 },
                    lastActive: { $max: "$createdAt" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    _id: 1,
                    username: "$user.username",
                    messageCount: 1,
                    lastActive: 1
                }
            },
            { $sort: { messageCount: -1 } },
            { $limit: 5 }
        ]);

        // Pipeline 2: Overall group stats
        const overall = await Message.aggregate([
            { $match: { group: groupId } },
            {
                $group: {
                    _id: null,
                    totalMessages: { $sum: 1 },
                    firstMessage: { $min: "$createdAt" },
                    lastMessage: { $max: "$createdAt" },
                    uniqueSenders: { $addToSet: "$sender" }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalMessages: 1,
                    firstMessage: 1,
                    lastMessage: 1,
                    activeMemberCount: { $size: "$uniqueSenders" }
                }
            }
        ]);

        // Pipeline 3: Daily message activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyActivity = await Message.aggregate([
            { $match: { group: groupId, createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    count: 1
                }
            }
        ]);

        resp.json({
            overall: overall[0] || { totalMessages: 0, activeMemberCount: 0, firstMessage: null, lastMessage: null },
            topSenders,
            dailyActivity
        });
    } catch (error) {
        resp.status(400).json({ message: error.message });
    }
})

// get messages for a group
messageRouter.get('/:groupId', protect, async (req, resp) => {
    try {
        const messages = await Message.find({ group: req.params.groupId })
            .populate("sender", "username email")
            .sort({ createdAt: 1 }); // Sort ascending (oldest first)
        resp.json(messages);
    } catch (error) {
        resp.status(400).json({ message: error.Message });
    }
})
module.exports = messageRouter;
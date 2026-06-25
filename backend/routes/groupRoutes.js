const express = require('express');
const Group = require('../models/GroupModel');
const Message = require('../models/ChatModel');
const { protect, isAdmin } = require('../middleware/authMiddleware');

const groupRouter = express.Router();

// Create a new group
groupRouter.post('/', protect, isAdmin, async (req, resp) => {
    try {
        const { name, description } = req.body;

        const groupExists = await Group.findOne({ name });
        if (groupExists) {
            return resp.status(400).json({ message: "Group with this name already exists" });
        }

        const group = await Group.create({
            name,
            description,
            admin: req.user._id,
            members: [req.user._id],
        })
        const populatedGroup = await Group.findById(group._id)
            .populate("admin", "username email")
            .populate("members", "username email");
        return resp.status(201).json({ populatedGroup });
    } catch (error) {
        console.log(error);
        return resp.status(400).json({ message: error.message });
    }
})

// get all groups
groupRouter.get('/', protect, async (req, resp) => {
    try {
        const groups = await Group.find()
            .populate("admin", "username email")
            .populate("members", "username email");
        resp.json(groups);
    } catch (error) {
        resp.status(400).json({ message: error.message })
    }
})

// search groups using text index
groupRouter.get('/search', protect, async (req, resp) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length === 0) {
            return resp.status(400).json({ message: "Search query is required" });
        }
        const groups = await Group.find(
            { $text: { $search: q } },
            { score: { $meta: "textScore" } }
        )
            .sort({ score: { $meta: "textScore" } })
            .populate("admin", "username email")
            .populate("members", "username email");
        resp.json(groups);
    } catch (error) {
        resp.status(400).json({ message: error.message });
    }
})

// Group stats using aggregation pipeline
// Optimized Stages: Group.aggregate → $lookup (sub-pipeline group) → $unwind (preserve nulls) → $project → $sort
groupRouter.get('/stats', protect, async (req, resp) => {
    try {
        const stats = await Group.aggregate([
            // Stage 1: Lookup with sub-pipeline on messages (pre-aggregates messages to prevent 16MB doc limit)
            {
                $lookup: {
                    from: "messages",
                    let: { groupId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$group", "$$groupId"] } } },
                        {
                            $group: {
                                _id: null,
                                totalMessages: { $sum: 1 },
                                lastActivity: { $max: "$createdAt" },
                                uniqueSenders: { $addToSet: "$sender" }
                            }
                        }
                    ],
                    as: "msgStats"
                }
            },
            // Stage 2: Flatten the msgStats array (which has 0 or 1 elements)
            // Preserve groups that have no messages (msgStats will be null/missing)
            {
                $unwind: {
                    path: "$msgStats",
                    preserveNullAndEmptyArrays: true
                }
            },
            // Stage 3: Shape the output and handle null defaults for empty groups
            {
                $project: {
                    _id: 1,
                    groupName: "$name",
                    totalMessages: { $ifNull: ["$msgStats.totalMessages", 0] },
                    lastActivity: { $ifNull: ["$msgStats.lastActivity", null] },
                    memberCount: { $size: "$members" },
                    activeSenderCount: {
                        $cond: [
                            { $isArray: "$msgStats.uniqueSenders" },
                            { $size: "$msgStats.uniqueSenders" },
                            0
                        ]
                    }
                }
            },
            // Stage 4: Sort by most active group first
            { $sort: { totalMessages: -1 } }
        ]);
        resp.json(stats);
    } catch (error) {
        resp.status(400).json({ message: error.message });
    }
})


// Join group
groupRouter.post('/:groupId/join', protect, async (req, resp) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return resp.status(404).json({ message: "Group not found" });
        }
        if(group.members.includes(req.user._id)){
            return resp.status(400).json({message: "Already a member of group"});
        }
        group.members.push(req.user._id);
        await group.save();
        resp.json({message: "Successfullt joined the group"});
    } catch (error) {
        resp.status(400).json({message: error.message});
    }
})

// leave group
groupRouter.post('/:groupId/leave', protect, async(req, resp)=>{
    try {
        const group = await Group.findById(req.params.groupId);
        if(!group){
            return resp.status(404).json({message: 'Group not found'});
        }
        if(!group.members.includes(req.user._id)){
            return resp.status(400).json({message: "Not a member of group"});
        }
        
        group.members = group.members.filter(memberId => memberId.toString() !== req.user._id.toString());
        await group.save();
        return resp.json({message: "Successfully left the group"});
    } catch (error) {
        return resp.status(400).json({message: error.message});
    }
})

// Delete group (admin only)
groupRouter.delete('/:groupId', protect, isAdmin, async (req, resp) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return resp.status(404).json({ message: 'Group not found' });
        }
        // Delete all messages in the group (cascade delete)
        await Message.deleteMany({ group: req.params.groupId });
        // Delete the group
        await Group.findByIdAndDelete(req.params.groupId);
        // Broadcast deletion to all connected users via Socket.IO
        const io = req.app.get('io');
        io.emit('group deleted', { groupId: req.params.groupId });
        return resp.json({ message: 'Group and all its messages deleted successfully' });
    } catch (error) {
        return resp.status(400).json({ message: error.message });
    }
})
module.exports = groupRouter;
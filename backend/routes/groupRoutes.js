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
// Stages: $group → $lookup → $unwind → $project → $sort
groupRouter.get('/stats', protect, async (req, resp) => {
    try {
        const stats = await Message.aggregate([
            // Stage 1: Group messages by group, count them, find last activity
            {
                $group: {
                    _id: "$group",
                    totalMessages: { $sum: 1 },
                    lastActivity: { $max: "$createdAt" },
                    uniqueSenders: { $addToSet: "$sender" }
                }
            },
            // Stage 2: Join with groups collection to get group details
            {
                $lookup: {
                    from: "groups",
                    localField: "_id",
                    foreignField: "_id",
                    as: "groupInfo"
                }
            },
            // Stage 3: Flatten the joined array
            { $unwind: "$groupInfo" },
            // Stage 4: Shape the output
            {
                $project: {
                    _id: 1,
                    groupName: "$groupInfo.name",
                    totalMessages: 1,
                    lastActivity: 1,
                    memberCount: { $size: "$groupInfo.members" },
                    activeSenderCount: { $size: "$uniqueSenders" }
                }
            },
            // Stage 5: Sort by most active group first
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
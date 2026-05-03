const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const groupSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
        trim:true,
        unique: true
    },
    description:{
        type:String,
        required: true
    },
    members:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{
    timestamps: true
});

// 1. Single Field Index
groupSchema.index({ name: 1 });

// 2. Multikey Index
groupSchema.index({ members: 1 });

// 3. Compound Index
groupSchema.index({ admin: 1, createdAt: -1 });

// 4. Text Index (for full-text search on group name and description)
groupSchema.index({ name: 'text', description: 'text' });

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;
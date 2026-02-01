const express = require('express');
const User = require("../models/UserModel");
const userRouter = express.Router();
const jwt = require('jsonwebtoken');

// register
userRouter.post('/register', async(req,resp)=>{
    try {
        const {username, email, password} = req.body;

        const userExists = await User.findOne({email});
        if(userExists){
            return resp.status(404).json({message: "User Already Exists"});
        }

        const user = await User.create({
            username,
            email,
            password
        });
        if(user){
            resp.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email
            });
        }
    } catch (error) {
        resp.status(404).json({ message:error.message });
    }
})

//login
userRouter.post('/login', async(req,resp)=>{
    try {
        const { email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            // console.log("Hello");
            return resp.status(401).json({ message:"invalid email" });
        }
        if(await user.matchPassword(password)){
            return resp.json({
                user:{
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    token: generateToken(user._id),
                }
            })
        } else{
            return resp.status(401).json({ message:"Invalid password" });
        }
    } catch (error) {
        return resp.status(404).json({ message:error.message });
    }
})

// generate token
const generateToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{ expiresIn: "1d" });
}

module.exports = userRouter;
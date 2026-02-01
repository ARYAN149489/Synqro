const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const protect = async (req, resp, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            return next();
        } catch (error) {
            console.log(error);
            return resp.status(401).json({ message: 'Not Authorized, token failed' });
        }
    }
    if (!token) {
        return resp.status(401).json({ message: 'Not Authorized, no token' });
    }
}

const isAdmin = async (req, resp, next) => {
    try {
        if (req.user && req.user.isAdmin) {
            return next();
        } else {
            return resp.status(403).json({ message: 'Not authorized Admin Only' });
        }
    } catch (error) {
        return resp.status(401).json({ message: 'Not authorized' });
    }
}
module.exports = { protect, isAdmin };
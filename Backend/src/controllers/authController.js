import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

export const googleCallback = async (req, res) => {
    try {
        const user = req.user;
        const token = generateToken(user._id);

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Log action
        await AuditLog.create({
            user: user._id,
            action: 'LOGIN',
            module: 'AUTH',
            details: { method: 'GOOGLE' },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });

        // Redirect to frontend
        res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`);
    } catch (error) {
        res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
};

export const logout = async (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
    const user = await User.findById(req.user.id).select('-googleId');
    res.status(200).json({
        success: true,
        data: user,
    });
};

import express from 'express';
import passport from 'passport';
import { googleCallback, logout, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.redirect(`${process.env.CLIENT_URL}/login?error=${info?.message === 'Unauthorized' ? 'unauthorized' : 'auth_failed'}`);
        }
        req.user = user;
        googleCallback(req, res, next);
    })(req, res, next);
});

router.get('/logout', logout);
router.get('/me', protect, getMe);

export default router;

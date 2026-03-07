import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;
            let user = await User.findOne({ googleId: profile.id });

            // If user not found by googleId, check by email
            if (!user) {
                user = await User.findOne({ email: email });
                if (user) {
                    // Link googleId to existing user record
                    user.googleId = profile.id;
                    if (profile.photos && profile.photos[0]) {
                        user.picture = profile.photos[0].value;
                    }
                    await user.save();
                }
            }

            // If still no user and it's the super admin, create it
            if (!user && email === 'harshmanmode79@gmail.com') {
                user = await User.create({
                    googleId: profile.id,
                    email: email,
                    displayName: profile.displayName,
                    picture: profile.photos[0]?.value,
                    role: 'ADMIN'
                });

                // Create initial admin employee record (upsert for safety)
                await Employee.findOneAndUpdate(
                    { user: user._id },
                    {
                        employeeId: 'ADMIN-001',
                        firstName: profile.name.givenName || 'Admin',
                        lastName: profile.name.familyName || '',
                        status: 'ACTIVE'
                    },
                    { upsert: true }
                );
            }

            // If no user exists and it's not super admin, reject login
            if (!user) {
                return done(null, false, { message: 'Unauthorized' });
            }

            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export default passport;

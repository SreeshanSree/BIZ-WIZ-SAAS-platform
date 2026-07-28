const router = require('express').Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/google — Verify Google credential, create/login user, return JWT
router.post('/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ message: 'Google credential is required.' });

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, name, email, picture } = payload;

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ googleId, name, email, profilePicture: picture });
    } else {
      // Update picture if changed
      if (user.profilePicture !== picture) {
        user.profilePicture = picture;
        await user.save();
      }
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, picture: user.profilePicture },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(401).json({ message: 'Invalid Google token.' });
  }
});

// GET /api/auth/me — Return current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-__v');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/auth/test — Test Login (Bypass Google)
router.post('/test', async (req, res) => {
  try {
    const email = 'testuser@example.com';
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ 
        googleId: 'test-12345', 
        name: 'Test User', 
        email, 
        profilePicture: 'https://ui-avatars.com/api/?name=Test+User&background=3b82f6&color=fff' 
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, picture: user.profilePicture },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during test login.' });
  }
});

module.exports = router;

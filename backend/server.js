// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Event = require('./models/events');
const User = require('./models/user');
require('dotenv').config();
const multer = require('multer');
const path = require('path');

// Initialize Firebase Admin for token verification
const admin = require('firebase-admin');

// Initialize Firebase Admin with project ID
// For local development, this uses Application Default Credentials (ADC)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: 'playmi-auth-demo', // Your Firebase project ID
      // For local development, Firebase will use default credentials
      // or you can set GOOGLE_APPLICATION_CREDENTIALS env variable
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
    // For development, create a simpler token verification that accepts any valid Firebase token
    console.log('Using fallback authentication for development');
  }
}

const app = express();
const PORT = process.env.PORT || 4556;

// Middleware
app.use(cors());
app.use(express.json());

// ==================== AUTHENTICATION MIDDLEWARE ====================

// Verify Firebase token middleware
const verifyFirebaseToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No authorization token provided' });
        }
        
        const token = authHeader.split(' ')[1];
        
        try {
            // Try to verify the token with Firebase Admin
            const decodedToken = await admin.auth().verifyIdToken(token);
            
            // Add user info to request object
            req.user = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                emailVerified: decodedToken.email_verified
            };
            
            console.log('Token verified for user:', decodedToken.email);
            next();
            
        } catch (adminError) {
            console.error('Firebase Admin token verification failed:', adminError.message);
            
            // Fallback: Try to decode the token without verification (for development)
            console.log('Attempting fallback token decode for development...');
            
            try {
                // Simple JWT decode without verification (NOT for production!)
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                
                const decodedToken = JSON.parse(jsonPayload);
                
                // Check if token has required Firebase fields
                if (decodedToken.aud && decodedToken.aud === 'playmi-auth-demo' && decodedToken.uid && decodedToken.email) {
                    req.user = {
                        uid: decodedToken.uid,
                        email: decodedToken.email,
                        emailVerified: decodedToken.email_verified || false
                    };
                    
                    console.log('Token decoded with fallback method for user:', decodedToken.email);
                    console.log('Note: This is a development fallback. Configure Firebase Admin SDK properly for production!');
                    next();
                } else {
                    throw new Error('Invalid token format');
                }
                
            } catch (decodeError) {
                console.error('Token decode failed:', decodeError.message);
                res.status(401).json({ error: 'Invalid or expired token' });
            }
        }
        
    } catch (error) {
        console.error('Token verification middleware error:', error.message);
        res.status(401).json({ error: 'Token verification failed' });
    }
};

// Optional: Get user role from MongoDB and add to request
const attachUserRole = async (req, res, next) => {
    try {
        if (req.user && req.user.uid) {
            const user = await User.findOne({ firebaseUID: req.user.uid });
            if (user) {
                req.user.role = user.role;
                req.user.mongoUser = user;
                console.log('User role attached:', user.role);
            }
        }
        next();
    } catch (error) {
        console.error('Error attaching user role:', error);
        next(); // Continue even if role fetch fails
    }
};

// Require seller role middleware (with upgrade suggestion)
const requireSeller = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!req.user.role || req.user.role === 'user') {
        return res.status(403).json({ 
            error: 'Seller account required',
            code: 'UPGRADE_TO_SELLER_NEEDED',
            message: 'You need a seller account to create events. Would you like to become a seller?',
            action: {
                type: 'redirect',
                url: '/seller-signup',
                buttonText: 'Become a Seller'
            },
            userInfo: {
                email: req.user.email,
                uid: req.user.uid
            }
        });
    }
    
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
        return res.status(403).json({ 
            error: 'Insufficient permissions',
            message: 'Only sellers and admins can create events'
        });
    }
    
    console.log('Seller access granted for:', req.user.email);
    next();
};

// Require admin role middleware  
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ 
            error: 'Admin access required',
            message: 'This action requires administrator privileges'
        });
    }
    next();
};

// Debug print for MONGO_URI
console.log('MONGO_URI:', process.env.MONGO_URI);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Set up storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Sample Route
app.get('/', (req, res) => {
    res.send('API is running');
});

// Create an event (protected - requires seller account)
app.post('/events', verifyFirebaseToken, attachUserRole, requireSeller, async (req, res) => {
    try {
        console.log('Incoming POST /events request');
        const newEvent = new Event(req.body);
        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all events
app.get('/events', async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single event by ID
app.get('/events/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update event by ID (protected - requires seller account)
app.put('/events/:id', verifyFirebaseToken, attachUserRole, requireSeller, async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedEvent) return res.status(404).json({ error: 'Event not found' });
        res.json(updatedEvent);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete event by ID (protected - requires seller account)
app.delete('/events/:id', verifyFirebaseToken, attachUserRole, requireSeller, async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) return res.status(404).json({ error: 'Event not found' });
        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.patch('/events/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const updatedEvent = await Event.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedEvent) return res.status(404).send('Event not found');
        res.json(updatedEvent);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to update event');
    }
});

// Image upload endpoint
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return the URL to the uploaded file
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// ==================== AUTHENTICATION ROUTES ====================

// Create or update user (called after Firebase auth)
app.post('/auth/user', async (req, res) => {
    try {
        console.log('POST /auth/user request body:', req.body);
        const { 
            firebaseUID, 
            email, 
            displayName, 
            photoURL, 
            role = 'user',
            // Seller-specific fields
            companyName,
            website,
            businessAddress,
            contactNumber,
            paymentInstitution,
            paymentInfo
        } = req.body;
        
        if (!firebaseUID || !email) {
            return res.status(400).json({ error: 'Firebase UID and email are required' });
        }

        // Check if user already exists (by firebaseUID OR email)
        let user = await User.findOne({ $or: [{ firebaseUID }, { email }] });
        
        if (user) {
            // Update existing user
            user.firebaseUID = firebaseUID; // Update firebaseUID in case it changed
            user.email = email;
            user.displayName = displayName || user.displayName;
            user.profilePicture = photoURL || user.profilePicture;
            user.role = role; // Update the role!
            user.lastLogin = new Date();
            
            // Update seller fields if provided
            if (role === 'seller') {
                user.companyName = companyName || user.companyName;
                user.website = website || user.website;
                user.businessAddress = businessAddress || user.businessAddress;
                user.contactNumber = contactNumber || user.contactNumber;
                user.paymentInstitution = paymentInstitution || user.paymentInstitution;
                user.paymentInfo = paymentInfo || user.paymentInfo;
            }
            
            await user.save();
            console.log('Updated existing user:', user.email);
        } else {
            // Create new user
            const userData = {
                firebaseUID,
                email,
                displayName,
                profilePicture: photoURL,
                role,
                lastLogin: new Date()
            };

            // Add seller-specific fields if creating a seller
            if (role === 'seller') {
                userData.companyName = companyName;
                userData.website = website;
                userData.businessAddress = businessAddress;
                userData.contactNumber = contactNumber;
                userData.paymentInstitution = paymentInstitution;
                userData.paymentInfo = paymentInfo;
            }

            user = new User(userData);
            await user.save();
            console.log('Created new user:', user.email, 'with role:', role);
        }

        const responseUser = {
            id: user._id,
            firebaseUID: user.firebaseUID,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            profilePicture: user.profilePicture,
            isActive: user.isActive
        };

        // Include seller fields in response if user is a seller
        if (user.role === 'seller') {
            responseUser.companyName = user.companyName;
            responseUser.website = user.website;
            responseUser.businessAddress = user.businessAddress;
            responseUser.contactNumber = user.contactNumber;
            responseUser.paymentInstitution = user.paymentInstitution;
            responseUser.paymentInfo = user.paymentInfo;
        }

        res.status(201).json({
            message: 'User created/updated successfully',
            user: responseUser
        });
    } catch (error) {
        console.error('Error creating/updating user:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get user profile by Firebase UID
app.get('/auth/profile/:firebaseUID', async (req, res) => {
    try {
        const { firebaseUID } = req.params;
        
        const user = await User.findOne({ firebaseUID });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
            id: user._id,
            firebaseUID: user.firebaseUID,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            profilePicture: user.profilePicture,
            isActive: user.isActive,
            lastLogin: user.lastLogin
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: error.message });
    }
});

// Upgrade user to seller
app.put('/auth/upgrade-to-seller/:firebaseUID', async (req, res) => {
    try {
        const { firebaseUID } = req.params;
        const { 
            companyName,
            website,
            businessAddress,
            contactNumber,
            paymentInstitution,
            paymentInfo
        } = req.body;
        
        const user = await User.findOne({ firebaseUID });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if (user.role === 'seller' || user.role === 'admin') {
            return res.status(400).json({ error: 'User is already a seller or admin' });
        }
        
        // Update role and business information
        user.role = 'seller';
        user.companyName = companyName;
        user.website = website;
        user.businessAddress = businessAddress;
        user.contactNumber = contactNumber;
        user.paymentInstitution = paymentInstitution;
        user.paymentInfo = paymentInfo || 'Mock payment integration - for demo purposes';
        
        await user.save();
        
        console.log(`User ${user.email} upgraded to seller with business info`);
        
        res.json({ 
            message: 'Successfully upgraded to seller', 
            user: {
                id: user._id,
                firebaseUID: user.firebaseUID,
                email: user.email,
                displayName: user.displayName,
                role: user.role,
                profilePicture: user.profilePicture,
                isActive: user.isActive,
                companyName: user.companyName,
                website: user.website,
                businessAddress: user.businessAddress,
                contactNumber: user.contactNumber,
                paymentInstitution: user.paymentInstitution,
                paymentInfo: user.paymentInfo
            }
        });
    } catch (error) {
        console.error('Error upgrading to seller:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all users (admin only - we'll add proper auth later)
app.get('/auth/users', async (req, res) => {
    try {
        const users = await User.find({}, '-firebaseUID'); // Exclude sensitive firebaseUID
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

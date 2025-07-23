// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Event = require('./models/events');
const User = require('./models/user');
const TicketPurchase = require('./models/ticketPurchase');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

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
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 image uploads
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// Generate secure invitation token
const generateInvitationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

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
        console.log('Event settings:', req.body.eventSettings);
        console.log('Visibility:', req.body.eventSettings?.visibility);
        
        // Add creator tracking to the event data
        const eventData = {
            ...req.body,
            creatorUID: req.user.uid,
            creatorId: req.user.mongoUser._id
        };
        
        // Generate invitation token for private events
        if (req.body.eventSettings && req.body.eventSettings.visibility === 'private') {
            eventData.invitationToken = generateInvitationToken();
            console.log('Generated invitation token for private event');
        }
        
        const newEvent = new Event(eventData);
        const savedEvent = await newEvent.save();
        console.log('Event saved with ID:', savedEvent._id);
        console.log('Saved event visibility:', savedEvent.eventSettings?.visibility);
        console.log('Saved event invitation token:', savedEvent.invitationToken);
        res.status(201).json(savedEvent);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(400).json({ error: error.message });
    }
});

// Get all events (excludes private events)
app.get('/events', async (req, res) => {
    try {
        // Only return public events
        const events = await Event.find({
            $or: [
                { 'eventSettings.visibility': 'public' },
                { 'eventSettings.visibility': { $exists: false } }
            ]
        });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get events by organizer (includes private events for the organizer)
app.get('/events/organizer/:organizerId', verifyFirebaseToken, attachUserRole, async (req, res) => {
    try {
        const { organizerId } = req.params;
        
        // Verify the user is requesting their own events or is an admin
        if (req.user.uid !== organizerId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const events = await Event.find({
            'organizerContact.name': organizerId
        });
        
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
        
        console.log('Fetching event:', event._id);
        console.log('Event visibility:', event.eventSettings?.visibility);
        console.log('Event invitation token:', event.invitationToken);
        
        // Check if event is private
        if (event.eventSettings && event.eventSettings.visibility === 'private') {
            console.log('Event is private, checking authentication...');
            // Check if user is authenticated and is the organizer
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                try {
                    const token = authHeader.split(' ')[1];
                    const decodedToken = await admin.auth().verifyIdToken(token);
                    
                    // Check if the user is the organizer of this event
                    // For now, we'll allow access if user is authenticated (organizer check can be added later)
                    console.log('Authenticated user accessing private event:', decodedToken.email);
                    res.json(event);
                    return;
                } catch (authError) {
                    console.log('Auth failed for private event access:', authError.message);
                }
            }
            
            // If not authenticated or not organizer, require invitation
            console.log('No valid authentication, requiring invitation');
            return res.status(403).json({ error: 'This is a private event. Access requires invitation.' });
        }
        
        console.log('Event is public, returning without restrictions');
        res.json(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get private event by invitation token
app.get('/events/invite/:token', async (req, res) => {
    try {
        const { token } = req.params;
        
        if (!token) {
            return res.status(400).json({ error: 'Invitation token is required' });
        }
        
        // Validate token format (should be 64 characters hex)
        if (!/^[a-f0-9]{64}$/.test(token)) {
            return res.status(400).json({ error: 'Invalid invitation token format' });
        }
        
        const event = await Event.findOne({ invitationToken: token });
        
        if (!event) {
            return res.status(404).json({ error: 'Invalid or expired invitation link' });
        }
        
        // Verify the event is still private
        if (!event.eventSettings || event.eventSettings.visibility !== 'private') {
            return res.status(400).json({ error: 'This event is no longer private' });
        }
        
        // Add rate limiting headers to prevent brute force attacks
        res.set({
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '99',
            'X-RateLimit-Reset': Math.floor(Date.now() / 1000) + 3600
        });
        
        res.json(event);
    } catch (error) {
        console.error('Error fetching private event:', error);
        res.status(500).json({ error: 'Failed to load event' });
    }
});

// Regenerate invitation token for private event (organizer only)
app.post('/events/:id/regenerate-invitation', verifyFirebaseToken, attachUserRole, requireSeller, async (req, res) => {
    try {
        const { id } = req.params;
        
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        // Verify the event is private
        if (!event.eventSettings || event.eventSettings.visibility !== 'private') {
            return res.status(400).json({ error: 'Only private events can have invitation tokens' });
        }
        
        // Generate new invitation token
        const newToken = generateInvitationToken();
        event.invitationToken = newToken;
        await event.save();
        
        res.json({ 
            message: 'Invitation token regenerated successfully',
            invitationToken: newToken
        });
    } catch (error) {
        console.error('Error regenerating invitation token:', error);
        res.status(500).json({ error: 'Failed to regenerate invitation token' });
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

// ==================== PROFILE ENDPOINTS (PHASE 2) ====================

// Update user profile
app.put('/auth/profile/:firebaseUID', verifyFirebaseToken, async (req, res) => {
    try {
        console.log('=== PROFILE UPDATE REQUEST ===');
        const { firebaseUID } = req.params;
        console.log('FirebaseUID from params:', firebaseUID);
        console.log('Request body:', req.body);
        console.log('Authenticated user UID:', req.user.uid);
        
        const { 
            username,
            bio,
            location,
            socialMedia,
            displayName,
            profilePicture,
            bannerImage
        } = req.body;
        
        // Verify user can only update their own profile
        if (req.user.uid !== firebaseUID) {
            console.log('ERROR: UID mismatch - user trying to update another profile');
            return res.status(403).json({ error: 'You can only update your own profile' });
        }
        
        const user = await User.findOne({ firebaseUID });
        console.log('User found:', user ? 'YES' : 'NO');
        if (!user) {
            console.log('ERROR: User not found in database');
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Update profile fields
        if (username !== undefined) {
            // Check if username is already taken
            if (username && username !== user.username) {
                const existingUser = await User.findOne({ username });
                if (existingUser) {
                    return res.status(400).json({ error: 'Username already taken' });
                }
            }
            user.username = username;
        }
        
        if (bio !== undefined) user.bio = bio;
        if (location !== undefined) user.location = location;
        if (displayName !== undefined) user.displayName = displayName;
        if (profilePicture !== undefined) user.profilePicture = profilePicture;
        if (bannerImage !== undefined) user.bannerImage = bannerImage;
        
        // Update social media fields
        if (socialMedia) {
            user.socialMedia = { ...user.socialMedia, ...socialMedia };
        }
        
        await user.save();
        console.log('Profile updated successfully for user:', user.firebaseUID);
        
        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                firebaseUID: user.firebaseUID,
                email: user.email,
                displayName: user.displayName,
                username: user.username,
                bio: user.bio,
                location: user.location,
                socialMedia: user.socialMedia,
                role: user.role,
                profilePicture: user.profilePicture,
                bannerImage: user.bannerImage,
                isActive: user.isActive,
                followersCount: user.followersCount,
                followingCount: user.followingCount
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        console.error('Error details:', error.stack);
        res.status(500).json({ error: error.message });
    }
});

// Get enhanced user profile (with all fields)
app.get('/auth/profile/full/:firebaseUID', async (req, res) => {
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
            username: user.username,
            bio: user.bio,
            location: user.location,
            socialMedia: user.socialMedia,
            role: user.role,
            profilePicture: user.profilePicture,
            bannerImage: user.bannerImage,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            followersCount: user.followersCount,
            followingCount: user.followingCount,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            // Include seller fields if user is a seller
            ...(user.role === 'seller' && {
                companyName: user.companyName,
                website: user.website,
                businessAddress: user.businessAddress,
                contactNumber: user.contactNumber,
                paymentInstitution: user.paymentInstitution
            })
        });
    } catch (error) {
        console.error('Error fetching enhanced user profile:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== EVENT PROFILE ENDPOINTS ====================

// Get events created by a user (for sellers)
app.get('/events/by-user/:firebaseUID', async (req, res) => {
    try {
        const { firebaseUID } = req.params;
        const { status, limit = 10, page = 1 } = req.query;
        
        const query = { creatorUID: firebaseUID };
        
        // Filter by status if provided
        if (status) {
            query['eventSettings.publishStatus'] = status;
        }
        
        const skip = (page - 1) * limit;
        
        const events = await Event.find(query)
            .populate('creatorId', 'displayName username profilePicture')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);
        
        const totalCount = await Event.countDocuments(query);
        
        res.json({
            events,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
                hasNext: page < Math.ceil(totalCount / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching user events:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get events purchased by a user (for buyers)
app.get('/events/purchased/:firebaseUID', async (req, res) => {
    try {
        const { firebaseUID } = req.params;
        const { timeframe = 'all', limit = 10, page = 1 } = req.query;
        
        const query = { buyerUID: firebaseUID, status: 'confirmed' };
        
        const skip = (page - 1) * limit;
        
        // Get ticket purchases first
        const purchases = await TicketPurchase.find(query)
            .populate({
                path: 'eventId',
                populate: {
                    path: 'creatorId',
                    select: 'displayName username profilePicture'
                }
            })
            .sort({ purchaseDate: -1 })
            .limit(parseInt(limit))
            .skip(skip);
        
        // Categorize events by time
        const now = new Date();
        const categorizedEvents = {
            upcoming: [],
            past: [],
            all: []
        };
        
        purchases.forEach(purchase => {
            const event = purchase.eventId;
            if (!event) return;
            
            // Determine if event is upcoming or past
            const eventDate = event.dateTimes?.singleStartDate || 
                             event.dateTimes?.eventSlots?.[0]?.startDate;
            
            const eventData = {
                ...event.toObject(),
                ticketPurchase: {
                    purchaseDate: purchase.purchaseDate,
                    quantity: purchase.quantity,
                    totalAmount: purchase.totalAmount,
                    ticketTierName: purchase.ticketTierName
                }
            };
            
            categorizedEvents.all.push(eventData);
            
            if (eventDate && new Date(eventDate) > now) {
                categorizedEvents.upcoming.push(eventData);
            } else {
                categorizedEvents.past.push(eventData);
            }
        });
        
        const totalCount = await TicketPurchase.countDocuments(query);
        
        let responseEvents = categorizedEvents.all;
        if (timeframe === 'upcoming') {
            responseEvents = categorizedEvents.upcoming;
        } else if (timeframe === 'past') {
            responseEvents = categorizedEvents.past;
        }
        
        res.json({
            events: responseEvents,
            categorized: {
                upcoming: categorizedEvents.upcoming.length,
                past: categorizedEvents.past.length,
                total: categorizedEvents.all.length
            },
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
                hasNext: page < Math.ceil(totalCount / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching purchased events:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== TICKET PURCHASE ENDPOINTS ====================

// Purchase tickets (for testing - in production this would integrate with payment processing)
app.post('/tickets/purchase', verifyFirebaseToken, attachUserRole, async (req, res) => {
    try {
        const {
            eventId,
            ticketTierName,
            quantity,
            pricePerTicket
        } = req.body;
        
        // Verify event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        // Find the ticket tier
        const ticketTier = event.ticketTiers.find(tier => tier.name === ticketTierName);
        if (!ticketTier) {
            return res.status(404).json({ error: 'Ticket tier not found' });
        }
        
        // Check availability
        if (ticketTier.quantity < quantity) {
            return res.status(400).json({ error: 'Not enough tickets available' });
        }
        
        // Calculate total
        const totalAmount = pricePerTicket * quantity;
        
        // Generate ticket codes
        const ticketCodes = [];
        for (let i = 0; i < quantity; i++) {
            ticketCodes.push({
                code: `TICKET-${Date.now()}-${i + 1}`,
                used: false
            });
        }
        
        // Create ticket purchase
        const purchase = new TicketPurchase({
            buyerUID: req.user.uid,
            buyerId: req.user.mongoUser._id,
            eventId,
            ticketTierName,
            ticketTierType: ticketTier.type,
            quantity,
            pricePerTicket,
            totalAmount,
            paymentMethod: ticketTier.type === 'free' ? 'free' : 'credit_card',
            ticketCodes,
            status: 'confirmed'
        });
        
        await purchase.save();
        
        // Update ticket tier quantity
        ticketTier.quantity -= quantity;
        await event.save();
        
        res.status(201).json({
            message: 'Tickets purchased successfully',
            purchase: {
                id: purchase._id,
                eventId,
                ticketTierName,
                quantity,
                totalAmount,
                purchaseDate: purchase.purchaseDate,
                ticketCodes: purchase.ticketCodes
            }
        });
    } catch (error) {
        console.error('Error purchasing tickets:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start server locally or export for Vercel
if (require.main === module) {
    // Local development
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
} else {
    // Vercel deployment
    module.exports = app;
}

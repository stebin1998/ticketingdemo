// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Event = require('./models/events');
require('dotenv').config();
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4556;

// Middleware
app.use(cors());
app.use(express.json());

// Debug print for MONGO_URI
console.log('MONGO_URI:', process.env.MONGO_URI);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
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

// Create an event
app.post('/events', async (req, res) => {
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

// Update event by ID
app.put('/events/:id', async (req, res) => {
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

// Delete event by ID
app.delete('/events/:id', async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) return res.status(404).json({ error: 'Event not found' });
        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
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

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

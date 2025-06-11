require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected!');
    const Event = mongoose.model('Event', new mongoose.Schema({}, { strict: false }), 'events');
    const events = await Event.find();
    console.log('Events:', events);
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  }); 
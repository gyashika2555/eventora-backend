const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/event.js');
const  bookingRoutes = require('./routes/booking.js'); 

dotenv.config();

const app = express(); 
 app.use(cors());
 app.use(express.json());

 //Routes
 app.use('/api/auth' , authRoutes);
 app.use('/api/events' , eventRoutes);
 app.use('/api/bookings' , bookingRoutes);

 console.log(process.env.MONGO_URI);
 //connect to MongoDB
 mongoose.connect(process.env.MONGO_URI || "mongodb+srv://yashikagoyal:yashikagoyal@cluster0.3jnya9v.mongodb.net/eventorDEV")
 .then(() => {
    console.log('Connected to MongoDB');
 })
 .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
 })

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`);
});
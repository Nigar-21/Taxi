const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();


const app = express();
app.use(cors());
app.use(express.json());

// Routes (əlavə edəcəyik sonra)
app.get('/', (req, res) => {
  res.send('Taxi Backend is working!');
});

const PORT = process.env.PORT || 5000;
mongoose
.connect(process.env.MONGO_URI)

  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log(err));

  const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const rideRoutes = require('./routes/rideRoutes');
app.use('/api/rides', rideRoutes);


app.get('/', (req, res) => {
    res.send('Taxi Backend is working!');
  });
  

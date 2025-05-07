const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  model: {
    type: String,
    required: true,
  },
  licensePlate: {
    type: String,
    required: true,
    unique: true,
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);

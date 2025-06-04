const Ride = require('../models/ride');
const User = require('../models/user');
const Vehicle = require('../models/vehicle');

// Yeni ride yaratmaq
exports.createRide = async (req, res) => {
  const { passengerId, driverId, vehicleId, pickupLocation, dropoffLocation } = req.body;

  try {
    const passenger = await User.findById(passengerId);
    const driver = await User.findById(driverId);
    const vehicle = await Vehicle.findById(vehicleId);

    if (!passenger || !driver || !vehicle) {
      return res.status(404).json({ message: 'İstifadəçi və ya nəqliyyat vasitəsi tapılmadı' });
    }

    const newRide = new Ride({
      passenger: passengerId,
      driver: driverId,
      vehicle: vehicleId,
      pickupLocation,
      dropoffLocation,
    });

    await newRide.save();
    res.status(201).json({ message: 'Ride yaradıldı', ride: newRide });
  } catch (error) {
    res.status(500).json({ message: 'Server xətası', error: error.message });
  }
};

// Bütün ride-ları əldə etmək
exports.getAllRides = async (req, res) => {
  try {
   const rides = await Ride.find().populate('passenger driver vehicle', 'name phone model licensePlate');
    res.status(200).json(rides);
  } catch (error) {
    res.status(500).json({ message: 'Server xətası', error: error.message });
  }
};

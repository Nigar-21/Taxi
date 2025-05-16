import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

function Home() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [loading, setLoading] = useState(false);
  const [pickupPosition, setPickupPosition] = useState(null);
  const [dropoffPosition, setDropoffPosition] = useState(null);

  // GPS ilə mövcud mövqe
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const coords = [pos.coords.latitude, pos.coords.longitude];
      setPickupPosition(coords);

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`
        );
        const data = await res.json();
        setPickup(data.display_name);
      } catch (error) {
        console.error("Pickup ünvan tapılmadı:", error);
      }
    });
  }, []);

  // Dropoff üçün xəritəyə klik
  function MapClickHandler() {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        setDropoffPosition([lat, lng]);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          setDropoff(data.display_name);
        } catch (error) {
          console.error("Dropoff ünvan tapılmadı:", error);
        }
      },
    });
    return null;
  }

  const customIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [40, 40],
  });

  const handleBooking = async () => {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/rides", {
        pickupLocation: pickup,
        dropoffLocation: dropoff
      });
      console.log("Ride yaradıldı:", response.data);
      alert("Sifariş uğurla yaradıldı!");
    } catch (err) {
      console.error("Xəta baş verdi:", err.response?.data || err.message);
      alert("Sifariş zamanı xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh' }}>
      {pickupPosition ? (
        <MapContainer center={pickupPosition} zoom={13} style={{ height: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Pickup Marker */}
          <Marker position={pickupPosition} icon={customIcon}>
            <Popup>Your pickup location</Popup>
          </Marker>

          {/* Dropoff Marker */}
          {dropoffPosition && (
            <Marker position={dropoffPosition}>
              <Popup>Dropoff location</Popup>
            </Marker>
          )}

          <MapClickHandler />
        </MapContainer>
      ) : (
        <p>Loading map...</p>
      )}

      <div style={{ padding: '10px' }}>
        <input
          type="text"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
          placeholder="Pickup location"
        />
        <input
          type="text"
          value={dropoff}
          onChange={(e) => setDropoff(e.target.value)}
          placeholder="Dropoff location"
        />
        <button onClick={handleBooking} disabled={loading}>
          {loading ? "Booking..." : "Book Ride"}
        </button>
      </div>
    </div>
  );
}

export default Home;



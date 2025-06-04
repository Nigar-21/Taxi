import React, { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import GeocodingService from "@mapbox/mapbox-sdk/services/geocoding";
import MapboxClient from "@mapbox/mapbox-sdk";
import "mapbox-gl/dist/mapbox-gl.css";


mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const Home = () => {
  // Refs
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropoffMarkerRef = useRef(null);
  const geocodingClient = useRef(
    GeocodingService(MapboxClient({ accessToken: mapboxgl.accessToken }))
  );

  // State
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [pickupInput, setPickupInput] = useState("");
  const [dropoffInput, setDropoffInput] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [distance, setDistance] = useState(null);
  const [price, setPrice] = useState(null);

const [isOrderPanelOpen, setIsOrderPanelOpen] = useState(false);

const toggleOrderPanel = () => {
  setIsOrderPanelOpen(!isOrderPanelOpen);
};

  // Constants
  const BASE_FARE = 1;
  const PER_KM_RATE = 0.7;

  // Reverse geocode function
const reverseGeocode = useCallback(async (coords) => {
  // 1. Token və koordinat yoxlanışı
  if (!mapboxgl.accessToken) return "Xəritə xidməti işləmir";
  if (!coords?.lng || !coords?.lat) return "Geçərsiz yer";

  try {
    // 2. API sorğusu
    const res = await geocodingClient.current
      .reverseGeocode({
        query: [coords.lng, coords.lat],
        types: ["address", "street", "poi"],
        limit: 1
      })
      .send();

    // 3. Cavab yoxlanışı
    if (!res.body?.features?.length) {
      return `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
    }

    // 4. Ünvan formatlanması (Bakı, Azərbaycan hissəsini silmək)
    const address = res.body.features[0].place_name;
    const cleanAddress = address
      .replace(/, Bakı, Azerbaijan/gi, "")
      .replace(/, Azerbaijan/gi, "")
      .trim();

    return cleanAddress || "Küçə adı tapılmadı";

  } catch (err) {
    console.error("Ünvan tapma xətası:", err);
    return `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
  }
}, []);

  // Handle address search for suggestions
  const handleAddressSearch = useCallback(async (query, type) => {
    if (!query) return;
    try {
      const res = await geocodingClient.current
        .forwardGeocode({
          query,
          autocomplete: true,
          limit: 5,
        })
        .send();

      const suggestions = res.body.features;
      type === "pickup" 
        ? setPickupSuggestions(suggestions) 
        : setDropoffSuggestions(suggestions);
    } catch (err) {
      console.error("Ünvan axtarış xətası:", err);
    }
  }, []);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback(async (feature, type) => {
    const coords = {
      lng: feature.center[0],
      lat: feature.center[1],
    };
    
    if (type === "pickup") {
      setPickup(coords);
      setPickupInput(feature.place_name);
      setPickupSuggestions([]);
    } else {
      setDropoff(coords);
      setDropoffInput(feature.place_name);
      setDropoffSuggestions([]);
    }
  }, []);

  // Initialize map and get user location
  useEffect(() => {
    const initMap = async (coords) => {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [coords.lng, coords.lat],
        zoom: 14,
      });
      mapRef.current = map;

      // Set pickup location and input
      setPickup(coords);
      const address = await reverseGeocode(coords);
      setPickupInput(address);

      // Add pickup marker
      pickupMarkerRef.current = new mapboxgl.Marker({ color: "green" })
        .setLngLat([coords.lng, coords.lat])
        .setPopup(new mapboxgl.Popup().setText("Hal-hazırda olduğun yer"))
        .addTo(map);

      // Handle map clicks for dropoff
      map.on("click", async (e) => {
        const { lng, lat } = e.lngLat;
        const coords = { lng, lat };
        setDropoff(coords);
        
        // Set dropoff input to clicked location's address
        const address = await reverseGeocode(coords);
        setDropoffInput(address);
      });
    };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await initMap({
          lng: pos.coords.longitude,
          lat: pos.coords.latitude,
        });
      },
      (err) => {
        alert("GPS aktiv deyil və ya mövqe tapılmadı: " + err.message);
      }
    );

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, [reverseGeocode]);

  // Calculate route when pickup or dropoff changes
  useEffect(() => {
    if (!pickup || !dropoff || !mapRef.current) return;
    const map = mapRef.current;

    // Remove existing dropoff marker if exists
    if (dropoffMarkerRef.current) dropoffMarkerRef.current.remove();

    // Add new dropoff marker
    dropoffMarkerRef.current = new mapboxgl.Marker({ color: "red" })
      .setLngLat([dropoff.lng, dropoff.lat])
      .setPopup(new mapboxgl.Popup().setText("Təyin etdiyin nöqtə"))
      .addTo(map);

    // Fetch route and calculate distance/price
    const fetchRoute = async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?geometries=geojson&access_token=${mapboxgl.accessToken}`
        );
        const data = await response.json();
        
        const route = data.routes[0].geometry;
        const dist = (data.routes[0].distance / 1000).toFixed(2);
        setDistance(dist);
        setPrice((BASE_FARE + dist * PER_KM_RATE).toFixed(2));

        // Update or add route layer
        if (map.getSource("route")) {
          map.getSource("route").setData(route);
        } else {
          map.addSource("route", {
            type: "geojson",
            data: route,
          });
          map.addLayer({
            id: "route-line",
            type: "line",
            source: "route",
            paint: {
              "line-color": "#ff9900",
              "line-width": 5,
            },
          });
        }
      } catch (error) {
        console.error("Marşrut xətası:", error);
      }
    };

    fetchRoute();
  }, [pickup, dropoff]);

  // Debounced search for pickup input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pickupInput) handleAddressSearch(pickupInput, "pickup");
    }, 300);
    return () => clearTimeout(timer);
  }, [pickupInput, handleAddressSearch]);

  // Debounced search for dropoff input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (dropoffInput) handleAddressSearch(dropoffInput, "dropoff");
    }, 300);
    return () => clearTimeout(timer);
  }, [dropoffInput, handleAddressSearch]);

  // Render suggestions
  const renderSuggestions = (suggestions, type) => (
    suggestions.map((s, i) => (
      <div
        key={s.id || i}
        onClick={() => handleSuggestionSelect(s, type)}
        className="suggestion-item"
      >
        {s.place_name}
      </div>
    ))
  );

  return (
    <div className="map-container">
      <div ref={mapContainerRef} className="map" />

      {distance && (
        <div className="distance-box">
          <p><strong>Məsafə:</strong> {distance} km</p>
          <p><strong>Qiymət:</strong> {price} AZN</p>
        </div>
      )}

      <div className="controls-container">
        <div className="controls">
          <div className="input-group">
            <label>Başlanğıc nöqtə</label>
            <input
              type="text"
              value={pickupInput}
              onChange={(e) => setPickupInput(e.target.value)}
              placeholder="Başlanğıc ünvanı daxil edin"
              className="address-input"
            />
            {pickupInput && renderSuggestions(pickupSuggestions, "pickup")}
          </div>

          <div className="input-group">
            <label>Bitmə nöqtəsi</label>
            <input
              type="text"
              value={dropoffInput}
              onChange={(e) => setDropoffInput(e.target.value)}
              placeholder="Bitmə ünvanını daxil edin"
              className="address-input"
            />
            {dropoffInput && renderSuggestions(dropoffSuggestions, "dropoff")}
          </div>

          <button
            className="book-button"
            onClick={() => alert("Sifariş verildi!")}
          >
            Sifariş et
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
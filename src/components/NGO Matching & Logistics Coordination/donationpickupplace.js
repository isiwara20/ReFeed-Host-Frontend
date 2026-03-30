import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default function DonationMap({ donationId }) {
  const [donation, setDonation] = useState(null);

  useEffect(() => {
    async function fetchDonation() {
      try {
        const res = await fetch(`https://refeed-hosting-backend-production.up.railway.app/api/donations-picking/${donationId}`);
        const data = await res.json();
        setDonation(data);
      } catch (err) {
        console.error("Error fetching donation:", err);
      }
    }

    fetchDonation();
  }, [donationId]);

  // Default map center (Sri Lanka)
  const defaultCenter = [7.8731, 80.7718];

  // Use donation location if available
  const position =
    donation && donation.location && donation.location.lat && donation.location.lng
      ? [donation.location.lat, donation.location.lng]
      : defaultCenter;

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer center={position} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {donation && donation.location && (
          <Marker position={position}>
            <Popup>
              <strong>{donation.foodType}</strong> <br />
              Quantity: {donation.quantity.amount} {donation.quantity.unit} <br />
              Address: {donation.location.address}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

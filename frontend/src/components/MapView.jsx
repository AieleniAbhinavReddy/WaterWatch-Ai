import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

/*
 * Fix: Leaflet default marker icons are broken under Webpack / CRA because
 * the asset URLs are not resolved correctly. We manually point to the CDN.
 */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_CENTER = [20.5937, 78.9629]; // India centre
const DEFAULT_ZOOM = 5;

function MapView({ complaints = [] }) {
  const markers = complaints.filter((c) => c.latitude && c.longitude);

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((c) => (
          <Marker key={c.id} position={[c.latitude, c.longitude]}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold text-gray-800">{c.title}</p>
                {c.description && (
                  <p className="text-gray-600 mt-1">{c.description}</p>
                )}
                <span
                  className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    c.status === "Resolved"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {c.status}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {markers.length === 0 && (
        <p className="text-center text-xs text-gray-400 py-2">
          No geolocated complaints to display.
        </p>
      )}
    </div>
  );
}

export default MapView;

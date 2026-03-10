import L from "leaflet";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const riskColors = {
  LOW: "#1a9850",
  MEDIUM: "#fee08b",
  HIGH: "#d73027",
};

const contaminatedIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function RiskMap({ predictions, waterRows }) {
  const center = [20.5937, 78.9629];
  const contaminated = waterRows.filter((w) => w.ecoli_presence);

  return (
    <section className="card map-card">
      <h3>Outbreak Heatmap and Contaminated Sources</h3>
      <MapContainer center={center} zoom={5} scrollWheelZoom className="map-canvas">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {predictions.map((point) => (
          <CircleMarker
            key={point.id}
            center={[point.latitude, point.longitude]}
            pathOptions={{
              fillColor: riskColors[point.risk_level] || "#888",
              color: riskColors[point.risk_level] || "#888",
              fillOpacity: 0.45,
            }}
            radius={Math.max(6, Math.round(point.confidence * 18))}
          >
            <Popup>
              <strong>{point.risk_level}</strong>
              <br />
              Confidence: {(point.confidence * 100).toFixed(1)}%
              <br />
              {new Date(point.predicted_at).toLocaleString()}
            </Popup>
          </CircleMarker>
        ))}

        {contaminated.map((row) => (
          <Marker key={row.id} position={[row.latitude, row.longitude]} icon={contaminatedIcon}>
            <Popup>
              Contaminated source detected<br />
              pH: {row.ph.toFixed(2)} | Turbidity: {row.turbidity.toFixed(2)}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </section>
  );
}

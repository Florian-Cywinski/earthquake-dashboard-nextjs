import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import chroma from "chroma-js";
import { useEffect, useState } from "react";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then((mod) => mod.CircleMarker), { ssr: false });
const Tooltip = dynamic(() => import("react-leaflet").then((mod) => mod.Tooltip), { ssr: false });
const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false });

export default function EarthquakeMap({ earthquakeData }) {
  const startYear = 1965;
  const endYear = 2016;

  const colorScale = chroma.scale(["#FF5733", "#33FF57", "#3357FF", "#FFFF33", "#FF33FF"]).domain([startYear, endYear]);

  const getColor = (year) => colorScale(year).hex();
  const getMarkerSize = (magnitude) => Math.max(Math.log(magnitude || 1) * 1.5, 2);

  const bounds = [
    [-85, -180],
    [85, 180],
  ];

  const [plateBoundaries, setPlateBoundaries] = useState(null);
  const [plateNames, setPlateNames] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlateData() {
      setLoading(true);
      const boundariesResponse = await fetch(
        "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
      );
      const namesResponse = await fetch(
        "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"
      );

      const boundariesData = await boundariesResponse.json();
      const namesData = await namesResponse.json();

      setPlateBoundaries(boundariesData);
      setPlateNames(namesData);
      setLoading(false);
    }
    fetchPlateData();
  }, []);

  return (
    <div className="w-[95%] h-[700px] mx-auto overflow-hidden border border-gray-300 shadow-lg relative">
      {loading && (
        <div style={loadingStyle}>
          <p>Loading...</p>
        </div>
      )}
      <MapContainer
        center={[0, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={10}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png"
          attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
        />

        {earthquakeData.map((quake, idx) => {
          const year = new Date(quake.Date).getFullYear();
          return (
            <CircleMarker
              key={idx}
              center={[quake.Latitude, quake.Longitude]}
              radius={getMarkerSize(quake.Magnitude)}
              fillColor={getColor(year)}
              color={getColor(year)}
              fillOpacity={0.8}
              stroke={false}
            >
              <Tooltip>
                <span>{`Magnitude: ${quake.Magnitude}`}</span>
                <br />
                <span>{`Date: ${quake.Date}`}</span>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {plateBoundaries && (
          <GeoJSON
            data={plateBoundaries}
            style={() => ({
              color: "brown",
              weight: 2,
              dashArray: "5,5",
            })}
          />
        )}

        {plateNames &&
          plateNames.features.map((plate, idx) => {
            const coordinates = plate.geometry.coordinates[0];
            const midPoint = coordinates[Math.floor(coordinates.length / 2)];
            return (
              <Tooltip
                key={idx}
                permanent
                direction="center"
                offset={[0, 0]}
                position={[midPoint[1], midPoint[0]]}
              >
                <span style={{ fontWeight: "bold", color: "black", background: "white", padding: "2px" }}>
                  {plate.properties.PlateName}
                </span>
              </Tooltip>
            );
          })}
      </MapContainer>

      <div style={legendStyle}>
        <h4 style={{ color: "black", marginBottom: "10px" }}>Legende</h4>
        <div style={legendGrid}>
          {Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i).map((year, index) => (
            <div key={index} style={legendItemStyle}>
              <span
                style={{
                  backgroundColor: getColor(year),
                  display: "inline-block",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  marginRight: "5px",
                }}
              ></span>
              <span style={{ color: "black", fontSize: "12px" }}>{year}</span>
            </div>
          ))}
        </div>
        <div style={legendItemStyle}>
          <span
            style={{
              display: "inline-block",
              width: "20px",
              height: "5px",
              backgroundColor: "brown",
              marginRight: "5px",
            }}
          ></span>
          <span style={{ color: "black", fontSize: "12px" }}>Plattengrenzen</span>
        </div>
      </div>
    </div>
  );
}

const loadingStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  background: "white",
  padding: "10px",
  borderRadius: "5px",
  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  fontSize: "16px",
  zIndex: 1000,
};

const legendStyle = {
  position: "absolute",
  top: "10px",
  right: "10px",
  padding: "10px",
  zIndex: 1000,
  borderRadius: "5px",
  backgroundColor: "white",
  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  fontSize: "12px",
  overflowY: "auto",
  maxHeight: "80%",
};

const legendGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "5px",
};

const legendItemStyle = {
  display: "flex",
  alignItems: "center",
  marginBottom: "5px",
};

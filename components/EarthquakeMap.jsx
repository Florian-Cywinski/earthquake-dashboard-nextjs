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
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    async function fetchPlateData() {
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

  const handleMapLoad = () => {
    setMapLoaded(true);
  };

  useEffect(() => {
    if (mapLoaded && !loading) {
      setLoading(false);
    }
  }, [mapLoaded, loading]);

  return (
    <div className="w-[95%] h-[700px] mx-auto overflow-hidden border border-gray-300 shadow-lg relative">
      {loading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-md text-lg font-bold text-gray-800 z-[1000]">
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
        whenCreated={handleMapLoad}
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
                <span className="font-bold text-black bg-white p-1">{plate.properties.PlateName}</span>
              </Tooltip>
            );
          })}
      </MapContainer>

      <div className="absolute top-2 right-2 p-4 z-[1000] rounded-lg bg-white shadow-md text-sm overflow-y-auto max-h-[80%]">
        <h4 className="text-black mb-2">Legende</h4>
        <div className="grid grid-cols-2 gap-1">
          {Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i).map((year, index) => (
            <div key={index} className="flex items-center mb-1">
              <span
                className="inline-block w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: getColor(year) }}
              ></span>
              <span className="text-black text-xs">{year}</span>
            </div>
          ))}
        </div>
        {/* Marker für Plattengrenzen in der Legende */}
        <div className="flex items-center mb-1">
          {/* Zwei dünnere Striche nebeneinander für gestrichelte Darstellung */}
          <span
            className="inline-block w-3 h-0.5 mr-1"
            style={{ backgroundColor: "brown", marginRight: "2px" }}
          ></span>
          <span
            className="inline-block w-3 h-0.5"
            style={{ backgroundColor: "brown", marginLeft: "2px" }}
          ></span>
          <span className="text-black text-xs ml-2">Plattengrenzen</span>
        </div>
      </div>
    </div>
  );
}

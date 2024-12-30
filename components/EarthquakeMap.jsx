import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import chroma from "chroma-js";

// Dynamischer Import von Leaflet-Komponenten
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then((mod) => mod.CircleMarker), { ssr: false });
const Tooltip = dynamic(() => import("react-leaflet").then((mod) => mod.Tooltip), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false });

export default function EarthquakeMap({ earthquakeData }) {
  const startYear = 1965;
  const endYear = 2016;
  const colorScale = chroma
    .scale(["#FF5733", "#33FF57", "#3357FF", "#FFFF33", "#FF33FF"])
    .domain([startYear, endYear]);

  const getColor = (year) => colorScale(year).hex();

  // Begrenzung der sichtbaren Karte
  const bounds = [
    [-85, -180], // Südwestliche Ecke (nahe Südpol)
    [85, 180],   // Nordöstliche Ecke (nahe Nordpol)
  ];

  // Bestimmung der Marker-Größe (noch kleiner)
  const getMarkerSize = (magnitude) => {
    const size = Math.log(magnitude || 1) * 1.5; // Noch kleiner machen
    return Math.min(size, 6); // Maximale Marker-Größe auf 6 begrenzen
  };

  // Beispielhafte tektonische Plattengrenzen (richtige Koordinaten)
  const plateBoundaries = [
    [[40, -120], [35, -115]], // North American Plate
    [[35, -115], [32, -110]], // Pacific Plate
    [[-50, 70], [50, 80]],    // Eurasian Plate
    [[-60, 80], [40, 130]],   // Indo-Australian Plate
  ];

  return (
    <div className="w-[95%] h-[700px] mx-auto overflow-y-scroll border border-gray-300 shadow-lg">
      <MapContainer
        center={[0, 0]} // Zentrum der Karte
        zoom={2} // Initialer Zoom für vollständige Weltansicht
        minZoom={2} // Verhindert Herauszoomen über die gesamte Welt
        maxZoom={10} // Optional: Maximale Zoomstufe
        maxBounds={bounds} // Beschränkung der Karte auf die Welt
        maxBoundsViscosity={1.0} // Strikte Begrenzung
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        {/* Tile-Layer für die Karte mit deutschen Bezeichnungen */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png" // Deutsche Bezeichner
          attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
        />

        {/* Marker für Erdbeben */}
        {earthquakeData.map((quake, idx) => {
          const year = new Date(quake.Date).getFullYear();
          const latitude = quake.Latitude;
          const longitude = quake.Longitude;

          if (isNaN(latitude) || isNaN(longitude)) {
            return null;
          }

          return (
            <CircleMarker
              key={idx}
              center={[latitude, longitude]}
              radius={getMarkerSize(quake.Magnitude)} // Dynamische Größe basierend auf der Magnitude
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

        {/* Tektonische Plattengrenzen (braun gepunktet) */}
        {plateBoundaries.map((boundary, index) => (
          <Polyline
            key={index}
            positions={boundary}
            color="brown"
            weight={2}
            dashArray="5,5" // Gepunktete Linie
          />
        ))}

        {/* Legende hinzufügen */}
        <div className="leaflet-control-legend" style={legendStyle}>
          <h4 style={{ color: "black" }}>Erdbebenjahr</h4>
          <div>
            {colorScale.domain().map((year, index) => (
              <div key={index} style={legendItemStyle}>
                <span
                  style={{
                    backgroundColor: getColor(year),
                    display: "inline-block",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%", // Runde Marker in der Legende
                    marginRight: "5px",
                  }}
                ></span>
                <span style={{ color: "black" }}>{year}</span> {/* Text schwarz */}
              </div>
            ))}
          </div>
        </div>
      </MapContainer>

      {/* Legende außerhalb der Karte, falls notwendig */}
      <div className="legend-container" style={outsideLegendStyle}>
        <h4 style={{ color: "black" }}>Erdbebenjahr</h4>
        <div>
          {colorScale.domain().map((year, index) => (
            <div key={index} style={outsideLegendItemStyle}>
              <span
                style={{
                  backgroundColor: getColor(year),
                  display: "inline-block",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%", // Runde Marker in der Legende
                  marginRight: "5px",
                }}
              ></span>
              <span style={{ color: "black" }}>{year}</span> {/* Text schwarz */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Stil für die Legende innerhalb der Karte
const legendStyle = {
  position: "absolute",
  top: "10px",
  left: "10px",
  zIndex: 1000,
  backgroundColor: "white",
  padding: "10px",
  borderRadius: "5px",
  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  fontSize: "14px",
  maxHeight: "200px",
  overflowY: "scroll", // Scrollbar hinzufügen, wenn die Legende zu groß wird
};

// Stil für jedes Element in der Legende
const legendItemStyle = {
  display: "flex",
  alignItems: "center",
  marginBottom: "5px",
};

// Stil für die Legende außerhalb der Karte
const outsideLegendStyle = {
  position: "relative",
  marginTop: "20px",
  zIndex: 1000,
  backgroundColor: "white",
  padding: "10px",
  borderRadius: "5px",
  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  fontSize: "14px",
};

// Stil für die einzelnen Legendenitems außerhalb der Karte
const outsideLegendItemStyle = {
  display: "flex",
  alignItems: "center",
  marginBottom: "5px",
};









// import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
// import { useEffect, useState } from 'react';
// import "leaflet/dist/leaflet.css";
// import chroma from 'chroma-js';

// export default function EarthquakeMap({ earthquakeData }) {
//   // console.log("Earthquake data received in EarthquakeMap:", earthquakeData);

//   return (
//     <div className="h-96 w-full">
//       <MapContainer center={[0, 0]} zoom={2} className="h-full w-full">
//       <TileLayer
//         url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
//         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CartoDB</a>'
//       />

//         {earthquakeData.map((quake, idx) => {
//           // console.log(`Rendering marker ${idx}`, quake);
//           return (
//             <CircleMarker
//               key={idx}
//               center={[quake.Latitude, quake.Longitude]}
//               radius={Math.log(quake.Magnitude || 1) * 3}
//               fillColor="red"
//               color="red"
//               fillOpacity={0.8}
//               stroke={false}
//             >
//               <Tooltip>
//                 <span>{`Magnitude: ${quake.Magnitude}`}</span>
//                 <br />
//                 <span>{`Date: ${quake.Date}`}</span>
//               </Tooltip>
//             </CircleMarker>
//           );
//         })}
//       </MapContainer>
//     </div>
//   );
// }


// import dynamic from "next/dynamic";
// import "leaflet/dist/leaflet.css";
// import chroma from "chroma-js";

// const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
// const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
// const CircleMarker = dynamic(() => import("react-leaflet").then((mod) => mod.CircleMarker), { ssr: false });
// const Tooltip = dynamic(() => import("react-leaflet").then((mod) => mod.Tooltip), { ssr: false });

// export default function EarthquakeMap({ earthquakeData }) {
//   // console.log("Earthquake Data in Map:", earthquakeData); // Überprüfen, ob die Daten korrekt übergeben wurden
//   const startYear = 1965;
//   const endYear = 2016;

//   const colorScale = chroma
//     .scale(["#FF5733", "#33FF57", "#3357FF", "#FFFF33", "#FF33FF"])
//     .domain([startYear, endYear]);

//   const getColor = (year) => colorScale(year).hex();

//   return (
//     // <div className="h-96 w-full">
//     <div className="h-full w-full">
//       <MapContainer center={[0, 0]} zoom={2} className="h-full w-full">
//         {/* <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
//         /> */}
//         <TileLayer
//           url="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
//         />

//         {earthquakeData.map((quake, idx) => {
//           // console.log(`Processing earthquake ${idx}: Latitude: ${quake.Latitude}, Longitude: ${quake.Longitude}`); // Überprüfen der Koordinaten
//           const year = new Date(quake.Date).getFullYear();
//           return (
//             <CircleMarker
//               key={idx}
//               center={[quake.Latitude, quake.Longitude]}
//               radius={Math.log(quake.Magnitude || 1) * 3}
//               fillColor={getColor(year)}
//               color={getColor(year)}
//               fillOpacity={0.8}
//               stroke={false}
//             >
//               <Tooltip>
//                 <span>{`Magnitude: ${quake.Magnitude}`}</span>
//                 <br />
//                 <span>{`Date: ${quake.Date}`}</span>
//               </Tooltip>
//             </CircleMarker>
//           );
//         })}
//       </MapContainer>
//     </div>
//   );
// }

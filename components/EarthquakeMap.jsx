import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { useEffect, useState } from 'react';
import "leaflet/dist/leaflet.css";
import chroma from 'chroma-js';

// Korrekte Initialisierung und Dynamik für Kartenkomponenten
export default function EarthquakeMap({ earthquakeData }) {
  const startYear = 1965;
  const endYear = 2016;

  const colorScale = chroma
    .scale(["#FF5733", "#33FF57", "#3357FF", "#FFFF33", "#FF33FF"])
    .domain([startYear, endYear]);

  const getColor = (year) => colorScale(year).hex();

  return (
    <div className="h-96 w-full">
      <MapContainer center={[0, 0]} zoom={2} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
        />
        {earthquakeData.map((quake, idx) => {
          const year = new Date(quake.Date).getFullYear();
          return (
            <CircleMarker
              key={idx}
              center={[quake.Latitude, quake.Longitude]}
              radius={Math.log(quake.Magnitude || 1) * 3}
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
      </MapContainer>
    </div>
  );
}


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

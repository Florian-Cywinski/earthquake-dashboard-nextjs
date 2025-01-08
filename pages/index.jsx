import Head from "next/head";
import dynamic from "next/dynamic";
import StatsPlots from "../components/StatsPlots";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

// Dynamisches Laden der EarthquakeMap-Komponente
const EarthquakeMap = dynamic(() => import("../components/EarthquakeMap"), { ssr: false });

// const EarthquakeMap = dynamic(() => import("../components/EarthquakeMap"), { 
//   ssr: false,
//   loading: () => <p>Loading map...</p>, // Ladeanzeige
// });


export async function getStaticProps() {
  // Pfad zur CSV-Datei
  const filePath = path.join(process.cwd(), "public/data/earthquake_data.csv");
  const fileContent = fs.readFileSync(filePath, "utf8");

  console.log("CSV-Dateipfad:", filePath);

  // CSV-Daten parsen
  const { data } = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  // Funktion zum sicheren Umwandeln in ISO-String
  const parseDate = (value) => {
    const date = new Date(value);
    return date instanceof Date && !isNaN(date) ? date.toISOString() : null;
  };

  // Daten formatieren und JSON-kompatibel machen
  const earthquakeData = data.map((item, index) => {
    const date = parseDate(item.Date);
    const time = parseDate(item.Time);

    return {
      id: index + 1, // Eindeutige ID für jedes Erdbeben
      Date: date, // Datum des Erdbebens im ISO-Format
      Time: time, // Uhrzeit des Erdbebens als ISO-String
      Latitude: parseFloat(item.Latitude), // Breitengrad
      Longitude: parseFloat(item.Longitude), // Längengrad
      Magnitude: parseFloat(item.Magnitude), // Magnitude
      Depth: parseFloat(item.Depth), // Tiefe
      Type: item.Type || null, // Art des Ereignisses (z. B. Erdbeben)
    };
  });

  return { props: { earthquakeData } };
}

export default function Home({ earthquakeData }) {
  return (
    <>
      <Head>
        <title>Earthquake Dashboard</title>
      </Head>
      <main>
        <h1 className="text-2xl font-bold text-center my-4">Earthquake Dashboard - Significant Earthquakes, 1965-2016</h1>
        <h2 className="text-l text-center my-4">Date, time, and location of all earthquakes with magnitude of 5.5 or higher</h2>
        <div className="mb-8">
          <EarthquakeMap earthquakeData={earthquakeData} />
        </div>
        <div>
          <StatsPlots data={earthquakeData} />
        </div>
      </main>
    </>
  );
}


// export default function Home() {
//   return <h1>Hello, World!</h1>;
// }

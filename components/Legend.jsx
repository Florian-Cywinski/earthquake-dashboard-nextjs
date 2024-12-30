import chroma from "chroma-js";

export default function Legend() {
  const startYear = 1965;
  const endYear = 2016;

  // Farbverlauf für die Legende
  const colorScale = chroma.scale(["#FF5733", "#33FF57", "#3357FF", "#FFFF33", "#FF33FF"]).domain([startYear, endYear]);

  // Jahre für die Legende berechnen (5 Stufen)
  const steps = 5;
  const years = Array.from({ length: steps + 1 }, (_, i) =>
    Math.round(startYear + ((endYear - startYear) / steps) * i)
  );

  return (
    <div className="bg-gray-800 p-4 rounded-md shadow-md">
      <h3 className="text-lg font-semibold mb-2">Legend</h3>
      <ul>
        {years.map((year, idx) => (
          <li key={idx} className="flex items-center mb-1">
            <span
              className="inline-block w-4 h-4 mr-2"
              style={{ backgroundColor: colorScale(year).hex() }}
            ></span>
            <span>{year}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import ReactEcharts from "echarts-for-react";

export default function StatsPlots({ data }) {
  const processYearlyData = () => {
    const yearCounts = {};
    data.forEach((quake) => {
      const year = new Date(quake.Date).getFullYear();
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });
    return {
      xAxis: {
        type: "category",
        data: Object.keys(yearCounts),
        name: "Year", // Achsenbeschriftung für x-Achse
        nameLocation: "middle", // Position der Beschriftung
        nameGap: 30, // Abstand der Beschriftung von der Achse
      },
      yAxis: {
        type: "value",
        name: "Number of earthquakes", // Achsenbeschriftung für y-Achse
        nameLocation: "middle", // Position der Beschriftung
        nameGap: 40, // Abstand der Beschriftung von der Achse
      },
      series: [
        {
          data: Object.values(yearCounts),
          type: "bar",
          color: "#3b82f6",
        },
      ],
      tooltip: { trigger: "axis" },
    };
  };

  const processMagnitudeData = () => {
    const years = {};
    data.forEach((quake) => {
      const year = new Date(quake.Date).getFullYear();
      years[year] = years[year] || [];
      years[year].push(quake.Magnitude);
    });

    const avgMagnitude = Object.keys(years).map((year) => {
      const magnitudes = years[year];
      const avg = magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length;
      return avg.toFixed(2);
    });

    return {
      xAxis: {
        type: "category",
        data: Object.keys(years),
        name: "Year", // Achsenbeschriftung für x-Achse
        nameLocation: "middle", // Position der Beschriftung
        nameGap: 30, // Abstand der Beschriftung von der Achse
      },
      yAxis: {
        type: "value",
        name: "Average magnitude", // Achsenbeschriftung für y-Achse
        nameLocation: "middle", // Position der Beschriftung
        nameGap: 40, // Abstand der Beschriftung von der Achse
        min: 5, // Minimale Grenze für Magnitude
        max: 7, // Maximale Grenze für Magnitude
        interval: 0.5, // Intervall von 0.5 für die y-Achse
      },
      series: [
        {
          data: avgMagnitude,
          type: "line",
          color: "#9333ea",
        },
      ],
      tooltip: { trigger: "axis" },
    };
  };

  return (
    <div className="space-y-8">
      <div className="bg-dark p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4 text-center">Earthquake Frequency Over the Years</h2>
        <ReactEcharts option={processYearlyData()} style={{ height: "400px" }} />
      </div>
      <div className="bg-dark p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4 text-center">Average Magnitude Per Year</h2>
        <ReactEcharts option={processMagnitudeData()} style={{ height: "400px" }} />
      </div>
    </div>
  );
}

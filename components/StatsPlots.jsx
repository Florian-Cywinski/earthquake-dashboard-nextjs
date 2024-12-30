import ReactEcharts from "echarts-for-react";

export default function StatsPlots({ data }) {
  const processYearlyData = () => {
    const yearCounts = {};
    data.forEach((quake) => {
      const year = new Date(quake.Date).getFullYear();
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });
    return {
      xAxis: { type: "category", data: Object.keys(yearCounts) },
      yAxis: { type: "value" },
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
      xAxis: { type: "category", data: Object.keys(years) },
      yAxis: { type: "value" },
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
        <h2 className="text-lg font-semibold mb-4">Earthquake Frequency Over the Years</h2>
        <ReactEcharts option={processYearlyData()} style={{ height: "400px" }} />
      </div>
      <div className="bg-dark p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Average Magnitude Per Year</h2>
        <ReactEcharts option={processMagnitudeData()} style={{ height: "400px" }} />
      </div>
    </div>
  );
}

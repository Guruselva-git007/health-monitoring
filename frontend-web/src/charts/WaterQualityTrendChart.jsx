import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function WaterQualityTrendChart({ waterRows }) {
  const data = [...waterRows]
    .sort((a, b) => new Date(a.collected_at) - new Date(b.collected_at))
    .slice(-40)
    .map((row) => ({
      time: new Date(row.collected_at).toLocaleDateString(),
      ph: Number(row.ph.toFixed(2)),
      turbidity: Number(row.turbidity.toFixed(2)),
      chlorine: Number(row.chlorine_level.toFixed(2)),
    }));

  return (
    <section className="card">
      <h3>Water Quality Trends</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="ph" stroke="#2c7fb8" strokeWidth={2} />
          <Line type="monotone" dataKey="turbidity" stroke="#f03b20" strokeWidth={2} />
          <Line type="monotone" dataKey="chlorine" stroke="#fd8d3c" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function OutbreakProbabilityChart({ predictions }) {
  const data = [...predictions]
    .sort((a, b) => new Date(a.predicted_at) - new Date(b.predicted_at))
    .slice(-40)
    .map((row) => ({
      time: new Date(row.predicted_at).toLocaleDateString(),
      probability: Math.round(row.confidence * 100),
      risk: row.risk_level,
    }));

  return (
    <section className="card">
      <h3>Outbreak Probability</h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis unit="%" domain={[0, 100]} />
          <Tooltip />
          <Area type="monotone" dataKey="probability" stroke="#6a3d9a" fill="#cab2d6" />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  );
}

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function aggregateByDay(reports) {
  const map = {};
  reports.forEach((report) => {
    const day = new Date(report.reported_at).toISOString().slice(0, 10);
    map[day] = (map[day] || 0) + 1;
  });

  return Object.entries(map)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([date, count]) => ({ date, count }));
}

export default function SymptomTrendChart({ reports }) {
  const data = aggregateByDay(reports);

  return (
    <section className="card">
      <h3>Symptom Trend Over Time</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#1b9e77" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = {
  LOW: "#1a9850",
  MEDIUM: "#fee08b",
  HIGH: "#d73027",
};

export default function RiskDistributionChart({ predictions }) {
  const count = predictions.reduce(
    (acc, row) => {
      acc[row.risk_level] = (acc[row.risk_level] || 0) + 1;
      return acc;
    },
    { LOW: 0, MEDIUM: 0, HIGH: 0 }
  );

  const data = Object.entries(count).map(([name, value]) => ({ name, value }));

  return (
    <section className="card">
      <h3>Risk Distribution</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={90}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </section>
  );
}

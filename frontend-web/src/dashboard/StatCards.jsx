export default function StatCards({ reports, waterRows, predictions, alerts }) {
  const highRisk = predictions.filter((p) => p.risk_level === "HIGH").length;
  const contaminated = waterRows.filter((w) => w.ecoli_presence).length;
  const activeAlerts = alerts.filter((a) => !a.is_read).length;

  const cards = [
    { label: "Symptom Reports", value: reports.length, tone: "aqua" },
    { label: "Water Samples", value: waterRows.length, tone: "blue" },
    { label: "High Risk Predictions", value: highRisk, tone: "rose" },
    { label: "Active Alerts", value: activeAlerts, tone: "amber" },
    { label: "Contaminated Sources", value: contaminated, tone: "mint" },
  ];

  return (
    <section className="stats-grid">
      {cards.map((card) => (
        <article key={card.label} className={`stat-card tone-${card.tone}`}>
          <span>{card.label}</span>
          <h3>{card.value}</h3>
        </article>
      ))}
    </section>
  );
}

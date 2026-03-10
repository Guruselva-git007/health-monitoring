import { markAlertRead } from "../services/api";

const severityClass = {
  info: "chip-info",
  warning: "chip-warning",
  critical: "chip-critical",
};

export default function AlertPanel({ alerts, onUpdated }) {
  const unread = alerts.filter((a) => !a.is_read);

  const markRead = async (alertId) => {
    await markAlertRead(alertId);
    onUpdated();
  };

  return (
    <section className="card">
      <div className="card-header">
        <h3>Early Warning Alerts</h3>
        <span>{unread.length} unread</span>
      </div>
      <div className="alert-list">
        {alerts.length === 0 && <p>No alerts available</p>}
        {alerts.map((alert) => (
          <article key={alert.id} className={`alert-item ${alert.is_read ? "read" : ""}`}>
            <div className="alert-item-head">
              <span className={`chip ${severityClass[alert.severity] || "chip-info"}`}>
                {alert.severity.toUpperCase()}
              </span>
              <small>{new Date(alert.created_at).toLocaleString()}</small>
            </div>
            <p>{alert.message}</p>
            {!alert.is_read && (
              <button className="link-btn" onClick={() => markRead(alert.id)}>
                Mark read
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

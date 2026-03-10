import { useCallback, useEffect, useMemo, useState } from "react";
import AlertPanel from "../components/AlertPanel";
import OutbreakProbabilityChart from "../charts/OutbreakProbabilityChart";
import RiskDistributionChart from "../charts/RiskDistributionChart";
import SymptomTrendChart from "../charts/SymptomTrendChart";
import WaterQualityTrendChart from "../charts/WaterQualityTrendChart";
import RiskMap from "../maps/RiskMap";
import {
  exportAlertsCsv,
  exportReportsCsv,
  fetchAlerts,
  fetchReports,
  predictRisk,
  fetchRiskMap,
  fetchWaterData,
} from "../services/api";
import useRealtime from "../hooks/useRealtime";
import StatCards from "./StatCards";

export default function DashboardPage() {
  const [reports, setReports] = useState([]);
  const [waterRows, setWaterRows] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [predicting, setPredicting] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [reportsData, waterData, riskData, alertsData] = await Promise.all([
        fetchReports(),
        fetchWaterData(),
        fetchRiskMap(),
        fetchAlerts(),
      ]);

      setReports(reportsData);
      setWaterRows(waterData);
      setPredictions(riskData.items || []);
      setAlerts(alertsData);
      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load live data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
    const timer = setInterval(loadAll, 30000);
    return () => clearInterval(timer);
  }, [loadAll]);

  useRealtime(
    useCallback(
      (message) => {
        if (["symptom_report_created", "water_data_created", "risk_prediction_created"].includes(message.event)) {
          loadAll();
        }
      },
      [loadAll]
    )
  );

  const highRiskZones = useMemo(
    () => predictions.filter((item) => item.risk_level === "HIGH").length,
    [predictions]
  );

  const runQuickPrediction = async () => {
    setPredicting(true);
    try {
      await predictRisk({
        latitude: 12.9716 + Math.random() * 0.08,
        longitude: 77.5946 + Math.random() * 0.08,
        ph: 6.1,
        turbidity: 13.2,
        temperature: 31.6,
        ecoli: 1,
        number_of_symptom_reports: 24,
        population_density: 8200,
        rainfall: 138,
      });
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.detail || "Live prediction failed");
    } finally {
      setPredicting(false);
    }
  };

  const onExportReports = async () => {
    try {
      await exportReportsCsv();
    } catch (err) {
      setError(err.response?.data?.detail || "Report export failed");
    }
  };

  const onExportAlerts = async () => {
    try {
      await exportAlertsCsv();
    } catch (err) {
      setError(err.response?.data?.detail || "Alert export failed");
    }
  };

  return (
    <main className="dashboard-layout">
      <section className="toolbar card">
        <div>
          <h2>Operational Dashboard</h2>
          <p>High-risk zones: {highRiskZones}</p>
          {lastUpdated && <p>Last updated: {lastUpdated.toLocaleString()}</p>}
          {error && <p className="error-text">{error}</p>}
        </div>
        <div className="toolbar-actions">
          <button onClick={onExportReports}>Export Reports CSV</button>
          <button onClick={onExportAlerts}>Export Alerts CSV</button>
          <button onClick={runQuickPrediction} disabled={predicting}>
            {predicting ? "Running..." : "Run Live Prediction"}
          </button>
        </div>
      </section>

      {loading && <section className="card">Loading operational data...</section>}

      <StatCards reports={reports} waterRows={waterRows} predictions={predictions} alerts={alerts} />

      <section className="grid-two">
        <SymptomTrendChart reports={reports} />
        <WaterQualityTrendChart waterRows={waterRows} />
      </section>

      <section className="grid-two">
        <OutbreakProbabilityChart predictions={predictions} />
        <RiskDistributionChart predictions={predictions} />
      </section>

      <RiskMap predictions={predictions} waterRows={waterRows} />

      <AlertPanel alerts={alerts} onUpdated={loadAll} />
    </main>
  );
}

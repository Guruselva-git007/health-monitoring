import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import * as Notifications from "expo-notifications";
import { fetchAlerts } from "../api/client";
import i18n from "../locales/translations";

export default function AlertsScreen({ token }) {
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadAlerts = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await fetchAlerts(token);
      setAlerts(data);

      const critical = data.filter((a) => a.severity === "critical" && !a.is_read);
      if (critical.length > 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Critical Health Alert",
            body: critical[0].message,
          },
          trigger: null,
        });
      }
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t("alerts")}</Text>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadAlerts} />}
        renderItem={({ item }) => (
          <View style={[styles.card, item.severity === "critical" && styles.critical]}>
            <Text style={styles.meta}>{new Date(item.created_at).toLocaleString()}</Text>
            <Text style={styles.severity}>{item.severity.toUpperCase()}</Text>
            <Text>{item.message}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f8fb",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: "#d5deea",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  critical: {
    borderColor: "#ef4444",
    backgroundColor: "#fff2f2",
  },
  severity: {
    fontWeight: "700",
    marginBottom: 4,
  },
  meta: {
    color: "#5f6b7d",
    marginBottom: 4,
    fontSize: 12,
  },
});

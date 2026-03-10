import NetInfo from "@react-native-community/netinfo";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { postSymptomReport } from "./api/client";
import AlertsScreen from "./screens/AlertsScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ReportSymptomScreen from "./screens/ReportSymptomScreen";
import i18n from "./locales/translations";
import {
  clearAuth,
  loadAuth,
  loadLanguage,
  loadQueue,
  saveLanguage,
  saveQueue,
} from "./utils/storage";

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [pendingQueueCount, setPendingQueueCount] = useState(0);
  const [language, setLanguage] = useState(i18n.locale.startsWith("hi") ? "hi" : "en");

  const syncOfflineQueue = useCallback(
    async (activeToken) => {
      const queue = await loadQueue();
      if (queue.length === 0 || !activeToken) {
        setPendingQueueCount(queue.length);
        return;
      }

      const remaining = [];
      for (const item of queue) {
        try {
          await postSymptomReport(item, activeToken);
        } catch {
          remaining.push(item);
        }
      }

      await saveQueue(remaining);
      setPendingQueueCount(remaining.length);
    },
    []
  );

  useEffect(() => {
    const bootstrap = async () => {
      const { token: storedToken, user: storedUser } = await loadAuth();
      const queued = await loadQueue();
      const savedLang = await loadLanguage();
      if (savedLang) {
        i18n.locale = savedLang;
        setLanguage(savedLang);
      }
      setToken(storedToken || null);
      setUser(storedUser || null);
      setPendingQueueCount(queued.length);
      if (storedToken) {
        syncOfflineQueue(storedToken);
      }
    };

    Notifications.requestPermissionsAsync();
    bootstrap();

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && token) {
        syncOfflineQueue(token);
      }
    });
    return unsubscribe;
  }, [syncOfflineQueue, token]);

  const onAuthenticated = async (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    await syncOfflineQueue(newToken);
  };

  const logout = async () => {
    await clearAuth();
    setToken(null);
    setUser(null);
  };

  const toggleLanguage = async () => {
    const next = language === "en" ? "hi" : "en";
    setLanguage(next);
    i18n.locale = next;
    await saveLanguage(next);
  };

  if (!token) {
    return (
      <NavigationContainer>
        <AuthStack.Navigator>
          <AuthStack.Screen name="Login" options={{ title: i18n.t("login") }}>
            {(props) => <LoginScreen {...props} onAuthenticated={onAuthenticated} />}
          </AuthStack.Screen>
          <AuthStack.Screen name="Register" options={{ title: i18n.t("register") }}>
            {(props) => <RegisterScreen {...props} onAuthenticated={onAuthenticated} />}
          </AuthStack.Screen>
        </AuthStack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.appHeader}>
          <Text style={styles.greeting}>{user?.full_name || "Community User"}</Text>
          <View style={styles.headerActions}>
            <Pressable onPress={toggleLanguage} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>{i18n.t("language")}: {language.toUpperCase()}</Text>
            </Pressable>
            <Pressable onPress={logout} style={styles.headerButtonSecondary}>
              <Text style={styles.headerButtonText}>{i18n.t("logout")}</Text>
            </Pressable>
          </View>
        </View>

        {pendingQueueCount > 0 && (
          <View style={styles.queueBanner}>
            <Text style={styles.queueText}>
              {i18n.t("queuePending")}: {pendingQueueCount}
            </Text>
          </View>
        )}

        <AppStack.Navigator>
          <AppStack.Screen name="Report" options={{ title: i18n.t("symptomReport") }}>
            {(props) => (
              <ReportSymptomScreen
                {...props}
                token={token}
                onQueueUpdated={setPendingQueueCount}
              />
            )}
          </AppStack.Screen>
          <AppStack.Screen name="Alerts" options={{ title: i18n.t("alerts") }}>
            {(props) => <AlertsScreen {...props} token={token} />}
          </AppStack.Screen>
        </AppStack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f8fb",
  },
  appHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: "#e8f2fa",
    borderBottomWidth: 1,
    borderBottomColor: "#d0dceb",
  },
  greeting: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerActions: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#2563eb",
  },
  headerButtonSecondary: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#0b6e4f",
  },
  headerButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  queueBanner: {
    backgroundColor: "#fff3cd",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#ffe08a",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  queueText: {
    color: "#7a5400",
    fontWeight: "600",
  },
});

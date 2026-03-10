import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { postSymptomReport } from "../api/client";
import SymptomSelector from "../components/SymptomSelector";
import i18n from "../locales/translations";
import { appendQueue } from "../utils/storage";

export default function ReportSymptomScreen({ navigation, token, onQueueUpdated }) {
  const [symptoms, setSymptoms] = useState([]);
  const [waterSourceType, setWaterSourceType] = useState("tap");
  const [householdSize, setHouseholdSize] = useState("4");
  const [recentTravel, setRecentTravel] = useState(false);
  const [notes, setNotes] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [status, setStatus] = useState("");

  const useCurrentLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      setStatus("Location permission denied");
      return;
    }

    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    setLatitude(String(location.coords.latitude));
    setLongitude(String(location.coords.longitude));
  };

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setStatus("Photo permission denied");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true });
    if (!result.canceled && result.assets?.length) {
      setPhotoUrl(result.assets[0].uri);
    }
  };

  const buildPayload = () => ({
    latitude: Number(latitude),
    longitude: Number(longitude),
    symptoms,
    water_source_type: waterSourceType,
    household_size: Number(householdSize),
    recent_travel: recentTravel,
    photo_url: photoUrl || null,
    notes: notes || null,
    date: new Date().toISOString(),
  });

  const submit = async () => {
    if (!latitude || !longitude || symptoms.length === 0) {
      setStatus("Provide location and at least one symptom");
      return;
    }

    const payload = buildPayload();

    try {
      await postSymptomReport(payload, token);
      setStatus("Submitted successfully");
      setSymptoms([]);
      setNotes("");
      setPhotoUrl("");
    } catch {
      const queue = await appendQueue(payload);
      onQueueUpdated(queue.length);
      setStatus("No network: report queued for sync");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{i18n.t("symptomReport")}</Text>

      <Text style={styles.label}>{i18n.t("symptoms")}</Text>
      <SymptomSelector value={symptoms} onChange={setSymptoms} />

      <Text style={styles.label}>{i18n.t("waterSource")}</Text>
      <TextInput style={styles.input} value={waterSourceType} onChangeText={setWaterSourceType} />

      <Text style={styles.label}>{i18n.t("household")}</Text>
      <TextInput
        style={styles.input}
        value={householdSize}
        onChangeText={setHouseholdSize}
        keyboardType="number-pad"
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>{i18n.t("travel")}</Text>
        <Switch value={recentTravel} onValueChange={setRecentTravel} />
      </View>

      <Text style={styles.label}>Latitude</Text>
      <TextInput style={styles.input} value={latitude} onChangeText={setLatitude} keyboardType="numbers-and-punctuation" />

      <Text style={styles.label}>Longitude</Text>
      <TextInput style={styles.input} value={longitude} onChangeText={setLongitude} keyboardType="numbers-and-punctuation" />

      <Pressable style={styles.secondaryButton} onPress={useCurrentLocation}>
        <Text style={styles.secondaryText}>{i18n.t("useLocation")}</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={pickPhoto}>
        <Text style={styles.secondaryText}>{i18n.t("capturePhoto")}</Text>
      </Pressable>
      {photoUrl ? <Text style={styles.muted}>Photo selected</Text> : null}

      <Text style={styles.label}>{i18n.t("notes")}</Text>
      <TextInput style={[styles.input, styles.notes]} value={notes} onChangeText={setNotes} multiline />

      <Pressable style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>{i18n.t("submit")}</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate("Alerts")}>
        <Text style={styles.secondaryText}>{i18n.t("alerts")}</Text>
      </Pressable>

      {status ? <Text style={styles.status}>{status}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f8fb",
  },
  content: {
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  label: {
    fontWeight: "600",
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccd7e0",
    borderRadius: 8,
    backgroundColor: "#fff",
    padding: 10,
  },
  notes: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  button: {
    marginTop: 8,
    backgroundColor: "#0b6e4f",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#0b6e4f",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },
  secondaryText: {
    color: "#0b6e4f",
    fontWeight: "600",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  status: {
    marginTop: 10,
    color: "#174ea6",
  },
  muted: {
    color: "#596579",
  },
});

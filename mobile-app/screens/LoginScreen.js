import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { loginUser } from "../api/client";
import i18n from "../locales/translations";
import { saveAuth } from "../utils/storage";

export default function LoginScreen({ navigation, onAuthenticated }) {
  const [email, setEmail] = useState("admin@healthmonitor.org");
  const [password, setPassword] = useState("ChangeMe123!");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setError("");
      const data = await loginUser({ email, password });
      await saveAuth({ token: data.access_token, user: data.user });
      onAuthenticated(data.access_token, data.user);
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t("login")}</Text>
      <TextInput style={styles.input} placeholder={i18n.t("email")} value={email} onChangeText={setEmail} />
      <TextInput
        style={styles.input}
        placeholder={i18n.t("password")}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>{i18n.t("login")}</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate("Register")}> 
        <Text style={styles.link}>{i18n.t("register")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f4f8fb",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccd7e0",
    borderRadius: 10,
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#0b6e4f",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
  link: {
    marginTop: 16,
    color: "#0f5dff",
    textAlign: "center",
  },
  error: {
    color: "#b42318",
    marginBottom: 12,
  },
});

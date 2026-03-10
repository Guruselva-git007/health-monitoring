import { Pressable, StyleSheet, Text, View } from "react-native";

const DEFAULT_SYMPTOMS = [
  "Diarrhea",
  "Vomiting",
  "Fever",
  "Cholera symptoms",
  "Typhoid symptoms",
];

export default function SymptomSelector({ value, onChange }) {
  const toggle = (symptom) => {
    if (value.includes(symptom)) {
      onChange(value.filter((v) => v !== symptom));
      return;
    }
    onChange([...value, symptom]);
  };

  return (
    <View style={styles.row}>
      {DEFAULT_SYMPTOMS.map((item) => (
        <Pressable
          key={item}
          onPress={() => toggle(item)}
          style={[styles.chip, value.includes(item) && styles.chipActive]}
        >
          <Text style={[styles.chipText, value.includes(item) && styles.chipTextActive]}>{item}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#c8d0dc",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#fff",
  },
  chipActive: {
    backgroundColor: "#0b6e4f",
    borderColor: "#0b6e4f",
  },
  chipText: {
    color: "#233041",
    fontSize: 12,
  },
  chipTextActive: {
    color: "#fff",
  },
});

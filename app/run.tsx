import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Run() {
  return (
    <View style={styles.container}>
      <Text>Run</Text>

      <TouchableOpacity
        style={styles.floatingBtn}
        onPress={() => router.push("/add")}
      >
        <Ionicons name="add" size={30} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  floatingBtn: {
    position: "absolute",
    bottom: 60,
    right: 40,
    backgroundColor: "#129ade",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    padding: 10,
  },
});

import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

const runimg = require("../assets/images/run.png");

export default function Index() {
  // หน้าจอโหลด (Splash Screen) 3 วินาที
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
      }}
    >
      <Image source={runimg} style={styles.imglogo} />
      <Text
        style={{
          fontFamily: "Kanit_700Bold",
          fontSize: 24,
          marginTop: 20,
        }}
      >
        Run Tracker
      </Text>
      <Text
        style={{
          fontFamily: "Kanit_400Regular",
          fontSize: 16,
          marginTop: 10,
          marginBottom: 20,
        }}
      >
        วิ่งเพื่อสุขภาพ
      </Text>
      <ActivityIndicator size="large" color="#129ade" />
    </View>
  );
}

const styles = StyleSheet.create({
  imglogo: {
    width: 200,
    height: 200,
  },
});

import {
  Kanit_400Regular,
  Kanit_700Bold,
  useFonts,
} from "@expo-google-fonts/kanit";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // โหลดฟอนต์ก่อนที่แอปจะเริ่มทำงาน
  const [fontsLoaded] = useFonts({
    Kanit_400Regular,
    Kanit_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#129ade",
        },
        headerTitleStyle: {
          fontFamily: "Kanit_700Bold",
          fontSize: 20,
          color: "#ffffff",
        },
        headerTitleAlign: "center", // จัดตําแหน่งข้อความให้อยู่ตรงกลาง
        headerTintColor: "#ffffff", // สีของปุ่มกลับ
        headerBackButtonDisplayMode: "minimal", // ซ่อนข้อความปุ่มกลับ
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="run" options={{ title: "Run Tracker" }} />
      <Stack.Screen name="add" options={{ title: "เพิ่มการวิ่ง" }} />
      <Stack.Screen name="[id]" options={{ title: "รายละเอียดการวิ่ง" }} />
    </Stack>
  );
}

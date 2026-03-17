import { supabase } from "@/services/supabase";
import { Ionicons } from "@expo/vector-icons";
import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Add() {
  const router = useRouter();

  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("เช้า");
  const [image, setImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.log("No user found on mount");
    } else {
      console.log("User detected:", user.email);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("ขออนุญาต", "กรุณาอนุญาตให้เข้าถึงกล้องเพื่อถ่ายภาพ");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setBase64Image(result.assets[0].base64 || null);
    }
  };

  const handleSaveToSupabase = async () => {
    if (!location.trim() || !distance.trim() || !image) {
      Alert.alert("คำเตือน", "กรุณากรอกข้อมูลให้ครบและถ่ายรูปภาพ");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      let activeUser = user;

      if (userError || !user) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) {
          throw new Error(
            "ระบบหาตัวตนคุณไม่เจอจริงๆ กรุณากลับไปหน้า Login แล้วล็อกอินใหม่อีกครั้งครับ",
          );
        }
        activeUser = session.user;
      }

      console.log("บันทึกโดย User:", activeUser?.email);

      const fileName = `${activeUser?.id}/run_${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("run_bk")
        .upload(fileName, decode(base64Image!), {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError)
        throw new Error(`อัปโหลดรูปไม่สำเร็จ: ${uploadError.message}`);

      const {
        data: { publicUrl },
      } = supabase.storage.from("run_bk").getPublicUrl(fileName);

      const { error: insertError } = await supabase.from("runs").insert([
        {
          location: String(location).trim(),
          distance: Number(distance),
          time_of_day: String(timeOfDay),
          run_date: new Date().toISOString().split("T")[0],
          image_url: publicUrl,
          user_id: activeUser?.id,
        },
      ]);

      if (insertError) throw insertError;

      Alert.alert("สำเร็จ", "บันทึกข้อมูลการวิ่งเรียบร้อยแล้ว", [
        { text: "ตกลง", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.log("Save Error:", error.message);
      Alert.alert("เกิดข้อผิดพลาด", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.formGroup}>
          <Text style={styles.label}>สถานที่วิ่ง</Text>
          <TextInput
            placeholder="เช่น สวนสาธารณะ"
            style={styles.input}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>ระยะทาง (กิโลเมตร)</Text>
          <TextInput
            placeholder="เช่น 5.2"
            keyboardType="numeric"
            style={styles.input}
            value={distance}
            onChangeText={setDistance}
          />
        </View>

        <Text style={styles.label}>ช่วงเวลา</Text>
        {/* แก้ไขจาก <div> เป็น <View> เรียบร้อยครับ */}
        <View style={styles.timeContainer}>
          {["เช้า", "กลางวัน", "เย็น", "กลางคืน"].map((time) => (
            <TouchableOpacity
              key={time}
              onPress={() => setTimeOfDay(time)}
              style={[
                styles.timeBtn,
                timeOfDay === time
                  ? styles.timeBtnActive
                  : styles.timeBtnInactive,
              ]}
            >
              <Text
                style={[
                  styles.timeText,
                  timeOfDay === time && { color: "white" },
                ]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>รูปภาพสถานที่</Text>
        <TouchableOpacity
          style={styles.photoBox}
          onPress={handleTakePhoto}
          activeOpacity={0.7}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImg} />
          ) : (
            <View style={styles.placeholderBox}>
              <Ionicons name="camera" size={40} color="#999" />
              <Text style={styles.placeholderText}>แตะเพื่อเปิดกล้อง</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.7 }]}
          onPress={handleSaveToSupabase}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons
                name="cloud-upload-outline"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.saveBtnText}>บันทึกข้อมูลการวิ่ง</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  formGroup: { marginBottom: 20 },
  label: {
    fontFamily: "Kanit_700Bold",
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    fontFamily: "Kanit_400Regular",
    backgroundColor: "#f9f9f9",
  },
  timeContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 25 },
  timeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  timeBtnActive: { backgroundColor: "#1889da", borderColor: "#1889da" },
  timeBtnInactive: { backgroundColor: "#fff", borderColor: "#ddd" },
  timeText: { fontFamily: "Kanit_400Regular", color: "#666" },
  photoBox: {
    width: "100%",
    height: 220,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
    marginBottom: 30,
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "#ccc",
  },
  previewImg: { width: "100%", height: "100%" },
  placeholderBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  placeholderText: {
    fontFamily: "Kanit_400Regular",
    color: "#999",
    marginTop: 10,
  },
  saveBtn: {
    backgroundColor: "#1889da",
    flexDirection: "row",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  saveBtnText: { fontFamily: "Kanit_700Bold", color: "white", fontSize: 18 },
});

import { supabase } from "@/services/supabase";
import { Ionicons } from "@expo/vector-icons";
import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

  // สร้าง state สำหรับเก็บข้อมูลที่กรอก
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("เช้า"); // ค่าเริ่มต้นเป็น "เช้า"
  const [image, setImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);

  // ฟังก์ชันสำหรับเปิดกล้องถ่ายภาพหรือเลือกภาพจากแกลเลอรี่
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("ขออนุญาตเข้าถึงกล้องเพื่อถ่ายภาพหน่อยนะคะคนดี");
      return;
    }

    // เปิดกล้องถ่ายภาพ
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true, // เพิ่มตัวเลือกนี้เพื่อรับข้อมูลภาพในรูปแบบ Base64
    });

    // หลังจากถ่ายเสร็จแล้ว เอาไปกับ state ที่เตรียมไว้
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setBase64Image(result.assets[0].base64 || null); // เก็บข้อมูล Base64 ใน state แยกต่างหาก
    }
  };

  // ฟังก์ชันสำหรับบันทึกข้อมูลใช้ป้อน/เลือกไปไว้ที่ Supabase
  const handleSaveToSupabase = async () => {
    //Validation, location, distance, image
    if (!location || !distance || !image) {
      Alert.alert("คำเตือน", "กรุณากรอกข้อมูลให้ครบและเลือกรูปภาพด้วย");
      return;
    }

    //อัปโหลดรูปไปยัง Bucket -> Supabase -> Storage
    //ตัวแปรเก็บ url ของรูปที่อับโหลด
    let image_url = null; // ตัวแปรเก็บ URL ของรูปที่อัปโหลด
    const fileName = `img_${Date.now()}.jpg`; //ตั้งชื่อไฟล์ที่จะอัปโหลด
    const { error: uploadError } = await supabase.storage
      .from("run_bk")
      .upload(fileName, decode(base64Image!), {
        contentType: "image/jpeg",
      });

    if (uploadError) throw uploadError; //ตรวจสอบการอัปโหลดรูปภาพ

    //เอา url ของรูปที่ storage มากำหนดให้กับตัวแปรดเพื่อใช้บันทึกลงตาราง
    image_url = await supabase.storage.from("run_bk").getPublicUrl(fileName)
      .data.publicUrl;

    //บันทึกข้อมูลที่กรอกไปยัง Table -> Database -> Supabase==============
    const { error: insertError } = await supabase.from("runs").insert([
      {
        location: location,
        distance: distance,
        time_of_day: timeOfDay,
        run_date: new Date().toISOString().split("T")[0], // เอาแต่ ปี เดือน วัน ไม่เอาเวลา
        image_url: image_url,
      },
    ]);

    if (insertError) {
      Alert.alert(
        "เกิดข้อผิดพลาด",
        "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
      );
      return;
    }

    // ถ้าบันทึกสำเร็จแสดงข้อความแจ้ง และเปิดไปที่หน้า Run
    Alert.alert("สำเร็จ", "บันทึกข้อมูลเรียบร้อยแล้ว");
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* ช่องกรอกสถานที่วิ่ง */}
        <Text style={styles.titleShow}>สถานที่วิ่ง</Text>
        <TextInput
          placeholder="เช่น สวนลุมพินี"
          style={styles.inputValue}
          value={location}
          onChangeText={setLocation}
        />
        {/* ช่องกรอกระยะทาง */}
        <Text style={styles.titleShow}>ระยะทาง (กิโลเมตร)</Text>
        <TextInput
          placeholder="เช่น 5.0"
          keyboardType="numeric"
          style={styles.inputValue}
          value={distance}
          onChangeText={setDistance}
        />
        {/* ปุ่มเลือกช่วงเวลา */}
        <Text style={styles.titleShow}>ช่วงเวลา</Text>
        <View style={{ flexDirection: "row", marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => setTimeOfDay("เช้า")}
            style={[
              styles.todBtn,
              timeOfDay === "เช้า"
                ? { backgroundColor: "#1889da" }
                : { backgroundColor: "#b6b6b6" },
            ]}
          >
            <Text style={{ fontFamily: "Kanit_400Regular", color: "white" }}>
              เช้า
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTimeOfDay("เย็น")}
            style={[
              styles.todBtn,
              timeOfDay === "เย็น"
                ? { backgroundColor: "#1889da" }
                : { backgroundColor: "#b6b6b6" },
            ]}
          >
            <Text style={{ fontFamily: "Kanit_400Regular", color: "white" }}>
              เย็น
            </Text>
          </TouchableOpacity>
        </View>
        {/* ปุ่มถ่ายภาพ */}
        <Text style={styles.titleShow}>รูปภาพสถานที่</Text>
        <TouchableOpacity style={styles.takePhotoBtn} onPress={handleTakePhoto}>
          {image ? (
            <Image
              source={{ uri: image }}
              style={{ width: "100%", height: 200 }}
            />
          ) : (
            <View style={{ alignItems: "center" }}>
              <Ionicons name="camera" size={30} color="#b6b6b6" />
              <Text
                style={{ fontFamily: "Kanit_400Regular", color: "#b6b6b6" }}
              >
                กดเพื่อถ่ายภาพ
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ปุ่มบันทึก */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveToSupabase}>
          <Text style={{ fontFamily: "Kanit_700Bold", color: "white" }}>
            บันทึกข้อมูล
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  todBtn: {
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    paddingHorizontal: 20,
  },
  saveBtn: {
    backgroundColor: "#1889da",
    marginTop: 20,
    borderRadius: 8,
    alignItems: "center",
    padding: 15,
  },
  takePhotoBtn: {
    width: "100%",
    height: 200,
    backgroundColor: "#e6e6e6",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  titleShow: {
    fontFamily: "Kanit_700Bold",
    marginBottom: 10,
  },
  inputValue: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontFamily: "Kanit_400Regular",
    backgroundColor: "#EFEFEF",
  },
});

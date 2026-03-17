import { supabase } from "@/services/supabase";
import { RunsType } from "@/types/runtype";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

//เอารูปมา
const runimg = require("../assets/images/run.png");

export default function Run() {
  // สร้าง state เก็บข้อมูลทที่ดึงมาจาก Supabase
  const [runs, setRuns] = useState<RunsType[]>([]);

  // ฟังก์ชันสำหรับดึงข้อมูลจาก Supabase
  const fetchRuns = async () => {
    // 1. ดึงข้อมูล User ปัจจุบันที่ล็อกอินอยู่
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return; // ถ้าไม่มี user ให้หยุดทำงาน

    // 2. ดึงข้อมูลจากตาราง runs โดยเลือกเฉพาะอันที่มี user_id ตรงกับเรา
    const { data, error } = await supabase
      .from("runs")
      .select("*")
      .eq("user_id", user.id); // กรองข้อมูล

    //ตรวจสอบว่ามี error หรือไม่
    if (error) {
      Alert.alert("คำเตือน", "เกิดข้อผิดพลาดในการดึงข้อมูลจาก Supabase");
      return;
    }
    //กำหนดข้อมูลที่ดึงมาให้กับ state
    setRuns(data as RunsType[]);
  };

  // ฟังก์ชันสำหรับออกจากระบบ
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("ข้อผิดพลาด", "ไม่สามารถออกจากระบบได้");
    } else {
      router.replace("/login"); // ออกสำเร็จให้เด้งไปหน้า login
    }
  };

  //เรียกใช้ฟังก์ชันดึงข้อมูล
  useFocusEffect(
    useCallback(() => {
      fetchRuns();
    }, []),
  );

  //สร้างฟังก์ชั้นแสดงหน้าตาที่จะแสดงแต่ละรายการที่ FlastList
  const renderItem = ({ item }: { item: RunsType }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <Image source={{ uri: item.image_url }} style={styles.cardImage} />
        <View style={styles.distanceBadge}>
          <Text style={styles.locationText}>{item.location}</Text>
          <Text style={styles.dateText}>
            {(() => {
              const date = new Date(item.run_date);
              const buddhistYear = "พ.ศ. " + (date.getFullYear() + 543);
              return (
                new Intl.DateTimeFormat("th-TH", {
                  month: "long",
                  day: "numeric",
                }).format(date) +
                " " +
                buddhistYear
              );
            })()}
          </Text>
        </View>
        <Text style={styles.distanceText}>{item.distance} km</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* ปุ่ม Logout มุมขวาบน */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
      </TouchableOpacity>

      {/* รูปภาพ */}
      <Image source={runimg} style={styles.imglogo} />

      {/* ส่วนแสดงข้อมูลรายการการวิ่งที่ดึงมากจาก Supabase */}
      <FlatList
        data={runs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listPadding}
      />

      {/* ปุ่มแสดงไปหน้า add */}
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
  listPadding: {
    padding: 20,
    paddingBottom: 100, // เว้นที่ให้ FAB
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    // Shadow สำหรับ iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // Elevation สำหรับ Android
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 10,
  },
  locationText: {
    fontFamily: "Kanit_700Bold",
    fontSize: 18,
    color: "#333",
    marginBottom: 4,
  },
  dateText: {
    fontFamily: "Kanit_400Regular",
    fontSize: 14,
    color: "#888",
  },
  distanceText: {
    fontFamily: "Kanit_700Bold",
    fontSize: 14,
    color: "#007AFF",
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  distanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  imgShow: {
    width: 50,
    height: 50,
  },
  cardItem: {
    flex: 1,
    flexDirection: "row",
    margin: 5,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
  },
  imglogo: {
    width: 120,
    height: 120,
    marginTop: 40,
    margin: "auto",
  },
  container: {
    flex: 1,
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
  // สไตล์ปุ่ม Logout
  logoutBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
});

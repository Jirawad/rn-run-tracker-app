import { supabase } from "@/services/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// บรรทัดนี้จำเป็นเพื่อให้เบราว์เซอร์ปิดตัวลงเมื่อล็อกอินเสร็จ
WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const handleGoogleLogin = async () => {
    try {
      // 1. สร้าง URL สำหรับเด้งกลับมาที่ Expo Go
      const redirectUrl = Linking.createURL("/");

      // 2. เรียกการล็อกอินผ่าน OAuth (Google) ของ Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      // 3. เปิดหน้าต่างเบราว์เซอร์เพื่อให้ผู้ใช้เลือกบัญชี Google
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl,
      );

      // 4. ถ้าล็อกอินสำเร็จ ให้เปลี่ยนหน้าไปหน้า Run
      if (result.type === "success") {
        router.replace("/run");
      }
    } catch (error: any) {
      Alert.alert("เกิดข้อผิดพลาด", error.message || "ไม่สามารถเข้าสู่ระบบได้");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/run.png")}
        style={styles.imglogo}
      />

      <View style={styles.content}>
        <Text style={styles.title}>ยินดีต้อนรับ</Text>
        <Text style={styles.subtitle}>
          กรุณาเข้าสู่ระบบเพื่อบันทึกข้อมูลการวิ่ง
        </Text>

        <TouchableOpacity style={styles.loginBtn} onPress={handleGoogleLogin}>
          <Ionicons
            name="logo-google"
            size={24}
            color="#FFF"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.loginBtnText}>เข้าสู่ระบบด้วย Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
  },
  imglogo: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginBottom: 30,
  },
  content: {
    paddingHorizontal: 30,
    alignItems: "center",
  },
  title: {
    fontFamily: "Kanit_700Bold",
    fontSize: 28,
    color: "#333",
  },
  subtitle: {
    fontFamily: "Kanit_400Regular",
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginVertical: 10,
    marginBottom: 40,
  },
  loginBtn: {
    flexDirection: "row",
    backgroundColor: "#DB4437",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
    elevation: 3,
  },
  loginBtnText: {
    fontFamily: "Kanit_700Bold",
    color: "#FFF",
    fontSize: 18,
  },
});

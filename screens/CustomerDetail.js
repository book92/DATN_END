import React, { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, View, ScrollView } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";
import firestore from '@react-native-firebase/firestore';
import { deleteUserAccount, banUser, unbanUser } from '../store/index';

const BLUE_COLOR = '#0000CD';
const RED_COLOR = '#FF0000';
const ORANGE_COLOR = '#FFA500';
const GREEN_COLOR = '#4CAF50';

const CustomerDetail = ({ navigation, route }) => {
  const { fullname, email, phone, address, avatar, department } = route.params;
  const [newfullname, setFullname] = useState(fullname);
  const [newphone, setPhone] = useState(phone);
  const [newaddress, setAddress] = useState(address);
  const [newdepartment, setDepartment] = useState(department);
  const [departments, setDepartments] = useState([]);
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const snapshot = await firestore().collection("DEPARTMENTS").get();
        const deptList = snapshot.docs.map(doc => ({
          label: doc.data().name,
          value: doc.data().name,
        }));
        setDepartments(deptList);
      } catch (error) {
        console.log("Error fetching departments: ", error);
      }
    };
    fetchDepartments();

    const checkBanStatus = async () => {
      const userDoc = await firestore().collection("USERS").doc(email).get();
      setIsBanned(userDoc.data().banned || false);
    };
    checkBanStatus();
  }, []);

  const handleUpdate = async () => {
    try {
      await firestore().collection("USERS").doc(email).update({
        fullname: newfullname,
        department: newdepartment,
        phone: newphone,
        address: newaddress,
      });

      Alert.alert("Cập nhật thành công!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating profile: ", error);
      Alert.alert("Có lỗi xảy ra khi cập nhật!");
    }
  };

  const handleBan = () => {
    Alert.alert(
      "Xác nhận cấm",
      "Bạn có chắc chắn muốn cấm tài khoản này không?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Cấm", 
          onPress: async () => {
            try {
              await banUser(email);
              console.log(`Tài khoản ${email} đã bị cấm`);
              Alert.alert("Thông báo", "Tài khoản đã bị cấm thành công!");
              setIsBanned(true);
            } catch (error) {
              console.error("Error banning account: ", error);
              Alert.alert("Lỗi", "Có lỗi xảy ra khi cấm tài khoản. Vui lòng thử lại sau.");
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleUnban = () => {
    Alert.alert(
      "Xác nhận bỏ cấm",
      "Bạn có chắc chắn muốn bỏ cấm tài khoản này không?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Bỏ cấm", 
          onPress: async () => {
            try {
              await unbanUser(email);
              console.log(`Tài khoản ${email} đã được bỏ cấm`);
              Alert.alert("Thông báo", "Tài khoản đã được bỏ cấm thành công!");
              setIsBanned(false);
            } catch (error) {
              console.error("Lỗi Cấm Tài Khoản: ", error);
              Alert.alert("Lỗi", "Có lỗi xảy ra khi bỏ cấm tài khoản. Vui lòng thử lại sau.");
            }
          },
          style: "default"
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={avatar ? { uri: avatar } : require("../assets/user.png")}
            style={styles.icon}
          />
        </View>
        <TextInput
          label={"Họ và tên"}
          style={styles.input}
          value={newfullname}
          onChangeText={setFullname}
          theme={{ colors: { primary: BLUE_COLOR, text: 'black' } }}
          outlineColor={BLUE_COLOR}
          activeOutlineColor={BLUE_COLOR}
          mode="outlined"
          textColor="black"
        />
        <TextInput
          label={"Email"}
          style={[styles.input, styles.disabledInput]}
          value={email}
          editable={false}
          theme={{ colors: { primary: BLUE_COLOR, text: 'black' } }}
          outlineColor={BLUE_COLOR}
          activeOutlineColor={BLUE_COLOR}
          mode="outlined"
          textColor="black"
        />
        <TextInput
          label={"Số điện thoại"}
          style={styles.input}
          value={newphone}
          onChangeText={setPhone}
          theme={{ colors: { primary: BLUE_COLOR, text: 'black' } }}
          outlineColor={BLUE_COLOR}
          activeOutlineColor={BLUE_COLOR}
          mode="outlined"
          textColor="black"
        />
        <TextInput
          label={"Địa chỉ"}
          style={styles.input}
          value={newaddress}
          onChangeText={setAddress}
          theme={{ colors: { primary: BLUE_COLOR, text: 'black' } }}
          outlineColor={BLUE_COLOR}
          activeOutlineColor={BLUE_COLOR}
          mode="outlined"
          textColor="black"
        />
      </View>
      <View style={styles.dropdownContainer}>
        <Dropdown
          label="Chọn phòng"
          options={departments}
          value={newdepartment}
          onSelect={setDepartment}
          mode="outlined"
          theme={{ colors: { primary: BLUE_COLOR, text: 'black' } }}
          outlineColor={BLUE_COLOR}
          activeOutlineColor={BLUE_COLOR}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button mode="contained" style={styles.button} labelStyle={styles.buttonLabel} onPress={handleUpdate}>
          Cập nhật
        </Button>
        <Button 
          mode="contained" 
          style={styles.button} 
          labelStyle={styles.buttonLabel} 
          onPress={() => navigation.goBack()}
        >
          Trở về
        </Button>
        <Button 
          mode="contained" 
          style={styles.button} 
          labelStyle={styles.buttonLabel} 
          onPress={() => navigation.navigate("ChangePassword")}
        >
          Đổi mật khẩu
        </Button>
        {!isBanned ? (
          <Button mode="contained" style={styles.banButton} labelStyle={styles.buttonLabel} onPress={handleBan}>
            Cấm Tài Khoản
          </Button>
        ) : (
          <Button mode="contained" style={styles.unbanButton} labelStyle={styles.buttonLabel} onPress={handleUnban}>
            Bỏ Cấm Tài Khoản
          </Button>
        )}
      </View>
    </ScrollView>
  );
};

export default CustomerDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
    width: 150,
    height: 150,
    margin: 10,
  },
  icon: {
    width: 150,
    height: 150,
    borderWidth: 2,
    borderColor: BLUE_COLOR,
    borderRadius: 75,
  },
  input: {
    width: "90%",
    margin: 5,
    backgroundColor: "white",
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
  },
  dropdownContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: BLUE_COLOR,
    width: '100%',
    marginVertical: 5,
  },
  deleteButton: {
    backgroundColor: RED_COLOR,
    width: '100%',
    marginVertical: 5,
  },
  buttonLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
  banButton: {
    backgroundColor: ORANGE_COLOR,
    width: '100%',
    marginVertical: 5,
  },
  unbanButton: {
    backgroundColor: GREEN_COLOR,
    width: '100%',
    marginVertical: 5,
  },
});

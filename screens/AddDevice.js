import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { captureRef } from 'react-native-view-shot';
import { Dropdown } from 'react-native-paper-dropdown';
import { IconButton, Button } from 'react-native-paper';

const firebaseConfig = {
  apiKey: 'AIzaSyApBWUABXIusWxrlvdBt9ttvTd0uSISTQY',
  projectId: 'device-management-43211',
  storageBucket: 'device-management-43211.appspot.com',
  appId: 'com.device_management',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const BLUE_COLOR = '#0000CD';
const BLACK_COLOR = '#000000';
const WHITE_COLOR = '#FFFFFF';
const LIGHT_GRAY = '#F0F0F0';

const AddDevice = ({ route = { params: {} }, navigation }) => {
  const { departmentName } = route.params;
  const [deviceName, setDeviceName] = useState('');
  const [deviceUser, setDeviceUser] = useState('');
  const [deviceUserName, setDeviceUserName] = useState(''); // Thêm state mới cho tên người dùng
  const [deviceType, setDeviceType] = useState('');
  const [users, setUsers] = useState([]);
  const [deviceSpecs, setDeviceSpecs] = useState({});
  const [deviceNotes, setDeviceNotes] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [qrData, setQRData] = useState(null);
  const qrRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [editingSpec, setEditingSpec] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await firestore().collection("USERS").get();
        const userList = snapshot.docs.map(doc => ({
          label: `${doc.data().fullname} (${doc.data().email})`,
          value: doc.data().email,
          name: doc.data().fullname // Thêm tên người dùng vào object
        }));
        setUsers(userList);
      } catch (error) {
        console.log("Error fetching users: ", error);
      }
    };
    fetchUsers();
  }, [departmentName]);  

  useEffect(() => {
    const fetchDeviceTypes = async () => {
      const snapshot = await firestore().collection('DEVICETYPE').get();
      const types = snapshot.docs.map(doc => doc.data().name.toLowerCase());
      setDeviceTypes(types);
    };
    fetchDeviceTypes();
  }, []);

  const addNewDeviceType = async (newType) => {
    try {
      const normalizedType = newType.toLowerCase().trim();
      if (!deviceTypes.includes(normalizedType)) {
        await firestore().collection('DEVICETYPE').add({ name: newType });
        console.log('New device type added:', newType);
        setDeviceTypes(prevTypes => [...prevTypes, normalizedType]);
      } else {
        console.log('Device type already exists:', newType);
      }
    } catch (error) {
      console.error('Error adding new device type:', error);
    }
  };

  const handleDeviceTypeChange = (text) => {
    setDeviceType(text);
  };

  const handleAddSpecification = () => {
    if (newSpecKey && newSpecValue) {
      setDeviceSpecs((prevSpecs) => ({
        ...prevSpecs,
        [newSpecKey]: newSpecValue,
      }));
      setNewSpecKey('');
      setNewSpecValue('');
    } else {
      Alert.alert('Lỗi', 'Cả khóa và giá trị cho thông số kỹ thuật đều bắt buộc.');
    }
  };

  const handleEditSpecification = (key, value) => {
    setEditingSpec({ key, value });
    setNewSpecKey(key);
    setNewSpecValue(value);
  };

  const handleUpdateSpecification = () => {
    if (editingSpec && newSpecKey && newSpecValue) {
      setDeviceSpecs((prevSpecs) => {
        const updatedSpecs = { ...prevSpecs };
        delete updatedSpecs[editingSpec.key];
        updatedSpecs[newSpecKey] = newSpecValue;
        return updatedSpecs;
      });
      setEditingSpec(null);
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const handleRemoveSpecification = (key) => {
    setDeviceSpecs((prevSpecs) => {
      const updatedSpecs = { ...prevSpecs };
      delete updatedSpecs[key];
      return updatedSpecs;
    });
  };

  // Hàm mới để xử lý khi chọn người dùng
  const handleUserSelect = (email) => {
    setDeviceUser(email);
    const selectedUser = users.find(user => user.value === email);
    if (selectedUser) {
      setDeviceUserName(selectedUser.name);
    }
  };

  const handleGenerateQR = async () => {
    if (deviceName && deviceUser && deviceType && deviceNotes) {
      setLoading(true);
      try {
        // Check if a device with the same name already exists in the department
        const existingDeviceSnapshot = await firestore()
          .collection('DEVICES')
          .where('name', '==', deviceName)
          .where('departmentName', '==', departmentName)
          .get();

        if (!existingDeviceSnapshot.empty) {
          Alert.alert('Lỗi', 'Tên thiết bị đã tồn tại trong phòng này. Vui lòng nhập tên khác.');
          setLoading(false);
          return;
        }

        const deviceData = {
          name: deviceName,
          userEmail: deviceUser,
          user: deviceUserName,
          type: deviceType,
          specs: deviceSpecs,
          notes: deviceNotes,
          department: departmentName
        };
        const encodedData = encodeURIComponent(JSON.stringify(deviceData));
        const deviceInfoURL = `https://book92.github.io/Lab1_P1/diviceinfo.html?data=${encodedData}`;
        console.log("Generated URL:", deviceInfoURL);
        setQRData(deviceInfoURL);

        try {
          const uri = await captureRef(qrRef.current, {
            format: 'png',
            quality: 1.0
          });

          const refImage = storage().ref('/QR/' + deviceName + '_' + Date.now() + '.png');
          await refImage.putFile(uri);
          const link = await refImage.getDownloadURL();

          const docRef = await firestore().collection('DEVICES').add({
            name: deviceName,
            departmentName,
            userEmail: deviceUser,
            user:deviceUserName, // Thêm tên người dùng vào Firestore
            type: deviceType,
            specifications: deviceSpecs,
            note: deviceNotes,
            image: link
          });

          await docRef.update({ id: docRef.id });

          // Sau khi thiết bị đã được tạo thành công, thêm loại thiết bị mới vào DEVICETYPE
          await addNewDeviceType(deviceType);

          Alert.alert('Thông báo', 'Tạo thiết bị thành công');
          navigation.goBack();
        } catch (error) {
          console.error('Error saving device:', error);
          Alert.alert('Thông báo', 'Tạo mã QR thành công');
        }
      } catch (error) {
        console.error('Error generating QR:', error);
        Alert.alert('Lỗi', 'Có lỗi xảy ra khi tạo QR');
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Xác nhận hủy",
      "Bạn có muốn hủy tạo thiết bị?",
      [
        {
          text: "Hủy",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { 
          text: "Xác nhận", 
          onPress: () => navigation.goBack() 
        }
      ],
      { cancelable: false }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thêm thiết bị</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tên thiết bị</Text>
        <TextInput
          style={styles.input}
          value={deviceName}
          onChangeText={setDeviceName}
          placeholder="Nhập tên thiết bị"
          placeholderTextColor="#A9A9A9"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Người dùng</Text>
        <Dropdown
          options={users}
          value={deviceUser}
          onSelect={handleUserSelect} // Sử dụng hàm mới
          mode="outlined"
          style={styles.dropdown}
        />
      </View>

      {deviceUserName && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tên người dùng</Text>
          <Text style={styles.userNameText}>{deviceUserName}</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Loại thiết bị</Text>
        <TextInput
          style={styles.input}
          value={deviceType}
          onChangeText={handleDeviceTypeChange}
          placeholder="Nhập loại thiết bị"
          placeholderTextColor="#A9A9A9"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Thông số kỹ thuật</Text>
        {Object.entries(deviceSpecs).map(([key, value]) => (
          <View key={key} style={styles.specContainer}>
            <Text style={styles.specText}>{key}: {value}</Text>
            <View style={styles.specActionContainer}>
              <IconButton
                icon="pencil"
                size={20}
                color={BLUE_COLOR}
                onPress={() => handleEditSpecification(key, value)}
              />
              <IconButton
                icon="delete"
                size={20}
                color="#FF0000"
                onPress={() => handleRemoveSpecification(key)}
              />
            </View>
          </View>
        ))}
        <View style={styles.specInputContainer}>
          <TextInput
            style={styles.specInput}
            value={newSpecKey}
            onChangeText={setNewSpecKey}
            placeholder="Thông số"
            placeholderTextColor="#A9A9A9"
          />
          <TextInput
            style={styles.specInput}
            value={newSpecValue}
            onChangeText={setNewSpecValue}
            placeholder="Nhập thông số"
            placeholderTextColor="#A9A9A9"
          />
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={editingSpec ? handleUpdateSpecification : handleAddSpecification}
          >
            <Text style={styles.buttonText}>{editingSpec ? '✓' : '+'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Ghi chú</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={deviceNotes}
          onChangeText={setDeviceNotes}
          placeholder="Nhập ghi chú"
          placeholderTextColor="#A9A9A9"
          multiline
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={handleGenerateQR} 
          style={styles.button}
          labelStyle={styles.buttonText}
        >
          Tạo thiết bị
        </Button>
        <Button 
          mode="contained" 
          onPress={handleCancel}  // Thay đổi ở đây
          style={[styles.button, styles.cancelButton]}
          labelStyle={styles.buttonText}
        >
          Hủy
        </Button>
      </View>

      {loading && <ActivityIndicator size="large" color={BLUE_COLOR} />}
      {qrData && (
        <View style={styles.qrContainer} collapsable={false} ref={qrRef}>
          <Text style={styles.qrText}>Quét mã QR này:</Text>
          <QRCode value={qrData} size={200} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: WHITE_COLOR,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BLUE_COLOR,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: BLUE_COLOR,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: BLUE_COLOR,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    color: BLACK_COLOR,
  },
  dropdown: {
    marginBottom: 20,
  },
  specContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: LIGHT_GRAY,
    borderRadius: 5,
    marginBottom: 5,
  },
  specText: {
    fontSize: 14,
    color: BLACK_COLOR,
    flex: 1,
  },
  specActionContainer: {
    flexDirection: 'row',
  },
  specInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specInput: {
    flex: 1,
    height: 40,
    borderColor: BLUE_COLOR,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    color: BLACK_COLOR,
    marginRight: 5,
  },
  addButton: {
    backgroundColor: BLUE_COLOR,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 50,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: BLUE_COLOR,
  },
  cancelButton: {
    backgroundColor: '#FF6347',
  },
  buttonText: {
    color: WHITE_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
  },
  qrContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  qrText: {
    fontSize: 16,
    color: BLUE_COLOR,
    marginBottom: 10,
  },
  userNameText: {
    fontSize: 16,
    color: BLACK_COLOR,
    paddingVertical: 10,
  },
});

export default AddDevice;
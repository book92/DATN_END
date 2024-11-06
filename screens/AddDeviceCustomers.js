import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Button } from 'react-native-paper';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { captureRef } from 'react-native-view-shot';

const firebaseConfig = {
  apiKey: 'AIzaSyApBWUABXIusWxrlvdBt9ttvTd0uSISTQY',
  projectId: 'device-management-43211',
  storageBucket: 'device-management-43211.appspot.com',
  appId: 'com.device_management',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const AddDeviceUser = ({ route = { params: {} }, navigation }) => {
  const { departmentName, userName } = route.params;
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [deviceSpecs, setDeviceSpecs] = useState({});
  const [deviceNotes, setDeviceNotes] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [qrData, setQRData] = useState(null);
  const qrRef = useRef(null);
  const [loading, setLoading] = useState(false);

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

  const handleGenerateQR = async () => {
    if (deviceName && deviceType) {
      setLoading(true);
      const deviceData = {
        name: deviceName,
        user: userName,
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

        console.log('Saving device:', {
          name: deviceName,
          departmentName,
          user: userName,
          type: deviceType,
          specifications: deviceSpecs,
          note: deviceNotes,
          image: link
        });

        const docRef = await firestore().collection('DEVICES').add({
          name: deviceName,
          departmentName,
          user: userName,
          type: deviceType,
          specifications: deviceSpecs,
          note: deviceNotes,
          image: link
        });

        await docRef.update({ id: docRef.id });
        Alert.alert('Thêm thiết bị mới thành công');
        navigation.goBack();
      } catch (e) {
        console.error('Upload QR lỗi:', e);
        Alert.alert('Thông báo', 'Tạo QR thành công');
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert('Thông báo', 'Cần nhập hết các trường bắt buộc');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={{fontSize: 30, textAlign:'center', fontWeight: 'bold'}}>Thêm thiết bị</Text>
      <Text style={styles.label}>Tên thiết bị</Text>
      <TextInput
        style={styles.input}
        value={deviceName}
        onChangeText={setDeviceName}
        placeholder="Nhập tên thiết bị"
      />
      <Text style={styles.label}>Loại thiết bị</Text>
      <TextInput
        style={styles.input}
        value={deviceType}
        onChangeText={setDeviceType}
        placeholder="Nhập loại thiết bị"
      />
      <Text style={styles.label}>Thông số kỹ thuật</Text>
      {Object.keys(deviceSpecs).map((key) => (
        <View key={key} style={styles.specContainer}>
          <Text style={styles.specText}>{key}: {deviceSpecs[key]}</Text>
        </View>
      ))}
      <View style={styles.specInputContainer}>
        <TextInput
          style={styles.specInput}
          value={newSpecKey}
          onChangeText={setNewSpecKey}
          placeholder="Thông số"
        />
        <TextInput
          style={styles.specInput}
          value={newSpecValue}
          onChangeText={setNewSpecValue}
          placeholder="Nhập thông số"
        />
        <Button mode='contained' onPress={handleAddSpecification}>
          Thêm
        </Button>
      </View>
      <Text style={styles.label}>Ghi chú</Text>
      <TextInput
        style={styles.input}
        value={deviceNotes}
        onChangeText={setDeviceNotes}
        placeholder="Nhập ghi chú"
        multiline
      />
      <Button mode='contained' style={{marginBottom:10}} onPress={handleGenerateQR}>
        Tạo thiết bị
      </Button>
      <Button mode='contained' style={{marginBottom:40}} onPress={()=> navigation.goBack()}>
        Hủy
      </Button>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {qrData && (
        <View style={styles.qrContainer} collapsable={false} ref={qrRef}>
          <Text>Scan this QR code:</Text>
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
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    marginTop:10
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
  specContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  specText: {
    fontSize: 16,
  },
  specInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  specInput: {
    flex: 1,
    marginRight: 10,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  qrContainer: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddDeviceUser;
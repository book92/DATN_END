import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { Button, IconButton } from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';
import { captureRef } from 'react-native-view-shot';
import storage from '@react-native-firebase/storage';
import QRCode from 'react-native-qrcode-svg';
import { useMyContextController } from '../store';
import RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

const DeviceDetail = ({ route, navigation }) => {
  const { deviceId } = route.params;
  const [device, setDevice] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);  
  const [specifications, setSpecifications] = useState({});
  const [note, setNote] = useState('');
  const [QR, setQR] = useState('');
  const qrRef = useRef(null);
  const [qrValue, setQrValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [editingSpec, setEditingSpec] = useState(null);
  const [controller, dispatch] = useMyContextController();
  const { userLogin } = controller;

  useEffect(() => {
    if (deviceId) {
      fetchDepartments();
      fetchUsers();
      fetchDevice();
    }
  }, [deviceId]);

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

  const fetchUsers = async () => {
    try {
      const snapshot = await firestore().collection("USERS").get();
      const userList = snapshot.docs.map(doc => {
        const userData = doc.data();
        return {
          label: userData?.fullname || 'Unknown',
          value: userData?.fullname || 'Unknown',
        };
      }).filter(user => user.label !== 'Unknown');
      setUsers(userList);
    } catch (error) {
      console.log("Error fetching users: ", error);
    }
  };

  const fetchDevice = async () => {
    try {
      const doc = await firestore().collection('DEVICES').doc(deviceId).get();
      if (doc.exists) {
        const deviceData = doc.data();
        if (deviceData) {
          setDevice(deviceData);
          setName(deviceData.name || '');
          setType(deviceData.type || '');
          setDepartmentName(deviceData.departmentName || '');
          setSpecifications(deviceData.specifications || {});
          setNote(deviceData.note || '');
          setQR(deviceData.image || '');
          updateQRValue(deviceData);
        } else {
          console.log('Device data is null');
        }
      } else {
        console.log('Không có dữ liệu!');
      }
    } catch (error) {
      console.error('Error fetching device: ', error);
    }
  };

  const updateQRValue = (deviceData) => {
    const qrData = {
      id: deviceData.id,
      name: deviceData.name,
      user: deviceData.user,
      type: deviceData.type,
      specs: deviceData.specifications,
      notes: deviceData.note,
      department: deviceData.departmentName
    };
    const encodedData = encodeURIComponent(JSON.stringify(qrData));
    const qrUrl = `https://book92.github.io/Lab1_P1/diviceinfo.html?data=${encodedData}`;
    setQrValue(qrUrl);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const updatedDeviceData = {
        name,
        type,
        departmentName,
        specifications,
        note,
        // Ensure we keep the existing user
        user: device.user,
      };

      // Cập nhật thông tin thiết bị trong Firestore
      await firestore().collection('DEVICES').doc(deviceId).update(updatedDeviceData);

      // Tạo mã QR mới
      updateQRValue({ id: deviceId, ...updatedDeviceData });

      // Đợi một chút để đảm bảo QR code đã được cập nhật
      await new Promise(resolve => setTimeout(resolve, 100));

      // Chụp ảnh mã QR mới
      const uri = await captureRef(qrRef.current, {
        format: 'png',
        quality: 1.0,
      });

      // Lưu mã QR mới vào Firebase Storage
      const refImage = storage().ref(`/QR/${deviceId}_${Date.now()}.png`);
      await refImage.putFile(uri);
      const newQRLink = await refImage.getDownloadURL();

      // Cập nhật link mã QR mới vào Firestore
      await firestore().collection('DEVICES').doc(deviceId).update({
        image: newQRLink,
      });

      // Cập nhật state local
      setQR(newQRLink);
      setDevice({ ...updatedDeviceData, image: newQRLink });

      Alert.alert('Thông báo', 'Cập nhật thnh công');
      setIsEditing(false);
    } catch (error) {
      console.error('Lỗi cập nhật: ', error);
      Alert.alert('Thông báo', 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Thông báo',
      'Bạn có muốn hủy các thay đổi?',
      [
        {
          text: 'Hủy',
          onPress: () => console.log('Hủy pressed'),
          style: 'cancel',
        },
        {
          text: 'Xác nhận',
          onPress: () => {
            setIsEditing(false);
            fetchDevice();
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleAddSpecification = () => {
    if (newSpecKey && newSpecValue) {
      setSpecifications(prevSpecs => ({
        ...prevSpecs,
        [newSpecKey]: newSpecValue,
      }));
      setNewSpecKey('');
      setNewSpecValue('');
    } else {
      Alert.alert('Lỗi', 'Cả khóa và giá trị cho thông số kỹ thuật đều bắt buộc.');
    }
  };

  const handleEditSpecification = (oldKey, oldValue) => {
    setEditingSpec({ oldKey, key: oldKey, value: oldValue });
  };

  const handleUpdateSpecification = () => {
    if (editingSpec) {
      setSpecifications(prevSpecs => {
        const newSpecs = { ...prevSpecs };
        if (editingSpec.oldKey !== editingSpec.key) {
          delete newSpecs[editingSpec.oldKey];
        }
        newSpecs[editingSpec.key] = editingSpec.value;
        return newSpecs;
      });
      setEditingSpec(null);
    }
  };

  const handleRemoveSpecification = (key) => {
    setSpecifications(prevSpecs => {
      const newSpecs = { ...prevSpecs };
      delete newSpecs[key];
      return newSpecs;
    });
  };

  const requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Quyền truy cập bộ nhớ",
          message: "Ứng dụng cần quyền truy cập bộ nhớ để lưu file Excel.",
          buttonNeutral: "Hỏi lại sau",
          buttonNegative: "Từ chối",
          buttonPositive: "Đồng ý"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Quyền truy cập bộ nhớ được cấp");
        return true;
      } else {
        console.log("Quyền truy cập bộ nhớ bị từ chối");
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const exportQRToPDF = async () => {
    try {
      console.log('Starting PDF export...');

      const base64Image = await captureRef(qrRef, {
        format: 'png',
        quality: 0.8,
      });

      const htmlContent = `
        <h1>${device.name}</h1>
        <img src="${base64Image}" alt="QR Code" />
      `;

      const fileName = `${device.name.replace(/\s+/g, '_')}_${departmentName.replace(/\s+/g, '_')}`;

      const options = {
        html: htmlContent,
        fileName: fileName,
        directory: RNFS.DownloadDirectoryPath,
      };

      const file = await RNHTMLtoPDF.convert(options);
      const filePath = `${RNFS.DownloadDirectoryPath}/${fileName}.pdf`;

      await RNFS.moveFile(file.filePath, filePath);

      console.log('File saved successfully:', filePath);
      Alert.alert('Thành công', `File đã được lưu vào: ${filePath}`);

    } catch (error) {
      console.error('Error in PDF export:', error);
      Alert.alert('Lỗi', `Không thể xuất file PDF: ${error.message}`);
    }
  };

  const confirmExport = () => {
    Alert.alert(
      'Xuất PDF',
      'Bạn muốn xuất mã QR thành file PDF?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xác nhận', onPress: exportQRToPDF },
      ],
      { cancelable: true }
    );
  };

  if (!device) {
    return <Text>Đang tải...</Text>;
  }


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{isEditing ? 'Cập nhật thiết bị' : 'Chi tiết thiết bị'}</Text>
      {device && (
        <>
          <Text style={styles.label}>Tên thiết bị:</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { color: '#0000FF' }]}
              value={name}
              onChangeText={setName}
            />
          ) : (
            <Text style={[styles.value, { color: '#0000FF' }]}>{device.name}</Text>
          )}
          <Text style={styles.label}>Loại thiết bị:</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { color: '#0000FF' }]}
              value={type}
              onChangeText={setType}
              editable={false}
            />
          ) : (
            <Text style={[styles.value, { color: '#0000FF' }]}>{device.type}</Text>
          )}
          <Text style={styles.label}>Phòng:</Text>
          {isEditing ? (
            <Dropdown
              options={departments}
              value={departmentName}
              onSelect={setDepartmentName}
              mode="outlined"
              style={{ color: '#0000FF' }}
            />
          ) : (
            <Text style={[styles.value, { color: '#0000FF' }]}>{departmentName || 'No department assigned'}</Text>
          )}
          <Text style={styles.label}>Người dùng:</Text>
          <Text style={[styles.value, { color: '#0000FF' }]}>{device.user || 'Chưa được gán'}</Text>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Thông số kỹ thuật:</Text>
            <View style={styles.specificationsContainer}>
              {Object.entries(specifications).map(([key, value]) => (
                <View key={key} style={styles.specificationItem}>
                  {editingSpec && editingSpec.oldKey === key ? (
                    <View style={styles.editSpecContainer}>
                      <TextInput
                        style={[styles.input, { flex: 1, marginRight: 5 }]}
                        value={editingSpec.key}
                        onChangeText={(text) => setEditingSpec({ ...editingSpec, key: text })}
                        placeholder="Thông số"
                      />
                      <TextInput
                        style={[styles.input, { flex: 1, marginRight: 5 }]}
                        value={editingSpec.value}
                        onChangeText={(text) => setEditingSpec({ ...editingSpec, value: text })}
                        placeholder="Giá trị"
                      />
                      <IconButton
                        icon="check"
                        color="#0000FF"
                        size={20}
                        onPress={handleUpdateSpecification}
                      />
                    </View>
                  ) : (
                    <>
                      <Text style={[styles.specificationKey, { color: '#0000FF' }]}>{key}:</Text>
                      <Text style={[styles.specificationValue, { color: '#0000FF' }]}>{value}</Text>
                      {isEditing && (
                        <View style={styles.specActionContainer}>
                          <IconButton
                            icon="pencil"
                            color="#0000FF"
                            size={20}
                            onPress={() => handleEditSpecification(key, value)}
                          />
                          <IconButton
                            icon="delete"
                            color="#FF0000"
                            size={20}
                            onPress={() => handleRemoveSpecification(key)}
                          />
                        </View>
                      )}
                    </>
                  )}
                </View>
              ))}
            </View>
            {isEditing && (
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
                  onPress={handleAddSpecification}
                >
                  <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <Text style={styles.label}>Ghi chú:</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.multilineInput, { color: '#0000FF' }]}
              value={note}
              onChangeText={setNote}
              multiline
            />
          ) : (
            <Text style={[styles.value, { color: '#0000FF' }]}>{device.note}</Text>
          )}
          <Text style={styles.label}>QR:</Text>
          <View style={styles.qrSection}>
            <View ref={qrRef} collapsable={false} style={styles.qrContainer}>
              <QRCode value={qrValue || ' '} size={200} />
            </View>
            <TouchableOpacity style={styles.exportButton} onPress={confirmExport}>
              <Text style={styles.exportButtonText}>Xuất PDF</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            {isEditing ? (
              <>
                <Button 
                  mode="contained" 
                  onPress={handleSave} 
                  style={styles.button}
                  labelStyle={styles.buttonText}
                >
                  Lưu
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handleCancel} 
                  style={[styles.button, styles.cancelButton]}
                  labelStyle={styles.buttonText}
                >
                  Hủy
                </Button>
              </>
            ) : (
              <>
                <Button 
                  mode="contained" 
                  onPress={() => setIsEditing(true)} 
                  style={styles.button}
                  labelStyle={styles.buttonText}
                >
                  Cập nhật
                </Button>
                <Button 
                  mode='contained' 
                  style={styles.button} 
                  labelStyle={styles.buttonText}
                  onPress={() => navigation.navigate("Error", {device})}
                >
                  Báo lỗi
                </Button>
              </>
            )}
          </View>
          {!isEditing && (
            <View style={styles.backButtonContainer}>
              <Button 
                mode='contained' 
                style={styles.backButton} 
                labelStyle={styles.buttonText}
                onPress={() => navigation.navigate("MyDevices", {departmentName})}
              >
                Trở về
              </Button>
            </View>
          )}
          {loading && <ActivityIndicator size="large" color="#0000FF" />}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign:'center',
    color:"#0000CD"
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#0000FF',
  },
  value: {
    fontSize: 16,
    marginVertical: 5,
    color: '#0000FF',
  },
  exportButton: {
    backgroundColor: '#0000CD',
    padding: 10,
    borderRadius: 5,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    color: '#0000FF',
  },
  multilineInput: {
    height: 100,
  },
  specificationsContainer: {
    marginVertical: 10,
  },
  specificationContainer: {
    marginBottom: 5,
    marginTop: 5,
    marginStart:10
  },
  specificationLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#0000FF',
  },
  specificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  specActionContainer: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  editSpecContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  specificationKey: {
    fontWeight: 'bold',
    marginRight: 10,
    color: '#0000FF',
  },
  specificationValue: {
    flex: 1,
    color: '#0000FF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20, // Reduced bottom margin
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#0000CD',
    paddingHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#FF6347',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: "white",
    textAlign: 'center',
  },
  qrSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  qrContainer: {
    // Remove alignItems: 'center' if it exists
  },
  exportButton: {
    backgroundColor: '#0000CD',
    padding: 10,
    borderRadius: 5,
  },
  exportButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  specInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  specInput: {
    flex: 1,
    height: 40,
    borderColor: '#0000CD',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    color: '#000000',
    marginRight: 5,
  },
  addButton: {
    backgroundColor: '#0000CD',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonContainer: {
    alignItems: 'center',
    marginBottom: 50, // Add margin at the bottom
  },
  backButton: {
    backgroundColor: '#0000CD',
    paddingHorizontal: 20, // Increased horizontal padding
    width: '50%', // Set width to 50% of the container
  },
});

export default DeviceDetail;

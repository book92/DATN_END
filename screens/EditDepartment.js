import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';

const BLUE_COLOR = '#0000CD';

const EditDepartment = ({ route, navigation }) => {
  const { id } = route.params;
  const [name, setName] = useState('');
  const [originalName, setOriginalName] = useState('');

  useEffect(() => {
    const fetchDepartment = async () => {
      const departmentRef = firestore().collection('DEPARTMENTS').doc(id);
      const doc = await departmentRef.get();
      if (doc.exists) {
        const departmentData = doc.data();
        setName(departmentData.name);
        setOriginalName(departmentData.name);
      }
    };

    fetchDepartment();
  }, [id]);

  const handleSave = async () => {
    if (name !== originalName) {
      Alert.alert(
        'Xác nhận thay đổi',
        'Các thiết bị có trong phòng cũng sẽ thay đổi theo phòng. Bạn có muốn tiếp tục?',
        [
          {
            text: 'Hủy',
            style: 'cancel'
          },
          {
            text: 'Xác nhận',
            onPress: async () => {
              try {
                const departmentRef = firestore().collection('DEPARTMENTS').doc(id);
                await departmentRef.update({ name });

                // Cập nhật tên phòng cho tất cả các thiết bị trong phòng
                const devicesRef = firestore().collection('DEVICES');
                const devicesSnapshot = await devicesRef.where('departmentName', '==', originalName).get();
                
                const batch = firestore().batch();
                devicesSnapshot.forEach(doc => {
                  batch.update(doc.ref, { departmentName: name });
                });
                await batch.commit();

                Alert.alert('Thông báo', 'Cập nhật phòng thành công');
                navigation.goBack();
              } catch (error) {
                console.error('Error updating department:', error);
                Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật phòng');
              }
            }
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cập nhật phòng</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholderTextColor={BLUE_COLOR}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Lưu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.backButton]} onPress={handleGoBack}>
          <Text style={styles.buttonText}>Trở về</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: BLUE_COLOR,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: BLUE_COLOR,
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
    color: BLUE_COLOR,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: BLUE_COLOR,
    padding: 15,
    borderRadius: 5,
    width: '45%',
  },
  backButton: {
    backgroundColor: BLUE_COLOR,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default EditDepartment;

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';

const BLUE_COLOR = '#0000CD';

const AddDepartment = ({ navigation }) => {
  const [name, setName] = useState('');

  const handleAdd = async () => {
    if (name.trim() === '') {
      Alert.alert('Thông báo', 'Vui lòng nhập tên phòng');
      return;
    }
    try {
      // Kiểm tra xem tên phòng đã tồn tại chưa
      const departmentSnapshot = await firestore()
        .collection('DEPARTMENTS')
        .where('name', '==', name.trim())
        .get();

      if (!departmentSnapshot.empty) {
        Alert.alert('Thông báo', 'Tên phòng đã tồn tại');
        return;
      }

      // Nếu tên chưa tồn tại, thêm mới
      await firestore().collection('DEPARTMENTS').add({ name: name.trim() });
      Alert.alert('Thông báo', 'Thêm phòng thành công');
      setName('');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding department:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi thêm phòng');
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thêm một phòng mới</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Nhập tên phòng"
        placeholderTextColor={BLUE_COLOR}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleAdd}>
          <Text style={styles.buttonText}>Thêm phòng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.backButton]} onPress={handleGoBack}>
          <Text style={styles.buttonText}>Hủy</Text>
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

export default AddDepartment;

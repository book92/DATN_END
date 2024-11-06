import React, { useEffect, useState } from 'react';
import { FlatList, View, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { IconButton, Text, Searchbar } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import Routercustomers from "../routers/RouterCustomers"
const BLUE_COLOR = '#0000CD';

const Department = ({ name, onPress, onEdit, onDelete }) => (
  <View style={styles.departmentContainer}>
    <TouchableOpacity onPress={onPress} style={{ flex: 1 }}>
      <Text style={styles.departmentName}>{name}</Text>
    </TouchableOpacity>
    <IconButton
      icon="pencil"
      style={styles.iconButton}
      size={24}
      onPress={onEdit}
      color={BLUE_COLOR}
    />
    <IconButton
      icon="delete"
      style={styles.iconButton}
      size={24}
      onPress={onDelete}
      color={BLUE_COLOR}
    />
  </View>
);

const Departments = ({ navigation }) => {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const DEPARTMENTS = firestore().collection('DEPARTMENTS');
  const DEVICES = firestore().collection('DEVICES');
  const USERS = firestore().collection('USERS');

  useEffect(() => {
    const unsubscribe = DEPARTMENTS.onSnapshot((querySnapshot) => {
      const departmentlist = [];
      querySnapshot.forEach((doc) => {
        const { name } = doc.data();
        departmentlist.push({
          id: doc.id,
          name,
        });
      });
      setDepartments(departmentlist);
      setFilteredDepartments(departmentlist);
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = departments.filter(department =>
      department.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredDepartments(filtered);
  };

  const handleEdit = (id) => {
    navigation.navigate('EditDepartment', { id });
  };

  const handleDelete = async (id, name) => {
    try {
      // Kiểm tra xem có thiết bị nào trong phòng không
      const devicesSnapshot = await DEVICES.where('departmentName', '==', name).get();
      if (!devicesSnapshot.empty) {
        Alert.alert('Thông báo', 'Vui lòng xóa thiết bị còn lại trong phòng');
        return;
      }

      // Kiểm tra xem có người dùng nào trong phòng không
      const usersSnapshot = await USERS.where('departmentName', '==', name).get();
      if (!usersSnapshot.empty) {
        Alert.alert('Thông báo', 'Còn người dùng trong phòng này');
        return;
      }

      Alert.alert(
        'Xóa phòng',
        'Bạn chắc chắn muốn xóa phòng này chứ?',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: async () => {
              try {
                await DEPARTMENTS.doc(id).delete();
                Alert.alert('Thông báo', 'Xóa phòng thành công');
              } catch (error) {
                console.error('Error deleting department:', error);
                Alert.alert('Thông báo', 'Xóa phòng thất bại');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error checking devices or users:', error);
      Alert.alert('Thông báo', 'Có lỗi xảy ra khi kiểm tra thiết bị hoặc người dùng');
    }
  };

  const handleSelectDepartment = (name, id) => {
    Alert.alert(
      "Chọn hành động",
      "",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Xem thiết bị theo phòng",
          onPress: () => navigation.navigate('Devices', { departmentName: name, departmentId: id })
        },
        {
          text: "Xem người dùng theo phòng",
          onPress: () => navigation.navigate('DepartmentCustomers', { departmentName: name, departmentId: id})
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Thêm phòng mới
        </Text>
        <IconButton
          icon="plus-circle"
          iconColor={BLUE_COLOR}
          size={35}
          onPress={() => navigation.navigate('AddDepartment')}
        />
      </View>
      <Searchbar
        placeholder="Tìm kiếm phòng"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchBarInput}
        iconColor={BLUE_COLOR}
        placeholderTextColor={BLUE_COLOR}
        theme={{ colors: { primary: BLUE_COLOR } }}
      />
      <FlatList
        data={filteredDepartments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Department
            name={item.name}
            onPress={() => handleSelectDepartment(item.name, item.id)}
            onEdit={() => handleEdit(item.id)}
            onDelete={() => handleDelete(item.id, item.name)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    marginLeft: 6,
    color: BLUE_COLOR,
  },
  departmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: BLUE_COLOR,
    padding: 15,
    margin: 10,
  },
  departmentName: {
    fontSize: 20,
    color: BLUE_COLOR,
  },
  iconButton: {
    borderWidth: 1,
    borderColor: BLUE_COLOR,
  },
  searchBar: {
    marginBottom: 10,
    marginHorizontal: 10,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: BLUE_COLOR,
  },
  searchBarInput: {
    color: BLUE_COLOR,
  },
});

export default Departments;
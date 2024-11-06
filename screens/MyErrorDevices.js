import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore'; 
import { useMyContextController } from '../store';
import { IconButton, Searchbar } from 'react-native-paper';

const BLUE_COLOR = '#0000CD';

const Device = ({ name, state, fixday, onPress }) => (
    <View style={styles.deviceContainer}>
      <TouchableOpacity onPress={onPress} style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{name}</Text>
        <Text style={styles.deviceStatus}>
          {state === "Fixed" ? `Đã sửa: ${fixday}` :  "Đã tiếp nhận"}
        </Text>
      </TouchableOpacity>
      <IconButton
        icon={state === "Fixed" ? "check-circle" : "close-circle"}
        color={state === "Fixed" ? "green" : "red"}
        size={24}
      />
    </View>
);

const MyErrorDevices = () => {
  const [errors, setErrors] = useState([]);
  const [filteredErrors, setFilteredErrors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [controller] = useMyContextController();
  const { userLogin } = controller;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchErrorDevices = async () => {
      if (userLogin && userLogin.email) {
        const errorRef = firestore().collection('ERROR');
        const unsubscribe = errorRef
          .where('userreport', '==', userLogin.email)
          .onSnapshot(snapshot => {
            const errorList = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            console.log('Fetched error devices:', errorList);
            setErrors(errorList);
            setFilteredErrors(errorList);
          }, error => {
            console.error("Error fetching error devices: ", error);
          });

        return () => unsubscribe();
      }
    };

    fetchErrorDevices();
  }, [userLogin]);

  const handleSelectErrorDevice = (item) => {
    navigation.navigate('MyErrorDeviceDetail', { item });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = errors.filter(item => 
      item.deviceName.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredErrors(filtered);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thiết bị đã báo lỗi</Text>
      <Searchbar
        placeholder="Tìm kiếm thiết bị..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchBarInput}
        iconColor={BLUE_COLOR}
        placeholderTextColor={BLUE_COLOR}
        theme={{ colors: { primary: BLUE_COLOR } }}
      />
      {filteredErrors.length > 0 ? (
        <FlatList
          data={filteredErrors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Device
              name={item.deviceName}
              state={item.state}
              fixday={item.fixday}
              onPress={() => handleSelectErrorDevice(item)}
            />
          )}
        />
      ) : (
        <Text style={styles.noDevicesText}>Không có thiết bị lỗi nào được báo cáo.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  searchBarInput: {
    color: BLUE_COLOR,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: BLUE_COLOR, 
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    
  },
  searchBar: {
    marginBottom: 10,
    marginHorizontal: 10,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: BLUE_COLOR,
  },
  deviceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BLUE_COLOR,
  },
  deviceStatus: {
    fontSize: 14,
    color: BLUE_COLOR, 
    marginTop: 5,
  },
  noDevicesText: {
    fontSize: 16,
    color: BLUE_COLOR,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default MyErrorDevices;
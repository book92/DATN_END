import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { IconButton, Searchbar } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';

const BLUE_COLOR = '#0000CD';

const Device = ({ name, state, dayfix, onPress }) => (
  <View style={styles.deviceContainer}>
    <TouchableOpacity onPress={onPress} style={styles.deviceInfo}>
      <Text style={styles.deviceName}>{name}</Text>
      <Text style={styles.deviceStatus}>
        {state === "Đã sửa" ? `Đã sửa: ${dayfix}` : "Đã tiếp nhận"}
      </Text>
    </TouchableOpacity>
    <IconButton
      icon={state === "Đã sửa" ? "check-circle" : "close-circle"}
      color={state === "Đã sửa" ? "green" : "red"}
      size={24}
    />
  </View>
);

const ErrorDevices = () => {
  const [errordevices, setErrordevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const { devices = [] } = route.params; // Provide a default empty array
  const ERROR = firestore().collection('ERROR');

  useEffect(() => {
    const unsubscribe = ERROR.onSnapshot((querySnapshot) => {
      const errorDevicelist = [];
      querySnapshot.forEach((doc) => {
        const { deviceName, description, fixday, reportday, state, userreport } = doc.data();
        errorDevicelist.push({
          id: doc.id,
          deviceName,
          description,
          fixday,
          reportday,
          state,
          userreport,
        });
      });

      // Filter errors for the selected devices
      const filteredErrors = errorDevicelist.filter(errorDevice =>
        devices.some(device => device.name === errorDevice.deviceName)
      );

      setErrordevices(filteredErrors);
      setFilteredDevices(filteredErrors);
    });
    return () => unsubscribe();
  }, [devices]);

  const handleSelectErrorDevice = (item) => {
    navigation.navigate('ErrorDeviceDetail', { item });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = errordevices.filter(item => 
      item.deviceName.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredDevices(filtered);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách thiết bị lỗi</Text>
      <Searchbar
        placeholder="Tìm kiếm thiết bị"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchBarInput}
        iconColor={BLUE_COLOR}
        placeholderTextColor={BLUE_COLOR}
        theme={{ colors: { primary: BLUE_COLOR } }}
        textColor={BLUE_COLOR}
      />
      <FlatList
        data={filteredDevices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Device
            name={item.deviceName}
            state={item.state}
            dayfix={item.fixday}
            onPress={() => handleSelectErrorDevice(item)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: BLUE_COLOR,
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
  deviceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: BLUE_COLOR,
    padding: 15,
    margin: 10,
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
});

export default ErrorDevices;

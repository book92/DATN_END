import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { IconButton, Searchbar } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const BLUE_COLOR = '#0000CD';

const ErrorDeviceItem = ({ name, onPress }) => (
  <View style={styles.deviceContainer}>
    <TouchableOpacity onPress={onPress} style={styles.deviceInfo}>
      <Text style={styles.deviceName}>{name}</Text>
    </TouchableOpacity>
    <IconButton
      icon="chevron-right"
      color={BLUE_COLOR}
      size={24}
    />
  </View>
);

const ListErrorDevices = () => {
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();
  const ERROR = firestore().collection('ERROR');

  useEffect(() => {
    const unsubscribe = ERROR.onSnapshot((querySnapshot) => {
      const errorDeviceMap = {};
      querySnapshot.forEach((doc) => {
        const { deviceName } = doc.data();
        if (!errorDeviceMap[deviceName]) {
          errorDeviceMap[deviceName] = [];
        }
        errorDeviceMap[deviceName].push({
          id: doc.id,
          name: deviceName,
        });
      });
      const deviceList = Object.keys(errorDeviceMap).map(name => ({
        name,
        devices: errorDeviceMap[name],
      }));
      setDevices(deviceList);
      setFilteredDevices(deviceList);
    });
    return () => unsubscribe();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = devices.filter(deviceGroup =>
      deviceGroup.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredDevices(filtered);
  };

  const handleSelectDeviceGroup = (deviceGroup) => {
    navigation.navigate('ErrorDevices', { devices: deviceGroup.devices });
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
      />
      <FlatList
        data={filteredDevices}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <ErrorDeviceItem
            name={item.name}
            onPress={() => handleSelectDeviceGroup(item)}
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
});

export default ListErrorDevices;

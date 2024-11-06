import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView } from 'react-native';
import { Divider, IconButton, Button, Searchbar } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';

const BLUE_COLOR = '#0000CD';

const Devices = ({ navigation, route }) => {
  const { departmentId, departmentName } = route.params;
  const [devices, setDevices] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDevices, setFilteredDevices] = useState({});

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('DEVICES')
      .where('departmentName', '==', departmentName)
      .onSnapshot(
        (querySnapshot) => {
          const deviceList = {};
          querySnapshot.forEach((doc) => {
            const { name, type } = doc.data();
            if (!deviceList[type]) {
              deviceList[type] = [];
            }
            deviceList[type].push({ id: doc.id, name });
          });

          setDevices(deviceList);
          setFilteredDevices(deviceList);
        },
        (error) => {
          console.error('Error fetching devices: ', error);
        }
      );

    return () => unsubscribe();
  }, [departmentId]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredDevices(devices);
    } else {
      const filtered = {};
      Object.keys(devices).forEach((type) => {
        const filteredDevices = devices[type].filter((device) =>
          device.name.toLowerCase().includes(query.toLowerCase())
        );
        if (filteredDevices.length > 0) {
          filtered[type] = filteredDevices;
        }
      });
      setFilteredDevices(filtered);
    }
  };

  const handleSelectDevice = (id) => {
    navigation.navigate('DeviceDetail', { deviceId: id, departmentName });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            Thiết bị thuộc phòng {departmentName}
          </Text>
          <IconButton
            icon="plus-circle"
            iconColor={BLUE_COLOR}
            size={35}
            onPress={() => navigation.navigate('AddDevice', { departmentName })}
          />
        </View>
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
        {Object.keys(filteredDevices).length === 0 ? (
          <Text style={styles.noDeviceText}>Không tìm thấy thiết bị</Text>
        ) : (
          Object.keys(filteredDevices).map((type) => (
            <View key={type} style={styles.deviceTypeContainer}>
              <Text style={styles.deviceTypeTitle}>{type}</Text>
              <Divider bold style={styles.divider} />
              <FlatList
                data={filteredDevices[type]}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                  <View>
                    <Text
                      style={styles.deviceName}
                      onPress={() => handleSelectDevice(item.id)}
                    >
                      {item.name}
                    </Text>
                    {index < filteredDevices[type].length - 1 && <Divider bold style={styles.itemDivider} />}
                  </View>
                )}
              />
            </View>
          ))
        )}
        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={handleGoBack}
            style={styles.button}
            labelStyle={styles.buttonText}
          >
            Trở về
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    color: BLUE_COLOR,
    flex: 1,
    marginRight: 10,
  },
  deviceTypeContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#E6E6FA',
  },
  deviceTypeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: BLUE_COLOR,
  },
  divider: {
    backgroundColor: BLUE_COLOR,
  },
  itemDivider: {
    backgroundColor: BLUE_COLOR,
  },
  deviceName: {
    fontSize: 16,
    marginLeft: 10,
    marginBottom: 10,
    marginTop: 10,
    color: BLUE_COLOR,
  },
  noDeviceText: {
    color: BLUE_COLOR,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: BLUE_COLOR,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchBar: {
    marginBottom: 10,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: BLUE_COLOR,
  },
  searchBarInput: {
    color: BLUE_COLOR,
  },
});

export default Devices;
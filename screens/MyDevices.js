import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore'; 
import { useMyContextController } from '../store';
import { Searchbar } from 'react-native-paper'; // Import Searchbar

const BLUE_COLOR = '#0000CD';

const MyDevices = ({route}) => {
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [controller, dispatch] = useMyContextController();
  const {userLogin} = controller;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        if (!userLogin || !userLogin.email) {
          console.error("User email not available");
          navigation.navigate("Login");
          return;
        }

        const devicesRef = firestore().collection('DEVICES');
        const snapshot = await devicesRef.where('userEmail', '==', userLogin.email).get();
        
        const devicesList = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
        }));
        
        setDevices(devicesList);
        setFilteredDevices(devicesList);
      } catch (error) {
        console.error("Error fetching devices: ", error);
      }
    };

    fetchDevices();
  }, [userLogin, navigation]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredDevices(devices);
    } else {
      const filtered = devices.filter(device => 
        device.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredDevices(filtered);
    }
  };

  const renderItem = ({ item, index }) => {
    const onPressItem = () => {
      navigation.navigate('MyDetailDevices', { deviceId: item.id });
    };

    return (
      <TouchableOpacity style={[styles.item, index !== 0 && { marginTop: 10 }]} onPress={onPressItem}>
        <View style={styles.iconContainer}>
          <Icon name="desktop" size={24} color="#000" />
        </View>
        <Text style={styles.title}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={{fontSize:25, fontWeight:'bold', textAlign:'center', color:"blue"}}>Danh sách thiết bị của tôi</Text>
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
      <FlatList
        data={filteredDevices}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 10 }}
      />
      <Text style={styles.contactText}>Liên hệ Admin để thêm thiết bị</Text>
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  searchBar: {
    margin: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: BLUE_COLOR,
    
  },
  searchBarInput: {
    color: BLUE_COLOR,

  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginHorizontal: 20,
  },
  iconContainer: {
    backgroundColor: '#e0e0e0',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginLeft: 10,
    fontSize: 18,
    color: "blue"
  },
  contactText: {
    fontSize: 16,
    textAlign: 'center',
    color: BLUE_COLOR,
    marginVertical: 10, // Add some vertical margin for spacing
  },
});

export default MyDevices;
import React, { useEffect, useState } from 'react';
import { FlatList, View, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';

const BLUE_COLOR = '#0000CD';

const CustomerItem = ({ avatar, fullname, phone, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.customerItem}>
    <Image
      source={avatar ? {uri: avatar} : require('../assets/user.png')}
      style={styles.avatar}
    />
    <View style={styles.textContainer}>
      <Text style={styles.customerName}>{fullname}</Text>
      <Text style={styles.customerPhone}>{phone}</Text>
    </View>
  </TouchableOpacity>
);

const Customers = ({ navigation }) => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const USERS = firestore().collection('USERS');

  useEffect(() => {
    const unsubscribe = USERS.onSnapshot((querySnapshot) => {
      const customerList = [];
      querySnapshot.forEach((doc) => {
        console.log("User data:", doc.data());  // Log dữ liệu của mỗi user
        const { fullname, email, phone, role, address, avatar, department } = doc.data();
        if (role === 'user') {
          customerList.push({
            id: doc.id,
            fullname,
            email,
            phone,
            address,
            avatar, 
            department
          });
        }
      });
      console.log("Customer list:", customerList);  // Log danh sách khách hàng
      setCustomers(customerList);
      setFilteredCustomers(customerList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = customers.filter(item => 
      item.fullname.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCustomers(filtered);
  };

  const handleCustomerPress = (customer) => {
    Alert.alert(
      "Xin hãy chọn",
      "",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Xem thiết bị",
          onPress: () => navigation.navigate("DeviceCustomer", { user: customer }) 
        },
        {
          text: "Xem thông tin người dùng",
          onPress: () => navigation.navigate("CustomerDetail", customer)
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BLUE_COLOR} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách người dùng</Text>
      <Searchbar
        placeholder="Tìm kiếm người dùng"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchBarInput}
        iconColor={BLUE_COLOR}
        placeholderTextColor={BLUE_COLOR}
        theme={{ colors: { primary: BLUE_COLOR } }}
      />
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CustomerItem 
            avatar={item.avatar} 
            fullname={item.fullname} 
            phone={item.phone} 
            onPress={() => handleCustomerPress(item)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: '400',
    marginBottom: 16,
    textAlign: "center",
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
    fontSize: 16,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: BLUE_COLOR,
  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BLUE_COLOR,
  },
  customerPhone: {
    fontSize: 14,
    color: 'gray',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Customers;

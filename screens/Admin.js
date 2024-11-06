import { Image, StyleSheet, TouchableOpacity, View } from "react-native"
import { Divider, Text } from "react-native-paper"
import Routercustomers from "../routers/RouterCustomers"
import { DrawerContentScrollView, DrawerItemList, createDrawerNavigator} from "@react-navigation/drawer"
import { useMyContextController } from "../store"
import { useEffect, useState } from "react"
import RouterSetting from "../routers/RouterSetting"
import ErrorDevices from "../screens/ErrorDevices"
import Statistic from "./Statistic"
import RouterDevice from "../routers/RouteDevice"
import AddDevice from "./AddDevice"
import RouterErrorDevices from "../routers/RouterErrorDevices"

const CustomDrawer = props => {
    const [controller, dispatch] = useMyContextController()
    const {userLogin} = controller 
    const [fullname, setFullname] = useState(userLogin?.fullname || '');
    const [role, setRole] = useState(userLogin?.role || '');
    const [avatar, setAvatar] = useState(userLogin?.avatar || '')

    useEffect(() => {
        if (userLogin) {
            setFullname(userLogin.fullname || '');
            setAvatar(userLogin.avatar || '');
        }
    }, [userLogin]);
    return(
        <DrawerContentScrollView {...props}>
            <View style={{flexDirection:"row", margin: 10}}>
                <Image
                    source={avatar ? { uri: avatar } : require('../assets/user.png')}
                    style={styles.avatar}
                />
                <View style={{justifyContent:"center", paddingLeft: 5}}>
                    <Text style={styles.nameText}>
                        {fullname}
                    </Text>
                    <Text style={styles.roleText}>
                        {role}
                    </Text>
                </View>
            </View>
            <Divider/>
            <DrawerItemList {...props}/>
            <Divider/>
        </DrawerContentScrollView>
    )
}

const Drawer = createDrawerNavigator()

const Admin = () => {
    return(
        <Drawer.Navigator 
            drawerContent={(props) => <CustomDrawer {...props}/>}
            screenOptions={{
                drawerActiveTintColor: 'black',
                drawerInactiveTintColor: 'black',
                drawerLabelStyle: {
                    color: 'black',
                },
                headerTitleStyle: {
                    color: 'black',
                },
            }}
        >
            <Drawer.Screen name="Statistic" component={Statistic}
                options={{
                    drawerLabel: "Thống kê",
                    headerTitle: "Thống kê",
                    drawerIcon: () => (
                        <Image
                          source={require('../assets/analysis.png')}
                          style={styles.icon}
                        />
                    ),
                }}
            />
            <Drawer.Screen 
                name="RouterDevice" 
                component={RouterDevice}
                options={{
                    drawerLabel: "Quản lý thiết bị",
                    headerTitle: "Thiết bị",
                    drawerIcon: () => (
                        <Image
                          source={require('../assets/responsive.png')}
                          style={styles.icon}
                        />
                    ),
                    unmountOnBlur: true,
                }}
                listeners={({ navigation }) => ({
                    drawerItemPress: (e) => {
                        e.preventDefault();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'RouterDevice', params: { screen: 'Departments' } }],
                        });
                    },
                })}
            />
            <Drawer.Screen 
                name="RouterCustomers" 
                component={Routercustomers}
                options={{
                    drawerLabel: "Quản lý người dùng",
                    headerTitle: "Danh sách người dùng",
                    drawerIcon: () => (
                        <Image
                            source={require('../assets/customer.png')}
                            style={styles.icon}
                        />
                    ),
                    unmountOnBlur: true,
                }}
                listeners={({ navigation }) => ({
                    drawerItemPress: (e) => {
                        e.preventDefault();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'RouterCustomers', params: { screen: 'Customers' } }],
                        });
                    },
                })}
            />
            
            <Drawer.Screen 
                name="RouterErrorDevices" 
                component={RouterErrorDevices}
                options={{
                    drawerLabel: "Quản lý thiết bị lỗi",
                    headerTitle: "Danh sách thiết bị lỗi",
                    drawerIcon: () => (
                        <Image
                          source={require('../assets/computer.png')}
                          style={styles.icon}
                        />
                    ),
                    unmountOnBlur: true,
                }}
                listeners={({ navigation }) => ({
                    drawerItemPress: (e) => {
                        e.preventDefault();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'RouterErrorDevices', params: { screen: 'ListErrorDevices' } }],
                        });
                    },
                })}
            />
            <Drawer.Screen 
                name="RouterSetting" 
                component={RouterSetting}
                options={{
                    drawerLabel: "Thông tin cá nhân",
                    headerTitle: "Thông tin cá nhân",
                    drawerIcon: () => (
                        <Image
                            source={require('../assets/user.png')}
                            style={styles.icon}
                        />
                    ),
                    unmountOnBlur: true,
                }}
                listeners={({ navigation }) => ({
                    drawerItemPress: (e) => {
                        e.preventDefault();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'RouterSetting', params: { screen: 'Profile' } }],
                        });
                    },
                    unmountOnBlur: true,
                })}
            />
        </Drawer.Navigator>
    )
}

export default Admin

const styles = StyleSheet.create({
    icon: {
      width: 24,
      height: 24,
    },
    avatar: {
      width: 80,
      height: 80,
      borderWidth: 2,
      borderColor: "black",
      borderRadius: 75,
    },
    nameText: {
      marginBottom: 5, 
      fontSize: 18,
      color: 'black',
    },
    roleText: {
      fontSize: 15, 
      color: 'black',
    },
});
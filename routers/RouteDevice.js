import { createStackNavigator } from "@react-navigation/stack"
import Departments from "../screens/Departments"
import EditDepartment from "../screens/EditDepartment"
import AddDepartment from "../screens/AddDepartment"
import Devices from "../screens/Devices"
import DeviceDetail from "../screens/DeviceDetail"
import AddDevice from "../screens/AddDevice"
import DepartmentCustomers from "../screens/DepartmentCustomers"
import Customers from "../screens/Customers"
import CustomerDetail from "../screens/CustomerDetail"
import DeviceCustomer from "../screens/DeviceCustomer"
import ListErrorDevices from "../screens/ListErrorDevices"
const Stack = createStackNavigator()

const RouterDevice = ()=>{
    return(
        <Stack.Navigator
            initialRouteName="Departments"
            screenOptions={{
                headerShown: false
            }}
        >
            <Stack.Screen name="Derpartments" component={Departments}/>
            <Stack.Screen name="DepartmentCustomers" component={DepartmentCustomers}/>
            <Stack.Screen name="EditDepartment" component={EditDepartment}/>
            <Stack.Screen name="AddDepartment" component={AddDepartment}/>
            <Stack.Screen name="Devices" component={Devices}/>
            <Stack.Screen name="AddDevice" component={AddDevice}/>
            <Stack.Screen name="DeviceDetail" component={DeviceDetail}/>
            <Stack.Screen name="Customers" component={Customers}/>
            <Stack.Screen name="CustomerDetail" component={CustomerDetail}/>
            <Stack.Screen name="DeviceCustomer" component={DeviceCustomer}/>
            <Stack.Screen name="ListErrorDevices" component={ListErrorDevices}/>
        </Stack.Navigator>
    )
}
export default RouterDevice
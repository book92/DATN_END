import { createStackNavigator } from "@react-navigation/stack"
import Setting from "../screens/Setting"
import UpdateProfile from "../screens/UpdateProfile"
import ChangePassword from "../screens/ChangePassword"
const Stack = createStackNavigator()

const RouterSetting = ()=>{
    return(
        <Stack.Navigator
            initialRouteName="Setting"
            screenOptions={{
                headerShown: false
            }}
        >
            <Stack.Screen name="Setting" component={Setting}/>
            <Stack.Screen name="UpdateProfile" component={UpdateProfile}/>
            <Stack.Screen name="ChangePassword" component={ChangePassword}/>
        </Stack.Navigator>
    )
}
export default RouterSetting
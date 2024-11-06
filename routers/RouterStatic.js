import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Statistic from './src/screens/Statistic'; 
import StaticList from './src/screens/StaticList';
const Stack = createStackNavigator();

const RouterStatic = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Statistic" component={Statistic} options={{ title: 'Thống kê' }} />
        <Stack.Screen name="StaticList" component={StaticList} options={{ title: 'Danh sách thống kê' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RouterStatic;
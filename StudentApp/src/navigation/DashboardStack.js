import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import StudentDashboardScreen from '../screens/StudentDashboardScreen'

const Stack = createStackNavigator()

const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Dashboard" component={StudentDashboardScreen} />
  </Stack.Navigator>
)

export default DashboardStack
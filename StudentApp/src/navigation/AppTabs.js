import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Ionicons from 'react-native-vector-icons/Ionicons'
import DashboardStack from './DashboardStack'
import ExamResultScreen from '../screens/ExamResultScreen'
import Attendance from '../screens/Attendance'
import ProfileStack from './ProfileStack'

const Tab = createBottomTabNavigator()

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopColor: '#e5e7eb',
        paddingBottom: 8,
        paddingTop: 4,
        height: 70,
      },
      tabBarActiveTintColor: '#667eea',
      tabBarInactiveTintColor: '#9ca3af',
      tabBarLabelStyle: { fontSize: 11, marginTop: 2 },
      tabBarIcon: ({ color, size }) => {
        const icons = {
          Home: 'home',
          Exam: 'book',
          Attendance: 'checkmark-circle',
          ProfileTab: 'person',
        }
        return <Ionicons name={icons[route.name]} size={size} color={color} />
      },
    })}
  >
    <Tab.Screen name="Home" component={DashboardStack} />
    <Tab.Screen name="Exam" component={ExamResultScreen} />
    <Tab.Screen name="Attendance" component={Attendance} />
    <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Profile' }} />
  </Tab.Navigator>
)

export default AppTabs
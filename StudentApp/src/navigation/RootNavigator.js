import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { useAuth } from '../context/AuthContext'
import AuthStack from './AuthStack'
import AppTabs from './AppTabs'

const RootNavigator = () => {
  const { token, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    )
  }

  return token ? <AppTabs /> : <AuthStack />
}

export default RootNavigator

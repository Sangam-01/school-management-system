import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ImageBackground
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../../services/api'

import { useAuth } from '../../context/AuthContext'
// import { useNavigation } from '@react-navigation/native'
// const navigation = useNavigation()
const LoginScreen = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      return setError('Username and password are required')
    }
    try {
      setLoading(true)
      setError('')
      const res = await api.post('/auth/signin', { username, password })
      if (res.data.status === 'success') {
        alert('Login successful!')
        // await AsyncStorage.setItem('token', res.data.data.token)
         const jwt = res.data.data.token
          await login(jwt)   // 🔥 THIS IS THE CORRECT WAY
        //  setToken(userToken)   // 🔥 THIS TRIGGERS ROOTNAVIGATOR SWITCH
    //  <AppTabs />,
        // token change triggers RootNavigator re-render
      } else {
        setError(res.data.message || 'Login failed')
      }
    } catch (e) {
  // console.log("LOGIN ERROR FULL:", e)
  // console.log("RESPONSE:", e.response)
  // console.log("REQUEST:", e.request)

  setError(
    e.response?.data?.message ||
    e.message ||
    'Network error'
  )
}
     finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        {/* top gradient blob */}
        <View style={styles.topBlob} />

        <View style={styles.cardContainer}>
          {/* logo circle */}
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>S</Text>
          </View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your student account</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
          />

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* bottom blob */}
        <View style={styles.bottomBlob} />
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  topBlob: { position: 'absolute', top: -80, left: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(102,126,234,0.35)' },
  bottomBlob: { position: 'absolute', bottom: -100, right: -80, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(118,75,162,0.3)' },

  cardContainer: { width: '88%', backgroundColor: '#fff', borderRadius: 24, paddingHorizontal: 24, paddingVertical: 32, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 10, zIndex: 1 },

  logoCircle: { width: 72, height: 72, borderRadius: 36, background: 'linear-gradient(135deg,#667eea,#764ba2)', backgroundColor: '#667eea', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoText: { fontSize: 32, fontWeight: '800', color: '#fff' },

  title: { fontSize: 22, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 20 },

  errorText: { backgroundColor: '#fef2f2', color: '#dc2626', fontSize: 13, padding: 10, borderRadius: 8, width: '100%', textAlign: 'center', marginBottom: 12 },

  label: { fontSize: 13, fontWeight: '600', color: '#475569', alignSelf: 'flex-start', marginBottom: 6 },
  input: { width: '100%', height: 48, borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 14, fontSize: 15, color: '#1e293b', marginBottom: 16, backgroundColor: '#f8fafc' },

  btn: { width: '100%', height: 50, borderRadius: 12, backgroundColor: '#667eea', justifyContent: 'center', alignItems: 'center', marginTop: 8, shadowColor: '#667eea', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
})

export default LoginScreen
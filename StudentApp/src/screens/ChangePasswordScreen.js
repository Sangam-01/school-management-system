import React, { useState } from 'react'
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../services/api'

// PUT /student/change-password  body: { old_password, new_password }
const ChangePasswordScreen = ({ navigation }) => {
  const [oldPwd,  setOldPwd]  = useState('')
  const [newPwd,  setNewPwd]  = useState('')
  const [confPwd, setConfPwd] = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = async () => {
    setError(''); setSuccess('')
    if (!oldPwd || !newPwd || !confPwd) return setError('All fields are required')
    if (newPwd !== confPwd) return setError('New passwords do not match')
    if (newPwd.length < 6) return setError('Password must be at least 6 characters')

    try {
      setLoading(true)
      const res = await api.put('/student/change-password', { old_password: oldPwd, new_password: newPwd })
      if (res.data.status === 'success') {
        setSuccess('Password changed successfully')
        // clear fields
        setOldPwd(''); setNewPwd(''); setConfPwd('')
        // logout after 1.5s so they re-login with new password
        setTimeout(async () => {
          await AsyncStorage.clear()
        }, 1500)
      } else {
        setError(res.data.message || 'Failed')
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Network error')
    } finally { setLoading(false) }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container}>
        {/* header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
        </View>

        <View style={styles.form}>
          {/* lock icon */}
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed" size={36} color="#667eea" />
          </View>
          <Text style={styles.formTitle}>Update your password</Text>
          <Text style={styles.formSub}>You will be logged out after changing password</Text>

          {error  ? <Text style={styles.errorText}>{error}</Text>  : null}
          {success ? <Text style={styles.successText}>{success}</Text> : null}

          <Text style={styles.label}>Current Password</Text>
          <TextInput style={styles.input} value={oldPwd} onChangeText={setOldPwd} placeholder="••••••••" secureTextEntry />

          <Text style={styles.label}>New Password</Text>
          <TextInput style={styles.input} value={newPwd} onChangeText={setNewPwd} placeholder="••••••••" secureTextEntry />

          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput style={styles.input} value={confPwd} onChangeText={setConfPwd} placeholder="••••••••" secureTextEntry />

          <TouchableOpacity style={styles.saveBtn} onPress={handleChange} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Change Password</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },

  header: { backgroundColor: '#764ba2', paddingTop: 56, paddingBottom: 18, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },

  form: { padding: 24, alignItems: 'center' },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  formTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  formSub: { fontSize: 13, color: '#94a3b8', marginTop: 4, textAlign: 'center', marginBottom: 20 },

  errorText: { backgroundColor: '#fef2f2', color: '#dc2626', fontSize: 13, padding: 10, borderRadius: 8, width: '100%', textAlign: 'center', marginBottom: 12 },
  successText: { backgroundColor: '#d1fae5', color: '#059669', fontSize: 13, padding: 10, borderRadius: 8, width: '100%', textAlign: 'center', marginBottom: 12 },

  label: { fontSize: 13, fontWeight: '600', color: '#475569', alignSelf: 'flex-start', marginBottom: 6 },
  input: { width: '100%', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1e293b', backgroundColor: '#fff', marginBottom: 18 },

  saveBtn: { width: '100%', backgroundColor: '#764ba2', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 8, shadowColor: '#764ba2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
})

export default ChangePasswordScreen
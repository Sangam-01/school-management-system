import React, { useState } from 'react'
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import api from '../services/api'

// PUT /student/profile/update accepts: { mobile, email, address }
const EditProfileScreen = ({ navigation, route }) => {
  const { profile } = route.params   // passed from StudentProfileScreen

  const [mobile,  setMobile]  = useState(profile.mobile  || '')
  const [email,   setEmail]   = useState(profile.email   || '')
  const [address, setAddress] = useState(profile.address || '')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')

  const handleSave = async () => {
    if (!mobile.trim() || !email.trim()) return setError('Mobile and email are required')
    try {
      setLoading(true); setError(''); setSuccess('')
      const res = await api.put('/student/profile/update', { mobile: mobile.trim(), email: email.trim(), address: address.trim() })
      if (res.data.status === 'success') {
        setSuccess('Profile updated successfully')
        setTimeout(() => navigation.goBack(), 1200)
      } else {
        setError(res.data.message || 'Update failed')
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
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>

        <View style={styles.form}>
          {/* read-only info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>✏️  You can update Mobile, Email and Address only.</Text>
          </View>

          {error  ? <Text style={styles.errorText}>{error}</Text>  : null}
          {success ? <Text style={styles.successText}>{success}</Text> : null}

          <Text style={styles.label}>Mobile Number</Text>
          <TextInput style={styles.input} value={mobile} onChangeText={setMobile} placeholder="e.g. 9876543210" keyboardType="phone-pad" />

          <Text style={styles.label}>Email Address</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@email.com" keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.label}>Address</Text>
          <TextInput style={[styles.input, { minHeight: 100 }]} value={address} onChangeText={setAddress} placeholder="Your address…" multiline textAlignVertical="top" />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },

  header: { backgroundColor: '#667eea', paddingTop: 56, paddingBottom: 18, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },

  form: { padding: 20 },
  infoBox: { backgroundColor: '#eef2ff', borderRadius: 12, padding: 12, marginBottom: 18 },
  infoText: { fontSize: 13, color: '#4338ca' },

  errorText: { backgroundColor: '#fef2f2', color: '#dc2626', fontSize: 13, padding: 10, borderRadius: 8, marginBottom: 12, textAlign: 'center' },
  successText: { backgroundColor: '#d1fae5', color: '#059669', fontSize: 13, padding: 10, borderRadius: 8, marginBottom: 12, textAlign: 'center' },

  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1e293b', backgroundColor: '#fff', marginBottom: 18 },

  saveBtn: { backgroundColor: '#667eea', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 8, shadowColor: '#667eea', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
})

export default EditProfileScreen
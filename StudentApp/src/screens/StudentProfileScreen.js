import React, { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, RefreshControl
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import api from '../services/api'

const StudentProfileScreen = ({ navigation }) => {
  // profile fields: { student_master_id, reg_no, fname, lname, mother_name, gender, dob, email, mobile, address, roll_no, admission_date, class_level, division, year_name }
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProfile()
    // refresh when coming back from edit
    const unsub = navigation.addListener('focus', fetchProfile)
    return unsub
  }, [navigation])

  const fetchProfile = async () => {
    try {
      setLoading(true); setError(null)
      const res = await api.get('/student/profile')
      if (res.data.status === 'success') setProfile(res.data.data)
      else setError(res.data.message)
    } catch (e) {
      setError(e.response?.data?.message || 'Network error')
    } finally { setLoading(false) }
  }

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#667eea" /></View>
  if (error) return (
    <View style={styles.centered}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={fetchProfile}><Text style={styles.retryText}>Retry</Text></TouchableOpacity>
    </View>
  )

  const Row = ({ label, value, icon }) => (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={18} color="#667eea" style={{ width: 22 }} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={styles.rowValue}>{value || '—'}</Text>
    </View>
  )

  const formatDate = (d) => { if (!d) return '—'; const dt = new Date(d); return dt.toLocaleDateString('en-IN') }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={false} onRefresh={fetchProfile} colors={['#667eea']} />}>
      {/* header with avatar */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(profile.fname || '')[0]?.toUpperCase()}{(profile.lname || '')[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.headerName}>{profile.fname} {profile.lname}</Text>
        <Text style={styles.headerReg}>Reg: {profile.reg_no} • Roll: {profile.roll_no}</Text>
        <Text style={styles.headerClass}>Class {profile.class_level}{profile.division} • {profile.year_name}</Text>
      </View>

      {/* personal info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Personal Info</Text>
        <View style={styles.card}>
          <Row label="Full Name"      value={`${profile.fname} ${profile.lname || ''}`} icon="person" />
          <Row label="Mother's Name"  value={profile.mother_name}  icon="people" />
          <Row label="Gender"         value={profile.gender}       icon="transgender" />
          <Row label="Date of Birth"  value={formatDate(profile.dob)} icon="calendar" />
        </View>
      </View>

      {/* contact info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📞 Contact</Text>
        <View style={styles.card}>
          <Row label="Mobile"  value={profile.mobile} icon="call" />
          <Row label="Email"   value={profile.email}  icon="mail" />
          <Row label="Address" value={profile.address} icon="location" />
        </View>
      </View>

      {/* academic info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎓 Academic</Text>
        <View style={styles.card}>
          <Row label="Reg No"        value={profile.reg_no}        icon="bookmark" />
          <Row label="Roll No"       value={profile.roll_no}       icon="list" />
          <Row label="Class"         value={`${profile.class_level} - ${profile.division}`} icon="layers" />
          <Row label="Academic Year" value={profile.year_name}     icon="calendar" />
          <Row label="Admission"     value={formatDate(profile.admission_date)} icon="enter" />
        </View>
      </View>

      {/* action buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#667eea' }]} onPress={() => navigation.navigate('EditProfile', { profile })}>
          <Ionicons name="pencil" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#764ba2' }]} onPress={() => navigation.navigate('ChangePassword')}>
          <Ionicons name="lock-closed" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Change Password</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' },
  errorText: { color: '#dc2626', fontSize: 15, marginBottom: 12 },
  retryBtn: { backgroundColor: '#667eea', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: '600' },

  /* header */
  header: { backgroundColor: '#667eea', paddingTop: 56, paddingBottom: 24, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { fontSize: 30, fontWeight: '800', color: '#fff' },
  headerName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerReg: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 3 },
  headerClass: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  section: { paddingHorizontal: 16, marginTop: 18 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowLabel: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  rowValue: { fontSize: 14, color: '#1e293b', fontWeight: '600', maxWidth: '55%', textAlign: 'right' },

  btnRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 24 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
  actionBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
})

export default StudentProfileScreen
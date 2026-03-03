import React, { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, RefreshControl
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
const StudentDashboardScreen = () => {
  const [dashboard, setDashboard] = useState(null)  // { enrollment_id, roll_no, class_level, division, year_name, class_teacher, total_days, present_days, subjects }
  const [fees, setFees] = useState({ total_amount: 0, paid_amount: 0, due_amount: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
const { logout } = useAuth()
  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true); setError(null)
      // dashboard gives enrollment_id + all stats
      const dashRes = await api.get('/student/dashboard')
      if (dashRes.data.status === 'success') {
        const d = dashRes.data.data
        setDashboard(d)
        // cache enrollment_id so other screens can use it
        await AsyncStorage.setItem('enrollment_id', String(d.enrollment_id))

        // fetch fees using enrollment_id
        const feeRes = await api.get('/student/fees', { params: { enrollment_id: d.enrollment_id } })
        if (feeRes.data.status === 'success') setFees(feeRes.data.data)
      } else {
        setError(dashRes.data.message)
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Network error')
    } finally { setLoading(false) }
  }

  const handleLogout = async () => {
    alert('LogOut successful!')
  await logout()
}

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const attendancePct = dashboard.total_days > 0
    ? Math.round((dashboard.present_days / dashboard.total_days) * 100)
    : 0
  const feePct = fees.total_amount > 0
    ? Math.round((fees.paid_amount / fees.total_amount) * 100)
    : 0
  const subjects = typeof dashboard.subjects === 'string'
    ? JSON.parse(dashboard.subjects)
    : (dashboard.subjects || [])

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={false} onRefresh={fetchData} colors={['#667eea']} />}
    >
      {/* header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Good Morning 👋</Text>
          <Text style={styles.headerName}>{dashboard.roll_no} • Class {dashboard.class_level}{dashboard.division}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* info row: year + teacher */}
      <View style={styles.infoRow}>
        <View style={styles.infoCard}>
          <Ionicons name="calendar" size={18} color="#667eea" />
          <Text style={styles.infoLabel}>Year</Text>
          <Text style={styles.infoValue}>{dashboard.year_name}</Text>
        </View>
        <View style={styles.infoCard}>
          <Ionicons name="person" size={18} color="#764ba2" />
          <Text style={styles.infoLabel}>Class Teacher</Text>
          <Text style={styles.infoValue}>{dashboard.class_teacher || 'N/A'}</Text>
        </View>
      </View>

      {/* stat cards row */}
      <View style={styles.statsRow}>
        {/* Attendance card */}
        <View style={[styles.statCard, { borderLeftColor: attendancePct >= 75 ? '#10b981' : '#f59e0b' }]}>
          <View style={styles.statIcon}>
            <Ionicons name="checkmark-circle" size={20} color={attendancePct >= 75 ? '#10b981' : '#f59e0b'} />
          </View>
          <Text style={styles.statNumber}>{attendancePct}%</Text>
          <Text style={styles.statLabel}>Attendance</Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressBar, { width: `${attendancePct}%`, backgroundColor: attendancePct >= 75 ? '#10b981' : '#f59e0b' }]} />
          </View>
          <Text style={styles.statSub}>{dashboard.present_days} / {dashboard.total_days} days</Text>
        </View>

        {/* Fee card */}
        <View style={[styles.statCard, { borderLeftColor: fees.due_amount > 0 ? '#ef4444' : '#10b981' }]}>
          <View style={styles.statIcon}>
            <Ionicons name="wallet" size={20} color={fees.due_amount > 0 ? '#ef4444' : '#10b981'} />
          </View>
          <Text style={styles.statNumber}>₹{Number(fees.due_amount).toLocaleString()}</Text>
          <Text style={styles.statLabel}>Fee Due</Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressBar, { width: `${feePct}%`, backgroundColor: '#667eea' }]} />
          </View>
          <Text style={styles.statSub}>Paid ₹{Number(fees.paid_amount).toLocaleString()} of ₹{Number(fees.total_amount).toLocaleString()}</Text>
        </View>
      </View>

      {/* Subjects list */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📚 My Subjects</Text>
        <View style={styles.subjectsGrid}>
          {subjects.map((s, i) => (
            <View key={i} style={[styles.subjectChip, { backgroundColor: ['#eef2ff','#f0fdf4','#fdf4ff','#fff7ed','#eff6ff','#fef3c7'][i % 6] }]}>
              <Text style={[styles.subjectText, { color: ['#4338ca','#166534','#7e22ce','#9a3412','#1d4ed8','#92400e'][i % 6] }]}>{s}</Text>
            </View>
          ))}
        </View>
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
  header: { background: 'linear-gradient(135deg,#667eea,#764ba2)', backgroundColor: '#667eea', paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  headerGreeting: { fontSize: 18, fontWeight: '700', color: '#fff' },
  headerName: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  /* info row */
  infoRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 14 },
  infoCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  infoLabel: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#1e293b', marginTop: 2, textAlign: 'center' },

  /* stat cards */
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  statIcon: { marginBottom: 8 },
  statNumber: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
  statLabel: { fontSize: 13, color: '#64748b', fontWeight: '600', marginTop: 2 },
  progressBg: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 3 },
  statSub: { fontSize: 11, color: '#94a3b8', marginTop: 4 },

  /* subjects */
  section: { paddingHorizontal: 16, marginTop: 18 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 10 },
  subjectsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subjectChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  subjectText: { fontSize: 13, fontWeight: '600' },
})

export default StudentDashboardScreen
import React, { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, RefreshControl
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../services/api'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const Attendance = () => {
  // attendance response: { total_days, present_days, absent_days, records:[{ attendance_date, status }] }
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [month, setMonth] = useState(new Date().getMonth() + 1)   // 1-12
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => { fetchData() }, [month, year])

  const fetchData = async () => {
    try {
      setLoading(true); setError(null)
      const eid = await AsyncStorage.getItem('enrollment_id')
      if (!eid) return setError('Enrollment not found. Go to Home first.')
      const res = await api.get('/student/attendance', { params: { enrollment_id: eid, month, year } })
      if (res.data.status === 'success') setData(res.data.data)
      else setError(res.data.message)
    } catch (e) {
      setError(e.response?.data?.message || 'Network error')
    } finally { setLoading(false) }
  }

  // month nav helpers
  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  // build a date→status map from records
  const statusMap = {}
  if (data?.records) {
    data.records.forEach(r => {
      const d = new Date(r.attendance_date)
      statusMap[d.getDate()] = r.status   // 'Present' or 'Absent'
    })
  }

  // days in selected month
  const daysInMonth = new Date(year, month, 0).getDate()
  // what day of week does the 1st fall on (0=Sun)
  const startDay = new Date(year, month - 1, 1).getDay()

  const attendancePct = data && data.total_days > 0 ? Math.round((data.present_days / data.total_days) * 100) : 0

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={false} onRefresh={fetchData} colors={['#667eea']} />}>
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📅 Attendance</Text>
        <Text style={styles.headerSub}>Your monthly attendance</Text>
      </View>

      {/* month navigator */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={22} color="#667eea" />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{MONTHS[month - 1]} {year}</Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
          <Ionicons name="chevron-forward" size={22} color="#667eea" />
        </TouchableOpacity>
      </View>

      {loading && <View style={{ marginTop: 40 }}><ActivityIndicator size="large" color="#667eea" /></View>}

      {error && !loading && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchData}><Text style={styles.retryText}>Retry</Text></TouchableOpacity>
        </View>
      )}

      {!loading && !error && data && (
        <>
          {/* stat pills */}
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: '#10b981', backgroundColor: '#d1fae5' }]}>
              <Ionicons name="checkmark-circle" size={18} color="#10b981" />
              <Text style={[styles.statPillNum, { color: '#10b981' }]}>{data.present_days}</Text>
              <Text style={styles.statPillLabel}>Present</Text>
            </View>
            <View style={[styles.statPill, { borderColor: '#ef4444', backgroundColor: '#fee2e2' }]}>
              <Ionicons name="close-circle" size={18} color="#ef4444" />
              <Text style={[styles.statPillNum, { color: '#ef4444' }]}>{data.absent_days}</Text>
              <Text style={styles.statPillLabel}>Absent</Text>
            </View>
            <View style={[styles.statPill, { borderColor: '#667eea', backgroundColor: '#eef2ff' }]}>
              <Ionicons name="analytics" size={18} color="#667eea" />
              <Text style={[styles.statPillNum, { color: '#667eea' }]}>{attendancePct}%</Text>
              <Text style={styles.statPillLabel}>Rate</Text>
            </View>
          </View>

          {/* progress bar */}
          <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
            <View style={styles.progressBg}>
              <View style={[styles.progressBar, { width: `${attendancePct}%`, backgroundColor: attendancePct >= 75 ? '#10b981' : '#f59e0b' }]} />
            </View>
          </View>

          {/* calendar grid */}
          <View style={styles.calendarCard}>
            {/* day headers */}
            <View style={styles.dayHeaders}>
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                <Text key={d} style={styles.dayHeader}>{d}</Text>
              ))}
            </View>

            {/* grid */}
            <View style={styles.dayGrid}>
              {/* empty cells for offset */}
              {Array.from({ length: startDay }).map((_, i) => (
                <View key={`e${i}`} style={styles.dayCell} />
              ))}

              {/* actual days */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1
                const status = statusMap[day]
                let bg = 'transparent', textColor = '#475569'
                if (status === 'Present') { bg = '#10b981'; textColor = '#fff' }
                if (status === 'Absent')  { bg = '#ef4444'; textColor = '#fff' }
                const isToday = day === new Date().getDate() && month === new Date().getMonth() + 1 && year === new Date().getFullYear()
                return (
                  <View key={day} style={[styles.dayCell, { backgroundColor: bg, borderWidth: isToday ? 2 : 0, borderColor: '#667eea' }]}>
                    <Text style={[styles.dayNum, { color: textColor, fontWeight: isToday ? '800' : '600' }]}>{day}</Text>
                  </View>
                )
              })}
            </View>

            {/* legend */}
            <View style={styles.legend}>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#10b981' }]} /><Text style={styles.legendLabel}>Present</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} /><Text style={styles.legendLabel}>Absent</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#667eea' }]} /><Text style={styles.legendLabel}>Today</Text></View>
            </View>
          </View>
        </>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },

  header: { backgroundColor: '#667eea', paddingTop: 56, paddingBottom: 18, paddingHorizontal: 20 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  /* month nav */
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 14 },
  navBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  monthLabel: { fontSize: 17, fontWeight: '700', color: '#1e293b' },

  errorBox: { alignItems: 'center', marginTop: 40 },
  errorText: { color: '#dc2626', fontSize: 15, marginBottom: 10 },
  retryBtn: { backgroundColor: '#667eea', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: '600' },

  /* stat pills */
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 10 },
  statPill: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 12, alignItems: 'center' },
  statPillNum: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  statPillLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },

  progressBg: { height: 7, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 4 },

  /* calendar */
  calendarCard: { margin: 16, backgroundColor: '#fff', borderRadius: 18, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  dayHeaders: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  dayHeader: { fontSize: 12, fontWeight: '700', color: '#94a3b8', width: 36, textAlign: 'center' },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 4, marginHorizontal: (36 * 7 > 252 ? 0 : 0) },
  dayNum: { fontSize: 14 },

  legend: { flexDirection: 'row', justifyContent: 'center', gap: 18, marginTop: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 14, height: 14, borderRadius: 7 },
  legendLabel: { fontSize: 12, color: '#64748b' },
})

export default Attendance
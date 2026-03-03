import React, { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, RefreshControl
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../services/api'

// grade colour map – matches backend: A+/A/B/C/D/F
const GRADE_COLORS = { 'A+': '#10b981', A: '#3b82f6', B: '#8b5cf6', C: '#f59e0b', D: '#f97316', F: '#ef4444' }
const GRADE_BG    = { 'A+': '#d1fae5', A: '#dbeafe', B: '#ede9fe', C: '#fef3c7', D: '#ffedd5', F: '#fee2e2' }

const ExamResultScreen = () => {
  const [marks, setMarks] = useState([])          // [{ subject_name, exam_name, marks_obtained, max_marks, grade }]
  const [progress, setProgress] = useState([])    // [{ exam_name, subjects_count, total_obtained, total_max, percentage }]
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedExam, setSelectedExam] = useState(null)  // filter by exam

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true); setError(null)
      const eid = await AsyncStorage.getItem('enrollment_id')
      if (!eid) return setError('Enrollment not found. Go to Home first.')

      const [marksRes, progRes] = await Promise.all([
        api.get('/student/marks', { params: { enrollment_id: eid } }),
        api.get('/student/progress-report', { params: { enrollment_id: eid } })
      ])
      if (marksRes.data.status === 'success') setMarks(marksRes.data.data)
      if (progRes.data.status === 'success') {
        setProgress(progRes.data.data)
        // default select first exam
        if (progRes.data.data.length > 0) setSelectedExam(progRes.data.data[0].exam_name)
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Network error')
    } finally { setLoading(false) }
  }

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#667eea" /></View>
  if (error) return (
    <View style={styles.centered}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={fetchData}><Text style={styles.retryText}>Retry</Text></TouchableOpacity>
    </View>
  )

  // unique exam names for filter pills
  const examNames = [...new Set(marks.map(m => m.exam_name))]
  // filtered marks for selected exam
  const filteredMarks = selectedExam ? marks.filter(m => m.exam_name === selectedExam) : marks
  // current progress entry
  const currentProgress = progress.find(p => p.exam_name === selectedExam)

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={false} onRefresh={fetchData} colors={['#667eea']} />}>
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📖 Exam Results</Text>
        <Text style={styles.headerSub}>Your marks & grades</Text>
      </View>

      {/* no data */}
      {marks.length === 0 && (
        <View style={styles.emptyBox}>
          <Ionicons name="book-outline" size={48} color="#cbd5e1" />
          <Text style={styles.emptyText}>No exam results yet</Text>
        </View>
      )}

      {marks.length > 0 && (
        <>
          {/* exam filter pills */}
          <View style={styles.pillRow}>
            {examNames.map(name => (
              <TouchableOpacity
                key={name}
                style={[styles.pill, selectedExam === name && styles.pillActive]}
                onPress={() => setSelectedExam(name)}
              >
                <Text style={[styles.pillText, selectedExam === name && styles.pillTextActive]}>{name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* progress summary card for selected exam */}
          {currentProgress && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryVal}>{currentProgress.subjects_count}</Text>
                  <Text style={styles.summaryLabel}>Subjects</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryVal}>{currentProgress.total_obtained} / {currentProgress.total_max}</Text>
                  <Text style={styles.summaryLabel}>Total Marks</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryVal, { color: parseFloat(currentProgress.percentage) >= 60 ? '#10b981' : '#ef4444' }]}>
                    {parseFloat(currentProgress.percentage).toFixed(1)}%
                  </Text>
                  <Text style={styles.summaryLabel}>Percentage</Text>
                </View>
              </View>
              {/* progress bar */}
              <View style={styles.progressBg}>
                <View style={[styles.progressBar, { width: `${Math.min(parseFloat(currentProgress.percentage), 100)}%` }]} />
              </View>
            </View>
          )}

          {/* marks cards */}
          {filteredMarks.map((m, i) => {
            const pct = m.max_marks > 0 ? ((m.marks_obtained / m.max_marks) * 100) : 0
            return (
              <View key={i} style={styles.markCard}>
                <View style={styles.markLeft}>
                  <Text style={styles.markSubject}>{m.subject_name}</Text>
                  <Text style={styles.markExam}>{m.exam_name}</Text>
                </View>
                <View style={styles.markRight}>
                  <Text style={styles.markScore}>{m.marks_obtained} / {m.max_marks}</Text>
                  <View style={[styles.gradeBadge, { backgroundColor: GRADE_BG[m.grade] || '#f1f5f9' }]}>
                    <Text style={[styles.gradeText, { color: GRADE_COLORS[m.grade] || '#64748b' }]}>{m.grade}</Text>
                  </View>
                </View>
                {/* thin progress */}
                <View style={styles.markProgressBg}>
                  <View style={[styles.markProgressBar, { width: `${Math.min(pct, 100)}%`, backgroundColor: GRADE_COLORS[m.grade] || '#667eea' }]} />
                </View>
              </View>
            )
          })}

          {/* All exams progress summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 Exam-wise Summary</Text>
            {progress.map((p, i) => (
              <View key={i} style={styles.progressCard}>
                <View style={styles.progressCardHeader}>
                  <Text style={styles.progressCardName}>{p.exam_name}</Text>
                  <Text style={styles.progressCardPct}>{parseFloat(p.percentage).toFixed(1)}%</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressBar, { width: `${Math.min(parseFloat(p.percentage), 100)}%` }]} />
                </View>
                <Text style={styles.progressCardSub}>{p.total_obtained} / {p.total_max} marks • {p.subjects_count} subjects</Text>
              </View>
            ))}
          </View>
        </>
      )}

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

  header: { backgroundColor: '#667eea', paddingTop: 56, paddingBottom: 18, paddingHorizontal: 20 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 15, color: '#94a3b8', marginTop: 12 },

  /* exam pills */
  pillRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: 16, flexWrap: 'wrap' },
  pill: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  pillActive: { backgroundColor: '#667eea' },
  pillText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  pillTextActive: { color: '#fff' },

  /* summary */
  summaryCard: { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryVal: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  summaryLabel: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: '#e2e8f0' },

  progressBg: { height: 7, backgroundColor: '#f1f5f9', borderRadius: 4, marginTop: 10, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 4, backgroundColor: '#667eea' },

  /* mark cards */
  markCard: { marginHorizontal: 16, marginTop: 10, backgroundColor: '#fff', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  markLeft: { marginBottom: 6 },
  markSubject: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  markExam: { fontSize: 12, color: '#94a3b8' },
  markRight: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  markScore: { fontSize: 14, fontWeight: '600', color: '#475569' },
  gradeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  gradeText: { fontSize: 13, fontWeight: '700' },
  markProgressBg: { height: 4, backgroundColor: '#f1f5f9', borderRadius: 2, marginTop: 8, overflow: 'hidden' },
  markProgressBar: { height: '100%', borderRadius: 2 },

  /* progress summary section */
  section: { paddingHorizontal: 16, marginTop: 22 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 10 },
  progressCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  progressCardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  progressCardName: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  progressCardPct: { fontSize: 14, fontWeight: '700', color: '#667eea' },
  progressCardSub: { fontSize: 11, color: '#94a3b8', marginTop: 6 },
})

export default ExamResultScreen
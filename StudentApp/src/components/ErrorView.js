import { View, Text, StyleSheet } from 'react-native'

export default function ErrorView({ message }) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  box: { padding: 20 },
  text: { color: 'red', textAlign: 'center' }
})

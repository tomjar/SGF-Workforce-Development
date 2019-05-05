import React from 'react'
import { Text, TouchableOpacity, StyleSheet } from 'react-native'
import { purple, white } from '../utils/colors'

export default function TextButton({ children, onPress, disabled, style = {} }) {
  return (
    <TouchableOpacity style={[styles.to, style]}
      activeOpacity={disabled ? 1 : 0.7} onPress={!disabled && onPress}>
      <Text style={[styles.reset, style]}>{children}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  reset: {
    textAlign: 'center',
    color: white,
  },
  to: {
    backgroundColor: purple,
    padding: 10,
  }
})
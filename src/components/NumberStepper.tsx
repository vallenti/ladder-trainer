import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, IconButton, TextInput, useTheme } from 'react-native-paper';

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

const NumberStepper: React.FC<NumberStepperProps> = ({
  value,
  onChange,
  min = 1,
  max = 999,
  step = 1,
  label
}) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  const handleIncrement = () => {
    const newValue = Math.min(value + step, max);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - step, min);
    onChange(newValue);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditValue(value.toString());
  };

  const handleEndEdit = () => {
    const numValue = parseInt(editValue, 10);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onChange(clampedValue);
    } else {
      setEditValue(value.toString());
    }
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text variant="labelSmall" style={styles.label}>{label}</Text>}
      <View style={styles.stepperContainer}>
        <IconButton
          icon="minus"
          size={20}
          onPress={handleDecrement}
          disabled={value <= min}
          style={styles.button}
        />
        {isEditing ? (
          <TextInput
            value={editValue}
            onChangeText={setEditValue}
            onBlur={handleEndEdit}
            autoFocus
            keyboardType="numeric"
            style={styles.input}
            dense
          />
        ) : (
          <TouchableOpacity onPress={handleStartEdit} style={styles.valueContainer}>
            <Text variant="titleMedium" style={styles.value}>
              {value}
            </Text>
          </TouchableOpacity>
        )}
        <IconButton
          icon="plus"
          size={20}
          onPress={handleIncrement}
          disabled={value >= max}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    marginBottom: 4,
    opacity: 0.7,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    margin: 0,
  },
  valueContainer: {
    minWidth: 50,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontWeight: 'bold',
  },
  input: {
    width: 70,
    textAlign: 'center',
    height: 40,
  },
});

export default NumberStepper;

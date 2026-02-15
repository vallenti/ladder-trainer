import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import { TextInput, Text, useTheme, Surface, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useExerciseStore } from '../store/exerciseStore';
import { ExerciseCatalogItem } from '../constants/defaultExercises';
import { spacing } from '../constants/theme';

interface AutocompleteExerciseInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onSelectExercise?: (exercise: ExerciseCatalogItem) => void;
  style?: any;
  maxLength?: number;
  disabled?: boolean;
}

const AutocompleteExerciseInput: React.FC<AutocompleteExerciseInputProps> = ({
  label,
  value,
  onChangeText,
  onSelectExercise,
  style,
  maxLength = 100,
  disabled = false,
}) => {
  const theme = useTheme();
  const { searchExercises } = useExerciseStore();
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<ExerciseCatalogItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (isFocused && value.length >= 1) {
      // Show suggestions after typing at least 1 character
      const results = searchExercises(value).slice(0, 4); // Limit to 4 suggestions
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [value, isFocused, searchExercises]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    // Delay to allow tap on suggestion
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  const handleSelectSuggestion = (exercise: ExerciseCatalogItem) => {
    onChangeText(exercise.name);
    setShowSuggestions(false);
    Keyboard.dismiss();
    
    if (onSelectExercise) {
      onSelectExercise(exercise);
    }
  };

  // Helper function to highlight matched text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return <Text>{text}</Text>;
    
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const matchIndex = lowerText.indexOf(lowerQuery);
    
    if (matchIndex === -1) {
      return <Text>{text}</Text>;
    }
    
    const beforeMatch = text.substring(0, matchIndex);
    const match = text.substring(matchIndex, matchIndex + query.length);
    const afterMatch = text.substring(matchIndex + query.length);
    
    return (
      <Text>
        {beforeMatch}
        <Text style={{ fontWeight: 'bold' }}>{match}</Text>
        {afterMatch}
      </Text>
    );
  };

  const renderSuggestion = ({ item }: { item: ExerciseCatalogItem }) => {
    const isExactMatch = item.name.toLowerCase() === value.toLowerCase();
    const hasUnit = !!item.suggestedUnit;
    
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.suggestionItem,
          { 
            borderBottomColor: theme.colors.surfaceVariant,
            backgroundColor: theme.colors.surface
          }
        ]}
        onPress={() => handleSelectSuggestion(item)}
      >
        <View style={styles.suggestionContent}>
          <View style={styles.suggestionLeft}>
            <MaterialCommunityIcons
              name={item.isCustom ? 'star' : 'lightning-bolt'}
              size={16}
              color={item.isCustom ? theme.colors.primary : theme.colors.tertiary}
              style={styles.suggestionIcon}
            />
            <Text 
              variant="bodyMedium" 
              style={[
                styles.suggestionText,
                isExactMatch && { color: theme.colors.primary }
              ]}
            >
              {highlightMatch(item.name, value)}
            </Text>
          </View>
          {hasUnit && (
            <Text 
              variant="bodySmall" 
              style={[styles.suggestionUnit, { color: theme.colors.onSurfaceVariant }]}
            >
              {item.suggestedUnit}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <TextInput
        ref={inputRef}
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        maxLength={maxLength}
        disabled={disabled}
        style={styles.input}
        right={
          value.length > 0 && isFocused ? (
            <TextInput.Icon
              icon="close"
              onPress={() => {
                onChangeText('');
                inputRef.current?.focus();
              }}
            />
          ) : undefined
        }
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <Surface
          style={[
            styles.suggestionsContainer,
            { 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
            }
          ]}
          elevation={5}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            style={[styles.suggestionsList, { backgroundColor: theme.colors.surface }]}
            showsVerticalScrollIndicator={true}
          >
            {suggestions.map((item) => renderSuggestion({ item }))}
          </ScrollView>
        </Surface>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 9999,
  },
  input: {
    backgroundColor: 'transparent',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 999999,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  suggestionIcon: {
    marginRight: spacing.xs,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionUnit: {
    marginLeft: spacing.sm,
    fontStyle: 'italic',
  },
});

export default AutocompleteExerciseInput;

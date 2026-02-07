import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Share, Platform } from 'react-native';
import { Text, Card, IconButton, Portal, Dialog, Button, useTheme, Divider, Snackbar, Searchbar, Chip, Badge } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';
import DateTimePicker from '@react-native-community/datetimepicker';
import { spacing } from '../../constants/theme';
import { useActiveWorkoutStore } from '../../store/activeWorkoutStore';
import { formatTime } from '../../utils/calculations';
import { getLadderStrategy } from '../../utils/ladderStrategies';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ShareableWorkoutCard } from '../../components/ShareableWorkoutCard';
import { shareWorkoutImage } from '../../utils/shareUtils';

const formatTimeWithMs = (totalSeconds: number): string => {
  const seconds = Math.floor(totalSeconds);
  const ms = Math.floor((totalSeconds - seconds) * 100);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

const splitTimeAndMs = (totalSeconds: number): { timeStr: string; msStr: string } => {
  const seconds = Math.floor(totalSeconds);
  const ms = Math.floor((totalSeconds - seconds) * 100);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return {
      timeStr: `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
      msStr: `.${ms.toString().padStart(2, '0')}`
    };
  }
  return {
    timeStr: `${minutes}:${secs.toString().padStart(2, '0')}`,
    msStr: `.${ms.toString().padStart(2, '0')}`
  };
};

const formatDateTime = (date: Date) => {
  const now = new Date();
  const workoutDate = new Date(date);
  const isToday = workoutDate.toDateString() === now.toDateString();
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = workoutDate.toDateString() === yesterday.toDateString();
  
  const dateStr = isToday 
    ? 'Today' 
    : isYesterday 
    ? 'Yesterday' 
    : workoutDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: workoutDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  
  const timeStr = workoutDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  
  return { dateStr, timeStr };
};

// Utility functions for date filtering
const isSameDay = (date1: Date, date2: Date): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

const parseDateFromYYYYMMDD = (dateString: string): Date | null => {
  if (!/^\d{8}$/.test(dateString)) return null;
  
  const year = parseInt(dateString.substring(0, 4));
  const month = parseInt(dateString.substring(4, 6)) - 1; // Month is 0-indexed
  const day = parseInt(dateString.substring(6, 8));
  
  const date = new Date(year, month, day);
  
  // Validate the date is real
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }
  
  return date;
};

const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

const LogbookScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { workoutHistory, loadHistory, deleteWorkoutFromHistory } = useActiveWorkoutStore();
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const shareViewRefs = useRef<{ [key: string]: any }>({});

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filterExpanded, setFilterExpanded] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  // Filter workouts based on search query and date filter
  const filteredWorkouts = workoutHistory.filter(workout => {
    // Date filter
    if (dateFilter) {
      const workoutDate = new Date(workout.startTime);
      if (!isSameDay(workoutDate, dateFilter)) return false;
    }
    
    // Search query (name or date format)
    if (searchQuery.trim()) {
      // Check if query is date format (8 digits)
      if (/^\d{8}$/.test(searchQuery.trim())) {
        const queryDate = parseDateFromYYYYMMDD(searchQuery.trim());
        if (queryDate) {
          const workoutDate = new Date(workout.startTime);
          return isSameDay(workoutDate, queryDate);
        }
      }
      // Otherwise search by name (fuzzy/partial match, case insensitive)
      return workout.templateName.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    return true;
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setDateFilter(null);
  };

  const hasActiveFilters = searchQuery.trim() !== '' || dateFilter !== null;
  const activeFilterCount = (searchQuery.trim() !== '' ? 1 : 0) + (dateFilter !== null ? 1 : 0);

  // Configure navigation header with filter button
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ marginRight: 8, position: 'relative' }}>
          <IconButton
            icon={filterExpanded ? "filter-minus" : "filter-plus"}
            size={24}
            iconColor={hasActiveFilters ? theme.colors.primary : theme.colors.onSurfaceVariant}
            onPress={() => setFilterExpanded(!filterExpanded)}
          />
          {activeFilterCount > 0 && (
            <View style={{
              position: 'absolute',
              top: 4,
              right: 4,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: theme.colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 4,
            }}>
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
                {activeFilterCount}
              </Text>
            </View>
          )}
        </View>
      ),
    });
  }, [navigation, filterExpanded, hasActiveFilters, activeFilterCount, theme]);

  const handleDateSelect = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS
    if (selectedDate) {
      setDateFilter(selectedDate);
      setSearchQuery(''); // Clear search when date is selected
    }
  };

  const handleDelete = (workoutId: string) => {
    setWorkoutToDelete(workoutId);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (workoutToDelete) {
      await deleteWorkoutFromHistory(workoutToDelete);
      setDeleteDialogVisible(false);
      setWorkoutToDelete(null);
      setExpandedWorkoutId(null);
    }
  };

  const handleShareAsImage = async (workoutId: string) => {
    const workout = workoutHistory.find(w => w.id === workoutId);
    if (!workout || !shareViewRefs.current[workoutId]) return;

    setIsGeneratingImage(true);
    try {
      await shareWorkoutImage(shareViewRefs.current[workoutId], workout.templateName);
      setSnackbarMessage('Workout shared successfully!');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Share as image failed:', error);
      setSnackbarMessage('Failed to share workout. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleShare = async (workoutId: string) => {
    const workout = workoutHistory.find(w => w.id === workoutId);
    if (!workout) return;

    const { dateStr, timeStr } = formatDateTime(workout.startTime);
    const ladderStrategy = getLadderStrategy(workout.ladderType, workout.stepSize || 1, workout.maxRounds, workout.startingReps);
    
    // Calculate exercise summary using ladder strategy
    const exerciseTotals = workout.exercises.map(exercise => {
      const totalAmount = ladderStrategy.calculateTotalReps(exercise, workout.rounds.length);
      return {
        ...exercise,
        totalAmount
      };
    });

    // Format the share message
    const ladderTypeNames: Record<string, string> = {
      christmas: 'Christmas Ladder',
      ascending: 'Ascending Ladder',
      descending: 'Descending Ladder',
      pyramid: 'Pyramid Ladder',
      flexible: 'Flexible Ladder',
      chipper: 'Chipper',
      amrap: 'AMRAP',
      forreps: 'For Reps'
    };
    const ladderTypeName = ladderTypeNames[workout.ladderType] || 'Custom Workout';
    let message = `🏋️ ${workout.templateName}\n`;
    message += `📊 ${ladderTypeName}\n\n`;
    message += `📅 ${dateStr} at ${timeStr}\n`;
    message += `⏱️ Total Time: ${formatTimeWithMs(workout.totalTime)}\n`;
    message += `🔄 Rounds Completed: ${workout.rounds.length}/${workout.maxRounds}\n\n`;
    
    if (exerciseTotals.length > 0) {
      message += `💪 Exercise Summary:\n`;
      exerciseTotals.forEach(ex => {
        message += `  • ${ex.name}: ${ex.totalAmount} ${ex.unit || 'reps'}\n`;
      });
      message += '\n';
    }
    
    message += `🔥 Round Times:\n`;
    workout.rounds.forEach(round => {
      message += `  Round ${round.roundNumber}: ${formatTimeWithMs(round.duration)}\n`;
    });
    
    message += `\n💪 Powered by LadFit`;

    try {
      await Share.share({
        message: message,
      });
    } catch (error) {
      console.error('Error sharing workout:', error);
    }
  };

  if (workoutHistory.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="clipboard-text-outline" size={80} color={theme.colors.onSurfaceVariant} />
        <Text variant="headlineSmall" style={styles.emptyText}>
          No workouts completed yet
        </Text>
        <Text variant="bodyLarge" style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
          Complete your first workout to see it here!
        </Text>
      </View>
    );
  }

  const resultCount = filteredWorkouts.length;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Collapsible Filter Section */}
      {filterExpanded && (
        <View style={[styles.filterContainer, { backgroundColor: theme.colors.surface }]}>
          <Searchbar
            placeholder="Search by name or date"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}
            iconColor={theme.colors.onSurfaceVariant}
            inputStyle={styles.searchInput}
            elevation={0}
          />
          <Text variant="bodySmall" style={[styles.helperText, { color: theme.colors.onSurfaceVariant }]}>
            💡 Tip: Enter workout name or date (e.g., 20260207)
          </Text>
          
          <View style={styles.filterRow}>
            <Button
              mode="outlined"
              icon="calendar"
              onPress={() => setShowDatePicker(true)}
              style={styles.dateButton}
              contentStyle={styles.dateButtonContent}
              compact
            >
              {dateFilter ? formatDateToYYYYMMDD(dateFilter) : 'Pick Date'}
            </Button>
            
            {hasActiveFilters && (
              <Button
                mode="text"
                icon="close"
                onPress={handleClearFilters}
                compact
                textColor={theme.colors.error}
              >
                Clear
              </Button>
            )}
          </View>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <View style={styles.chipContainer}>
              {searchQuery.trim() !== '' && !/^\d{8}$/.test(searchQuery.trim()) && (
                <Chip
                  icon="magnify"
                  onClose={() => setSearchQuery('')}
                  style={styles.filterChip}
                >
                  Name: {searchQuery}
                </Chip>
              )}
              {dateFilter && (
                <Chip
                  icon="calendar"
                  onClose={() => setDateFilter(null)}
                  style={styles.filterChip}
                >
                  Date: {dateFilter.toLocaleDateString()}
                </Chip>
              )}
            </View>
          )}
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredWorkouts.length === 0 && hasActiveFilters ? (
          <View style={styles.noResultsContainer}>
            <MaterialCommunityIcons name="magnify-close" size={60} color={theme.colors.onSurfaceVariant} />
            <Text variant="titleMedium" style={[styles.noResultsText, { color: theme.colors.onSurfaceVariant }]}>
              No workouts found
            </Text>
            <Text variant="bodyMedium" style={[styles.noResultsSubtext, { color: theme.colors.onSurfaceVariant }]}>
              Try adjusting your filters
            </Text>
          </View>
        ) : (
          filteredWorkouts.map((workout) => {
          const isExpanded = expandedWorkoutId === workout.id;
          const { dateStr, timeStr } = formatDateTime(workout.startTime);
          const ladderStrategy = getLadderStrategy(workout.ladderType, workout.stepSize || 1, workout.maxRounds, workout.startingReps);
          const exerciseTotals = workout.exercises.map(exercise => {
            const totalAmount = ladderStrategy.calculateTotalReps(exercise, workout.rounds.length);
            return {
              ...exercise,
              totalAmount
            };
          });

          return (
            <Card key={workout.id} style={[styles.workoutCard, { backgroundColor: theme.colors.surface }]} mode="elevated">
              <TouchableOpacity
                onPress={() => setExpandedWorkoutId(isExpanded ? null : workout.id)}
                activeOpacity={0.7}
              >
                <Card.Content style={styles.cardContent}>
                  <View style={styles.headerRow}>
                    <View style={styles.leftContent}>
                      <Text variant="titleLarge" style={[styles.workoutName, { color: theme.colors.onSurface }]}>
                        {workout.templateName}
                      </Text>
                      <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                          <MaterialCommunityIcons name="calendar" size={14} color={theme.colors.onSurfaceVariant} />
                          <Text variant="bodySmall" style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                            {dateStr}
                          </Text>
                        </View>
                        <View style={styles.metaItem}>
                          <MaterialCommunityIcons name="clock-outline" size={14} color={theme.colors.onSurfaceVariant} />
                          <Text variant="bodySmall" style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                            {timeStr}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.rightContent}>
                      <View style={styles.timeContainer}>
                        <Text variant="headlineSmall" style={[styles.totalTime, { color: theme.colors.primary }]}>
                          {splitTimeAndMs(workout.totalTime).timeStr}
                        </Text>
                        <Text variant="bodySmall" style={[styles.milliseconds, { color: theme.colors.primary }]}>
                          {splitTimeAndMs(workout.totalTime).msStr}
                        </Text>
                      </View>
                      <View style={[styles.roundsBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <Text variant="bodySmall" style={[styles.roundsText, { color: theme.colors.onSurfaceVariant }]}>
                          {workout.rounds.length} {workout.rounds.length === 1 ? 'round' : 'rounds'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {isExpanded && (
                    <>
                      <Divider style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
                      
                      <View style={styles.expandedContent}>
                        <View style={styles.section}>
                          <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="dumbbell" size={18} color={theme.colors.primary} />
                            <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                              Exercise Summary
                            </Text>
                          </View>
                          {exerciseTotals.map((exercise, index) => (
                            <View 
                              key={exercise.position} 
                              style={[
                                styles.exerciseItem,
                                index < exerciseTotals.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceVariant }
                              ]}
                            >
                              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                                {exercise.name}
                              </Text>
                              <Text variant="bodyMedium" style={[styles.exerciseTotal, { color: theme.colors.tertiary }]}>
                                {exercise.totalAmount} {(exercise.unit || 'reps').toLowerCase()}
                              </Text>
                            </View>
                          ))}
                        </View>

                        <View style={styles.section}>
                          <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="timer-outline" size={18} color={theme.colors.primary} />
                            <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                              Round Times
                            </Text>
                          </View>
                          {workout.rounds.map((round, index) => (
                            <View 
                              key={round.roundNumber} 
                              style={[
                                styles.roundItem,
                                index < workout.rounds.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceVariant }
                              ]}
                            >
                              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                                Round {round.roundNumber}
                              </Text>
                              <Text variant="bodyMedium" style={[styles.roundTime, { color: theme.colors.primary }]}>
                                {formatTimeWithMs(round.duration)}
                              </Text>
                            </View>
                          ))}
                        </View>
                        
                        <View style={styles.shareSection}>
                          <Text variant="titleMedium" style={[styles.shareLabel, { color: theme.colors.onSurface }]}>
                            Share
                          </Text>
                          <View style={styles.shareButtons}>
                            <Button
                              mode="contained"
                              icon="image"
                              onPress={() => handleShareAsImage(workout.id)}
                              style={styles.shareButton}
                              contentStyle={styles.shareButtonContent}
                              textColor="#fff"
                              loading={isGeneratingImage}
                              disabled={isGeneratingImage}
                            >
                              Image
                            </Button>
                            <Button
                              mode="contained"
                              icon="share-variant"
                              onPress={() => handleShare(workout.id)}
                              style={styles.shareButton}
                              contentStyle={styles.shareButtonContent}
                              textColor="#fff"
                            >
                              Text
                            </Button>
                          </View>
                        </View>

                        <TouchableOpacity 
                          onPress={() => handleDelete(workout.id)}
                          style={styles.deleteSection}
                        >
                          <Text variant="bodyMedium" style={[styles.deleteText, { color: theme.colors.error }]}>
                            Delete workout
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </Card.Content>
              </TouchableOpacity>
            </Card>
          );
        }))
        }
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={dateFilter || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateSelect}
          maximumDate={new Date()}
        />
      )}

      {/* Hidden ViewShots for generating shareable images */}
      {workoutHistory.map((workout) => (
        <ViewShot
          key={`viewshot-${workout.id}`}
          ref={(ref) => {
            if (ref) shareViewRefs.current[workout.id] = ref;
          }}
          style={styles.hiddenShareView}
          options={{ format: 'png', quality: 1 }}
        >
          <ShareableWorkoutCard workout={workout} />
        </ViewShot>
      ))}

      <Portal>
        <Dialog 
          visible={deleteDialogVisible} 
          onDismiss={() => setDeleteDialogVisible(false)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title>Delete Workout</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this workout? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => setDeleteDialogVisible(false)}
              buttonColor={theme.colors.primary}
              textColor="#FFFFFF"
              mode="contained"
            >
              Cancel
            </Button>
            <Button onPress={confirmDelete} textColor={theme.colors.error}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Snackbar for feedback */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  searchBar: {
    marginBottom: spacing.xs,
    borderRadius: 8,
  },
  searchInput: {
    fontSize: 14,
  },
  helperText: {
    marginBottom: spacing.sm,
    paddingLeft: spacing.xs,
    fontStyle: 'italic',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dateButton: {
    flex: 1,
    borderRadius: 8,
  },
  dateButtonContent: {
    paddingVertical: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  filterChip: {
    marginRight: 0,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  noResultsText: {
    marginTop: spacing.md,
    fontWeight: '600',
  },
  noResultsSubtext: {
    marginTop: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptySubtext: {
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.md,
  },
  workoutCard: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    elevation: 1,
  },
  cardContent: {
    paddingVertical: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  workoutName: {
    fontWeight: '600',
    marginBottom: spacing.xs,
    fontSize: 18,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  totalTime: {
    fontWeight: '700',
  },
  milliseconds: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 1,
  },
  roundsBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  roundsText: {
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    marginVertical: spacing.md,
  },
  expandedContent: {
    marginTop: 0,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  exerciseTotal: {
    fontWeight: '600',
  },
  roundItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  roundTime: {
    fontWeight: '600',
  },
  shareSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  shareLabel: {
    fontWeight: '700',
    marginBottom: spacing.md,
    fontSize: 18,
  },
  shareButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  shareButton: {
    flex: 1,
  },
  shareButtonContent: {
    paddingVertical: spacing.xs,
  },
  deleteSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
  },
  deleteText: {
    fontWeight: '700',
    fontSize: 15
  },
  hiddenShareView: {
    position: 'absolute',
    left: -10000,
    top: -10000,
  },
});

export default LogbookScreen;
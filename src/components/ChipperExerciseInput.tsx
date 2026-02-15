import React from 'react';
import FixedRepsExerciseInput from './FixedRepsExerciseInput';
import { Exercise } from '../types';

interface ChipperExerciseInputProps {
  exercise: Exercise;
  onChange: (exercise: Exercise) => void;
  onDelete: () => void;
  canDelete: boolean;
}

const ChipperExerciseInput: React.FC<ChipperExerciseInputProps> = (props) => {
  return (
    <FixedRepsExerciseInput
      {...props}
      repsLabel="Reps"
      repsProperty="fixedReps"
    />
  );
};

export default ChipperExerciseInput;

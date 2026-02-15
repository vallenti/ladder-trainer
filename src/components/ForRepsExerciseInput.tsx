import React from 'react';
import FixedRepsExerciseInput from './FixedRepsExerciseInput';
import { Exercise } from '../types';

interface ForRepsExerciseInputProps {
  exercise: Exercise;
  onChange: (exercise: Exercise) => void;
  onDelete: () => void;
  canDelete: boolean;
}

const ForRepsExerciseInput: React.FC<ForRepsExerciseInputProps> = (props) => {
  return (
    <FixedRepsExerciseInput
      {...props}
      repsLabel="Reps per round"
      repsProperty="repsPerRound"
    />
  );
};

export default ForRepsExerciseInput;

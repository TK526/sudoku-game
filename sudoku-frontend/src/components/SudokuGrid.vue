<!-- ./components/SudokuGrid.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import type { CellPosition } from '../types'; // Import shared type

// Define Props interface
interface Props {
  gridData: number[][];
  initialGrid: number[][];
  selectedCell: CellPosition | null;
  errorCells: Set<string>; // Reactive Set passed down ('row-col')
  hintCells: Set<string>; // Reactive Set passed down ('row-col')
  isPaused: boolean;
  animatingRows: Set<number>;   // Animation
  animatingCols: Set<number>;   // Animation
  isCompleted: boolean; // Winning Animation
}
const props = defineProps<Props>();

// Define Emits type literal
const emit = defineEmits<{
  (event: 'cell-selected', position: CellPosition): void;
}>();

// Computed properties with types
const gridDimension = computed<number>(() => props.gridData?.length || 9);
const subgridSize = computed<number>(() => Math.sqrt(gridDimension.value));

// Helper functions with types
const isPrefilled = (row: number, col: number): boolean => {
    return !!props.initialGrid[row]?.[col]; // Check if non-zero
};

const isSelected = (row: number, col: number): boolean => {
    return props.selectedCell?.row === row && props.selectedCell?.col === col;
};

const isError = (row: number, col: number): boolean => {
    return props.errorCells.has(`${row}-${col}`);
};

const isHint = (row: number, col: number): boolean => {
    return props.hintCells.has(`${row}-${col}`);
};

// Get cell classes function with types
const getCellClass = (row: number, col: number): string[] => {
  const classes = ['sudoku-cell'];
  const prefilled = isPrefilled(row, col);
  const hint = isHint(row, col);

  if (prefilled) classes.push('prefilled');
  if (isSelected(row, col)) classes.push('selected');
  if (isError(row, col)) classes.push('error'); // Keep error style separate
  if (hint) classes.push('hint');
  if (!prefilled && !hint) classes.push('user-input');

  // Borders - No change
  if ((col + 1) % subgridSize.value === 0 && col < gridDimension.value - 1) { classes.push('thick-border-right'); }
  if ((row + 1) % subgridSize.value === 0 && row < gridDimension.value - 1) { classes.push('thick-border-bottom'); }

  // *** CHECK ROW/COL ANIMATION ***
  if (props.animatingRows.has(row) || props.animatingCols.has(col)) {
      classes.push('animate-shake-unit'); // Use new class name
  }

  return classes;
};

// Cell selection handler with types
const selectCell = (row: number, col: number): void => {
    if (props.isPaused) return;
    // Let App.vue handle preventing selection of pre-filled
    emit('cell-selected', { row, col });
};
</script>

<template>
      <div
        class="sudoku-grid-container"
        :class="{ paused: isPaused, 'game-completed': isCompleted }"
      >
        <div v-if="gridData.length > 0" class="sudoku-grid" :style="{ '--grid-size': gridDimension }">
        <template v-for="(row, rowIndex) in gridData" :key="`row-${rowIndex}`">
          <div
            v-for="(cellValue, colIndex) in row"
            :key="`cell-${rowIndex}-${colIndex}`"
            :class="getCellClass(rowIndex, colIndex)"
            @click="selectCell(rowIndex, colIndex)"
            role="button"
            :aria-label="`Cell Row ${rowIndex+1} Column ${colIndex+1} Value ${cellValue || 'Empty'}`"
            :aria-selected="isSelected(rowIndex, colIndex)"
            tabindex="0"
            @keydown.enter.space="selectCell(rowIndex, colIndex)"
          >
            {{ cellValue === 0 ? '' : cellValue }}
          </div>
        </template>
      </div>
      <div v-else class="loading-grid">Loading Grid...</div> <!-- Added loading text -->
      <div v-if="isPaused" class="paused-overlay">Paused</div>
    </div>
</template>

<style scoped>
 .sudoku-grid-container {
    position: relative;
    margin-bottom: 1em;
    width: 100%;
    max-width: 540px; /* Adjust size as needed, keep divisible by 9 */
    aspect-ratio: 1 / 1;
    margin-left: auto;
    margin-right: auto;
 }
 .loading-grid { /* Style for loading text */
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%; /* Ensure it takes up space */
    font-style: italic;
    color: #777;
 }

/* This is the main grid element */
.sudoku-grid {
  display: grid;
  /* Define 9 equal columns and rows */
  grid-template-columns: repeat(var(--grid-size, 9), 1fr);
  grid-template-rows: repeat(var(--grid-size, 9), 1fr);
  /* Use the strong border for the outer edge */
  border: 3px solid var(--strong-border-color, #333); /* Added fallback */
  width: 100%;
  height: 100%;
  background-color: var(--cell-bg, #fff); /* Added fallback */
}

/* Styles for each individual cell */
.sudoku-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  /* Adjust font size as needed */
  font-size: clamp(1.5rem, 5vw, 2.2rem);
  /* Use the standard border color for thin internal lines */
  border: 1px solid var(--border-color, #bbb); /* Added fallback */
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
  background-color: var(--cell-bg, #fff);
  color: #111; /* Default text color */
  box-sizing: border-box; /* Ensure border doesn't add to size */
}
.sudoku-cell:focus { /* Accessibility focus */
    outline: 2px solid blue;
    outline-offset: -2px;
    z-index: 2;
}

/* Style for user-editable cells (not prefilled) */
.sudoku-cell.user-input {
    font-weight: bold;
    color: #0056b3; /* Blue color for user input */
}
.sudoku-cell.user-input:hover {
    background-color: #f0f8ff; /* Light hover */
}

/* Style for the initial numbers given */
.sudoku-cell.prefilled {
  background-color: var(--cell-prefilled-bg, #e0e0e0); /* Added fallback */
  cursor: default;
  font-weight: bold;
  color: #333; /* Darker color */
}

/* Style for the currently selected cell (yellow) */
.sudoku-cell.selected {
  background-color: var(--cell-selected-bg, #fffbaf); /* Added fallback yellow */
  z-index: 1;
}

/* Style for cells marked as errors */
.sudoku-cell.error {
   background-color: var(--cell-error-bg, #fff);
   color: var(--cell-error-text, #dc3545); /* Red text for error */
   animation: shake 0.3s;
   font-weight: bold;
}

/* Style for cells revealed by hints */
.sudoku-cell.hint {
   background-color: var(--cell-hint-bg, #d1ecf1); /* Light blue */
   color: var(--cell-hint-text, #0c5460); /* Darker blue text */
   font-style: italic;
   font-weight: bold;
   cursor: default; /* Hints are not interactive */
}

/* Thicker borders for subgrids */
.thick-border-right { border-right: 2px solid var(--strong-border-color, #333); }
.thick-border-bottom { border-bottom: 2px solid var(--strong-border-color, #333); }

 .paused-overlay {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background-color: rgba(128, 128, 128, 0.6); display: flex;
    justify-content: center; align-items: center; font-size: 2em;
    color: white; font-weight: bold; z-index: 10; pointer-events: none;
 }

 @keyframes errorShake { /* Renamed original shake */
  0%, 100% { transform: translateX(0); }
  25%, 75% { transform: translateX(-4px); }
  50% { transform: translateX(4px); }
}
.sudoku-cell.error {
   animation: errorShake 0.4s ease-in-out; /* Apply specific error shake */
}

@keyframes completionShake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); } /* Multiple quick shakes */
  20%, 40%, 60%, 80% { transform: translateX(3px); }
}

.sudoku-cell.animate-shake-unit {
  /* Apply completion shake animation once */
  animation: completionShake 0.6s ease-in-out 1; /* Adjust timing (0.6s) */
  /* background-color: var(--cell-selected-bg); */ /* Optional: Change color during shake */
  z-index: 5; /* Ensure animated cells are visually on top */
}

/*
Winning Animation
*/
@keyframes celebrate {
  0%, 100% { transform: scale(1); background-color: var(--color-success); color: white; }
  50% { transform: scale(1.08); background-color: lighten(var(--color-success), 10%); }
}

/* Apply animation to all cells when game is completed */
.game-completed .sudoku-cell {
  animation: celebrate 1s ease-in-out 1 forwards; /* Run once and stay at end state */
  /* animation-delay: 0.1s; */ /* Optional: staggered delay */
}

.game-completed .sudoku-cell.selected {
    background-color: var(--color-success); /* Keep win color */
}
.game-completed .sudoku-cell.error {
    color: white; /* Make error text white on green bg */
    animation: none; /* Prevent shake during win */
}
.game-completed .sudoku-cell.hint {
     background-color: var(--color-success); /* Override hint bg */
     color: white;
     font-style: normal; /* Remove italic during win */
}
</style>
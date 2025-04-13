<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';

// Import Components
import SudokuGrid from './components/SudokuGrid.vue';
import Controls from './components/Controls.vue';
import NumberPad from './components/NumberPad.vue';
import Leaderboard from './components/Leaderboard.vue';
import GameEndModal from './components/GameEndModal.vue';

// Import Services and Types
import api from './services/api';
import type { CellPosition, LeaderboardData } from './types';

// State variables
const gameId = ref<string | null>(null);
const difficulty = ref<string>('beginner');
const grid = ref<number[][]>([]);
const initialGrid = ref<number[][]>([]);
const selectedCell = ref<CellPosition | null>(null);
const errors = ref<number>(0);
const hintsUsed = ref<number>(0);
const maxHints = ref<number>(10);
const visibleCount = ref<number>(0);
const gameStartTime = ref<number | null>(null);
const elapsedTime = ref<number>(0);
const timerInterval = ref<number | null>(null);
const isPaused = ref<boolean>(false);
const isCompleted = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const showGameEndModal = ref<boolean>(false);
const finalScore = ref<number | null>(null);
const errorCells = reactive<Set<string>>(new Set());
const hintCells = reactive<Set<string>>(new Set());
const leaderboardData = ref<LeaderboardData | null>(null);
const animatingRows = reactive<Set<number>>(new Set());
const animatingCols = reactive<Set<number>>(new Set());

// Computed properties
const gameInProgress = computed<boolean>(() => gameId.value !== null && !isCompleted.value);
const hintsRemaining = computed<number>(() => maxHints.value - hintsUsed.value);
const gridDimension = computed<number>(() => grid.value?.length || 9);

// Calculates count of each digit currently on the grid
const digitCounts = computed<{ [key: number]: number }>(() => {
    const counts: { [key: number]: number } = {};
    for (let i = 1; i <= 9; i++) { counts[i] = 0; }
    if (!grid.value || grid.value.length === 0) return counts;
    for (let r = 0; r < gridDimension.value; r++) {
        for (let c = 0; c < gridDimension.value; c++) {
            const val = grid.value[r]?.[c];
            if (val >= 1 && val <= 9) { counts[val]++; }
        }
    }
    return counts;
});

// Fetch Leaderboard Data
const fetchLeaderboard = async (): Promise<void> => {
    isLoading.value = true;
    try {
        const response = await api.getLeaderboard();
        leaderboardData.value = response.data;
    } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        alert("Could not load leaderboard data.");
    } finally {
         isLoading.value = false;
    }
};

// Reset Game State
const resetGameState = (): void => {
    stopTimer();
    gameId.value = null; 
    grid.value = []; 
    initialGrid.value = [];
    selectedCell.value = null; 
    errors.value = 0; 
    hintsUsed.value = 0;
    visibleCount.value = 0; 
    gameStartTime.value = null; 
    elapsedTime.value = 0;
    isPaused.value = false; 
    isCompleted.value = false; 
    showGameEndModal.value = false;
    finalScore.value = null; 
    errorCells.clear(); 
    hintCells.clear();
    animatingRows.clear();
    animatingCols.clear();
};

// Start a New Game
const startGame = async (selectedDifficulty: string): Promise<void> => {
    if (isLoading.value) return;
    isLoading.value = true;
    resetGameState();
    difficulty.value = selectedDifficulty;
    try {
        const response = await api.createGame({ difficulty: difficulty.value, gridDimension: 9 });
        const { gameId: newGameId, hiddenGrid, visibleCount: initialVisibleCount } = response.data;
        if (!newGameId) throw new Error("Backend did not return a game ID.");

        gameId.value = newGameId;
        grid.value = hiddenGrid.map(row => [...row]);
        initialGrid.value = hiddenGrid.map(row => [...row]);
        visibleCount.value = initialVisibleCount;
        gameStartTime.value = Date.now();
        startTimer();
    } catch (err: any) {
        console.error("Error starting game:", err);
        alert(`Error starting game: ${err.response?.data?.message || err.message || 'Unknown error'}`);
        resetGameState();
    } finally {
        isLoading.value = false;
    }
};

// Handle the 'newGame' event emitted by Controls
const handleNewGame = (): void => {
    resetGameState();
};

// Handle Cell Selection from Grid Component
const handleCellSelect = (position: CellPosition): void => {
    if (isPaused.value || isCompleted.value) return;
    if (initialGrid.value[position.row]?.[position.col] !== 0) {
        selectedCell.value = null; 
        return;
    }
    selectedCell.value = position;
    errorCells.delete(`${position.row}-${position.col}`);
};

// Check for completed rows and columns and trigger animations
const checkRowColCompletion = (row: number, col: number): void => {
    const size = gridDimension.value;
    let rowComplete = true;
    let colComplete = true;

    // Check Row
    for (let c = 0; c < size; c++) {
        if (grid.value[row]?.[c] === 0) {
            rowComplete = false;
            break;
        }
    }

    // Check Column
    for (let r = 0; r < size; r++) {
        if (grid.value[r]?.[col] === 0) {
            colComplete = false;
            break;
        }
    }

    // Trigger animations if units are complete
    if (rowComplete) animatingRows.add(row);
    if (colComplete) animatingCols.add(col);

    // Clear animation classes after a delay
    if (rowComplete) {
        setTimeout(() => animatingRows.delete(row), 600);
    }
    if (colComplete) {
        setTimeout(() => animatingCols.delete(col), 600);
    }
};

// Handle Number Input from Keyboard or Number Pad
const handleNumberInput = async (value: number): Promise<void> => {
    if (!selectedCell.value || isLoading.value || isCompleted.value || isPaused.value) return;

    const { row, col } = selectedCell.value;
    if (initialGrid.value[row]?.[col] !== 0 || hintCells.has(`${row}-${col}`)) return;

    const oldValue = grid.value[row][col];
    if (oldValue === value) return;

    grid.value[row][col] = value; // Optimistic update

    try {
        const response = await api.checkValue({
            gameId: gameId.value!,
            row: row,
            column: col,
            value: value
        });
        const { correct, visibleValuesCount: newVisibleCount, errors: newErrors } = response.data;
        visibleCount.value = newVisibleCount;
        errors.value = newErrors;

        const cellKey = `${row}-${col}`;
        correct ? errorCells.delete(cellKey) : errorCells.add(cellKey);

        if (correct) {
            checkRowColCompletion(row, col);
            if (newVisibleCount >= 81) {
                await checkGameCompletion();
            }
        }
    } catch (err: any) {
        console.error("Error checking value:", err);
        alert(`Error checking value: ${err.response?.data?.message || err.message || 'Unknown error'}`);
        grid.value[row][col] = oldValue; // Revert on error
    }
};

// Clear Selected Cell from Keyboard
const clearSelectedCell = (): void => {
    if (!selectedCell.value || isLoading.value || isCompleted.value || isPaused.value) return;
    const { row, col } = selectedCell.value;
    const cellKey = `${row}-${col}`;
    if (initialGrid.value[row]?.[col] === 0 && !hintCells.has(cellKey) && grid.value[row]?.[col] !== 0) {
        grid.value[row][col] = 0;
        errorCells.delete(cellKey);
    }
};

// Request a Hint
const requestHint = async (): Promise<void> => {
    if (isLoading.value || isCompleted.value || hintsRemaining.value <= 0 || isPaused.value || !gameId.value) return;
    isLoading.value = true;
    try {
        const response = await api.useHint({ gameId: gameId.value });
        const hintData = response.data;
        if (hintData.error) {
            alert(`Hint Error: ${hintData.error}`);
            if (hintData.hintsUsed !== undefined) hintsUsed.value = hintData.hintsUsed;
            if (hintData.visibleValuesCount !== undefined) visibleCount.value = hintData.visibleValuesCount;
        } else if (hintData.rowIndex !== undefined && hintData.columnIndex !== undefined && hintData.value !== undefined) {
            grid.value[hintData.rowIndex][hintData.columnIndex] = hintData.value;
            hintsUsed.value++;
            if (hintData.visibleValuesCount !== undefined) visibleCount.value = hintData.visibleValuesCount;
            const cellKey = `${hintData.rowIndex}-${hintData.columnIndex}`;
            hintCells.add(cellKey);
            errorCells.delete(cellKey);

            checkRowColCompletion(hintData.rowIndex, hintData.columnIndex);

            if (visibleCount.value >= 81) {
                await checkGameCompletion();
            }
        }
    } catch (err: any) {
        console.error("Error getting hint:", err);
        alert(`Error getting hint: ${err.response?.data?.message || err.message || 'Unknown error'}`);
    } finally {
        isLoading.value = false;
    }
};

// Check Game Completion Status with Backend
const checkGameCompletion = async (): Promise<void> => {
    if (!gameId.value) return;
    isLoading.value = true;
    try {
        const response = await api.isGameCompleted({ gameId: gameId.value });
        if (response.data === true) {
            isCompleted.value = true;
            stopTimer();
            try {
                const scoreResponse = await api.getScore({ gameId: gameId.value });
                finalScore.value = scoreResponse.data;
            } catch (scoreErr: any) {
                console.error("Error fetching score:", scoreErr);
                finalScore.value = null;
                alert(`Could not fetch final score: ${scoreErr.response?.data?.message || scoreErr.message || 'Unknown error'}`);
            }
            showGameEndModal.value = true;
        }
    } catch (err: any) {
        console.error("Error checking completion:", err);
        alert(`Error checking completion: ${err.response?.data?.message || err.message || 'Unknown error'}`);
    } finally {
        isLoading.value = false;
    }
};

// Submit Score to Leaderboard
const submitScore = async (username: string): Promise<void> => {
    if (!username || isLoading.value || finalScore.value === null || !gameId.value) return;
    isLoading.value = true;
    try {
        await api.addLeaderboardRecord({ username, score: finalScore.value, difficulty: difficulty.value });
        showGameEndModal.value = false;
        await fetchLeaderboard();
        alert(`Score submitted for ${username}!`);
        resetGameState();
    } catch (err: any) {
        console.error("Error submitting score:", err);
        alert(`Error submitting score: ${err.response?.data?.message || err.message || 'Unknown error'}`);
    } finally {
        isLoading.value = false;
    }
};

// Timer Functions
const startTimer = (): void => {
    stopTimer();
    if (!gameStartTime.value) gameStartTime.value = Date.now();
    timerInterval.value = window.setInterval(() => {
        if (!isPaused.value && !isCompleted.value && gameStartTime.value) {
            elapsedTime.value = Math.floor((Date.now() - gameStartTime.value) / 1000);
        }
    }, 1000);
};

const stopTimer = (): void => {
    if (timerInterval.value !== null) {
        clearInterval(timerInterval.value);
        timerInterval.value = null;
    }
};

const togglePause = (): void => {
    if (!isCompleted.value) {
        isPaused.value = !isPaused.value;
    }
};

const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// Keyboard Event Handler
const handleKeyDown = (event: KeyboardEvent): void => {
    if (showGameEndModal.value || isLoading.value) return;
    if (!gameInProgress.value || isPaused.value || isCompleted.value) return;
    const { key } = event;

    // Handle cell input/clear only if a cell is selected
    if (selectedCell.value) {
        const { row, col } = selectedCell.value;
        const cellKey = `${row}-${col}`;
        const isEditable = initialGrid.value[row]?.[col] === 0 && !hintCells.has(cellKey);

        if (isEditable) {
            if (key >= '1' && key <= '9') {
                const digit = parseInt(key);
                if (digitCounts.value[digit] >= 9) {
                    event.preventDefault();
                    return;
                }
                event.preventDefault();
                handleNumberInput(digit);
                return;
            } else if (key === 'Backspace' || key === 'Delete') {
                event.preventDefault();
                clearSelectedCell();
                return;
            }
        }
        
        // Arrow Key Navigation
        let newRow = row;
        let newCol = col;
        let moved = false;
        
        if (key === 'ArrowUp') {
            newRow = Math.max(0, row - 1);
            moved = true;
        } else if (key === 'ArrowDown') {
            newRow = Math.min(gridDimension.value - 1, row + 1);
            moved = true;
        } else if (key === 'ArrowLeft') {
            newCol = Math.max(0, col - 1);
            moved = true;
        } else if (key === 'ArrowRight') {
            newCol = Math.min(gridDimension.value - 1, col + 1);
            moved = true;
        }
        
        if (moved) {
            event.preventDefault();
            handleCellSelect({ row: newRow, col: newCol });
            return;
        }
    }

    // Global keys
    if (key.toUpperCase() === 'P') {
        event.preventDefault();
        togglePause();
    }
    if (key.toUpperCase() === 'H') {
        event.preventDefault();
        requestHint();
    }
};

// Lifecycle Hooks
onMounted(() => {
    fetchLeaderboard();
    window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
    stopTimer();
    window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div id="app-container">
    <header class="app-header">
      <h1>Vue Sudoku TS</h1>
      <Controls
        :current-difficulty="difficulty"
        :errors="errors"
        :elapsed-time="elapsedTime"
        :hints-remaining="hintsRemaining"
        :is-paused="isPaused"
        :game-in-progress="gameInProgress"
        :is-loading="isLoading"
        @start-game="startGame"
        @use-hint="requestHint"
        @toggle-pause="togglePause"
        @new-game="handleNewGame"
      ></Controls>
    </header>

    <main class="main-content">
      <div class="game-area">
        <SudokuGrid
          v-if="gameId"
          :grid-data="grid"
          :initial-grid="initialGrid"
          :selected-cell="selectedCell"
          :error-cells="errorCells"
          :hint-cells="hintCells"
          :is-paused="isPaused"
          :animating-rows="animatingRows"
          :animating-cols="animatingCols"
          :animating-boxes="new Set()"
          :is-completed="isCompleted"
          @cell-selected="handleCellSelect"
        ></SudokuGrid>
        
        <div v-else class="start-prompt">
          <p>Select a difficulty and press "Start Game" to begin.</p>
          <div v-if="isLoading">Loading...</div>
        </div>

        <NumberPad
           v-if="gameInProgress"
           :digit-counts="digitCounts"
           :is-paused="isPaused"
        ></NumberPad>
      </div>

      <aside class="sidebar">
         <Leaderboard
            :leaderboard-data="leaderboardData"
            :is-loading="isLoading && leaderboardData === null"
         ></Leaderboard>
      </aside>
    </main>

    <GameEndModal
      v-if="showGameEndModal"
      :score="finalScore"
      :difficulty="difficulty"
      :time="formatTime(elapsedTime)"
      @submit-score="submitScore"
      @close="showGameEndModal = false"
    ></GameEndModal>

    <div v-if="isLoading" class="loading-overlay"><span>Loading...</span></div>
  </div>
</template>

<style>
 :root {
   --border-color: #bbb; --strong-border-color: #333; --main-bg: #f8f8f8;
   --cell-bg: #fff; --cell-prefilled-bg: #e0e0e0; --cell-selected-bg: #fffbaf;
   --cell-error-bg: #fff; --cell-error-text: #dc3545; --cell-hint-bg: #d1ecf1;
   --cell-hint-text: #0c5460; --button-bg: #e9e9e9; --button-hover-bg: #dcdcdc;
   --button-disabled-bg: #f5f5f5; --button-disabled-text: #aaa; --header-bg: #f0f0f0;
   --sidebar-bg: #f5f5f5; --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
   --color-success: #28a745; --color-win-animation: #4CAF50;
 }
 body { font-family: var(--font-family); margin: 0; background-color: var(--main-bg); color: #333; line-height: 1.5; }
 *, *::before, *::after { box-sizing: border-box; }
 #app-container { display: flex; flex-direction: column; max-width: 1000px; min-height: 100vh; margin: 0 auto; background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
 .app-header { background-color: var(--header-bg); padding: 1em; border-bottom: 1px solid var(--border-color); text-align: center; }
 .app-header h1 { margin: 0 0 0.5em 0; font-weight: 600; }
 .main-content {
   display: flex;
   flex-direction: row;
   padding: 1em;
   gap: 1.5em;
   flex-grow: 1;
   align-items: flex-start;
 }

 .game-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8em;
    width: 540px;
    max-width: 100%;
 }

 .start-prompt {
     padding: 20px;
     text-align: center;
     color: #555;
     font-size: 1.1em;
     width: 100%;
 }
 .start-prompt div { margin-top: 10px; font-style: italic; }

 .loading-overlay {
     position: fixed; inset: 0;
     background-color: rgba(255, 255, 255, 0.8);
     display: flex; justify-content: center; align-items: center;
     font-size: 1.5em; color: #333; z-index: 1000;
 }
 .loading-overlay span {
    background-color: #fff; padding: 15px 25px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);
 }

 .sidebar {
    flex-basis: 280px; flex-shrink: 0;
    background-color: var(--sidebar-bg); padding: 1em;
    border-left: 1px solid var(--border-color);
    align-self: stretch;
 }

 @media (max-width: 800px) {
     .main-content { flex-direction: column; align-items: center; }
     .game-area { width: 100%; }
     .sidebar { flex-basis: auto; width: 100%; border-left: none; border-top: 1px solid var(--border-color); padding: 0.5em; align-self: auto; }
 }

 button { padding: 8px 15px; border: 1px solid var(--border-color); border-radius: 4px; background-color: var(--button-bg); cursor: pointer; font-size: 0.95rem; transition: background-color 0.2s ease; }
 button:hover:not(:disabled) { background-color: var(--button-hover-bg); }
 button:disabled { background-color: var(--button-disabled-bg); color: var(--button-disabled-text); cursor: not-allowed; opacity: 0.7; }
</style>
<script setup lang="ts">
// =============================
// IMPORTS
// =============================
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';

// Import Components
import SudokuGrid from './components/SudokuGrid.vue';
import Controls from './components/Controls.vue';
import NumberPad from './components/NumberPad.vue';
import Leaderboard from './components/Leaderboard.vue';
import GameEndModal from './components/GameEndModal.vue';

// Import Services and Types
import api from './services/api';
import type {
    CellPosition,
    LeaderboardData
} from './types'; // Assuming types are defined in src/types/index.ts

// =============================
// STATE VARIABLES
// =============================
const gameId = ref<string | null>(null);
const difficulty = ref<string>('beginner');
const grid = ref<number[][]>([]);
const initialGrid = ref<number[][]>([]);
const selectedCell = ref<CellPosition | null>(null);
const errors = ref<number>(0);
const hintsUsed = ref<number>(0);
const maxHints = ref<number>(10);
const visibleCount = ref<number>(0);
const gameStartTime = ref<number | null>(null); // Timestamp (ms)
const elapsedTime = ref<number>(0); // Seconds
const timerInterval = ref<number | null>(null); // Interval ID
const isPaused = ref<boolean>(false);
const isCompleted = ref<boolean>(false);
const isLoading = ref<boolean>(false); // Global loading state
const showGameEndModal = ref<boolean>(false);
const finalScore = ref<number | null>(null);
const errorCells = reactive<Set<string>>(new Set()); // 'row-col'
const hintCells = reactive<Set<string>>(new Set()); // 'row-col'
const leaderboardData = ref<LeaderboardData | null>(null);
const animatingRows = reactive<Set<number>>(new Set()); // Animation
const animatingCols = reactive<Set<number>>(new Set()); // Animation

// =============================
// COMPUTED PROPERTIES
// =============================
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

// =============================
// METHODS
// =============================

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

// Start a New Game
const startGame = async (selectedDifficulty: string): Promise<void> => {
    if (isLoading.value) return;
    console.log("[Debug] startGame - Starting...");
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
        console.log(`[Debug] startGame - Game state updated. ID: ${gameId.value}`);
        startTimer();
    } catch (err: any) {
        console.error("[Debug] startGame - Error:", err);
        alert(`Error starting game: ${err.response?.data?.message || err.message || 'Unknown error'}`);
        resetGameState();
    } finally {
        isLoading.value = false;
        console.log("[Debug] startGame - Finished.");
    }
};

// Handle the 'newGame' event emitted by Controls
const handleNewGame = (): void => {
    console.log("[Debug] handleNewGame - Resetting for new game selection.");
    resetGameState();
    // Now the difficulty selector should show because gameInProgress is false
};

// Reset Game State
const resetGameState = (): void => {
    console.log("[Debug] resetGameState");
    stopTimer();
    gameId.value = null; grid.value = []; initialGrid.value = [];
    selectedCell.value = null; errors.value = 0; hintsUsed.value = 0;
    visibleCount.value = 0; gameStartTime.value = null; elapsedTime.value = 0;
    isPaused.value = false; isCompleted.value = false; showGameEndModal.value = false;
    finalScore.value = null; errorCells.clear(); hintCells.clear();
    animatingRows.clear(); // Animation
    animatingCols.clear(); // Animation
};

// Handle Cell Selection from Grid Component
const handleCellSelect = (position: CellPosition): void => {
    if (isPaused.value || isCompleted.value) return;
    if (initialGrid.value[position.row]?.[position.col] !== 0) {
        selectedCell.value = null; return;
    }
    selectedCell.value = position;
    errorCells.delete(`${position.row}-${position.col}`);
};

//Animation
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
    if (rowComplete || colComplete) {
        // Use separate timeouts in case both complete simultaneously
        if (rowComplete) {
            setTimeout(() => animatingRows.delete(row), 600); // Shorter duration for shake
        }
        if (colComplete) {
            setTimeout(() => animatingCols.delete(col), 600); // Shorter duration for shake
        }
        console.log(`[Debug] Animating Row: ${rowComplete ? row : 'N/A'}, Col: ${colComplete ? col : 'N/A'}`);
    }
};

// Handle Number Input from Keyboard
const handleNumberInput = async (value: number): Promise<void> => {
    if (!selectedCell.value || isLoading.value || isCompleted.value || isPaused.value) return;

    const { row, col } = selectedCell.value;
    if (initialGrid.value[row]?.[col] !== 0 || hintCells.has(`${row}-${col}`)) return; // Don't overwrite hints

    const oldValue = grid.value[row][col];
    if (oldValue === value) return;

    grid.value[row][col] = value; // Optimistic update

    try {
        const response = await api.checkValue({
            gameId: gameId.value!, // Assert non-null as game should be in progress
            row: row,
            column: col, // *** Ensure this matches CheckValuePayload in api.ts ***
            value: value
        });
        const { correct, visibleValuesCount: newVisibleCount, errors: newErrors } = response.data;
        visibleCount.value = newVisibleCount; errors.value = newErrors; // Update state from backend

        const cellKey = `${row}-${col}`;
        correct ? errorCells.delete(cellKey) : errorCells.add(cellKey);

        if (correct) {
            // *** CALL SIMPLIFIED COMPLETION CHECK HERE ***
            checkRowColCompletion(row, col);
            // Check for overall game completion
            if (newVisibleCount >= 81) { await checkGameCompletion(); }
        }
    } catch (err: any) {
        console.error("[Debug] handleNumberInput - Error:", err);
        alert(`Error checking value: ${err.response?.data?.message || err.message || 'Unknown error'}`);
        grid.value[row][col] = oldValue; // Revert on error
    } finally {
        // isLoading handled by checkGameCompletion if called
    }
};

// Clear Selected Cell from Keyboard
const clearSelectedCell = (): void => {
    if (!selectedCell.value || isLoading.value || isCompleted.value || isPaused.value) return;
    const { row, col } = selectedCell.value;
    const cellKey = `${row}-${col}`;
    if (initialGrid.value[row]?.[col] === 0 && !hintCells.has(cellKey) && grid.value[row]?.[col] !== 0) {
        grid.value[row][col] = 0; errorCells.delete(cellKey);
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
            hintsUsed.value++; // Increment after successful request
            if (hintData.visibleValuesCount !== undefined) visibleCount.value = hintData.visibleValuesCount;
            const cellKey = `${hintData.rowIndex}-${hintData.columnIndex}`;
            hintCells.add(cellKey); errorCells.delete(cellKey);

            checkRowColCompletion(hintData.rowIndex, hintData.columnIndex);

            // Check for overall game completion
            if (visibleCount.value >= 81) { await checkGameCompletion(); }
        }
    } catch (err: any) {
        console.error("[Debug] requestHint - Error:", err);
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
                console.error("[Debug] checkGameCompletion - Error fetching score:", scoreErr);
                finalScore.value = null; // Indicate score fetch failed
                alert(`Could not fetch final score: ${scoreErr.response?.data?.message || scoreErr.message || 'Unknown error'}`);
            }
            showGameEndModal.value = true; // Show modal regardless of score fetch success
        } else {
             console.log("[Debug] checkGameCompletion - Backend says game is NOT complete yet.");
        }
    } catch (err: any) {
        console.error("[Debug] checkGameCompletion - Error:", err);
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
        await fetchLeaderboard(); // Refresh list
        alert(`Score submitted for ${username}!`);
        resetGameState(); // Reset after submission
    } catch (err: any) {
        console.error("[Debug] submitScore - Error:", err);
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
    if (timerInterval.value !== null) { clearInterval(timerInterval.value); timerInterval.value = null; }
};
const togglePause = (): void => {
    if (!isCompleted.value) { isPaused.value = !isPaused.value; }
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
                if (digitCounts.value[digit] >= 9) { event.preventDefault(); return; } // Prevent if count >= 9
                event.preventDefault(); handleNumberInput(digit); return;
            } else if (key === 'Backspace' || key === 'Delete') {
                event.preventDefault(); clearSelectedCell(); return;
            }
        }
        // Arrow Key Navigation (works even if cell isn't editable)
        let newRow = row; let newCol = col; let moved = false;
        if (key === 'ArrowUp') { newRow = Math.max(0, row - 1); moved = true; }
        else if (key === 'ArrowDown') { newRow = Math.min(gridDimension.value - 1, row + 1); moved = true; }
        else if (key === 'ArrowLeft') { newCol = Math.max(0, col - 1); moved = true; }
        else if (key === 'ArrowRight') { newCol = Math.min(gridDimension.value - 1, col + 1); moved = true; }
        if (moved) { event.preventDefault(); handleCellSelect({ row: newRow, col: newCol }); return; }
    }

    // Global keys
    if (key.toUpperCase() === 'P') { event.preventDefault(); togglePause(); }
    if (key.toUpperCase() === 'H') { event.preventDefault(); requestHint(); }
};

// --- Lifecycle Hooks ---
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
        <!-- Show grid container only when gameId is set -->
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
        <!-- Show prompt when no game is active -->
        <div v-else class="start-prompt">
          <p>Select a difficulty and press "Start Game" to begin.</p>
           <!-- Show loading only when trying to start a game -->
           <div v-if="isLoading">Loading...</div>
        </div>

        <!-- Show number pad only during active (not completed) game -->
        <NumberPad
           v-if="gameInProgress"
           :digit-counts="digitCounts"
           :is-paused="isPaused"
        ></NumberPad>
      </div>

      <aside class="sidebar">
         <!-- Show loading indicator for leaderboard only if loading AND data hasn't arrived yet -->
         <Leaderboard
            :leaderboard-data="leaderboardData"
            :is-loading="isLoading && leaderboardData === null"
         ></Leaderboard>
      </aside>
    </main>

    <!-- Show modal only when flag is true -->
    <GameEndModal
      v-if="showGameEndModal"
      :score="finalScore"
      :difficulty="difficulty"
      :time="formatTime(elapsedTime)"
      @submit-score="submitScore"
      @close="showGameEndModal = false"
    ></GameEndModal>

    <!-- Global Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay"><span>Loading...</span></div>
  </div>
</template>

<!-- Global Styles -->
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
   /* Add align-items start to prevent vertical stretching if content height varies */
   align-items: flex-start;
 }

 .game-area {
    /* flex-grow: 1; Remove flex-grow or reduce significantly */
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8em;
    /* *** ADD a width related to the grid's max-width *** */
    /* Match the max-width used in SudokuGrid.vue's container */
    width: 540px; /* Or slightly more to accommodate padding/margins */
    max-width: 100%; /* Prevent overflow on very small screens */
    /* min-height: 400px; Keep min-height */
 }

 /* Keep the prompt centering styles */
 .game-area.game-area--prompt {
    justify-content: center;
 }

 .start-prompt {
     padding: 20px;
     text-align: center;
     color: #555;
     font-size: 1.1em;
     /* Ensure it takes the width of the game area */
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
    flex-basis: 280px; flex-shrink: 0; /* Keep sidebar width fixed */
    background-color: var(--sidebar-bg); padding: 1em;
    border-left: 1px solid var(--border-color);
    /* Ensure sidebar maintains height */
    align-self: stretch; /* Make it stretch to height of main-content */
 }

 /* Responsive styles remain largely the same */
 @media (max-width: 800px) {
     .main-content { flex-direction: column; align-items: center; /* Center items when stacked */ }
     /* Remove fixed width for game-area on small screens */
     .game-area { width: 100%; }
     .sidebar { flex-basis: auto; width: 100%; border-left: none; border-top: 1px solid var(--border-color); padding: 0.5em; align-self: auto; /* Reset stretch */ }
 }

 button { padding: 8px 15px; border: 1px solid var(--border-color); border-radius: 4px; background-color: var(--button-bg); cursor: pointer; font-size: 0.95rem; transition: background-color 0.2s ease; }
 button:hover:not(:disabled) { background-color: var(--button-hover-bg); }
 button:disabled { background-color: var(--button-disabled-bg); color: var(--button-disabled-text); cursor: not-allowed; opacity: 0.7; }
</style>
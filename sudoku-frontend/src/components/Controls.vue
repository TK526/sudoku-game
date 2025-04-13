<!-- ./components/Controls.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'; // Import watch

// Define component props
interface Props {
  currentDifficulty: string;
  errors: number;
  elapsedTime: number;
  hintsRemaining: number;
  isPaused: boolean;
  gameInProgress: boolean;
  isLoading: boolean;
}
const props = defineProps<Props>();

// Define component emits - ADD 'newGame'
const emit = defineEmits<{
  (event: 'startGame', difficulty: string): void;
  (event: 'useHint'): void;
  (event: 'togglePause'): void;
  (event: 'newGame'): void; // Add this emit
}>();

// Local state
const selectedDifficulty = ref<string>(props.currentDifficulty || 'beginner');
const difficulties: string[] = ['beginner', 'intermediate', 'hard', 'expert'];

// Watcher to sync local difficulty when game stops/resets
watch(() => props.gameInProgress, (newGameInProgressValue, oldGameInProgressValue) => {
  if (oldGameInProgressValue === true && newGameInProgressValue === false) {
    selectedDifficulty.value = props.currentDifficulty || 'beginner';
  }
});

// Format time function
const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// Event handlers
const handleStart = (): void => { // This is for the initial "Start Game" button
    if (!props.isLoading) {
        emit('startGame', selectedDifficulty.value);
    }
};

const handleHint = (): void => {
     if (!props.isLoading && props.gameInProgress && !props.isPaused && props.hintsRemaining > 0) {
        emit('useHint');
    }
};

const handlePause = (): void => {
    if (props.gameInProgress) {
        emit('togglePause');
    }
};

// *** ADD this handler for the "New Game" button ***
const handleNewGameClick = (): void => {
    if (!props.isLoading) {
        emit('newGame'); // Emit the reset event
    }
};

</script>

<template>
  <div class="controls-container">
    <!-- Initial Start -->
    <div class="difficulty-selector" v-if="!gameInProgress">
      <label for="difficulty">Difficulty: </label>
      <select id="difficulty" v-model="selectedDifficulty" :disabled="isLoading">
        <option v-for="diff in difficulties" :key="diff" :value="diff">
            {{ diff.charAt(0).toUpperCase() + diff.slice(1) }}
        </option>
      </select>
       <button @click="handleStart" :disabled="isLoading">
        {{ isLoading ? 'Starting...' : 'Start Game' }}
        </button>
    </div>

    <!-- In-Game Controls -->
    <div v-if="gameInProgress" class="game-info">
      <span>Level: {{ currentDifficulty }}</span>
       <span>Errors: {{ errors }}</span>
      <span>Time: {{ formatTime(elapsedTime) }}</span>
      <button @click="handlePause" :disabled="isLoading">{{ isPaused ? 'Resume' : 'Pause' }}</button>
      <button @click="handleHint" :disabled="isLoading || isPaused || hintsRemaining <= 0">
        💡 Hint ({{ hintsRemaining }})
      </button>
       <!-- *** CHANGE @click here *** -->
       <button @click="handleNewGameClick" :disabled="isLoading">New Game</button>
    </div>
  </div>
</template>

<style scoped>
.controls-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
  padding: 0.5em 0;
}

.difficulty-selector, .game-info {
    display: flex;
    align-items: center;
    gap: 10px;
}

 label {
    font-weight: bold;
    /* Ensure label text is dark */
    color: #333;
 }

 select, button {
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--button-bg);
    cursor: pointer;
    font-size: 0.9rem;
    /* --- ADD THIS --- */
    color: #333; /* Set default text color to dark grey */
    text-align: center; /* Center text in button/select */
 }

 /* --- ADD THIS to specifically style select dropdown text --- */
 select {
    min-width: 120px;
    appearance: none; /* Allows custom styling, removes default arrow sometimes */
    background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23333333%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E'); /* Simple dropdown arrow */
    background-repeat: no-repeat;
    background-position: right .7em top 50%;
    background-size: .65em auto;
    padding-right: 2em; /* Add space for the arrow */
    text-align-last: center; /* Center selected option text */
 }
  /* Style for the options within the dropdown */
 select option {
     color: #000; /* Ensure options are black */
     background-color: #fff; /* Ensure background is white */
 }

 button:hover:not(:disabled) {
    background-color: var(--button-hover-bg);
 }

 button:disabled {
    background-color: var(--button-disabled-bg);
    color: var(--button-disabled-text); /* Keep disabled text grey */
    cursor: not-allowed;
 }

 /* Keep span styles the same */
 span {
    font-size: 0.9rem;
    background-color: #fff;
    padding: 5px 8px;
    border-radius: 4px;
    border: 1px solid var(--border-color);
 }
</style>
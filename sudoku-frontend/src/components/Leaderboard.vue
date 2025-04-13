<!-- ./components/Leaderboard.vue -->
<script setup lang="ts"> // ADD lang="ts"
import type { LeaderboardData } from '../types';

interface Props {
  // Allow null for the initial state before data is fetched
  leaderboardData: LeaderboardData | null;
  isLoading: boolean;
}
defineProps<Props>(); // Use the interface

// Specify type for difficultyOrder keys
const difficultyOrder: Array<keyof LeaderboardData> = ['beginner', 'intermediate', 'hard', 'expert'];

// Function to format score with types
const formatScore = (score: number | undefined | null): string => score?.toLocaleString() ?? 'N/A';

// Helper to capitalize difficulty names
const capitalize = (s: string): string => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

</script>

<template>
  <div class="leaderboard">
    <h3>🏆 Leaderboard</h3>
    <!-- v-if/else-if logic was corrected previously -->
    <div v-if="isLoading" class="loading-message">Loading...</div>
    <div v-else-if="!leaderboardData" class="no-data">
       No records yet. Play a game!
    </div>
    <div v-else>
       <!-- Check if all difficulties are empty -->
<div v-if="leaderboardData && difficultyOrder.every(d => !(leaderboardData && leaderboardData[d].length))" class="no-data">
           No records found for any difficulty.
       </div>
       <template v-else>
           <div v-for="difficulty in difficultyOrder" :key="difficulty" class="difficulty-section">
             <h4>{{ capitalize(difficulty) }}</h4>
             <!-- Access is now safe because of v-else-if check -->
             <ul v-if="leaderboardData[difficulty]?.length > 0">
               <li v-for="(record, index) in leaderboardData[difficulty]" :key="record.id || index">
                 <span class="rank">{{ index + 1 }}.</span>
                 <span class="username">{{ record.username }}</span>
                 <span class="score">{{ formatScore(record.score) }}</span>
               </li>
             </ul>
             <p v-else class="no-records">No records for this difficulty.</p>
           </div>
       </template>
    </div>
  </div>
</template>

<style scoped>
/* Styles remain the same as provided in the dump */
.leaderboard {
  text-align: left;
  padding: 10px; /* Add some padding inside the sidebar */
}

.leaderboard h3 {
  text-align: center;
  margin-top: 0;
  margin-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 5px;
}

.difficulty-section {
    margin-bottom: 15px;
}

 .difficulty-section h4 {
    margin-bottom: 5px;
    color: #444;
    font-size: 1em;
 }

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 0.9em;
  border-bottom: 1px dashed #eee;
}

li:last-child {
    border-bottom: none;
}

/* Added classes for better targeting */
li span.rank {
    min-width: 20px; /* Align rank numbers */
    text-align: right;
    margin-right: 5px;
    color: #555;
}
li span.username {
    font-weight: bold;
    color: #333; /* Darker name */
    flex-grow: 1; /* Allow name to take space */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
li span.score {
    color: #0056b3; /* Score color */
    font-weight: bold;
    margin-left: 10px;
}

 .loading-message, .no-data, .no-records {
    text-align: center;
    color: #777;
    padding: 10px;
    font-style: italic; /* Italicize placeholder text */
 }
  .no-records {
      font-size: 0.85em;
      padding: 3px 0; /* Less padding for per-difficulty message */
  }
</style>
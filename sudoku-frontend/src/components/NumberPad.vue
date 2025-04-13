<!-- ./components/NumberPad.vue -->
<script setup lang="ts"> // Added lang="ts"

// Define Props interface
interface Props {
  // Object where keys are digits (1-9) and values are their counts
  digitCounts: { [key: number]: number };
  isPaused: boolean; // Although not interactive, pause might affect appearance slightly
}
const props = defineProps<Props>();

// No emits needed

const numbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Determine if a digit button should be visually 'disabled' (greyed out)
const isDigitComplete = (num: number): boolean => {
    // Disable if count is 9 or more. Pause doesn't affect display state here.
    return props.digitCounts[num] !== undefined && props.digitCounts[num] >= 9;
};

</script>

<template>
  <div class="number-pad">
     <p>Available Digits:</p>
    <button
      v-for="num in numbers"
      :key="num"
      :disabled="isDigitComplete(num)"
      class="digit-display-button"
      tabindex="-1"
    >
      {{ num }}
    </button>
  </div>
</template>

<style scoped>
/* Styles remain the same as provided in the dump */
.number-pad {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  margin-top: 1em;
}

 .number-pad p {
    margin-right: 10px;
    font-size: 0.9rem;
    color: #555;
 }

/* Style for the buttons that now only display digits */
.digit-display-button {
  width: 40px;
  height: 40px;
  font-size: 1.2em;
  border: 1px solid var(--border-color);
  background-color: var(--button-bg);
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #333; /* Default color */
  cursor: default; /* No longer clickable */
}

.digit-display-button:disabled {
   background-color: var(--button-disabled-bg);
   color: var(--button-disabled-text);
   opacity: 0.7;
   /* Optional: Add line-through */
   /* text-decoration: line-through; */
}
</style>
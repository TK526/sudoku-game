import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createApp, reactive } from 'vue';
import App from '../src/App.vue';
import api from '../src/services/api'; // Import the actual API service

// Mock the entire API module
vi.mock('../src/services/api');

// Define mock API responses
const mockLeaderboardData = {
    beginner: [{ id: '1', username: 'test1', score: 100, difficulty: 'beginner', completedAt: new Date() }],
    intermediate: [],
    hard: [],
    expert: [],
};

const mockGameData = {
  gameId: 'mock-game-id',
  hiddenGrid: Array(9).fill(Array(9).fill(0)), // Sample empty grid
  visibleCount: 0,
};

// Mock API functions
(api.getLeaderboard as any).mockResolvedValue({ data: mockLeaderboardData });
(api.createGame as any).mockResolvedValue({ data: mockGameData });
// Add mocks for checkValue, useHint, getScore, isGameCompleted as needed

describe('App.vue', () => {
  let app;
  let wrapper;

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    (api.getLeaderboard as any).mockResolvedValue({ data: mockLeaderboardData });
    (api.createGame as any).mockResolvedValue({ data: mockGameData });

    // Mounting App.vue requires a full Vue app instance if not using TestUtils shallowMount
    app = createApp(App);
    wrapper = mount(App, {
        global: {
            // You might need to mock router, store, etc., if you had them
        },
    });
  });

  it('fetches leaderboard data on mount', async () => {
    // Check if the API call was made
    expect(api.getLeaderboard).toHaveBeenCalled();
    // Wait for the component to update after the async call
    await wrapper.vm.$nextTick();
    // Check if state was updated
    expect(wrapper.vm.leaderboardData).toEqual(mockLeaderboardData);
  });

  it('starts a new game correctly', async () => {
    const difficulty = 'beginner';
    const controls = wrapper.findComponent({ name: 'Controls' }); // Find Controls component
    await controls.vm.$emit('startGame', difficulty); // Simulate clicking Start Game

    // Check if API was called
    expect(api.createGame).toHaveBeenCalledWith({ difficulty, gridDimension: 9 });

    // Wait for the component to update
    await wrapper.vm.$nextTick();

    // Check if state was updated
    expect(wrapper.vm.gameId).toBe(mockGameData.gameId);
    expect(wrapper.vm.grid).toEqual(mockGameData.hiddenGrid);
    expect(wrapper.vm.visibleCount).toBe(mockGameData.visibleCount);
    expect(wrapper.vm.gameInProgress).toBe(true);
  });

  it('resets game state when newGame event is emitted', async () => {
      // Simulate starting a game first
      const controls = wrapper.findComponent({ name: 'Controls' });
      await controls.vm.$emit('startGame', 'beginner');
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.gameInProgress).toBe(true); // Game is running

      // Simulate clicking New Game
      await controls.vm.$emit('newGame');
      await wrapper.vm.$nextTick();

      // Check if state was reset
      expect(wrapper.vm.gameId).toBeNull();
      expect(wrapper.vm.grid).toEqual([]); // Empty grid after reset
      expect(wrapper.vm.gameInProgress).toBe(false);
  });

  // Add more tests for:
  // - handleCellSelect behavior (selecting non-prefilled, deselecting on prefilled)
  // - handleKeyDown (triggering handleNumberInput, clearSelectedCell, navigation)
  // - handleNumberInput (mocking api.checkValue responses and checking state updates)
  // - checkGameCompletion (mocking api.isGameCompleted and api.getScore)
  // - submitScore (mocking api.addLeaderboardRecord)
});
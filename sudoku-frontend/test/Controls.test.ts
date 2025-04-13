import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Controls from '../src/components/Controls.vue';

// Mock the Date.now() for predictable time tests (if needed)
// const mockDate = new Date(2023, 10, 15);
// vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

describe('Controls.vue', () => {
  // Define default props for testing
  const defaultProps = {
    currentDifficulty: 'beginner',
    errors: 0,
    elapsedTime: 0,
    hintsRemaining: 10,
    isPaused: false,
    gameInProgress: false,
    isLoading: false,
  };

  it('renders difficulty selector when game is not in progress', () => {
    const wrapper = mount(Controls, { props: { ...defaultProps, gameInProgress: false } });
    expect(wrapper.find('.difficulty-selector').exists()).toBe(true);
    expect(wrapper.find('.game-info').exists()).toBe(false);
  });

  it('renders game info when game is in progress', () => {
    const wrapper = mount(Controls, { props: { ...defaultProps, gameInProgress: true } });
    expect(wrapper.find('.difficulty-selector').exists()).toBe(false);
    expect(wrapper.find('.game-info').exists()).toBe(true);
  });

  it('emits "startGame" event with selected difficulty when "Start Game" button is clicked', async () => {
    const wrapper = mount(Controls, { props: defaultProps });
    const select = wrapper.find('select');
    await select.setValue('intermediate'); // Select a different difficulty
    const startButton = wrapper.find('button'); // Finds the first button in difficulty selector
    await startButton.trigger('click');
    expect(wrapper.emitted('startGame')).toBeTruthy();
    expect(wrapper.emitted('startGame')?.[0]).toEqual(['intermediate']);
  });

  it('emits "useHint" when Hint button is clicked and game is in progress/not paused', async () => {
    const wrapper = mount(Controls, { props: { ...defaultProps, gameInProgress: true, hintsRemaining: 5 } });
    const hintButton = wrapper.findAll('button')[1]; // Find the Hint button
    await hintButton.trigger('click');
    expect(wrapper.emitted('useHint')).toBeTruthy();
  });

  it('does NOT emit "useHint" if no hints remain', async () => {
    const wrapper = mount(Controls, { props: { ...defaultProps, gameInProgress: true, hintsRemaining: 0 } });
    const hintButton = wrapper.findAll('button')[1];
    await hintButton.trigger('click');
    expect(wrapper.emitted('useHint')).toBeFalsy();
  });

  it('does NOT emit "useHint" if game is paused', async () => {
    const wrapper = mount(Controls, { props: { ...defaultProps, gameInProgress: true, isPaused: true } });
    const hintButton = wrapper.findAll('button')[1];
    await hintButton.trigger('click');
    expect(wrapper.emitted('useHint')).toBeFalsy();
  });

  // Add tests for Pause/Resume button, New Game button
  it('emits "togglePause" when Pause button is clicked', async () => {
     const wrapper = mount(Controls, { props: { ...defaultProps, gameInProgress: true } });
     const pauseButton = wrapper.find('button'); // First button in game-info
     await pauseButton.trigger('click');
     expect(wrapper.emitted('togglePause')).toBeTruthy();
   });

   it('emits "newGame" when New Game button is clicked', async () => {
     const wrapper = mount(Controls, { props: { ...defaultProps, gameInProgress: true } });
     const newGameButton = wrapper.findAll('button')[2]; // Assuming it's the third button in game-info
     await newGameButton.trigger('click');
     expect(wrapper.emitted('newGame')).toBeTruthy();
   });

  it('formats time correctly', () => {
    const wrapper = mount(Controls, { props: { ...defaultProps, gameInProgress: true, elapsedTime: 125 } }); // 2 minutes 5 seconds
    expect(wrapper.text()).toContain('Time: 02:05');
  });

  // Add tests for button disabled states based on isLoading, hintsRemaining, isPaused, gameInProgress
});
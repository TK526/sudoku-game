import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import SudokuGrid from '../src/components/SudokuGrid.vue';
import type { CellPosition } from '../src/types'; // Import type

// Helper function to get cell wrapper by row/col
const getCell = (wrapper: VueWrapper, row: number, col: number) => {
  // Cells are direct children of .sudoku-grid
  // Calculate index: row * 9 + col
  const index = row * 9 + col;
  return wrapper.findAll('.sudoku-cell')[index];
};

describe('SudokuGrid.vue', () => {
  let defaultProps: any; // Use 'any' for flexibility in test setup, or create a specific test props type

  // Reset props before each test
  beforeEach(() => {
    defaultProps = {
      gridData: [ // Example grid data
        [1, 2, 0, 4, 5, 6, 7, 8, 9],
        [4, 5, 6, 0, 0, 0, 0, 0, 0],
        [7, 8, 9, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 3, 0, 0, 0, 0], // Cell (4, 4) = 3 (user input)
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 8, 0, 0], // Cell (6, 6) = 8 (hint)
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 5], // Cell (8, 8) = 5 (error)
      ],
      initialGrid: [ // Define which numbers were pre-filled
        [1, 2, 0, 4, 5, 6, 7, 8, 9],
        [4, 5, 6, 0, 0, 0, 0, 0, 0],
        [7, 8, 9, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0], // Initial value for (4,4) was 0
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0], // Initial value for (6,6) was 0
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0], // Initial value for (8,8) was 0
      ],
      selectedCell: null,
      errorCells: new Set<string>(),
      hintCells: new Set<string>(),
      isPaused: false,
      animatingRows: new Set<number>(),
      animatingCols: new Set<number>(),
      // animatingBoxes prop removed based on simplification
    };
  });

  it('renders the grid with correct dimensions', () => {
    const wrapper = mount(SudokuGrid, { props: defaultProps });
    expect(wrapper.findAll('.sudoku-cell').length).toBe(81); // 9x9 grid
  });

  // --- Test getCellClass Logic ---

  it('applies "prefilled" class to initial numbers', () => {
    const wrapper = mount(SudokuGrid, { props: defaultProps });
    const cell = getCell(wrapper, 0, 0); // Cell with initial value 1
    expect(cell.classes()).toContain('prefilled');
    expect(cell.classes()).not.toContain('user-input');
  });

  it('applies "user-input" class to user-entered numbers', () => {
     // Ensure cell (4,4) is treated as user input (initialGrid is 0)
     const wrapper = mount(SudokuGrid, { props: defaultProps });
     const cell = getCell(wrapper, 4, 4); // Cell with user value 3
     expect(cell.classes()).not.toContain('prefilled');
     expect(cell.classes()).toContain('user-input');
  });


  it('applies "selected" class to the selected cell', () => {
    const selectedPos: CellPosition = { row: 3, col: 3 }; // An empty cell
    const wrapper = mount(SudokuGrid, {
      props: { ...defaultProps, selectedCell: selectedPos },
    });
    const cell = getCell(wrapper, 3, 3);
    expect(cell.classes()).toContain('selected');
  });

  it('applies "error" class to error cells', () => {
    const errorPos = '8-8'; // Row 8, Col 8
    defaultProps.errorCells.add(errorPos);
    const wrapper = mount(SudokuGrid, { props: defaultProps });
    const cell = getCell(wrapper, 8, 8);
    expect(cell.classes()).toContain('error');
  });

  it('applies "hint" class to hint cells', () => {
    const hintPos = '6-6'; // Row 6, Col 6
    defaultProps.hintCells.add(hintPos);
    const wrapper = mount(SudokuGrid, { props: defaultProps });
    const cell = getCell(wrapper, 6, 6);
    expect(cell.classes()).toContain('hint');
    expect(cell.classes()).not.toContain('user-input'); // Hints shouldn't have user-input style
  });

  it('applies "animate-shake-unit" class if row is animating', () => {
    defaultProps.animatingRows.add(4); // Animate row 4
    const wrapper = mount(SudokuGrid, { props: defaultProps });
    const cellInRow = getCell(wrapper, 4, 1); // Any cell in row 4
    const cellNotInRow = getCell(wrapper, 5, 1);
    expect(cellInRow.classes()).toContain('animate-shake-unit');
    expect(cellNotInRow.classes()).not.toContain('animate-shake-unit');
  });

  it('applies "animate-shake-unit" class if column is animating', () => {
    defaultProps.animatingCols.add(5); // Animate col 5
    const wrapper = mount(SudokuGrid, { props: defaultProps });
    const cellInCol = getCell(wrapper, 2, 5); // Any cell in col 5
    const cellNotInCol = getCell(wrapper, 2, 6);
    expect(cellInCol.classes()).toContain('animate-shake-unit');
    expect(cellNotInCol.classes()).not.toContain('animate-shake-unit');
  });

  // --- Test Event Emission ---

  it('emits "cell-selected" with correct position when an editable cell is clicked', async () => {
    const wrapper = mount(SudokuGrid, { props: defaultProps });
    const editableCell = getCell(wrapper, 3, 3); // An empty cell in initialGrid

    await editableCell.trigger('click');

    expect(wrapper.emitted('cell-selected')).toBeTruthy();
    expect(wrapper.emitted('cell-selected')?.[0]).toEqual([{ row: 3, col: 3 }]);
  });

  it('does NOT emit "cell-selected" when clicked if paused', async () => {
    const wrapper = mount(SudokuGrid, { props: { ...defaultProps, isPaused: true } });
    const editableCell = getCell(wrapper, 3, 3);

    await editableCell.trigger('click');

    expect(wrapper.emitted('cell-selected')).toBeFalsy();
  });

});
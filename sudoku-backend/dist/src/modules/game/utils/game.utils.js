"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValid = isValid;
exports.solveSudoku = solveSudoku;
exports.shuffle1DArray = shuffle1DArray;
exports.createList = createList;
exports.createEmptyGrid = createEmptyGrid;
exports.createCellGrid = createCellGrid;
exports.getVisibleCellsRange = getVisibleCellsRange;
exports.createHiddenGrid = createHiddenGrid;
exports.shuffleArray = shuffleArray;
exports.createCellGridWithHidden = createCellGridWithHidden;
exports.countVisibleNumbers = countVisibleNumbers;
function isValid(grid, row, col, num, gridDimension) {
    for (let i = 0; i < gridDimension; i++) {
        if (grid[row][i] === num)
            return false;
    }
    for (let i = 0; i < gridDimension; i++) {
        if (grid[i][col] === num)
            return false;
    }
    const subgridSize = Math.sqrt(gridDimension);
    const startRow = Math.floor(row / subgridSize) * subgridSize;
    const startCol = Math.floor(col / subgridSize) * subgridSize;
    for (let i = startRow; i < startRow + subgridSize; i++) {
        for (let j = startCol; j < startCol + subgridSize; j++) {
            if (grid[i][j] === num)
                return false;
        }
    }
    return true;
}
function solveSudoku(grid, gridDimension) {
    for (let row = 0; row < gridDimension; row++) {
        for (let col = 0; col < gridDimension; col++) {
            if (grid[row][col] === 0) {
                const numbers = shuffleArray([...Array(gridDimension).keys()].map(n => n + 1));
                for (let num of numbers) {
                    if (isValid(grid, row, col, num, gridDimension)) {
                        grid[row][col] = num;
                        if (solveSudoku(grid, gridDimension)) {
                            return true;
                        }
                        grid[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}
function shuffle1DArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function createList(userValue) {
    const list = [];
    for (let i = 1; i <= userValue; i++) {
        list.push(i);
    }
    return list;
}
function createEmptyGrid(gridDimension) {
    return Array.from({ length: gridDimension }, () => Array(gridDimension).fill(0));
}
function createCellGrid(grid) {
    const cellGrid = grid.map(row => row.map(value => ({
        value,
        hidden: false
    })));
    return cellGrid;
}
function getVisibleCellsRange(difficulty, totalCells) {
    switch (difficulty) {
        case 'beginner':
            return { min: 36, max: 40 };
        case 'intermediate':
            return { min: 32, max: 36 };
        case 'hard':
            return { min: 28, max: 32 };
        case 'expert':
            return { min: 24, max: 28 };
        default:
            return { min: 36, max: 40 };
    }
}
function createHiddenGrid(grid, difficulty) {
    const gridDimension = grid.length;
    const totalCells = gridDimension * gridDimension;
    const hiddenGrid = grid.map(row => [...row]);
    const visibleRange = getVisibleCellsRange(difficulty, totalCells);
    const visibleCells = Math.floor(Math.random() * (visibleRange.max - visibleRange.min + 1) + visibleRange.min);
    const cellsToHide = totalCells - visibleCells;
    const positions = [];
    for (let row = 0; row < gridDimension; row++) {
        for (let col = 0; col < gridDimension; col++) {
            positions.push({ row, col });
        }
    }
    const shuffledPositions = shuffleArray([...positions]);
    for (let i = 0; i < cellsToHide; i++) {
        const position = shuffledPositions[i];
        hiddenGrid[position.row][position.col] = 0;
    }
    return hiddenGrid;
}
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}
function createCellGridWithHidden(grid, hiddenGrid) {
    const cellGrid = grid.map((row, rowIndex) => row.map((value, colIndex) => ({
        value,
        hidden: hiddenGrid[rowIndex][colIndex] === 0
    })));
    return cellGrid;
}
function countVisibleNumbers(grid) {
    let count = 0;
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            if (grid[row][col] !== 0) {
                count++;
            }
        }
    }
    return count;
}
//# sourceMappingURL=game.utils.js.map
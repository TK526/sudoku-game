import { Cell } from "../interfaces/cell.interface";
export declare function isValid(grid: number[][], row: number, col: number, num: number, gridDimension: number): boolean;
export declare function solveSudoku(grid: number[][], gridDimension: number): boolean;
export declare function shuffle1DArray(array: number[]): number[];
export declare function createList(userValue: number): number[];
export declare function createEmptyGrid(gridDimension: number): number[][];
export declare function createCellGrid(grid: number[][]): Cell[][];
export declare function getVisibleCellsRange(difficulty: string, totalCells: number): {
    min: number;
    max: number;
};
export declare function createHiddenGrid(grid: number[][], difficulty: string): number[][];
export declare function shuffleArray<T>(array: T[]): T[];
export declare function createCellGridWithHidden(grid: number[][], hiddenGrid: number[][]): Cell[][];
export declare function countVisibleNumbers(grid: number[][]): number;

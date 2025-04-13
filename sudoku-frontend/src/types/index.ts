  // Describes the position of a cell
  export interface CellPosition {
    row: number;
    col: number;
  }
  
  // Describes a single entry in the leaderboard
  export interface LeaderboardEntry {
    id: string; // UUID from backend
    username: string;
    score: number;
    difficulty: string;
    completedAt: string | Date;
  }
  
  // Structure for the full leaderboard data
  export interface LeaderboardData {
    beginner: LeaderboardEntry[];
    intermediate: LeaderboardEntry[];
    hard: LeaderboardEntry[];
    expert: LeaderboardEntry[];
  }
  
  // CreateGameResponse Response Type
  export interface CreateGameResponse {
    gameId: string;
    hiddenGrid: number[][];
    visibleCount: number;
  }
  
  export interface CheckValueResponse {
    correct: boolean;
    visibleValuesCount: number;
    errors: number;
    correctCount: number;
  }
  
  export interface HintResponse {
    error?: string; // Optional error message
    hintsUsed?: number;
    maxHints?: number;
    visibleValuesCount?: number;
    rowIndex?: number;    // Present on success
    columnIndex?: number; // Present on success
    value?: number;       // Present on success
  }
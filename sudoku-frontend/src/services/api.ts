import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { API_BASE_URL } from '../config';
import type {
    CreateGameResponse,
    CheckValueResponse,
    HintResponse,
    LeaderboardData,
    LeaderboardEntry
} from '../types'; // Import types

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


interface CreateGamePayload { difficulty: string; gridDimension?: number; }
interface CheckValuePayload { gameId: string; row: number; column: number; value: number; }
interface GameInfoPayload { gameId: string; }
interface AddRecordPayload { username: string; score: number; difficulty: string; }

export default {
  // --- Game Endpoints ---
  createGame(payload: CreateGamePayload): Promise<AxiosResponse<CreateGameResponse>> {
    return apiClient.post<CreateGameResponse>('/game/create', payload);
  },

  checkValue(payload: CheckValuePayload): Promise<AxiosResponse<CheckValueResponse>> {
    return apiClient.post<CheckValueResponse>('/game/value', payload);
  },

  useHint(payload: GameInfoPayload): Promise<AxiosResponse<HintResponse>> {
    return apiClient.post<HintResponse>('/game/hint', payload);
  },

  getScore(payload: GameInfoPayload): Promise<AxiosResponse<number>> {
    return apiClient.post<number>('/game/score', payload);
  },

  isGameCompleted(payload: GameInfoPayload): Promise<AxiosResponse<boolean>> {
    return apiClient.post<boolean>('/game/completed', payload);
  },

  // --- Leaderboard Endpoints ---
  getLeaderboard(): Promise<AxiosResponse<LeaderboardData>> {
    return apiClient.get<LeaderboardData>('/leaderboard');
  },

  addLeaderboardRecord(payload: AddRecordPayload): Promise<AxiosResponse<LeaderboardEntry>> {
    // backend returns the created record
    return apiClient.post<LeaderboardEntry>('/leaderboard', payload);
  },
};
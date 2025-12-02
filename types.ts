export interface FoodAnalysisResult {
  dish: string;
  portion: string;
  calories: string;
  confidence: number;
  is_food: boolean;
  explanation?: string;
}

export interface HistoryItem extends FoodAnalysisResult {
  id: string;
  timestamp: number;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  HISTORY = 'HISTORY'
}
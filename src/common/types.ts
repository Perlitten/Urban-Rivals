// Card and Game Types
export interface ICard {
  id: string;
  name: string;
  clan: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  level: number;
  power: number;
  damage: number;
  ability?: string;
  abilityDescription?: string;
  imageUrl?: string;
  price?: number;
  owned: boolean;
}

export interface IBattleState {
  id: string;
  playerCards: ICard[];
  opponentCards: ICard[];
  currentRound: number;
  playerLife: number;
  opponentLife: number;
  playerPills: number;
  opponentPills: number;
  gamePhase: 'selection' | 'battle' | 'result';
  history: IBattleRound[];
}

export interface IBattleRound {
  round: number;
  playerCard: ICard;
  opponentCard: ICard;
  playerPills: number;
  opponentPills: number;
  winner: 'player' | 'opponent';
  damage: number;
}

export interface IDeck {
  id: string;
  name: string;
  cards: ICard[];
  winRate?: number;
  totalGames?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPlayer {
  id: string;
  name: string;
  level: number;
  guild?: string;
  winRate?: number;
  preferredClans?: string[];
}

// ML Recommendation Types
export interface IBattleRecommendation {
  recommendedCard: ICard;
  recommendedPills: number;
  winProbability: number;
  reasoning: string;
  alternatives: Array<{
    card: ICard;
    pills: number;
    probability: number;
    reasoning: string;
  }>;
  confidence: number;
}

export interface IDeckRecommendation {
  suggestedChanges: Array<{
    action: 'replace' | 'add' | 'remove';
    currentCard?: ICard;
    suggestedCard?: ICard;
    reasoning: string;
    impact: number;
  }>;
  expectedWinRate: number;
  strengths: string[];
  weaknesses: string[];
  clanBalance: Record<string, number>;
}

export interface IMarketRecommendation {
  buyRecommendations: Array<{
    card: ICard;
    currentPrice: number;
    averagePrice: number;
    priceChange: number;
    reasoning: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  sellRecommendations: Array<{
    card: ICard;
    currentPrice: number;
    averagePrice: number;
    priceChange: number;
    reasoning: string;
    urgency: 'high' | 'medium' | 'low';
  }>;
  budget: number;
  totalValue: number;
}

// User Preferences and Settings
export interface IUserPreferences {
  features: {
    battleAssistant: boolean;
    deckBuilder: boolean;
    marketAnalyzer: boolean;
    analytics: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    position: 'left' | 'right' | 'top' | 'bottom';
    transparency: number;
    detailLevel: 'minimal' | 'normal' | 'detailed';
  };
  notifications: {
    battleRecommendations: boolean;
    marketAlerts: boolean;
    deckSuggestions: boolean;
  };
  privacy: {
    dataCollection: boolean;
    analytics: boolean;
  };
}

// Analytics and Statistics
export interface IGameStatistics {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  averageGameDuration: number;
  favoriteCards: ICard[];
  mostSuccessfulDeck: IDeck;
  recentPerformance: Array<{
    date: Date;
    wins: number;
    losses: number;
    deck: IDeck;
  }>;
  cardEffectiveness: Record<string, {
    timesUsed: number;
    wins: number;
    winRate: number;
  }>;
}

// Chrome Extension Message Types
export interface IChromeMessage {
  type: string;
  payload?: any;
  requestId?: string;
}

export interface IBattleAnalysisMessage extends IChromeMessage {
  type: 'ANALYZE_BATTLE';
  payload: {
    battleState: IBattleState;
  };
}

export interface IDeckAnalysisMessage extends IChromeMessage {
  type: 'ANALYZE_DECK';
  payload: {
    deck: IDeck;
    availableCards: ICard[];
  };
}

export interface IMarketAnalysisMessage extends IChromeMessage {
  type: 'ANALYZE_MARKET';
  payload: {
    userCards: ICard[];
    marketData: IMarketData[];
    budget: number;
  };
}

export interface IMarketData {
  cardId: string;
  price: number;
  seller: string;
  timestamp: Date;
  priceHistory: Array<{
    date: Date;
    price: number;
  }>;
}

// Storage Types
export interface IStorageData {
  cards: ICard[];
  decks: IDeck[];
  statistics: IGameStatistics;
  preferences: IUserPreferences;
  marketHistory: IMarketData[];
  battleHistory: IBattleState[];
}

// ML Model Types
export interface IMLModel {
  name: string;
  version: string;
  type: 'battle' | 'deck' | 'market';
  modelUrl: string;
  weightsUrl?: string;
  inputShape: number[];
  outputShape: number[];
  lastUpdated: Date;
}

export interface IMLPrediction {
  prediction: number | number[];
  confidence: number;
  processingTime: number;
  modelVersion: string;
}

// UI Component Props
export interface IBattleAssistantProps {
  battleState: IBattleState;
  recommendation: IBattleRecommendation | null;
  isLoading: boolean;
  onCardSelect: (card: ICard) => void;
  onPillsChange: (pills: number) => void;
}

export interface IDeckBuilderProps {
  currentDeck: IDeck;
  availableCards: ICard[];
  recommendation: IDeckRecommendation | null;
  onDeckChange: (deck: IDeck) => void;
  onCardAdd: (card: ICard) => void;
  onCardRemove: (cardId: string) => void;
}

export interface IMarketAnalyzerProps {
  marketData: IMarketData[];
  recommendation: IMarketRecommendation | null;
  userBudget: number;
  onBuyCard: (cardId: string) => void;
  onSellCard: (cardId: string) => void;
}

export interface ISettingsProps {
  preferences: IUserPreferences;
  onPreferencesChange: (preferences: IUserPreferences) => void;
  onDataExport: () => void;
  onDataClear: () => void;
}

// Application State Types
export interface IAppState {
  user: IUserState;
  game: IGameState;
  ml: IMLState;
  ui: IUIState;
}

export interface IUserState {
  isLoggedIn: boolean;
  preferences: IUserPreferences;
  statistics: IGameStatistics;
  collection: ICard[];
  decks: IDeck[];
  clintzBalance: number;
}

export interface IGameState {
  currentPage: 'battle' | 'collection' | 'market' | 'guild' | 'other';
  battleState?: IBattleState;
  isInBattle: boolean;
  lastActivity: Date;
}

export interface IMLState {
  modelsLoaded: boolean;
  availableModels: IMLModel[];
  recommendations: {
    battle?: IBattleRecommendation;
    deck?: IDeckRecommendation;
    market?: IMarketRecommendation;
  };
  isProcessing: boolean;
  lastUpdate: Date;
}

export interface IUIState {
  theme: 'light' | 'dark';
  panelPosition: 'left' | 'right';
  transparency: number;
  enabledFeatures: {
    battleAssistant: boolean;
    deckBuilder: boolean;
    marketAnalyzer: boolean;
    analytics: boolean;
  };
  detailLevel: 'minimal' | 'normal' | 'detailed';
  showNotifications: boolean;
}

// Error Types
export interface IAppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Event Types
export type GameEvent = 
  | 'battle_start'
  | 'battle_end'
  | 'card_played'
  | 'deck_created'
  | 'deck_modified'
  | 'market_purchase'
  | 'market_sale';

export interface IGameEventData {
  event: GameEvent;
  timestamp: Date;
  data: any;
}

// Notification Types
export type NotificationLevel = 'info' | 'warning' | 'error' | 'success';

export interface INotification {
  id: string;
  level: NotificationLevel;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type GamePage = 'battle' | 'collection' | 'market' | 'guild' | 'training' | 'other';

export type MLTask = 'battle-analysis' | 'deck-optimization' | 'market-analysis' | 'card-recognition'; 
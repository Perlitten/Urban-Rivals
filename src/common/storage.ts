import Dexie, { Table } from 'dexie';
import type {
  ICard,
  IDeck,
  IBattleState,
  IGameStatistics,
  IUserPreferences,
  IMarketData,
  IStorageData,
  IMLModel
} from '../common/types';

// IndexedDB Database Schema
export class UrbanRivalsDB extends Dexie {
  cards!: Table<ICard>;
  decks!: Table<IDeck>;
  battles!: Table<IBattleState>;
  marketData!: Table<IMarketData>;
  models!: Table<IMLModel>;

  constructor() {
    super('UrbanRivalsDB');
    
    this.version(1).stores({
      cards: 'id, name, clan, rarity, level, power, damage, owned',
      decks: 'id, name, winRate, totalGames, createdAt, updatedAt',
      battles: 'id, currentRound, playerLife, opponentLife, gamePhase',
      marketData: 'cardId, price, timestamp, seller',
      models: 'name, version, type, lastUpdated'
    });
  }
}

// Initialize database instance
export const db = new UrbanRivalsDB();

// Chrome Storage Utilities
export class ChromeStorageManager {
  // Get user preferences from Chrome storage
  static async getPreferences(): Promise<IUserPreferences> {
    const defaultPreferences: IUserPreferences = {
      features: {
        battleAssistant: true,
        deckBuilder: true,
        marketAnalyzer: true,
        analytics: true
      },
      ui: {
        theme: 'dark',
        position: 'right',
        transparency: 0.9,
        detailLevel: 'normal'
      },
      notifications: {
        battleRecommendations: true,
        marketAlerts: true,
        deckSuggestions: true
      },
      privacy: {
        dataCollection: true,
        analytics: true
      }
    };

    try {
      const result = await chrome.storage.local.get(['preferences']);
      return result.preferences || defaultPreferences;
    } catch (error) {
      console.error('Error getting preferences:', error);
      return defaultPreferences;
    }
  }

  // Save user preferences to Chrome storage
  static async setPreferences(preferences: IUserPreferences): Promise<void> {
    try {
      await chrome.storage.local.set({ preferences });
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  }

  // Get game statistics from Chrome storage
  static async getStatistics(): Promise<IGameStatistics> {
    const defaultStats: IGameStatistics = {
      totalGames: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      averageGameDuration: 0,
      favoriteCards: [],
      mostSuccessfulDeck: {
        id: '',
        name: '',
        cards: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      recentPerformance: [],
      cardEffectiveness: {}
    };

    try {
      const result = await chrome.storage.local.get(['statistics']);
      return result.statistics || defaultStats;
    } catch (error) {
      console.error('Error getting statistics:', error);
      return defaultStats;
    }
  }

  // Save game statistics to Chrome storage
  static async setStatistics(statistics: IGameStatistics): Promise<void> {
    try {
      await chrome.storage.local.set({ statistics });
    } catch (error) {
      console.error('Error saving statistics:', error);
      throw error;
    }
  }

  // Clear all Chrome storage data
  static async clearAll(): Promise<void> {
    try {
      await chrome.storage.local.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
}

// IndexedDB Data Access Layer
export class DataManager {
  // Card operations
  static async getAllCards(): Promise<ICard[]> {
    try {
      return await db.cards.toArray();
    } catch (error) {
      console.error('Error getting cards:', error);
      return [];
    }
  }

  static async getCard(id: string): Promise<ICard | undefined> {
    try {
      return await db.cards.get(id);
    } catch (error) {
      console.error('Error getting card:', error);
      return undefined;
    }
  }

  static async saveCard(card: ICard): Promise<void> {
    try {
      await db.cards.put(card);
    } catch (error) {
      console.error('Error saving card:', error);
      throw error;
    }
  }

  static async saveCards(cards: ICard[]): Promise<void> {
    try {
      await db.cards.bulkPut(cards);
    } catch (error) {
      console.error('Error saving cards:', error);
      throw error;
    }
  }

  static async getCardsByClan(clan: string): Promise<ICard[]> {
    try {
      return await db.cards.where('clan').equals(clan).toArray();
    } catch (error) {
      console.error('Error getting cards by clan:', error);
      return [];
    }
  }

  static async getOwnedCards(): Promise<ICard[]> {
    try {
      return await db.cards.where('owned').equals(1).toArray();
    } catch (error) {
      console.error('Error getting owned cards:', error);
      return [];
    }
  }

  // Deck operations
  static async getAllDecks(): Promise<IDeck[]> {
    try {
      return await db.decks.toArray();
    } catch (error) {
      console.error('Error getting decks:', error);
      return [];
    }
  }

  static async getDeck(id: string): Promise<IDeck | undefined> {
    try {
      return await db.decks.get(id);
    } catch (error) {
      console.error('Error getting deck:', error);
      return undefined;
    }
  }

  static async saveDeck(deck: IDeck): Promise<void> {
    try {
      await db.decks.put(deck);
    } catch (error) {
      console.error('Error saving deck:', error);
      throw error;
    }
  }

  static async deleteDeck(id: string): Promise<void> {
    try {
      await db.decks.delete(id);
    } catch (error) {
      console.error('Error deleting deck:', error);
      throw error;
    }
  }

  // Battle operations
  static async saveBattle(battle: IBattleState): Promise<void> {
    try {
      await db.battles.put(battle);
    } catch (error) {
      console.error('Error saving battle:', error);
      throw error;
    }
  }

  static async getBattleHistory(limit: number = 50): Promise<IBattleState[]> {
    try {
      return await db.battles.orderBy('id').reverse().limit(limit).toArray();
    } catch (error) {
      console.error('Error getting battle history:', error);
      return [];
    }
  }

  // Market data operations
  static async saveMarketData(data: IMarketData): Promise<void> {
    try {
      await db.marketData.put(data);
    } catch (error) {
      console.error('Error saving market data:', error);
      throw error;
    }
  }

  static async getMarketData(cardId: string): Promise<IMarketData[]> {
    try {
      return await db.marketData.where('cardId').equals(cardId).toArray();
    } catch (error) {
      console.error('Error getting market data:', error);
      return [];
    }
  }

  static async getRecentMarketData(hours: number = 24): Promise<IMarketData[]> {
    try {
      const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
      return await db.marketData.where('timestamp').above(cutoff).toArray();
    } catch (error) {
      console.error('Error getting recent market data:', error);
      return [];
    }
  }

  // ML Model operations
  static async saveModel(model: IMLModel): Promise<void> {
    try {
      await db.models.put(model);
    } catch (error) {
      console.error('Error saving model:', error);
      throw error;
    }
  }

  static async getModel(name: string): Promise<IMLModel | undefined> {
    try {
      return await db.models.get(name);
    } catch (error) {
      console.error('Error getting model:', error);
      return undefined;
    }
  }

  static async getAllModels(): Promise<IMLModel[]> {
    try {
      return await db.models.toArray();
    } catch (error) {
      console.error('Error getting models:', error);
      return [];
    }
  }

  // Database maintenance
  static async clearAllData(): Promise<void> {
    try {
      await db.transaction('rw', db.cards, db.decks, db.battles, db.marketData, db.models, async () => {
        await db.cards.clear();
        await db.decks.clear();
        await db.battles.clear();
        await db.marketData.clear();
        await db.models.clear();
      });
    } catch (error) {
      console.error('Error clearing database:', error);
      throw error;
    }
  }

  static async exportData(): Promise<IStorageData> {
    try {
      const [cards, decks, battleHistory, marketHistory, preferences, statistics] = await Promise.all([
        DataManager.getAllCards(),
        DataManager.getAllDecks(),
        DataManager.getBattleHistory(),
        DataManager.getRecentMarketData(24 * 7), // Last week
        ChromeStorageManager.getPreferences(),
        ChromeStorageManager.getStatistics()
      ]);

      return {
        cards,
        decks,
        statistics,
        preferences,
        marketHistory,
        battleHistory
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  static async importData(data: Partial<IStorageData>): Promise<void> {
    try {
      await db.transaction('rw', db.cards, db.decks, db.battles, db.marketData, async () => {
        if (data.cards) {
          await db.cards.bulkPut(data.cards);
        }
        if (data.decks) {
          await db.decks.bulkPut(data.decks);
        }
        if (data.battleHistory) {
          await db.battles.bulkPut(data.battleHistory);
        }
        if (data.marketHistory) {
          await db.marketData.bulkPut(data.marketHistory);
        }
      });

      if (data.preferences) {
        await ChromeStorageManager.setPreferences(data.preferences);
      }
      if (data.statistics) {
        await ChromeStorageManager.setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
}

// Initialize database on module load
db.open().catch(error => {
  console.error('Failed to open database:', error);
}); 
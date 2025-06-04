// Market Analysis ML Worker
import type { 
  IMarketRecommendation, 
  ICard, 
  IMarketData 
} from '../../common/types';

interface WorkerMessage {
  type: string;
  data: any;
  requestId: string;
}

// Simple mock ML model for market analysis
class MarketAnalyzer {
  private isLoaded = false;

  async loadModel(): Promise<void> {
    // Simulate model loading
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.isLoaded = true;
  }

  analyzeMarket(userCards: ICard[], marketData: IMarketData[], budget: number): IMarketRecommendation {
    if (!this.isLoaded) {
      throw new Error('Model not loaded');
    }

    // Calculate price statistics for market data
    const priceStats = new Map<string, { avg: number; min: number; max: number; count: number }>();
    
    marketData.forEach(item => {
      const current = priceStats.get(item.cardId) || { avg: 0, min: Infinity, max: 0, count: 0 };
      current.count++;
      current.avg = (current.avg * (current.count - 1) + item.price) / current.count;
      current.min = Math.min(current.min, item.price);
      current.max = Math.max(current.max, item.price);
      priceStats.set(item.cardId, current);
    });

    // Find cards with good buy opportunities (below average price)
    const buyRecommendations = marketData
      .filter(item => {
        const stats = priceStats.get(item.cardId);
        return stats && item.price < stats.avg * 0.85 && item.price <= budget;
      })
      .slice(0, 5)
      .map(item => {
        const stats = priceStats.get(item.cardId)!;
        const priceChange = ((item.price - stats.avg) / stats.avg) * 100;
        
        return {
          card: this.createCardFromMarketData(item),
          currentPrice: item.price,
          averagePrice: Math.round(stats.avg),
          priceChange,
          reasoning: `Good buy opportunity - ${Math.abs(priceChange).toFixed(1)}% below average price`,
          priority: priceChange < -20 ? 'high' as const : 
                   priceChange < -10 ? 'medium' as const : 'low' as const
        };
      })
      .sort((a, b) => a.priceChange - b.priceChange);

    // Find user cards that are selling above average (good sell opportunities)
    const sellRecommendations = userCards
      .filter(card => {
        const marketItem = marketData.find(item => item.cardId === card.id);
        const stats = priceStats.get(card.id);
        return marketItem && stats && marketItem.price > stats.avg * 1.15;
      })
      .slice(0, 3)
      .map(card => {
        const marketItem = marketData.find(item => item.cardId === card.id)!;
        const stats = priceStats.get(card.id)!;
        const priceChange = ((marketItem.price - stats.avg) / stats.avg) * 100;
        
        return {
          card,
          currentPrice: marketItem.price,
          averagePrice: Math.round(stats.avg),
          priceChange,
          reasoning: `High demand - ${priceChange.toFixed(1)}% above average price`,
          urgency: priceChange > 30 ? 'high' as const : 
                  priceChange > 15 ? 'medium' as const : 'low' as const
        };
      })
      .sort((a, b) => b.priceChange - a.priceChange);

    // Calculate total portfolio value
    const totalValue = userCards.reduce((sum, card) => {
      const marketItem = marketData.find(item => item.cardId === card.id);
      return sum + (marketItem?.price || 0);
    }, 0);

    return {
      buyRecommendations,
      sellRecommendations,
      budget,
      totalValue
    };
  }

  private createCardFromMarketData(marketData: IMarketData): ICard {
    // This would typically come from a card database
    // For now, creating a basic card structure
    return {
      id: marketData.cardId,
      name: `Card ${marketData.cardId}`,
      clan: 'Unknown',
      rarity: 'Common',
      level: 1,
      power: 5,
      damage: 5,
      owned: false,
      price: marketData.price
    };
  }
}

// Initialize the analyzer
const analyzer = new MarketAnalyzer();

// Worker message handler
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, data, requestId } = event.data;

  try {
    switch (type) {
      case 'LOAD_MODEL':
        await analyzer.loadModel();
        self.postMessage({
          type: 'MODEL_LOADED',
          requestId,
          data: { success: true }
        });
        break;

      case 'ANALYZE':
        if (!data.marketData) {
          throw new Error('No market data provided');
        }

        const recommendation = analyzer.analyzeMarket(
          data.userCards || [], 
          data.marketData, 
          data.budget || 0
        );
        
        self.postMessage({
          type: 'ANALYSIS_COMPLETE',
          requestId,
          data: recommendation
        });
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      requestId,
      data: {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error
      }
    });
  }
};

// Auto-load model when worker starts
analyzer.loadModel().then(() => {
  self.postMessage({
    type: 'MODEL_LOADED',
    requestId: 'init',
    data: { success: true }
  });
}).catch((error) => {
  self.postMessage({
    type: 'ERROR',
    requestId: 'init',
    data: {
      message: 'Failed to load model',
      error: error
    }
  });
}); 
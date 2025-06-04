// Deck Analysis ML Worker
import type { 
  IDeck, 
  IDeckRecommendation, 
  ICard 
} from '../../common/types';

interface WorkerMessage {
  type: string;
  data: any;
  requestId: string;
}

// Simple mock ML model for deck analysis
class DeckAnalyzer {
  private isLoaded = false;

  async loadModel(): Promise<void> {
    // Simulate model loading
    await new Promise(resolve => setTimeout(resolve, 1500));
    this.isLoaded = true;
  }

  analyzeDeck(deck: IDeck, availableCards: ICard[]): IDeckRecommendation {
    if (!this.isLoaded) {
      throw new Error('Model not loaded');
    }

    if (!deck.cards || deck.cards.length === 0) {
      throw new Error('Empty deck provided');
    }

    // Analyze clan balance
    const clanBalance: Record<string, number> = {};
    deck.cards.forEach(card => {
      clanBalance[card.clan] = (clanBalance[card.clan] || 0) + 1;
    });

    // Calculate average stats
    const avgPower = deck.cards.reduce((sum, card) => sum + card.power, 0) / deck.cards.length;
    const avgDamage = deck.cards.reduce((sum, card) => sum + card.damage, 0) / deck.cards.length;

    // Find weak points in the deck
    const weakCards = deck.cards.filter(card => 
      card.power + card.damage < (avgPower + avgDamage) * 0.8
    );

    // Find potential replacements from available cards
    const suggestedChanges = weakCards.slice(0, 3).map(weakCard => {
      const betterCards = availableCards
        .filter(card => 
          card.clan === weakCard.clan && 
          (card.power + card.damage) > (weakCard.power + weakCard.damage) &&
          !deck.cards.some(deckCard => deckCard.id === card.id)
        )
        .sort((a, b) => (b.power + b.damage) - (a.power + a.damage));

      if (betterCards.length > 0) {
        return {
          action: 'replace' as const,
          currentCard: weakCard,
          suggestedCard: betterCards[0],
          reasoning: `Replace ${weakCard.name} (${weakCard.power}/${weakCard.damage}) with ${betterCards[0].name} (${betterCards[0].power}/${betterCards[0].damage}) for better stats`,
          impact: ((betterCards[0].power + betterCards[0].damage) - (weakCard.power + weakCard.damage)) / 10
        };
      }

      return {
        action: 'remove' as const,
        currentCard: weakCard,
        reasoning: `Consider removing ${weakCard.name} as it's underperforming`,
        impact: -0.2
      };
    });

    // Calculate expected win rate based on deck strength
    const totalStrength = deck.cards.reduce((sum, card) => sum + card.power + card.damage, 0);
    const expectedWinRate = Math.min(0.85, Math.max(0.35, totalStrength / 120));

    // Identify strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (avgPower > 6) strengths.push('High average power');
    if (avgDamage > 6) strengths.push('High average damage');
    if (Object.keys(clanBalance).length <= 2) strengths.push('Good clan focus');
    
    if (avgPower < 4) weaknesses.push('Low average power');
    if (avgDamage < 4) weaknesses.push('Low average damage');
    if (Object.keys(clanBalance).length > 3) weaknesses.push('Too many clans');
    if (weakCards.length > 2) weaknesses.push('Several weak cards');

    return {
      suggestedChanges,
      expectedWinRate,
      strengths,
      weaknesses,
      clanBalance
    };
  }
}

// Initialize the analyzer
const analyzer = new DeckAnalyzer();

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
        if (!data.deck) {
          throw new Error('No deck provided');
        }

        const recommendation = analyzer.analyzeDeck(data.deck, data.availableCards || []);
        
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
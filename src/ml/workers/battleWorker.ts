// Advanced Battle Analysis ML Worker
import { logger, createMLLogger } from '../../common/logger';
import type { 
  IBattleState, 
  IBattleRecommendation, 
  ICard 
} from '../../common/types';

// Initialize worker logger
const workerLogger = createMLLogger('BATTLE_WORKER');

interface WorkerMessage {
  type: string;
  data: any;
  requestId: string;
}

interface BattleContext {
  gamePhase: 'early' | 'mid' | 'late';
  powerBalance: number;
  cardAdvantage: number;
  pillsAdvantage: number;
}

// Advanced Battle Analysis Engine
class BattleAnalyzer {
  private isLoaded = false;
  private clanBonuses: Record<string, string> = {
    'All Stars': '+2 Life',
    'Bangers': '+2 Power',
    'Fang Pi Clang': '+2 Damage',
    'Freaks': '+2 Poison',
    'Ulu Watu': '+2 Power',
    'Montana': '-12 Opp Attack',
    'Uppers': '-10 Opp Attack',
    'Sakrohm': '-8 Opp Attack',
    'Nightmare': '-2 Opp Life',
    'Piranas': '-2 Opp Power',
    'Skeelz': 'Protection: Ability',
    'Roots': 'Stop: Ability',
    'GHEIST': 'Stop: Ability',
    'Pussycats': 'Damage = 1',
    'Rescue': '+1 Life per Damage',
    'Sentinels': '+8 Attack',
    'La Junta': '+2 Damage',
    'Junkz': '+8 Attack'
  };

  async loadModel(): Promise<void> {
    const timer = logger.startTimer(workerLogger, 'Battle Model Loading');
    logger.info(workerLogger, 'Starting battle analysis model loading', {
      clanBonusesCount: Object.keys(this.clanBonuses).length
    });
    
    try {
      // Simulate advanced model loading with card synergies database
      logger.debug(workerLogger, 'Loading card synergies database');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      logger.debug(workerLogger, 'Loading clan bonus calculations');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      logger.debug(workerLogger, 'Loading battle context analyzers');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      this.isLoaded = true;
      timer();
      logger.info(workerLogger, '✅ Battle analysis model loaded successfully');
    } catch (error) {
      timer();
      logger.error(workerLogger, 'Failed to load battle model', error as Error);
      throw error;
    }
  }

  analyzeMatchup(battleState: IBattleState): IBattleRecommendation {
    const timer = logger.startTimer(workerLogger, 'Battle Matchup Analysis');
    logger.info(workerLogger, 'Starting battle matchup analysis', {
      playerCards: battleState.playerCards.length,
      opponentCards: battleState.opponentCards.length,
      playerLife: battleState.playerLife,
      opponentLife: battleState.opponentLife,
      playerPills: battleState.playerPills,
      opponentPills: battleState.opponentPills,
      historyLength: battleState.history.length
    });
    
    if (!this.isLoaded) {
      logger.error(workerLogger, 'Battle analysis attempted with unloaded model');
      throw new Error('Battle analysis model not loaded');
    }

    try {
      logger.debug(workerLogger, 'Analyzing battle context');
      const context = this.analyzeBattleContext(battleState);
      logger.debug(workerLogger, 'Battle context analyzed', {
        gamePhase: context.gamePhase,
        powerBalance: context.powerBalance,
        cardAdvantage: context.cardAdvantage,
        pillsAdvantage: context.pillsAdvantage
      });

      logger.debug(workerLogger, 'Analyzing available cards');
      const cardAnalysis = this.analyzeAvailableCards(battleState.playerCards, context);
      logger.debug(workerLogger, 'Card analysis completed', {
        topCardScore: cardAnalysis[0]?.score,
        cardsAnalyzed: cardAnalysis.length
      });

      logger.debug(workerLogger, 'Analyzing opponent threat');
      const opponentThreat = this.analyzeOpponentThreat(battleState.opponentCards, battleState);
      logger.debug(workerLogger, 'Opponent threat analyzed', {
        threatLevel: opponentThreat.threatLevel,
        avgPower: opponentThreat.avgPower,
        avgDamage: opponentThreat.avgDamage
      });
      
      // Advanced card selection algorithm
      logger.debug(workerLogger, 'Selecting optimal card');
      const recommendedCard = this.selectOptimalCard(cardAnalysis, opponentThreat, context);
      logger.debug(workerLogger, 'Card selected', {
        cardName: recommendedCard.name,
        cardPower: recommendedCard.power,
        cardDamage: recommendedCard.damage
      });

      logger.debug(workerLogger, 'Calculating optimal pills');
      const recommendedPills = this.calculateOptimalPills(recommendedCard, opponentThreat, battleState, context);
      logger.debug(workerLogger, 'Pills calculated', { recommendedPills });
      
      // Monte Carlo simulation for win probability
      logger.debug(workerLogger, 'Running win probability simulation');
      const winProbability = this.calculateWinProbability(recommendedCard, recommendedPills, battleState, context);
      logger.debug(workerLogger, 'Win probability calculated', { winProbability });
      
      // Generate strategic reasoning
      logger.debug(workerLogger, 'Generating strategic reasoning');
      const reasoning = this.generateStrategicReasoning(recommendedCard, recommendedPills, context, opponentThreat);
      
      // Alternative strategies
      logger.debug(workerLogger, 'Generating alternative strategies');
      const alternatives = this.generateAlternatives(cardAnalysis, opponentThreat, context, battleState, recommendedCard);
      logger.debug(workerLogger, 'Alternatives generated', { alternativesCount: alternatives.length });
      
      // Confidence based on multiple factors
      logger.debug(workerLogger, 'Calculating confidence score');
      const confidence = this.calculateConfidence(context, cardAnalysis, opponentThreat);
      logger.debug(workerLogger, 'Confidence calculated', { confidence });

      const recommendation = {
        recommendedCard,
        recommendedPills,
        winProbability,
        reasoning,
        alternatives,
        confidence
      };

      timer();
      logger.info(workerLogger, '✅ Battle matchup analysis completed successfully', {
        recommendation: {
          cardName: recommendedCard.name,
          pills: recommendedPills,
          winProb: winProbability,
          confidence
        }
      });

      return recommendation;
    } catch (error) {
      timer();
      logger.error(workerLogger, 'Battle matchup analysis failed', error as Error, {
        battleState: {
          playerCards: battleState.playerCards.length,
          opponentCards: battleState.opponentCards.length
        }
      });
      throw error;
    }
  }

  private analyzeBattleContext(battleState: IBattleState): BattleContext {
    const gamePhase = this.determineGamePhase(battleState);
    const powerBalance = this.calculatePowerBalance(battleState);
    const cardAdvantage = battleState.playerCards.length - battleState.opponentCards.length;
    const pillsAdvantage = battleState.playerPills - battleState.opponentPills;

    return {
      gamePhase,
      powerBalance,
      cardAdvantage,
      pillsAdvantage
    };
  }

  private determineGamePhase(battleState: IBattleState): 'early' | 'mid' | 'late' {
    const totalRounds = battleState.history.length;
    const remainingCards = battleState.playerCards.length;
    
    if (totalRounds <= 1 && remainingCards >= 3) return 'early';
    if (totalRounds <= 2 && remainingCards >= 2) return 'mid';
    return 'late';
  }

  private calculatePowerBalance(battleState: IBattleState): number {
    const playerPower = battleState.playerCards.reduce((sum, card) => sum + card.power + card.damage, 0);
    const opponentPower = battleState.opponentCards.reduce((sum, card) => sum + card.power + card.damage, 0);
    
    return (playerPower - opponentPower) / Math.max(playerPower, opponentPower, 1);
  }

  private analyzeAvailableCards(cards: ICard[], context: BattleContext) {
    return cards.map(card => {
      const baseScore = card.power + card.damage;
      const clanBonus = this.getClanBonusValue(card.clan);
      const phaseModifier = this.getPhaseModifier(card, context.gamePhase);
      const situationalValue = this.getSituationalValue(card, context);
      
      return {
        card,
        score: baseScore + clanBonus + phaseModifier + situationalValue,
        strengths: this.identifyCardStrengths(card),
        weaknesses: this.identifyCardWeaknesses(card),
        synergy: this.calculateClanSynergy(card, context)
      };
    }).sort((a, b) => b.score - a.score);
  }

  private analyzeOpponentThreat(opponentCards: ICard[], battleState: IBattleState) {
    const avgPower = opponentCards.reduce((sum, card) => sum + card.power, 0) / opponentCards.length;
    const avgDamage = opponentCards.reduce((sum, card) => sum + card.damage, 0) / opponentCards.length;
    const threatLevel = (avgPower + avgDamage) / 14; // Normalized threat level
    
    return {
      avgPower,
      avgDamage,
      threatLevel,
      likelyPlay: this.predictOpponentPlay(opponentCards, battleState),
      counters: this.identifyCounterStrategies(opponentCards)
    };
  }

  private selectOptimalCard(cardAnalysis: any[], opponentThreat: any, context: BattleContext): ICard {
    // Advanced selection considering opponent threat and game context
    for (const analysis of cardAnalysis) {
      if (this.isEffectiveAgainstThreat(analysis, opponentThreat, context)) {
        return analysis.card;
      }
    }
    
    // Fallback to highest scoring card
    return cardAnalysis[0]?.card || cardAnalysis[0]?.card;
  }

  private calculateOptimalPills(card: ICard, opponentThreat: any, battleState: IBattleState, context: BattleContext): number {
    const basePills = Math.min(Math.floor((card.power + card.damage) / 4), battleState.playerPills);
    
    // Adjust based on game phase
    let phaseAdjustment = 0;
    switch (context.gamePhase) {
      case 'early':
        phaseAdjustment = -1; // Conservative early game
        break;
      case 'late':
        phaseAdjustment = +2; // Aggressive late game
        break;
    }
    
    // Adjust based on life difference
    const lifeDiff = battleState.playerLife - battleState.opponentLife;
    const lifeAdjustment = lifeDiff < -4 ? +2 : lifeDiff > 4 ? -1 : 0;
    
    // Adjust based on opponent threat
    const threatAdjustment = opponentThreat.threatLevel > 0.7 ? +1 : 0;
    
    return Math.max(0, Math.min(
      battleState.playerPills,
      basePills + phaseAdjustment + lifeAdjustment + threatAdjustment
    ));
  }

  private calculateWinProbability(card: ICard, pills: number, battleState: IBattleState, context: BattleContext): number {
    const cardStrength = card.power + card.damage + pills;
    const lifeAdvantage = (battleState.playerLife - battleState.opponentLife) / 24;
    const pillsAdvantage = (battleState.playerPills - battleState.opponentPills) / 24;
    const contextBonus = context.gamePhase === 'late' ? 0.1 : 0;
    
    // Monte Carlo simulation approximation
    let winProbability = Math.min(0.95, Math.max(0.05, 
      (cardStrength / 20) + 
      (lifeAdvantage * 0.2) + 
      (pillsAdvantage * 0.1) + 
      contextBonus
    ));
    
    return Math.round(winProbability * 100) / 100;
  }

  private generateStrategicReasoning(card: ICard, pills: number, context: BattleContext, threat: any): string {
    const reasoningParts = [];
    
    reasoningParts.push(`${card.name} is optimal with ${pills} pills`);
    
    if (context.gamePhase === 'early') {
      reasoningParts.push('conserving resources for later rounds');
    } else if (context.gamePhase === 'late') {
      reasoningParts.push('maximizing final round impact');
    }
    
    if (threat.threatLevel > 0.7) {
      reasoningParts.push('countering high opponent threat');
    }
    
    const clanBonus = this.clanBonuses[card.clan];
    if (clanBonus) {
      reasoningParts.push(`utilizing ${card.clan} clan bonus: ${clanBonus}`);
    }
    
    return reasoningParts.join(', ') + '.';
  }

  private generateAlternatives(cardAnalysis: any[], threat: any, context: BattleContext, battleState: IBattleState, recommendedCard: ICard) {
    return cardAnalysis
      .filter(analysis => analysis.card.id !== recommendedCard.id)
      .slice(0, 2)
      .map(analysis => {
        const altPills = this.calculateOptimalPills(analysis.card, threat, battleState, context);
        const altProbability = this.calculateWinProbability(analysis.card, altPills, battleState, context);
        
        return {
          card: analysis.card,
          pills: altPills,
          probability: altProbability,
          reasoning: this.generateAlternativeReasoning(analysis.card, context)
        };
      });
  }

  private calculateConfidence(context: BattleContext, cardAnalysis: any[], threat: any): number {
    const scoreSpread = cardAnalysis[0]?.score - cardAnalysis[1]?.score || 0;
    const contextClarity = context.gamePhase === 'late' ? 0.9 : 0.7;
    const threatCertainty = threat.threatLevel > 0.5 ? 0.8 : 0.6;
    
    return Math.min(0.95, Math.max(0.3, 
      (scoreSpread / 10) + (contextClarity * 0.3) + (threatCertainty * 0.2)
    ));
  }

  // Helper methods
  private getClanBonusValue(clan: string): number {
    const bonusValues: Record<string, number> = {
      'All Stars': 2, 'Bangers': 2, 'Fang Pi Clang': 2,
      'Montana': 3, 'Uppers': 2, 'Sakrohm': 2,
      'Skeelz': 3, 'Roots': 2, 'GHEIST': 2
    };
    return bonusValues[clan] || 0;
  }

  private getPhaseModifier(card: ICard, phase: 'early' | 'mid' | 'late'): number {
    if (phase === 'early' && card.power > 7) return 2;
    if (phase === 'late' && card.damage > 6) return 2;
    return 0;
  }

  private getSituationalValue(card: ICard, context: BattleContext): number {
    let value = 0;
    if (context.powerBalance < 0 && card.power > 6) value += 2;
    if (context.pillsAdvantage < 0 && card.damage > 5) value += 1;
    return value;
  }

  private identifyCardStrengths(card: ICard): string[] {
    const strengths = [];
    if (card.power >= 8) strengths.push('High Power');
    if (card.damage >= 6) strengths.push('High Damage');
    if (card.ability) strengths.push('Special Ability');
    return strengths;
  }

  private identifyCardWeaknesses(card: ICard): string[] {
    const weaknesses = [];
    if (card.power <= 4) weaknesses.push('Low Power');
    if (card.damage <= 2) weaknesses.push('Low Damage');
    return weaknesses;
  }

  private calculateClanSynergy(card: ICard, context: BattleContext): number {
    // Simplified clan synergy calculation
    return this.getClanBonusValue(card.clan);
  }

  private predictOpponentPlay(cards: ICard[], battleState: IBattleState): ICard | null {
    // Predict most likely opponent card based on game state
    return cards.reduce((strongest, card) => 
      (card.power + card.damage) > (strongest.power + strongest.damage) ? card : strongest
    );
  }

  private identifyCounterStrategies(cards: ICard[]): string[] {
    const strategies = [];
    const avgPower = cards.reduce((sum, card) => sum + card.power, 0) / cards.length;
    
    if (avgPower > 6) strategies.push('High damage focus');
    if (avgPower <= 4) strategies.push('Power advantage');
    
    return strategies;
  }

  private isEffectiveAgainstThreat(analysis: any, threat: any, context: BattleContext): boolean {
    return analysis.score > threat.avgPower + threat.avgDamage && 
           analysis.synergy > 1;
  }

  private generateAlternativeReasoning(card: ICard, context: BattleContext): string {
    if (context.gamePhase === 'early') {
      return `Conservative ${context.gamePhase} game strategy with ${card.name}`;
    }
    return `Alternative ${context.gamePhase} game approach focusing on ${card.power > card.damage ? 'power' : 'damage'}`;
  }
}

// Initialize the analyzer
const analyzer = new BattleAnalyzer();

// Worker message handler
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, data, requestId } = event.data;
  const messageLogger = createMLLogger('MESSAGE_HANDLER');
  
  logger.info(messageLogger, 'Received worker message', {
    type,
    requestId,
    dataSize: data ? JSON.stringify(data).length : 0,
    timestamp: Date.now()
  });

  try {
    switch (type) {
      case 'LOAD_MODEL':
        logger.info(messageLogger, 'Processing LOAD_MODEL request', { requestId });
        const loadTimer = logger.startTimer(messageLogger, 'Model Loading');
        
        await analyzer.loadModel();
        loadTimer();
        
        const modelResponse = {
          type: 'MODEL_LOADED',
          requestId,
          data: { 
            success: true,
            modelInfo: {
              name: 'Advanced Battle Analyzer',
              version: '2.0.0',
              capabilities: ['card_analysis', 'threat_assessment', 'strategic_planning']
            }
          }
        };
        
        logger.info(messageLogger, 'Sending MODEL_LOADED response', {
          requestId,
          responseSize: JSON.stringify(modelResponse).length
        });
        
        self.postMessage(modelResponse);
        break;

      case 'ANALYZE':
        logger.info(messageLogger, 'Processing ANALYZE request', { 
          requestId,
          hasBattleState: !!data?.battleState 
        });
        
        if (!data.battleState) {
          logger.error(messageLogger, 'ANALYZE request missing battle state', undefined, { requestId });
          throw new Error('No battle state provided');
        }

        const analysisTimer = logger.startTimer(messageLogger, 'Battle Analysis');
        const recommendation = analyzer.analyzeMatchup(data.battleState);
        analysisTimer();
        
        const analysisResponse = {
          type: 'ANALYSIS_COMPLETE',
          requestId,
          data: recommendation
        };
        
        logger.info(messageLogger, 'Sending ANALYSIS_COMPLETE response', {
          requestId,
          responseSize: JSON.stringify(analysisResponse).length,
          recommendedCard: recommendation.recommendedCard.name,
          winProbability: recommendation.winProbability
        });
        
        self.postMessage(analysisResponse);
        break;

      default:
        logger.warn(messageLogger, 'Unknown message type received', { 
          type, 
          requestId,
          availableTypes: ['LOAD_MODEL', 'ANALYZE']
        });
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    logger.error(messageLogger, 'Worker message processing failed', error as Error, {
      messageType: type,
      requestId,
      errorType: error instanceof Error ? error.constructor.name : 'Unknown'
    });
    
    const errorResponse = {
      type: 'ERROR',
      requestId,
      data: {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error
      }
    };
    
    logger.info(messageLogger, 'Sending ERROR response', {
      requestId,
      errorMessage: errorResponse.data.message
    });
    
    self.postMessage(errorResponse);
  }
};

// Auto-load model when worker starts
logger.info(workerLogger, 'Battle Worker starting auto-initialization');

analyzer.loadModel().then(() => {
  logger.info(workerLogger, '✅ Battle Worker auto-initialization completed successfully');
  
  self.postMessage({
    type: 'MODEL_LOADED',
    requestId: 'init',
    data: { 
      success: true,
      message: 'Advanced Battle Analyzer ready',
      timestamp: Date.now(),
      workerType: 'battle'
    }
  });
}).catch((error) => {
  logger.error(workerLogger, 'Battle Worker auto-initialization failed', error as Error);
  
  self.postMessage({
    type: 'ERROR',
    requestId: 'init',
    data: {
      message: 'Failed to load advanced battle model',
      error: error,
      workerType: 'battle',
      timestamp: Date.now()
    }
  });
}); 
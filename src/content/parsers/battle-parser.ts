/**
 * Battle Parser - Extraction and parsing of battle data
 * Парсинг данных о боях из DOM
 */

import { DOM_SELECTORS, DOMUtils } from '../dom/selectors';
import type { IBattleState, ICard, IBattleRound } from '../../common/types';

export class BattleParser {
  private static instance: BattleParser;
  
  static getInstance(): BattleParser {
    if (!BattleParser.instance) {
      BattleParser.instance = new BattleParser();
    }
    return BattleParser.instance;
  }

  /**
   * Parse complete battle state from DOM
   */
  parseBattleState(): IBattleState | null {
    try {
      const battleContainer = DOMUtils.findElement(DOM_SELECTORS.battle.container);
      if (!battleContainer) {
        return null;
      }

      const playerCards = this.extractPlayerCards(battleContainer);
      const opponentCards = this.extractOpponentCards(battleContainer);
      
      if (playerCards.length === 0 && opponentCards.length === 0) {
        return null;
      }

      const battleState: IBattleState = {
        id: this.generateBattleId(),
        playerCards,
        opponentCards,
        currentRound: this.extractCurrentRound(battleContainer),
        playerLife: this.extractPlayerLife(battleContainer),
        opponentLife: this.extractOpponentLife(battleContainer),
        playerPills: this.extractPlayerPills(battleContainer),
        opponentPills: this.extractOpponentPills(battleContainer),
        gamePhase: this.determineGamePhase(battleContainer),
        history: [] // История будет собираться отдельно
      };

      return battleState;
    } catch (error) {
      console.error('Error parsing battle state:', error);
      return null;
    }
  }

  /**
   * Extract player cards from battle container
   */
  private extractPlayerCards(container: Element): ICard[] {
    const playerContainer = DOMUtils.findElement(DOM_SELECTORS.battle.playerCards, container);
    return this.extractCardsFromContainer(playerContainer, true);
  }

  /**
   * Extract opponent cards from battle container
   */
  private extractOpponentCards(container: Element): ICard[] {
    const opponentContainer = DOMUtils.findElement(DOM_SELECTORS.battle.opponentCards, container);
    return this.extractCardsFromContainer(opponentContainer, false);
  }

  /**
   * Extract cards from a container element
   */
  private extractCardsFromContainer(container: Element | null, isPlayer: boolean): ICard[] {
    if (!container) return [];

    const cardElements = DOMUtils.findElements(DOM_SELECTORS.cards.container, container);
    const cards: ICard[] = [];

    for (const element of cardElements) {
      const card = this.parseCardElement(element as HTMLElement, isPlayer);
      if (card) {
        cards.push(card);
      }
    }

    return cards;
  }

  /**
   * Parse individual card element
   */
  private parseCardElement(element: HTMLElement, isPlayer: boolean): ICard | null {
    try {
      const name = this.extractCardName(element);
      if (!name) return null;

      const card: ICard = {
        id: this.generateCardId(name),
        name,
        clan: this.extractCardClan(element) || 'Unknown',
        rarity: this.determineRarity(element),
        level: this.extractCardLevel(element) || 1,
        power: this.extractCardPower(element) || 0,
        damage: this.extractCardDamage(element) || 0,
        ability: this.extractCardAbility(element) || undefined,
        abilityDescription: this.extractCardAbilityDescription(element) || undefined,
        imageUrl: this.extractCardImage(element) || undefined,
        owned: isPlayer
      };

      return card;
    } catch (error) {
      console.error('Error parsing card element:', error);
      return null;
    }
  }

  /**
   * Extract card name
   */
  private extractCardName(element: HTMLElement): string | null {
    return DOMUtils.extractText(DOM_SELECTORS.cards.name, element);
  }

  /**
   * Extract card power
   */
  private extractCardPower(element: HTMLElement): number | null {
    return DOMUtils.extractNumberFromSelectors(DOM_SELECTORS.cards.power, element);
  }

  /**
   * Extract card damage
   */
  private extractCardDamage(element: HTMLElement): number | null {
    return DOMUtils.extractNumberFromSelectors(DOM_SELECTORS.cards.damage, element);
  }

  /**
   * Extract card clan
   */
  private extractCardClan(element: HTMLElement): string | null {
    return DOMUtils.extractText(DOM_SELECTORS.cards.clan, element);
  }

  /**
   * Extract card level
   */
  private extractCardLevel(element: HTMLElement): number | null {
    return DOMUtils.extractNumberFromSelectors(DOM_SELECTORS.cards.level, element);
  }

  /**
   * Extract card ability
   */
  private extractCardAbility(element: HTMLElement): string | null {
    return DOMUtils.extractText(DOM_SELECTORS.cards.ability, element);
  }

  /**
   * Extract card ability description
   */
  private extractCardAbilityDescription(element: HTMLElement): string | null {
    const abilityElement = DOMUtils.findElement(DOM_SELECTORS.cards.ability, element);
    return abilityElement?.getAttribute('title') || null;
  }

  /**
   * Extract card image URL
   */
  private extractCardImage(element: HTMLElement): string | null {
    const imgElement = DOMUtils.findElement(DOM_SELECTORS.cards.image, element) as HTMLImageElement;
    return imgElement?.src || null;
  }

  /**
   * Determine card rarity based on stats
   */
  private determineRarity(element: HTMLElement): 'Common' | 'Uncommon' | 'Rare' | 'Legendary' {
    const power = this.extractCardPower(element) || 0;
    const damage = this.extractCardDamage(element) || 0;
    const level = this.extractCardLevel(element) || 1;
    const totalStats = power + damage;

    // Simple heuristic for rarity determination
    if (totalStats >= 16 || level >= 5) return 'Legendary';
    if (totalStats >= 12 || level >= 4) return 'Rare';
    if (totalStats >= 8 || level >= 3) return 'Uncommon';
    return 'Common';
  }

  /**
   * Extract current round number
   */
  private extractCurrentRound(container: Element): number {
    const round = DOMUtils.extractNumberFromSelectors(DOM_SELECTORS.battle.round, container);
    return round || 1;
  }

  /**
   * Extract player life
   */
  private extractPlayerLife(container: Element): number {
    const life = DOMUtils.extractNumberFromSelectors(DOM_SELECTORS.battle.life, container);
    return life || 12; // Default Urban Rivals life
  }

  /**
   * Extract opponent life (simplified)
   */
  private extractOpponentLife(container: Element): number {
    // В реальности потребовался бы более сложный селектор для жизни противника
    return 12; // Fallback
  }

  /**
   * Extract player pills
   */
  private extractPlayerPills(container: Element): number {
    const pills = DOMUtils.extractNumberFromSelectors(DOM_SELECTORS.battle.pills, container);
    return pills || 12; // Default Urban Rivals pills
  }

  /**
   * Extract opponent pills (simplified)
   */
  private extractOpponentPills(container: Element): number {
    // В реальности потребовался бы более сложный парсинг
    return 12; // Fallback
  }

  /**
   * Determine current game phase
   */
  private determineGamePhase(container: Element): 'selection' | 'battle' | 'result' {
    // Простая эвристика определения фазы
    const hasSelectedCard = container.querySelector('.selected-card');
    const hasResults = container.querySelector('.battle-result, .winner');
    
    if (hasResults) return 'result';
    if (hasSelectedCard) return 'battle';
    return 'selection';
  }

  /**
   * Generate unique battle ID
   */
  private generateBattleId(): string {
    return `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique card ID
   */
  private generateCardId(name: string): string {
    const sanitized = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    return `card_${sanitized}_${Math.random().toString(36).substr(2, 5)}`;
  }

  /**
   * Check if we're currently in a battle
   */
  isInBattle(): boolean {
    const battleContainer = DOMUtils.findElement(DOM_SELECTORS.battle.container);
    return battleContainer !== null;
  }

  /**
   * Extract battle history (if available)
   */
  extractBattleHistory(): IBattleRound[] {
    // Placeholder - в реальности потребовалось бы парсить историю раундов
    return [];
  }
} 
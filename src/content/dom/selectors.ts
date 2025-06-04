/**
 * DOM Selectors for Urban Rivals
 * Централизованные селекторы для различных элементов игры
 */

export const DOM_SELECTORS = {
  // Battle selectors
  battle: {
    container: [
      '.fight-container', '.battle-container', '.combat-zone',
      '#fight', '#battle', '.game-arena', '.duel-area'
    ],
    playerCards: [
      '.player-cards', '.my-cards', '.hand-cards',
      '.player-deck', '.user-hand', '.player-zone'
    ],
    opponentCards: [
      '.opponent-cards', '.enemy-cards', '.rival-cards',
      '.opponent-deck', '.enemy-hand', '.opponent-zone'
    ],
    life: [
      '.life', '.health', '.hp', '.vitality',
      '.life-points', '.health-bar'
    ],
    pills: [
      '.pills', '.mana', '.energy', '.power-pills',
      '.battle-pills', '.combat-energy'
    ],
    round: [
      '.round', '.turn', '.round-number',
      '.current-round', '.battle-round'
    ]
  },

  // Card selectors
  cards: {
    container: [
      '.card', '.character', '.unit', '.fighter',
      '.card-item', '.character-card', '.game-card'
    ],
    name: [
      '.card-name', '.name', '.character-name',
      '.title', '.card-title', '.unit-name'
    ],
    power: [
      '.power', '.attack', '.strength', '.pow',
      '.card-power', '.attack-value', '.combat-power'
    ],
    damage: [
      '.damage', '.dmg', '.harm', '.injury',
      '.card-damage', '.damage-value', '.attack-damage'
    ],
    clan: [
      '.clan', '.faction', '.group', '.family',
      '.card-clan', '.character-clan', '.unit-faction'
    ],
    ability: [
      '.ability', '.skill', '.special', '.power-ability',
      '.card-ability', '.special-ability', '.unit-skill'
    ],
    level: [
      '.level', '.lvl', '.rank', '.star', '.stars',
      '.card-level', '.character-level', '.unit-level'
    ],
    image: [
      '.card-image img', '.character-image img', '.card-picture img',
      '.card-avatar img', '.unit-image img', 'img.card'
    ]
  },

  // Market selectors
  market: {
    container: [
      '.market-item', '.shop-item', '.store-item',
      '.sale-item', '.auction-item', '.trade-item'
    ],
    price: [
      '.price', '.cost', '.value', '.clintz',
      '.market-price', '.sale-price', '.item-cost'
    ],
    seller: [
      '.seller', '.owner', '.vendor', '.merchant',
      '.seller-name', '.owner-name', '.trader'
    ]
  },

  // UI selectors
  ui: {
    notification: [
      '.notification', '.alert', '.message', '.toast',
      '.popup-message', '.game-notification'
    ],
    modal: [
      '.modal', '.popup', '.dialog', '.overlay',
      '.modal-dialog', '.popup-window'
    ]
  }
};

/**
 * Utility functions for DOM selection
 */
export class DOMUtils {
  /**
   * Find element by multiple selectors
   */
  static findElement(selectors: string[], parent: Element = document.body): Element | null {
    for (const selector of selectors) {
      const element = parent.querySelector(selector);
      if (element) return element;
    }
    return null;
  }

  /**
   * Find all elements by multiple selectors
   */
  static findElements(selectors: string[], parent: Element = document.body): Element[] {
    const elements: Element[] = [];
    for (const selector of selectors) {
      const found = Array.from(parent.querySelectorAll(selector));
      elements.push(...found);
    }
    // Remove duplicates
    return Array.from(new Set(elements));
  }

  /**
   * Extract text from multiple selectors
   */
  static extractText(selectors: string[], parent: Element): string | null {
    const element = this.findElement(selectors, parent);
    return element?.textContent?.trim() || null;
  }

  /**
   * Extract number from text using regex
   */
  static extractNumber(text: string | null): number | null {
    if (!text) return null;
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Extract number from multiple selectors
   */
  static extractNumberFromSelectors(
    selectors: string[], 
    parent: Element, 
    context?: string
  ): number | null {
    const text = this.extractText(selectors, parent);
    return this.extractNumber(text);
  }

  /**
   * Check if element matches any of the selectors
   */
  static matchesAny(element: Element, selectors: string[]): boolean {
    return selectors.some(selector => element.matches(selector));
  }

  /**
   * Wait for element to appear
   */
  static waitForElement(
    selectors: string[], 
    timeout = 5000,
    parent: Element = document.body
  ): Promise<Element | null> {
    return new Promise((resolve) => {
      const element = this.findElement(selectors, parent);
      if (element) {
        resolve(element);
        return;
      }

      let timeoutId: number;
      const observer = new MutationObserver(() => {
        const element = this.findElement(selectors, parent);
        if (element) {
          observer.disconnect();
          clearTimeout(timeoutId);
          resolve(element);
        }
      });

      observer.observe(parent, {
        childList: true,
        subtree: true
      });

      timeoutId = window.setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }
} 
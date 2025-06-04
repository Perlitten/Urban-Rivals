/**
 * Urban Rivals ML Consultant - Optimized Content Script
 * Модульная версия content script с улучшенной архитектурой
 */

import { logger, createContentLogger } from '../common/logger';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../ui/App';
import { BattleParser } from './parsers/battle-parser';
import { DOM_SELECTORS, DOMUtils } from './dom/selectors';
import type {
  IChromeMessage,
  IBattleState,
  IUserPreferences,
  GamePage
} from '../common/types';

// Initialize content logger
const contentLogger = createContentLogger('MAIN');

// Optimized content script state
interface ContentScriptState {
  isInitialized: boolean;
  currentPage: GamePage;
  uiContainer: HTMLElement | null;
  reactRoot: any;
  preferences: IUserPreferences | null;
  observer: MutationObserver | null;
  battleParser: BattleParser;
  lastUpdate: number;
}

const state: ContentScriptState = {
  isInitialized: false,
  currentPage: 'other',
  uiContainer: null,
  reactRoot: null,
  preferences: null,
  observer: null,
  battleParser: BattleParser.getInstance(),
  lastUpdate: 0
};

// Page detection patterns (simplified)
const PAGE_PATTERNS = {
  battle: ['fight', 'battle', 'combat', 'duel'],
  collection: ['collection', 'cards', 'deck'],
  market: ['market', 'shop', 'buy', 'sell'],
  guild: ['guild', 'clan', 'team'],
  training: ['training', 'practice', 'tutorial']
} as const;

/**
 * Initialize optimized content script
 */
async function initialize() {
  const initTimer = logger.startTimer(contentLogger, 'Content Script Initialization');
  
  logger.info(contentLogger, 'Starting Urban Rivals ML Consultant initialization', {
    url: window.location.href,
    hostname: window.location.hostname,
    pathname: window.location.pathname,
    userAgent: navigator.userAgent,
    timestamp: Date.now()
  });
  
  try {
    if (!isUrbanRivalsPage()) {
      logger.info(contentLogger, 'Not on Urban Rivals page, skipping initialization', {
        currentHostname: window.location.hostname,
        expectedHostname: 'urban-rivals.com'
      });
      initTimer();
      return;
    }
    
    logger.debug(contentLogger, 'Waiting for page to load completely');
    await waitForPageLoad();
    logger.debug(contentLogger, 'Page load completed');
    
    logger.debug(contentLogger, 'Loading user preferences');
    state.preferences = await getPreferences();
         logger.info(contentLogger, 'User preferences loaded', {
       battleAssistant: state.preferences?.features.battleAssistant,
       deckBuilder: state.preferences?.features.deckBuilder,
       marketAnalyzer: state.preferences?.features.marketAnalyzer,
       theme: state.preferences?.ui.theme
     });
    
    logger.debug(contentLogger, 'Detecting current page type');
    state.currentPage = detectCurrentPage();
    logger.info(contentLogger, 'Page type detected', {
      pageType: state.currentPage,
      pathname: window.location.pathname
    });
    
    logger.debug(contentLogger, 'Setting up DOM observer');
    setupDOMObserver();
    logger.debug(contentLogger, 'DOM observer configured');
    
    logger.debug(contentLogger, 'Injecting UI components');
    await injectUI();
    logger.debug(contentLogger, 'UI injection completed');
    
    logger.debug(contentLogger, 'Setting up message listeners');
    setupMessageListeners();
    logger.debug(contentLogger, 'Message listeners configured');
    
    logger.debug(contentLogger, 'Starting periodic data extraction');
    startPeriodicDataExtraction();
    logger.debug(contentLogger, 'Periodic data extraction started');
    
    state.isInitialized = true;
    initTimer();
    logger.info(contentLogger, '✅ Content script initialization completed successfully', {
      pageType: state.currentPage,
      componentsActive: {
        uiContainer: !!state.uiContainer,
        reactRoot: !!state.reactRoot,
        observer: !!state.observer,
        battleParser: !!state.battleParser
      }
    });
  } catch (error) {
    initTimer();
    logger.error(contentLogger, 'Content script initialization failed', error as Error, {
      url: window.location.href,
      pageType: state.currentPage,
      initializationStep: 'unknown'
    });
  }
}

/**
 * Enhanced Urban Rivals page detection
 */
function isUrbanRivalsPage(): boolean {
  const hostname = window.location.hostname.toLowerCase();
  return hostname.includes('urban-rivals.com');
}

/**
 * Wait for page to be fully loaded
 */
function waitForPageLoad(): Promise<void> {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', () => resolve());
    }
  });
}

/**
 * Detect current page type
 */
function detectCurrentPage(): GamePage {
  const url = window.location.href.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();
  
  for (const [pageType, patterns] of Object.entries(PAGE_PATTERNS)) {
    if (patterns.some(pattern => url.includes(pattern) || pathname.includes(pattern))) {
      return pageType as GamePage;
    }
  }
  
  return 'other';
}

/**
 * Setup DOM observer for page changes
 */
function setupDOMObserver() {
  if (state.observer) {
    state.observer.disconnect();
  }

  state.observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        shouldUpdate = true;
        break;
      }
    }
    
    if (shouldUpdate) {
      handlePageChange();
    }
  });

  state.observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

/**
 * Handle page changes
 */
function handlePageChange() {
  const newPage = detectCurrentPage();
  if (newPage !== state.currentPage) {
    console.log('📍 Page changed:', state.currentPage, '→', newPage);
    state.currentPage = newPage;
    
    // Update UI if needed
    if (shouldInjectUI()) {
      injectUI();
    }
  }
}

/**
 * Inject UI based on current page
 */
async function injectUI() {
  if (!shouldInjectUI()) {
    return;
  }

  try {
    // Remove existing UI
    if (state.uiContainer) {
      state.uiContainer.remove();
      state.uiContainer = null;
    }

    // Create new UI container
    state.uiContainer = document.createElement('div');
    state.uiContainer.id = 'urban-rivals-ml-consultant';
    state.uiContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 320px;
      max-height: 600px;
      z-index: 10000;
      background: rgba(0, 0, 0, 0.9);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    document.body.appendChild(state.uiContainer);

    // Create React root and render
    state.reactRoot = createRoot(state.uiContainer);
    state.reactRoot.render(React.createElement(App));

    console.log('🎨 UI injected successfully');
  } catch (error) {
    console.error('❌ Failed to inject UI:', error);
  }
}

/**
 * Check if UI should be injected
 */
function shouldInjectUI(): boolean {
  if (!state.preferences?.features.battleAssistant) {
    return false;
  }

  // Only inject on relevant pages
  return ['battle', 'collection', 'market'].includes(state.currentPage);
}

/**
 * Get user preferences
 */
async function getPreferences(): Promise<IUserPreferences> {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_PREFERENCES'
      });
      
      if (response) {
        return response;
      }
    }
  } catch (error) {
    console.error('Failed to get preferences:', error);
  }
  
  return getDefaultPreferences();
}

/**
 * Default preferences
 */
function getDefaultPreferences(): IUserPreferences {
  return {
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
      marketAlerts: false,
      deckSuggestions: true
    },
    privacy: {
      dataCollection: false,
      analytics: false
    }
  };
}

/**
 * Setup message listeners
 */
function setupMessageListeners() {
  chrome.runtime.onMessage.addListener((message: IChromeMessage, sender, sendResponse) => {
    switch (message.type) {
      case 'GET_BATTLE_STATE':
        const battleState = state.battleParser.parseBattleState();
        sendResponse(battleState);
        break;
        
      case 'GET_PAGE_INFO':
        sendResponse({
          currentPage: state.currentPage,
          isInBattle: state.battleParser.isInBattle(),
          url: window.location.href
        });
        break;
        
      case 'UPDATE_PREFERENCES':
        state.preferences = message.payload;
        if (shouldInjectUI()) {
          injectUI();
        }
        sendResponse({ success: true });
        break;
        
      default:
        sendResponse({ error: 'Unknown message type' });
    }
  });
}

/**
 * Start periodic data extraction
 */
function startPeriodicDataExtraction() {
  setInterval(() => {
    const now = Date.now();
    
    // Throttle updates to every 2 seconds
    if (now - state.lastUpdate < 2000) {
      return;
    }
    
    state.lastUpdate = now;
    
    if (state.currentPage === 'battle' && state.battleParser.isInBattle()) {
      extractAndSendBattleData();
    }
  }, 1000);
}

/**
 * Extract and send battle data
 */
function extractAndSendBattleData() {
  try {
    const battleState = state.battleParser.parseBattleState();
    
    if (battleState) {
      chrome.runtime.sendMessage({
        type: 'BATTLE_DATA_UPDATE',
        payload: battleState,
        requestId: generateRequestId()
      });
    }
  } catch (error) {
    console.error('Failed to extract battle data:', error);
  }
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Cleanup function
 */
function cleanup() {
  if (state.observer) {
    state.observer.disconnect();
  }
  
  if (state.uiContainer) {
    state.uiContainer.remove();
  }
  
  if (state.reactRoot) {
    state.reactRoot.unmount();
  }
  
  state.isInitialized = false;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup); 
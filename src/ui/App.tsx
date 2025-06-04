import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import BattleAssistant from './components/BattleAssistant';
import DeckBuilder from './components/DeckBuilder';
import MarketAnalyzer from './components/MarketAnalyzer';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import type { 
  IBattleState, 
  IBattleRecommendation, 
  IDeckRecommendation, 
  IMarketRecommendation, 
  IUserPreferences,
  GamePage 
} from '../common/types';

interface AppState {
  currentTab: 'battle' | 'deck' | 'market' | 'analytics' | 'settings';
  currentPage: GamePage;
  battleState: IBattleState | null;
  battleRecommendation: IBattleRecommendation | null;
  deckRecommendation: IDeckRecommendation | null;
  marketRecommendation: IMarketRecommendation | null;
  preferences: IUserPreferences | null;
  isLoading: boolean;
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  color: #ffffff;
`;

const TabBar = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 12px 8px;
  background: ${props => props.active ? 'rgba(102, 126, 234, 0.2)' : 'transparent'};
  border: none;
  color: ${props => props.active ? '#667eea' : '#888'};
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid ${props => props.active ? '#667eea' : 'transparent'};
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentTab: 'battle',
    currentPage: 'other',
    battleState: null,
    battleRecommendation: null,
    deckRecommendation: null,
    marketRecommendation: null,
    preferences: null,
    isLoading: false
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Load preferences from background script
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        const response = await chrome.runtime.sendMessage({
          type: 'GET_PREFERENCES'
        });
        
        if (response) {
          setState(prev => ({ ...prev, preferences: response }));
        }
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleTabChange = (tab: AppState['currentTab']) => {
    setState(prev => ({ ...prev, currentTab: tab }));
  };

  const renderContent = () => {
    switch (state.currentTab) {
      case 'battle':
        return (
          <BattleAssistant
            battleState={state.battleState}
            recommendation={state.battleRecommendation}
            preferences={state.preferences}
            isLoading={state.isLoading}
          />
        );
      
      case 'deck':
        return (
          <DeckBuilder
            currentPage={state.currentPage}
            recommendation={state.deckRecommendation}
            preferences={state.preferences}
          />
        );
      
      case 'market':
        return (
          <MarketAnalyzer
            currentPage={state.currentPage}
            recommendation={state.marketRecommendation}
            preferences={state.preferences}
          />
        );
      
      case 'analytics':
        return (
          <Analytics
            currentPage={state.currentPage}
            preferences={state.preferences}
          />
        );
      
      case 'settings':
        return (
          <Settings
            preferences={state.preferences}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Container>
      <TabBar>
        <Tab
          active={state.currentTab === 'battle'}
          onClick={() => handleTabChange('battle')}
        >
          ⚔️ BATTLE
        </Tab>
        <Tab
          active={state.currentTab === 'deck'}
          onClick={() => handleTabChange('deck')}
        >
          🃏 DECK
        </Tab>
        <Tab
          active={state.currentTab === 'market'}
          onClick={() => handleTabChange('market')}
        >
          💰 MARKET
        </Tab>
        <Tab
          active={state.currentTab === 'analytics'}
          onClick={() => handleTabChange('analytics')}
        >
          📊 STATS
        </Tab>
        <Tab
          active={state.currentTab === 'settings'}
          onClick={() => handleTabChange('settings')}
        >
          ⚙️ SETTINGS
        </Tab>
      </TabBar>
      
      <Content>
        {renderContent()}
      </Content>
    </Container>
  );
};

export default App; 
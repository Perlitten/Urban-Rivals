import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import styled, { createGlobalStyle } from 'styled-components';
import Settings from '../ui/components/Settings';
import type { IUserPreferences } from '../common/types';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #1a1a1a;
    color: #ffffff;
    width: 380px;
    height: 500px;
    overflow: hidden;
  }

  #root {
    width: 100%;
    height: 100%;
  }

  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const PopupContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  text-align: center;
  position: relative;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const Subtitle = styled.p`
  margin: 4px 0 0 0;
  font-size: 12px;
  opacity: 0.9;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const StatusIndicator = styled.div<{ status: 'connected' | 'disconnected' | 'loading' }>`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'connected': return '#4CAF50';
      case 'loading': return '#FF9800';
      default: return '#F44336';
    }
  }};
  animation: ${props => props.status === 'loading' ? 'pulse 1.5s infinite' : 'none'};

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #888;
  flex-direction: column;
  gap: 12px;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #F44336;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 8px;
  margin: 20px;
`;

interface PopupState {
  preferences: IUserPreferences | null;
  connectionStatus: 'connected' | 'disconnected' | 'loading';
  error: string | null;
}

const Popup: React.FC = () => {
  const [state, setState] = useState<PopupState>({
    preferences: null,
    connectionStatus: 'loading',
    error: null
  });

  useEffect(() => {
    const checkConnection = async () => {
      console.log('[POPUP] Attempting to ping background script...');
      try {
        const response = await chrome.runtime.sendMessage({ type: 'PING_FROM_POPUP', timestamp: Date.now() });
        console.log('[POPUP] Ping successful, response:', response);
      } catch (pingError) {
        console.error('[POPUP] Ping failed:', pingError);
        setTimeout(async () => {
          console.log('[POPUP] Retrying ping to background script...');
          try {
            const response = await chrome.runtime.sendMessage({ type: 'PING_FROM_POPUP', timestamp: Date.now() });
            console.log('[POPUP] Retry ping successful, response:', response);
          } catch (retryPingError) {
            console.error('[POPUP] Retry ping failed:', retryPingError);
          }
        }, 500);
      }
    };

    checkConnection();
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      console.log('[POPUP] Starting preference load...');
      setState(prev => ({ ...prev, connectionStatus: 'loading', error: null }));
      
      console.log('[POPUP] Sending GET_PREFERENCES message to background script');
      const response = await chrome.runtime.sendMessage({
        type: 'GET_PREFERENCES',
        timestamp: Date.now(),
        source: 'popup'
      });

      console.log('[POPUP] Received response:', response);

      if (chrome.runtime.lastError) {
        console.error('[POPUP] Chrome runtime error:', chrome.runtime.lastError);
        throw new Error(chrome.runtime.lastError.message);
      }

      setState(prev => ({
        ...prev,
        preferences: response || null,
        connectionStatus: 'connected'
      }));
      
      console.log('[POPUP] Preferences loaded successfully');
    } catch (error) {
      console.error('[POPUP] Failed to load preferences:', error);
      setState(prev => ({
        ...prev,
        connectionStatus: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  const getStatusText = () => {
    switch (state.connectionStatus) {
      case 'connected': return 'Connected';
      case 'loading': return 'Connecting...';
      default: return 'Disconnected';
    }
  };

  const renderContent = () => {
    if (state.error) {
      return (
        <ErrorMessage>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>
            Connection Error
          </div>
          <div style={{ fontSize: '12px' }}>
            {state.error}
          </div>
          <button
            onClick={loadPreferences}
            style={{
              marginTop: '12px',
              padding: '6px 12px',
              background: '#F44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Retry Connection
          </button>
        </ErrorMessage>
      );
    }

    if (state.connectionStatus === 'loading') {
      return (
        <LoadingMessage>
          <div style={{ fontSize: '32px' }}>🤖</div>
          <div>Connecting to Urban Rivals ML Consultant...</div>
        </LoadingMessage>
      );
    }

    return <Settings preferences={state.preferences} />;
  };

  return (
    <>
      <GlobalStyle />
      <PopupContainer>
        <Header>
          <StatusIndicator status={state.connectionStatus} />
          <Title>Urban Rivals ML Consultant</Title>
          <Subtitle>{getStatusText()}</Subtitle>
        </Header>
        <Content>
          {renderContent()}
        </Content>
      </PopupContainer>
    </>
  );
};

// Initialize popup
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
} else {
  console.error('Root container not found');
} 
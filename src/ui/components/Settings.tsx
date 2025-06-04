import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import type { IUserPreferences } from '../../common/types';

interface SettingsProps {
  preferences?: IUserPreferences | null;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SettingLabel = styled.label`
  font-size: 13px;
  font-weight: 500;
  flex: 1;
  color: #ffffff;
`;

const ToggleSwitch = styled.div<{ active: boolean }>`
  width: 40px;
  height: 20px;
  background: ${props => props.active ? '#667eea' : '#333'};
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    top: 2px;
    left: ${props => props.active ? '22px' : '2px'};
    transition: left 0.3s ease;
  }
`;

const Select = styled.select`
  background: #333;
  color: white;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 12px;
  min-width: 100px;
`;

const Slider = styled.input`
  width: 100px;
  height: 4px;
  border-radius: 2px;
  background: #333;
  outline: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #667eea;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #667eea;
    cursor: pointer;
    border: none;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  background: ${props => {
    switch (props.variant) {
      case 'primary': return '#667eea';
      case 'danger': return '#F44336';
      default: return '#444';
    }
  }};
  
  color: white;
  
  &:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const ExportTextarea = styled.textarea`
  width: 100%;
  height: 80px;
  background: #222;
  color: white;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 8px;
  font-size: 11px;
  font-family: monospace;
  resize: vertical;
  margin-top: 8px;
`;

const VersionInfo = styled.div`
  text-align: center;
  padding: 12px;
  font-size: 11px;
  color: #888;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 6px;
`;

const Settings: React.FC<SettingsProps> = ({ preferences }) => {
  const [localPrefs, setLocalPrefs] = useState<IUserPreferences | null>(preferences || null);
  const [exportData, setExportData] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    setLocalPrefs(preferences || null);
  }, [preferences]);

  const updatePreference = (updates: Partial<IUserPreferences>) => {
    if (!localPrefs) return;
    
    const updated = { ...localPrefs, ...updates };
    setLocalPrefs(updated);
    
    // Send updated preferences to background script
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        type: 'SET_PREFERENCES',
        payload: updated
      });
    }
  };

  const updateFeature = (feature: keyof IUserPreferences['features'], enabled: boolean) => {
    if (!localPrefs) return;
    
    updatePreference({
      features: {
        ...localPrefs.features,
        [feature]: enabled
      }
    });
  };

  const updateUI = (uiKey: keyof IUserPreferences['ui'], value: any) => {
    if (!localPrefs) return;
    
    updatePreference({
      ui: {
        ...localPrefs.ui,
        [uiKey]: value
      }
    });
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'EXPORT_DATA',
        timestamp: Date.now(),
        source: 'popup'
      });
      
      if (response?.success) {
        setExportData(response.data);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    if (!exportData.trim()) return;
    
    setIsImporting(true);
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'IMPORT_DATA',
        data: { jsonData: exportData },
        timestamp: Date.now(),
        source: 'popup'
      });
      
      if (response?.success) {
        alert('Data imported successfully!');
        setExportData('');
      } else {
        alert('Import failed: ' + response?.error);
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed: ' + error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      return;
    }
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'CLEAR_DATA',
        timestamp: Date.now(),
        source: 'popup'
      });
      
      if (response?.success) {
        alert('All data cleared successfully!');
      }
    } catch (error) {
      console.error('Clear data failed:', error);
    }
  };

  if (!localPrefs) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
          Loading preferences...
        </div>
      </Container>
    );
  }

  return (
    <Container>
      {/* Features */}
      <Section>
        <SectionTitle>Features</SectionTitle>
        <SettingRow>
          <SettingLabel>Battle Assistant</SettingLabel>
          <ToggleSwitch
            active={localPrefs.features.battleAssistant}
            onClick={() => updateFeature('battleAssistant', !localPrefs.features.battleAssistant)}
          />
        </SettingRow>
        <SettingRow>
          <SettingLabel>Deck Builder</SettingLabel>
          <ToggleSwitch
            active={localPrefs.features.deckBuilder}
            onClick={() => updateFeature('deckBuilder', !localPrefs.features.deckBuilder)}
          />
        </SettingRow>
        <SettingRow>
          <SettingLabel>Market Analyzer</SettingLabel>
          <ToggleSwitch
            active={localPrefs.features.marketAnalyzer}
            onClick={() => updateFeature('marketAnalyzer', !localPrefs.features.marketAnalyzer)}
          />
        </SettingRow>
        <SettingRow>
          <SettingLabel>Analytics</SettingLabel>
          <ToggleSwitch
            active={localPrefs.features.analytics}
            onClick={() => updateFeature('analytics', !localPrefs.features.analytics)}
          />
        </SettingRow>
      </Section>

      {/* Appearance */}
      <Section>
        <SectionTitle>Appearance</SectionTitle>
        <SettingRow>
          <SettingLabel>Theme</SettingLabel>
          <Select
            value={localPrefs.ui.theme}
            onChange={(e) => updateUI('theme', e.target.value as 'light' | 'dark' | 'auto')}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="auto">Auto</option>
          </Select>
        </SettingRow>
        <SettingRow>
          <SettingLabel>Panel Position</SettingLabel>
          <Select
            value={localPrefs.ui.position}
            onChange={(e) => updateUI('position', e.target.value as 'left' | 'right' | 'top' | 'bottom')}
          >
            <option value="right">Right</option>
            <option value="left">Left</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
          </Select>
        </SettingRow>
        <SettingRow>
          <SettingLabel>Transparency</SettingLabel>
          <Slider
            type="range"
            min="0.5"
            max="1"
            step="0.1"
            value={localPrefs.ui.transparency}
            onChange={(e) => updateUI('transparency', parseFloat(e.target.value))}
          />
        </SettingRow>
        <SettingRow>
          <SettingLabel>Detail Level</SettingLabel>
          <Select
            value={localPrefs.ui.detailLevel}
            onChange={(e) => updateUI('detailLevel', e.target.value as 'minimal' | 'normal' | 'detailed')}
          >
            <option value="minimal">Minimal</option>
            <option value="normal">Normal</option>
            <option value="detailed">Detailed</option>
          </Select>
        </SettingRow>
      </Section>

      {/* Notifications */}
      <Section>
        <SectionTitle>Notifications</SectionTitle>
        <SettingRow>
          <SettingLabel>Battle Recommendations</SettingLabel>
          <ToggleSwitch
            active={localPrefs.notifications.battleRecommendations}
            onClick={() => updatePreference({
              notifications: {
                ...localPrefs.notifications,
                battleRecommendations: !localPrefs.notifications.battleRecommendations
              }
            })}
          />
        </SettingRow>
        <SettingRow>
          <SettingLabel>Market Alerts</SettingLabel>
          <ToggleSwitch
            active={localPrefs.notifications.marketAlerts}
            onClick={() => updatePreference({
              notifications: {
                ...localPrefs.notifications,
                marketAlerts: !localPrefs.notifications.marketAlerts
              }
            })}
          />
        </SettingRow>
        <SettingRow>
          <SettingLabel>Deck Suggestions</SettingLabel>
          <ToggleSwitch
            active={localPrefs.notifications.deckSuggestions}
            onClick={() => updatePreference({
              notifications: {
                ...localPrefs.notifications,
                deckSuggestions: !localPrefs.notifications.deckSuggestions
              }
            })}
          />
        </SettingRow>
      </Section>

      {/* Data Management */}
      <Section>
        <SectionTitle>Data Management</SectionTitle>
        <ButtonGroup>
          <Button
            variant="secondary"
            onClick={handleExportData}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
          <Button
            variant="secondary"
            onClick={handleImportData}
            disabled={isImporting || !exportData.trim()}
          >
            {isImporting ? 'Importing...' : 'Import Data'}
          </Button>
          <Button
            variant="danger"
            onClick={handleClearData}
          >
            Clear All Data
          </Button>
        </ButtonGroup>
        {exportData && (
          <ExportTextarea
            value={exportData}
            onChange={(e) => setExportData(e.target.value)}
            placeholder="Exported data will appear here, or paste data to import..."
          />
        )}
      </Section>

      {/* About */}
      <VersionInfo>
        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
          Urban Rivals ML Consultant v1.0.0
        </div>
        <div>AI-powered gaming assistant for Urban Rivals</div>
        <div style={{ marginTop: '8px' }}>
          Built with ❤️ using React, TypeScript & TensorFlow.js
        </div>
      </VersionInfo>
    </Container>
  );
};

export default Settings; 
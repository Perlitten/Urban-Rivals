import React from 'react';
import styled from 'styled-components';
import type { GamePage, IMarketRecommendation, IUserPreferences } from '../../common/types';

interface MarketAnalyzerProps {
  currentPage: GamePage;
  recommendation?: IMarketRecommendation | null;
  preferences?: IUserPreferences | null;
}

const Container = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #888;
`;

const MarketAnalyzer: React.FC<MarketAnalyzerProps> = ({ currentPage, recommendation, preferences }) => {
  return (
    <Container>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>💰</div>
      <div>Market Analyzer</div>
      <div style={{ fontSize: '12px', marginTop: '8px' }}>
        Coming soon - AI-powered market insights
      </div>
    </Container>
  );
};

export default MarketAnalyzer; 
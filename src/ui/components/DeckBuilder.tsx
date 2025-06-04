import React from 'react';
import styled from 'styled-components';
import type { GamePage, IDeckRecommendation, IUserPreferences } from '../../common/types';

interface DeckBuilderProps {
  currentPage: GamePage;
  recommendation?: IDeckRecommendation | null;
  preferences?: IUserPreferences | null;
}

const Container = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #888;
`;

const DeckBuilder: React.FC<DeckBuilderProps> = ({ currentPage, recommendation, preferences }) => {
  return (
    <Container>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>🃏</div>
      <div>Deck Builder</div>
      <div style={{ fontSize: '12px', marginTop: '8px' }}>
        Coming soon - AI-powered deck optimization
      </div>
    </Container>
  );
};

export default DeckBuilder; 
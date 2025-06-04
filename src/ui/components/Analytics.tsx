import React from 'react';
import styled from 'styled-components';
import type { GamePage, IUserPreferences } from '../../common/types';

interface AnalyticsProps {
  currentPage: GamePage;
  preferences?: IUserPreferences | null;
}

const Container = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #888;
`;

const Analytics: React.FC<AnalyticsProps> = ({ currentPage, preferences }) => {
  return (
    <Container>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
      <div>Analytics</div>
      <div style={{ fontSize: '12px', marginTop: '8px' }}>
        Coming soon - Performance statistics and insights
      </div>
    </Container>
  );
};

export default Analytics; 
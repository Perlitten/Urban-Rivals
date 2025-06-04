import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import type { IBattleState, IBattleRecommendation, IUserPreferences, ICard } from '../../common/types';

interface BattleAssistantProps {
  battleState?: IBattleState | null;
  recommendation?: IBattleRecommendation | null;
  preferences?: IUserPreferences | null;
  isLoading?: boolean;
}

// Enhanced animations
const slideIn = keyframes`
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 5px rgba(34, 197, 94, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.6), 0 0 30px rgba(34, 197, 94, 0.3);
  }
`;

// Enhanced styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  backdrop-filter: blur(20px);
  color: #e2e8f0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  animation: ${slideIn} 0.3s ease-out;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.2),
    0 4px 12px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  background: linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const StatusIcon = styled.div<{ status: 'ready' | 'analyzing' | 'error' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'ready': return 'linear-gradient(135deg, #22c55e, #16a34a)';
      case 'analyzing': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'error': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      default: return '#64748b';
    }
  }};
  animation: ${props => props.status === 'analyzing' ? css`${pulse} 1s infinite` : 'none'};
  box-shadow: 0 0 10px currentColor;
`;

const GameState = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.1);
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(148, 163, 184, 0.3);
    transform: translateY(-1px);
  }
`;

const StatLabel = styled.span`
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
`;

const StatValue = styled.span<{ type?: 'life' | 'pills' | 'round' }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => {
    switch (props.type) {
      case 'life': return '#22c55e';
      case 'pills': return '#3b82f6';
      case 'round': return '#f59e0b';
      default: return '#e2e8f0';
    }
  }};
`;

const RecommendationCard = styled.div<{ isHighlighted?: boolean }>`
  padding: 20px;
  background: ${props => props.isHighlighted 
    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)'
    : 'rgba(15, 23, 42, 0.6)'
  };
  border-radius: 12px;
  border: 2px solid ${props => props.isHighlighted 
    ? 'rgba(34, 197, 94, 0.4)'
    : 'rgba(148, 163, 184, 0.2)'
  };
  transition: all 0.3s ease;
  animation: ${props => props.isHighlighted ? css`${glow} 2s infinite` : 'none'};
  
  &:hover {
    border-color: ${props => props.isHighlighted 
      ? 'rgba(34, 197, 94, 0.6)'
      : 'rgba(148, 163, 184, 0.4)'
    };
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const CardImage = styled.div<{ imageUrl?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.imageUrl 
    ? `url(${props.imageUrl}) center/cover`
    : 'linear-gradient(135deg, #1e293b, #334155)'
  };
  border: 2px solid rgba(148, 163, 184, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 20px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    border-color: rgba(148, 163, 184, 0.6);
  }
`;

const CardInfo = styled.div`
  flex: 1;
`;

const CardName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #e2e8f0;
`;

const CardStats = styled.div`
  display: flex;
  gap: 12px;
`;

const StatChip = styled.span<{ variant: 'power' | 'damage' | 'pills' }>`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    switch (props.variant) {
      case 'power': return 'rgba(239, 68, 68, 0.2)';
      case 'damage': return 'rgba(245, 158, 11, 0.2)';
      case 'pills': return 'rgba(59, 130, 246, 0.2)';
      default: return 'rgba(148, 163, 184, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.variant) {
      case 'power': return '#fca5a5';
      case 'damage': return '#fbbf24';
      case 'pills': return '#93c5fd';
      default: return '#cbd5e1';
    }
  }};
  border: 1px solid ${props => {
    switch (props.variant) {
      case 'power': return 'rgba(239, 68, 68, 0.3)';
      case 'damage': return 'rgba(245, 158, 11, 0.3)';
      case 'pills': return 'rgba(59, 130, 246, 0.3)';
      default: return 'rgba(148, 163, 184, 0.3)';
    }
  }};
`;

const ProbabilityBar = styled.div<{ probability: number; confidence: number }>`
  margin: 16px 0;
  padding: 12px;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.1);
`;

const ProbabilityLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ProbabilityText = styled.span`
  font-size: 14px;
  color: #94a3b8;
`;

const ProbabilityValue = styled.span<{ value: number }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => {
    if (props.value >= 0.7) return '#22c55e';
    if (props.value >= 0.5) return '#f59e0b';
    return '#ef4444';
  }};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.1);
`;

const ProgressFill = styled.div<{ probability: number; confidence: number }>`
  height: 100%;
  width: ${props => props.probability * 100}%;
  background: linear-gradient(90deg, 
    ${props => props.probability >= 0.7 ? '#22c55e' : props.probability >= 0.5 ? '#f59e0b' : '#ef4444'} 0%,
    ${props => props.probability >= 0.7 ? '#16a34a' : props.probability >= 0.5 ? '#d97706' : '#dc2626'} 100%
  );
  border-radius: 4px;
  transition: all 0.5s ease;
  opacity: ${props => Math.max(0.6, props.confidence)};
  animation: ${shimmer} 2s infinite linear;
  background-size: 200px 100%;
`;

const ReasoningSection = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
`;

const ReasoningText = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #cbd5e1;
`;

const AlternativesSection = styled.div`
  margin-top: 20px;
`;

const SectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AlternativeCard = styled.div`
  padding: 12px;
  background: rgba(30, 41, 59, 0.4);
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  margin-bottom: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(30, 41, 59, 0.6);
    border-color: rgba(148, 163, 184, 0.3);
    transform: translateY(-1px);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #94a3b8;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid rgba(148, 163, 184, 0.3);
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  margin: 0;
  font-size: 14px;
  text-align: center;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #64748b;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const BattleAssistant: React.FC<BattleAssistantProps> = ({ 
  battleState, 
  recommendation, 
  preferences,
  isLoading = false 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getStatus = () => {
    if (isLoading) return 'loading';
    if (battleState && recommendation) return 'active';
    return 'inactive';
  };

  const getStatusText = () => {
    if (isLoading) return '🤖 Analyzing battle...';
    if (battleState && recommendation) return '⚔️ Battle analysis ready';
    return '⏳ Waiting for battle...';
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  if (isLoading) {
    return (
      <Container>
        <Header>
          <StatusIcon status="analyzing" />
          <Title>Battle Assistant</Title>
        </Header>
        <LoadingState>
          <LoadingSpinner />
          <LoadingText>Analyzing battle situation...</LoadingText>
        </LoadingState>
      </Container>
    );
  }

  if (!battleState) {
    return (
      <Container>
        <Header>
          <StatusIcon status="ready" />
          <Title>Battle Assistant</Title>
        </Header>
        <EmptyState>
          <EmptyIcon>⚔️</EmptyIcon>
          <p>No active battle detected</p>
          <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
            Start a battle to receive AI recommendations
          </p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <StatusIcon status={recommendation ? "ready" : "analyzing"} />
        <Title>Battle Assistant</Title>
      </Header>

      <GameState>
        <StatItem>
          <StatLabel>Your Life</StatLabel>
          <StatValue type="life">❤️ {battleState.playerLife}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Opponent Life</StatLabel>
          <StatValue type="life">💀 {battleState.opponentLife}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Your Pills</StatLabel>
          <StatValue type="pills">💊 {battleState.playerPills}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Round</StatLabel>
          <StatValue type="round">🔄 {battleState.currentRound}</StatValue>
        </StatItem>
      </GameState>

      {recommendation && (
        <>
          <RecommendationCard isHighlighted>
            <CardHeader>
              <CardImage imageUrl={recommendation.recommendedCard.imageUrl}>
                {!recommendation.recommendedCard.imageUrl && '🃏'}
              </CardImage>
              <CardInfo>
                <CardName>{recommendation.recommendedCard.name}</CardName>
                <CardStats>
                  <StatChip variant="power">⚡ {recommendation.recommendedCard.power}</StatChip>
                  <StatChip variant="damage">💥 {recommendation.recommendedCard.damage}</StatChip>
                  <StatChip variant="pills">💊 {recommendation.recommendedPills}</StatChip>
                </CardStats>
              </CardInfo>
            </CardHeader>

            <ProbabilityBar probability={recommendation.winProbability} confidence={recommendation.confidence}>
              <ProbabilityLabel>
                <ProbabilityText>Win Probability</ProbabilityText>
                <ProbabilityValue value={recommendation.winProbability}>
                  {Math.round(recommendation.winProbability * 100)}%
                </ProbabilityValue>
              </ProbabilityLabel>
              <ProgressBar>
                <ProgressFill 
                  probability={recommendation.winProbability} 
                  confidence={recommendation.confidence}
                />
              </ProgressBar>
            </ProbabilityBar>

            <ReasoningSection>
              <ReasoningText>{recommendation.reasoning}</ReasoningText>
            </ReasoningSection>
          </RecommendationCard>

          {recommendation.alternatives && recommendation.alternatives.length > 0 && (
            <AlternativesSection>
              <SectionTitle>Alternative Strategies</SectionTitle>
              {recommendation.alternatives.map((alt, index) => (
                <AlternativeCard key={index}>
                  <CardHeader>
                    <CardInfo>
                      <CardName style={{ fontSize: '14px' }}>{alt.card.name}</CardName>
                      <CardStats>
                        <StatChip variant="power">⚡ {alt.card.power}</StatChip>
                        <StatChip variant="damage">💥 {alt.card.damage}</StatChip>
                        <StatChip variant="pills">💊 {alt.pills}</StatChip>
                      </CardStats>
                      <ProbabilityValue 
                        value={alt.probability} 
                        style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}
                      >
                        {Math.round(alt.probability * 100)}% win chance
                      </ProbabilityValue>
                    </CardInfo>
                  </CardHeader>
                  <ReasoningText style={{ fontSize: '12px', marginTop: '8px' }}>
                    {alt.reasoning}
                  </ReasoningText>
                </AlternativeCard>
              ))}
            </AlternativesSection>
          )}
        </>
      )}
    </Container>
  );
};

export default BattleAssistant; 
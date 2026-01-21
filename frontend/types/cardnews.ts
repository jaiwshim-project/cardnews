// 카드뉴스 도메인 타입
export type Domain = 'hospital' | 'election' | 'education' | 'general';

// 카드 유형 (5장 구조)
export type CardType = 'HOOK' | 'EMPATHY' | 'PROBLEM' | 'SOLUTION' | 'CTA';

// 개별 카드 데이터
export interface CardData {
  type: CardType;
  title: string;
  content: string;
  subContent?: string;
}

// 카드뉴스 입력 데이터
export interface CardNewsInput {
  domain: Domain;
  topic: string;
  targetAudience: string;
  mainMessage: string;
  keywords?: string[];
  tone?: 'formal' | 'friendly' | 'urgent' | 'professional';
}

// 생성된 카드뉴스 결과
export interface CardNewsResult {
  id: string;
  input: CardNewsInput;
  cards: CardData[];
  qualityScore: QualityScore;
  createdAt: string;
}

// 품질 점수
export interface QualityScore {
  overall: number; // 0-100
  hookStrength: number;
  flowCoherence: number;
  ctaClarity: number;
  domainRelevance: number;
  feedback: string[];
}

// 도메인별 규칙
export interface DomainRule {
  domain: Domain;
  displayName: string;
  forbiddenWords: string[];
  recommendedWords: string[];
  toneGuide: string;
  maxLength: {
    title: number;
    content: number;
  };
}

// API 응답 타입
export interface GenerateResponse {
  success: boolean;
  data?: CardNewsResult;
  error?: string;
}

// 카드 디자인 스타일
export interface CardStyle {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
}

// 도메인별 스타일 맵핑
export const DOMAIN_STYLES: Record<Domain, CardStyle> = {
  hospital: {
    backgroundColor: '#f0f9ff',
    textColor: '#0c4a6e',
    accentColor: '#0ea5e9',
    fontFamily: 'Pretendard, sans-serif',
  },
  election: {
    backgroundColor: '#fef3c7',
    textColor: '#92400e',
    accentColor: '#f59e0b',
    fontFamily: 'Pretendard, sans-serif',
  },
  education: {
    backgroundColor: '#ecfdf5',
    textColor: '#065f46',
    accentColor: '#10b981',
    fontFamily: 'Pretendard, sans-serif',
  },
  general: {
    backgroundColor: '#f8fafc',
    textColor: '#334155',
    accentColor: '#6366f1',
    fontFamily: 'Pretendard, sans-serif',
  },
};

// 카드 타입별 라벨
export const CARD_TYPE_LABELS: Record<CardType, string> = {
  HOOK: '관심 유도',
  EMPATHY: '공감 형성',
  PROBLEM: '문제 제기',
  SOLUTION: '해결책 제시',
  CTA: '행동 유도',
};

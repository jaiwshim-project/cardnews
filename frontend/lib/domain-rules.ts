import { Domain, DomainRule } from '@/types/cardnews';

export const DOMAIN_RULES: Record<Domain, DomainRule> = {
  hospital: {
    domain: 'hospital',
    displayName: '병원/의료',
    forbiddenWords: [
      '100% 완치',
      '기적',
      '최고',
      '최초',
      '유일',
      '확실한 효과',
      '부작용 없음',
      '절대',
      '무조건',
    ],
    recommendedWords: [
      '전문',
      '맞춤',
      '상담',
      '안전',
      '신뢰',
      '케어',
      '건강',
      '정기 검진',
      '예방',
      '관리',
    ],
    toneGuide: '신뢰감 있고 전문적인 톤. 과장 표현 없이 사실 기반으로 작성.',
    maxLength: {
      title: 20,
      content: 80,
    },
  },
  election: {
    domain: 'election',
    displayName: '선거/정치',
    forbiddenWords: [
      '확실한 당선',
      '무조건',
      '거짓말',
      '비방',
      '특정 정당 비하',
      '혐오',
      '선동',
    ],
    recommendedWords: [
      '공약',
      '비전',
      '변화',
      '미래',
      '함께',
      '시민',
      '발전',
      '소통',
      '참여',
      '희망',
    ],
    toneGuide: '희망적이고 신뢰감 있는 톤. 긍정적인 비전 제시 중심.',
    maxLength: {
      title: 15,
      content: 60,
    },
  },
  education: {
    domain: 'education',
    displayName: '교육',
    forbiddenWords: [
      '100% 합격',
      '무조건',
      '기적',
      '천재',
      '확실한',
      '실패 없는',
    ],
    recommendedWords: [
      '성장',
      '발전',
      '학습',
      '미래',
      '가능성',
      '도전',
      '역량',
      '창의',
      '사고력',
      '문제 해결',
    ],
    toneGuide: '긍정적이고 동기부여가 되는 톤. 학습자 중심의 표현 사용.',
    maxLength: {
      title: 20,
      content: 70,
    },
  },
  general: {
    domain: 'general',
    displayName: '일반',
    forbiddenWords: [
      '무조건',
      '100%',
      '확실한',
      '절대',
      '기적',
    ],
    recommendedWords: [
      '함께',
      '새로운',
      '특별한',
      '쉽게',
      '빠르게',
      '효과적',
      '스마트',
      '편리',
    ],
    toneGuide: '친근하고 이해하기 쉬운 톤. 대중적인 표현 사용.',
    maxLength: {
      title: 20,
      content: 80,
    },
  },
};

export function getDomainRule(domain: Domain): DomainRule {
  return DOMAIN_RULES[domain];
}

export function validateContent(
  content: string,
  domain: Domain
): { isValid: boolean; violations: string[] } {
  const rule = DOMAIN_RULES[domain];
  const violations: string[] = [];

  for (const word of rule.forbiddenWords) {
    if (content.includes(word)) {
      violations.push(`금지어 사용: "${word}"`);
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
  };
}

export function getDomainDisplayName(domain: Domain): string {
  return DOMAIN_RULES[domain].displayName;
}

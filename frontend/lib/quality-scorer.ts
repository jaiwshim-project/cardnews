import { CardData, CardNewsInput, QualityScore } from '@/types/cardnews';
import { getDomainRule, validateContent } from './domain-rules';

export function calculateQualityScore(
  cards: CardData[],
  input: CardNewsInput
): QualityScore {
  const feedback: string[] = [];
  const rule = getDomainRule(input.domain);

  // 1. HOOK 강도 평가 (25점)
  let hookStrength = 25;
  const hookCard = cards.find((c) => c.type === 'HOOK');
  if (hookCard) {
    // 질문형 또는 감탄형 여부
    if (!hookCard.title.includes('?') && !hookCard.title.includes('!')) {
      hookStrength -= 5;
      feedback.push('HOOK 제목에 질문이나 감탄문을 추가하면 더 효과적입니다.');
    }
    // 길이 체크
    if (hookCard.title.length > rule.maxLength.title) {
      hookStrength -= 5;
      feedback.push('HOOK 제목이 너무 깁니다.');
    }
    // 내용 충실도
    if (hookCard.content.length < 20) {
      hookStrength -= 5;
      feedback.push('HOOK 본문이 너무 짧습니다.');
    }
  } else {
    hookStrength = 0;
    feedback.push('HOOK 카드가 없습니다.');
  }

  // 2. 흐름 일관성 평가 (25점)
  let flowCoherence = 25;
  const expectedFlow = ['HOOK', 'EMPATHY', 'PROBLEM', 'SOLUTION', 'CTA'];
  const actualFlow = cards.map((c) => c.type);

  for (let i = 0; i < expectedFlow.length; i++) {
    if (actualFlow[i] !== expectedFlow[i]) {
      flowCoherence -= 5;
    }
  }

  if (flowCoherence < 25) {
    feedback.push('카드 흐름 순서가 권장 구조와 다릅니다.');
  }

  // 3. CTA 명확성 평가 (25점)
  let ctaClarity = 25;
  const ctaCard = cards.find((c) => c.type === 'CTA');
  if (ctaCard) {
    // 행동 유도 동사 존재 여부
    const actionWords = ['문의', '연락', '방문', '신청', '시작', '확인', '예약', '상담'];
    const hasActionWord = actionWords.some(
      (word) => ctaCard.title.includes(word) || ctaCard.content.includes(word)
    );
    if (!hasActionWord) {
      ctaClarity -= 10;
      feedback.push('CTA에 구체적인 행동 유도 문구를 추가하세요.');
    }
    // 연락처 또는 링크 여부
    if (!ctaCard.subContent) {
      ctaClarity -= 5;
      feedback.push('CTA에 연락처나 추가 정보를 포함하면 좋습니다.');
    }
  } else {
    ctaClarity = 0;
    feedback.push('CTA 카드가 없습니다.');
  }

  // 4. 도메인 적합성 평가 (25점)
  let domainRelevance = 25;

  // 금지어 검사
  for (const card of cards) {
    const titleValidation = validateContent(card.title, input.domain);
    const contentValidation = validateContent(card.content, input.domain);

    if (!titleValidation.isValid) {
      domainRelevance -= 5;
      feedback.push(...titleValidation.violations);
    }
    if (!contentValidation.isValid) {
      domainRelevance -= 5;
      feedback.push(...contentValidation.violations);
    }
  }

  // 권장어 사용 여부
  const allText = cards.map((c) => `${c.title} ${c.content}`).join(' ');
  const usedRecommendedWords = rule.recommendedWords.filter((word) =>
    allText.includes(word)
  );

  if (usedRecommendedWords.length < 2) {
    domainRelevance -= 5;
    feedback.push('도메인 관련 권장 단어를 더 활용해보세요.');
  }

  // 점수 보정 (음수 방지)
  hookStrength = Math.max(0, hookStrength);
  flowCoherence = Math.max(0, flowCoherence);
  ctaClarity = Math.max(0, ctaClarity);
  domainRelevance = Math.max(0, domainRelevance);

  const overall = hookStrength + flowCoherence + ctaClarity + domainRelevance;

  // 긍정적 피드백 추가
  if (overall >= 90) {
    feedback.unshift('훌륭한 카드뉴스입니다!');
  } else if (overall >= 70) {
    feedback.unshift('좋은 품질의 카드뉴스입니다.');
  } else if (overall >= 50) {
    feedback.unshift('개선이 필요한 부분이 있습니다.');
  }

  return {
    overall,
    hookStrength,
    flowCoherence,
    ctaClarity,
    domainRelevance,
    feedback: [...new Set(feedback)], // 중복 제거
  };
}

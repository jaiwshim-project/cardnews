import { CardData, CardNewsInput, CardType } from '@/types/cardnews';
import { generateContent } from './gemini';
import { getDomainRule } from './domain-rules';

const CARD_FLOW: CardType[] = ['HOOK', 'EMPATHY', 'PROBLEM', 'SOLUTION', 'CTA'];

function buildPrompt(input: CardNewsInput): string {
  const rule = getDomainRule(input.domain);

  const toneMap = {
    formal: '격식 있고 전문적인',
    friendly: '친근하고 따뜻한',
    urgent: '긴급하고 강조하는',
    professional: '전문적이고 신뢰감 있는',
  };

  const toneDescription = input.tone ? toneMap[input.tone] : '자연스러운';

  return `당신은 카드뉴스 콘텐츠 전문가입니다. 다음 정보를 바탕으로 5장의 카드뉴스 콘텐츠를 생성해주세요.

## 입력 정보
- 도메인: ${rule.displayName}
- 주제: ${input.topic}
- 타겟 대상: ${input.targetAudience}
- 핵심 메시지: ${input.mainMessage}
${input.keywords?.length ? `- 키워드: ${input.keywords.join(', ')}` : ''}
- 톤앤매너: ${toneDescription}

## 도메인 가이드라인
- 톤 가이드: ${rule.toneGuide}
- 권장 단어: ${rule.recommendedWords.join(', ')}
- 금지 단어 (절대 사용 금지): ${rule.forbiddenWords.join(', ')}
- 제목 최대 길이: ${rule.maxLength.title}자
- 본문 최대 길이: ${rule.maxLength.content}자

## 5장 구조 (반드시 이 순서로 작성)
1. HOOK (관심 유도): 독자의 시선을 사로잡는 질문이나 놀라운 사실
2. EMPATHY (공감 형성): 타겟 대상의 고민이나 상황에 공감 표현
3. PROBLEM (문제 제기): 해결해야 할 문제나 니즈를 명확히 제시
4. SOLUTION (해결책 제시): 주제와 관련된 해결책이나 가치 제안
5. CTA (행동 유도): 구체적인 다음 행동 유도 (문의, 방문, 신청 등)

## 출력 형식 (반드시 이 JSON 형식으로만 응답)
{
  "cards": [
    {
      "type": "HOOK",
      "title": "제목 (${rule.maxLength.title}자 이내)",
      "content": "본문 내용 (${rule.maxLength.content}자 이내)",
      "subContent": "추가 설명 (선택사항)"
    },
    {
      "type": "EMPATHY",
      "title": "제목",
      "content": "본문 내용"
    },
    {
      "type": "PROBLEM",
      "title": "제목",
      "content": "본문 내용"
    },
    {
      "type": "SOLUTION",
      "title": "제목",
      "content": "본문 내용"
    },
    {
      "type": "CTA",
      "title": "제목",
      "content": "본문 내용",
      "subContent": "연락처나 추가 정보"
    }
  ]
}

반드시 위 JSON 형식으로만 응답하고, 다른 텍스트는 포함하지 마세요.`;
}

export async function generateCardFlow(input: CardNewsInput): Promise<CardData[]> {
  const prompt = buildPrompt(input);

  try {
    const response = await generateContent(prompt);

    // JSON 추출 (코드 블록이 있을 수 있음)
    let jsonStr = response;
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    // JSON 파싱
    const parsed = JSON.parse(jsonStr.trim());

    if (!parsed.cards || !Array.isArray(parsed.cards)) {
      throw new Error('Invalid response format');
    }

    // 5장 구조 검증
    if (parsed.cards.length !== 5) {
      throw new Error('Card count must be 5');
    }

    // 타입 검증 및 매핑
    const cards: CardData[] = parsed.cards.map((card: CardData, index: number) => ({
      type: CARD_FLOW[index],
      title: card.title || '',
      content: card.content || '',
      subContent: card.subContent,
    }));

    return cards;
  } catch (error) {
    console.error('Card flow generation error:', error);
    throw new Error('카드뉴스 생성 중 오류가 발생했습니다.');
  }
}

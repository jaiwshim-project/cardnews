import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { CardNewsInput, CardNewsResult, GenerateResponse } from '@/types/cardnews';
import { generateCardFlow } from '@/lib/cardflow';
import { calculateQualityScore } from '@/lib/quality-scorer';

export async function POST(request: NextRequest): Promise<NextResponse<GenerateResponse>> {
  try {
    const body = await request.json();

    // 입력 검증
    const { domain, topic, targetAudience, mainMessage, keywords, tone } = body;

    if (!domain || !topic || !targetAudience || !mainMessage) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
        },
        { status: 400 }
      );
    }

    // 유효한 도메인 검증
    const validDomains = ['hospital', 'election', 'education', 'general'];
    if (!validDomains.includes(domain)) {
      return NextResponse.json(
        {
          success: false,
          error: '유효하지 않은 도메인입니다.',
        },
        { status: 400 }
      );
    }

    const input: CardNewsInput = {
      domain,
      topic,
      targetAudience,
      mainMessage,
      keywords: keywords || [],
      tone: tone || 'professional',
    };

    // 카드 흐름 생성
    const cards = await generateCardFlow(input);

    // 품질 점수 계산
    const qualityScore = calculateQualityScore(cards, input);

    // 결과 생성
    const result: CardNewsResult = {
      id: uuidv4(),
      input,
      cards,
      qualityScore,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Generate API error:', error);

    const errorMessage =
      error instanceof Error ? error.message : '카드뉴스 생성 중 오류가 발생했습니다.';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

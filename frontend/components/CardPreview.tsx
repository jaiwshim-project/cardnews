'use client';

import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CardTemplate from './CardTemplate';
import { CardNewsResult, CARD_TYPE_LABELS } from '@/types/cardnews';

interface CardPreviewProps {
  result: CardNewsResult;
}

export default function CardPreview({ result }: CardPreviewProps) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [activeCard, setActiveCard] = useState(0);

  const downloadCard = async (index: number) => {
    const cardElement = cardRefs.current[index];
    if (!cardElement) return;

    try {
      setDownloading(true);
      const canvas = await html2canvas(cardElement, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `cardnews_${result.cards[index].type}_${index + 1}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Download error:', error);
      alert('이미지 다운로드 중 오류가 발생했습니다.');
    } finally {
      setDownloading(false);
    }
  };

  const downloadAllCards = async () => {
    setDownloading(true);
    try {
      for (let i = 0; i < result.cards.length; i++) {
        await downloadCard(i);
        // 각 다운로드 사이에 약간의 딜레이
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } finally {
      setDownloading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return '우수';
    if (score >= 70) return '양호';
    if (score >= 50) return '보통';
    return '개선필요';
  };

  return (
    <div className="space-y-8">
      {/* Quality Score Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>품질 점수</span>
            <span className={`text-3xl font-bold ${getScoreColor(result.qualityScore.overall)}`}>
              {result.qualityScore.overall}점
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-sm text-slate-600">HOOK 강도</div>
              <div className={`text-xl font-bold ${getScoreColor(result.qualityScore.hookStrength * 4)}`}>
                {result.qualityScore.hookStrength}/25
              </div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-sm text-slate-600">흐름 일관성</div>
              <div className={`text-xl font-bold ${getScoreColor(result.qualityScore.flowCoherence * 4)}`}>
                {result.qualityScore.flowCoherence}/25
              </div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-sm text-slate-600">CTA 명확성</div>
              <div className={`text-xl font-bold ${getScoreColor(result.qualityScore.ctaClarity * 4)}`}>
                {result.qualityScore.ctaClarity}/25
              </div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-sm text-slate-600">도메인 적합성</div>
              <div className={`text-xl font-bold ${getScoreColor(result.qualityScore.domainRelevance * 4)}`}>
                {result.qualityScore.domainRelevance}/25
              </div>
            </div>
          </div>

          {/* Feedback */}
          {result.qualityScore.feedback.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">피드백</h4>
              <ul className="space-y-1">
                {result.qualityScore.feedback.map((fb, idx) => (
                  <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    {fb}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cards Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>카드 미리보기</span>
            <Button onClick={downloadAllCards} disabled={downloading}>
              {downloading ? '다운로드 중...' : '전체 다운로드'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="0" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              {result.cards.map((card, index) => (
                <TabsTrigger key={index} value={String(index)} className="text-xs">
                  {CARD_TYPE_LABELS[card.type]}
                </TabsTrigger>
              ))}
            </TabsList>

            {result.cards.map((card, index) => (
              <TabsContent key={index} value={String(index)}>
                <div className="flex flex-col items-center gap-4">
                  <CardTemplate
                    ref={(el) => {
                      cardRefs.current[index] = el;
                    }}
                    card={card}
                    domain={result.input.domain}
                    cardIndex={index}
                  />
                  <Button
                    variant="outline"
                    onClick={() => downloadCard(index)}
                    disabled={downloading}
                  >
                    이 카드 다운로드 (PNG)
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* All Cards Grid View */}
      <Card>
        <CardHeader>
          <CardTitle>전체 카드 보기</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-4 overflow-x-auto py-4">
            {result.cards.map((card, index) => (
              <div key={index} className="flex-shrink-0 scale-50 origin-top-left" style={{ width: '200px', height: '250px' }}>
                <CardTemplate
                  card={card}
                  domain={result.input.domain}
                  cardIndex={index}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

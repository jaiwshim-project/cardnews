'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Domain, CardNewsInput, CardNewsResult } from '@/types/cardnews';

const DOMAINS: { value: Domain; label: string }[] = [
  { value: 'hospital', label: '병원/의료' },
  { value: 'election', label: '선거/정치' },
  { value: 'education', label: '교육' },
  { value: 'general', label: '일반' },
];

const TONES = [
  { value: 'formal', label: '격식체' },
  { value: 'friendly', label: '친근한' },
  { value: 'urgent', label: '긴급한' },
  { value: 'professional', label: '전문적' },
];

interface CardNewsFormProps {
  onGenerated: (result: CardNewsResult) => void;
}

export default function CardNewsForm({ onGenerated }: CardNewsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CardNewsInput>({
    domain: 'general',
    topic: '',
    targetAudience: '',
    mainMessage: '',
    keywords: [],
    tone: 'professional',
  });

  const [keywordsInput, setKeywordsInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const keywords = keywordsInput
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      const response = await fetch('/api/cardnews/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          keywords,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '카드뉴스 생성에 실패했습니다.');
      }

      onGenerated(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>카드뉴스 생성</CardTitle>
        <CardDescription>
          아래 정보를 입력하면 AI가 5장의 카드뉴스 콘텐츠를 생성합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Domain */}
          <div className="space-y-2">
            <Label htmlFor="domain">도메인</Label>
            <Select
              value={formData.domain}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, domain: value as Domain }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="도메인 선택" />
              </SelectTrigger>
              <SelectContent>
                {DOMAINS.map((domain) => (
                  <SelectItem key={domain.value} value={domain.value}>
                    {domain.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic">주제</Label>
            <Input
              id="topic"
              placeholder="예: 치아 미백의 효과와 주의사항"
              value={formData.topic}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, topic: e.target.value }))
              }
              required
            />
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label htmlFor="targetAudience">타겟 대상</Label>
            <Input
              id="targetAudience"
              placeholder="예: 20-30대 직장인"
              value={formData.targetAudience}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, targetAudience: e.target.value }))
              }
              required
            />
          </div>

          {/* Main Message */}
          <div className="space-y-2">
            <Label htmlFor="mainMessage">핵심 메시지</Label>
            <Textarea
              id="mainMessage"
              placeholder="전달하고 싶은 핵심 메시지를 입력하세요"
              value={formData.mainMessage}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, mainMessage: e.target.value }))
              }
              required
              rows={3}
            />
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <Label htmlFor="keywords">키워드 (선택)</Label>
            <Input
              id="keywords"
              placeholder="쉼표로 구분 (예: 치아미백, 안전, 전문)"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
            />
          </div>

          {/* Tone */}
          <div className="space-y-2">
            <Label htmlFor="tone">톤앤매너</Label>
            <Select
              value={formData.tone}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, tone: value as CardNewsInput['tone'] }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="톤 선택" />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    {tone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                AI가 생성 중입니다...
              </span>
            ) : (
              '카드뉴스 생성하기'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

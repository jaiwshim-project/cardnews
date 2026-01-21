'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import CardPreview from '@/components/CardPreview';
import { CardNewsResult } from '@/types/cardnews';

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<CardNewsResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 결과 로드
    const stored = localStorage.getItem('cardnews_result');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // ID 확인
        if (parsed.id === params.id) {
          setResult(parsed);
        } else {
          // ID가 일치하지 않으면 홈으로
          router.push('/');
        }
      } catch {
        router.push('/');
      }
    } else {
      router.push('/');
    }
    setLoading(false);
  }, [params.id, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">로딩 중...</p>
        </div>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">결과를 찾을 수 없습니다</h1>
          <Link href="/create">
            <Button>새로운 카드뉴스 만들기</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/create" className="text-slate-600 hover:text-slate-900 text-sm mb-2 inline-block">
              ← 다시 만들기
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">카드뉴스 미리보기</h1>
            <p className="text-slate-600 mt-1">{result.input.topic}</p>
          </div>
          <Link href="/">
            <Button variant="outline">홈으로</Button>
          </Link>
        </div>

        {/* Info Summary */}
        <div className="bg-white rounded-lg p-4 mb-8 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-500">도메인:</span>{' '}
              <span className="font-medium">{result.input.domain}</span>
            </div>
            <div>
              <span className="text-slate-500">타겟:</span>{' '}
              <span className="font-medium">{result.input.targetAudience}</span>
            </div>
            <div>
              <span className="text-slate-500">톤:</span>{' '}
              <span className="font-medium">{result.input.tone}</span>
            </div>
            <div>
              <span className="text-slate-500">생성일:</span>{' '}
              <span className="font-medium">
                {new Date(result.createdAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
        </div>

        {/* Card Preview */}
        <CardPreview result={result} />
      </div>
    </main>
  );
}

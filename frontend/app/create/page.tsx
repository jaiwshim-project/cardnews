'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CardNewsForm from '@/components/CardNewsForm';
import { CardNewsResult } from '@/types/cardnews';
import { Button } from '@/components/ui/button';

export default function CreatePage() {
  const router = useRouter();
  const [result, setResult] = useState<CardNewsResult | null>(null);

  const handleGenerated = (generatedResult: CardNewsResult) => {
    setResult(generatedResult);
    // 로컬 스토리지에 결과 저장 (미리보기 페이지에서 사용)
    localStorage.setItem('cardnews_result', JSON.stringify(generatedResult));
    // 미리보기 페이지로 이동
    router.push(`/preview/${generatedResult.id}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-slate-600 hover:text-slate-900 text-sm mb-4 inline-block">
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">카드뉴스 생성</h1>
          <p className="text-slate-600 mt-2">
            아래 정보를 입력하시면 AI가 5장의 카드뉴스 콘텐츠를 생성합니다.
          </p>
        </div>

        {/* Form */}
        <CardNewsForm onGenerated={handleGenerated} />

        {/* Tips */}
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">작성 팁</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 주제는 구체적으로 작성할수록 좋은 결과를 얻을 수 있습니다.</li>
              <li>• 타겟 대상을 명확히 하면 그에 맞는 톤으로 작성됩니다.</li>
              <li>• 핵심 메시지에 전달하고 싶은 가치를 담아주세요.</li>
              <li>• 도메인에 따라 적절한 규칙이 자동 적용됩니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

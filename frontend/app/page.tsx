import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            AI 카드뉴스 생성기
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            주제만 입력하면 AI가 5장 카드뉴스의 사고 흐름과 문장을 자동으로 생성합니다.
            HOOK → EMPATHY → PROBLEM → SOLUTION → CTA 구조로 효과적인 카드뉴스를 만들어보세요.
          </p>
          <Link href="/create">
            <Button size="lg" className="text-lg px-8 py-6">
              카드뉴스 만들기
            </Button>
          </Link>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">병원/의료</CardTitle>
              <CardDescription>
                신뢰감 있는 의료 콘텐츠
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                의료 광고 규정을 준수하면서 전문성과 신뢰를 전달하는 카드뉴스를 생성합니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">선거/정치</CardTitle>
              <CardDescription>
                비전을 담은 정치 콘텐츠
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                희망적인 메시지와 구체적인 공약을 효과적으로 전달하는 카드뉴스를 생성합니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">교육</CardTitle>
              <CardDescription>
                동기부여 교육 콘텐츠
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                학습자의 성장과 발전을 독려하는 긍정적인 교육 카드뉴스를 생성합니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">일반</CardTitle>
              <CardDescription>
                다양한 목적의 콘텐츠
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                마케팅, 홍보, 안내 등 다양한 목적에 맞는 카드뉴스를 생성합니다.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How it works Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            5장 구조로 완성되는 카드뉴스
          </h2>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { step: '1', title: 'HOOK', desc: '관심 유도', color: 'bg-blue-100 text-blue-700' },
              { step: '2', title: 'EMPATHY', desc: '공감 형성', color: 'bg-green-100 text-green-700' },
              { step: '3', title: 'PROBLEM', desc: '문제 제기', color: 'bg-yellow-100 text-yellow-700' },
              { step: '4', title: 'SOLUTION', desc: '해결책 제시', color: 'bg-purple-100 text-purple-700' },
              { step: '5', title: 'CTA', desc: '행동 유도', color: 'bg-red-100 text-red-700' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center mx-auto mb-3 font-bold`}>
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

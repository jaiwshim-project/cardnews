// ============================================
// AI 카드뉴스 생성기 - 로컬 버전
// ============================================

// 전역 변수
let apiKey = localStorage.getItem('gemini_api_key') || 'AIzaSyD-k4tiMRVxKuTYyYavuV5Z0de-e8THvl4';
let currentCards = [];
let currentDomain = 'general';
let currentCardIndex = 0;
let currentTopic = '';
let currentBusinessName = '';

// 도메인별 이미지 키워드
const DOMAIN_IMAGE_KEYWORDS = {
  hospital: ['dental', 'medical', 'healthcare', 'clinic', 'doctor', 'smile', 'teeth'],
  election: ['politics', 'vote', 'community', 'people', 'city', 'government', 'future'],
  education: ['education', 'learning', 'student', 'book', 'classroom', 'study', 'growth'],
  general: ['business', 'technology', 'modern', 'lifestyle', 'success', 'office', 'team'],
  realestate: ['building', 'apartment', 'house', 'city', 'architecture', 'home', 'interior'],
  finance: ['finance', 'money', 'investment', 'business', 'growth', 'chart', 'savings'],
  beauty: ['beauty', 'skincare', 'spa', 'cosmetics', 'fashion', 'wellness', 'luxury'],
  food: ['food', 'restaurant', 'cooking', 'delicious', 'kitchen', 'chef', 'dining'],
  custom: ['business', 'professional', 'service', 'quality', 'modern', 'success', 'team']
};

// 카드 타입별 이미지 키워드
const CARD_TYPE_IMAGE_KEYWORDS = {
  HOOK: ['attention', 'surprise', 'question', 'curious'],
  EMPATHY: ['understanding', 'emotion', 'care', 'support'],
  PROBLEM: ['challenge', 'problem', 'concern', 'issue'],
  SOLUTION: ['solution', 'success', 'help', 'answer'],
  CTA: ['action', 'contact', 'start', 'call']
};

// 도메인별 규칙
const DOMAIN_RULES = {
  hospital: {
    displayName: '병원/의료',
    forbiddenWords: ['100% 완치', '기적', '최고', '최초', '유일', '확실한 효과', '부작용 없음', '절대', '무조건'],
    recommendedWords: ['전문', '맞춤', '상담', '안전', '신뢰', '케어', '건강', '정기 검진', '예방', '관리'],
    toneGuide: '신뢰감 있고 전문적인 톤. 과장 표현 없이 사실 기반으로 작성.',
    maxLength: { title: 20, content: 80 }
  },
  election: {
    displayName: '선거/정치',
    forbiddenWords: ['확실한 당선', '무조건', '거짓말', '비방', '특정 정당 비하', '혐오', '선동'],
    recommendedWords: ['공약', '비전', '변화', '미래', '함께', '시민', '발전', '소통', '참여', '희망'],
    toneGuide: '희망적이고 신뢰감 있는 톤. 긍정적인 비전 제시 중심.',
    maxLength: { title: 15, content: 60 }
  },
  education: {
    displayName: '교육',
    forbiddenWords: ['100% 합격', '무조건', '기적', '천재', '확실한', '실패 없는'],
    recommendedWords: ['성장', '발전', '학습', '미래', '가능성', '도전', '역량', '창의', '사고력', '문제 해결'],
    toneGuide: '긍정적이고 동기부여가 되는 톤. 학습자 중심의 표현 사용.',
    maxLength: { title: 20, content: 70 }
  },
  general: {
    displayName: '일반',
    forbiddenWords: ['무조건', '100%', '확실한', '절대', '기적'],
    recommendedWords: ['함께', '새로운', '특별한', '쉽게', '빠르게', '효과적', '스마트', '편리'],
    toneGuide: '친근하고 이해하기 쉬운 톤. 대중적인 표현 사용.',
    maxLength: { title: 20, content: 80 }
  },
  realestate: {
    displayName: '부동산',
    forbiddenWords: ['확정 수익', '무조건 상승', '100% 보장', '절대 손해없음', '투기'],
    recommendedWords: ['입지', '투자가치', '교통', '학군', '편의시설', '미래가치', '프리미엄', '생활환경', '개발호재', '시세'],
    toneGuide: '신뢰감 있고 전문적인 톤. 객관적인 정보 제공 중심.',
    maxLength: { title: 20, content: 80 }
  },
  finance: {
    displayName: '금융/보험',
    forbiddenWords: ['확정 수익', '무조건', '100% 보장', '원금 보장', '손해 없음'],
    recommendedWords: ['안정', '수익', '보장', '절세', '노후준비', '자산관리', '맞춤설계', '전문상담', '보험료', '혜택'],
    toneGuide: '신뢰감 있고 전문적인 톤. 정확한 정보와 안정성 강조.',
    maxLength: { title: 20, content: 80 }
  },
  beauty: {
    displayName: '뷰티/미용',
    forbiddenWords: ['100% 효과', '기적', '완벽한', '부작용 없음', '영구적'],
    recommendedWords: ['자연스러운', '맞춤케어', '피부관리', '트렌드', '전문가', '프리미엄', '안전한', '효과적', '뷰티', '관리'],
    toneGuide: '세련되고 트렌디한 톤. 자연스러운 아름다움 강조.',
    maxLength: { title: 20, content: 80 }
  },
  food: {
    displayName: '음식/요식업',
    forbiddenWords: ['최고', '유일', '세계 1위', '무조건'],
    recommendedWords: ['신선한', '정성', '맛집', '특별한', '프리미엄', '수제', '건강한', '인기', '추천', '분위기'],
    toneGuide: '친근하고 맛있는 느낌의 톤. 감성적인 표현 사용.',
    maxLength: { title: 20, content: 80 }
  }
};

// 카드 타입 정보
const CARD_TYPES = ['HOOK', 'EMPATHY', 'PROBLEM', 'SOLUTION', 'CTA'];
const CARD_TYPE_LABELS = {
  HOOK: '관심 유도',
  EMPATHY: '공감 형성',
  PROBLEM: '문제 제기',
  SOLUTION: '해결책 제시',
  CTA: '행동 유도'
};

const CARD_TYPE_COLORS = {
  HOOK: { gradient: 'card-gradient-hook', badge: 'bg-blue-700' },
  EMPATHY: { gradient: 'card-gradient-empathy', badge: 'bg-green-700' },
  PROBLEM: { gradient: 'card-gradient-problem', badge: 'bg-yellow-700' },
  SOLUTION: { gradient: 'card-gradient-solution', badge: 'bg-purple-700' },
  CTA: { gradient: 'card-gradient-cta', badge: 'bg-red-700' }
};

// 톤 설명
const TONE_MAP = {
  formal: '격식 있고 전문적인',
  friendly: '친근하고 따뜻한',
  urgent: '긴급하고 강조하는',
  professional: '전문적이고 신뢰감 있는'
};

// ============================================
// 초기화
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // API 키 로드
  if (apiKey) {
    document.getElementById('api-key-input').value = apiKey;
    showApiKeyStatus('API 키가 저장되어 있습니다.', 'success');
  }

  // 폼 제출 이벤트
  document.getElementById('cardnews-form').addEventListener('submit', handleSubmit);

  // 초기 키워드 버튼 생성
  updateKeywordButtons();
});

// 선택된 연령대와 직업군
let selectedAge = '30대';
let selectedJob = '직장인';
let selectedKeywords = [];

// 도메인별 기본 키워드
const DOMAIN_KEYWORDS = {
  hospital: ['전문치료', '안전', '최신장비', '무통시술', '맞춤케어', '정기검진', '예방치료', '자연스러운'],
  election: ['변화', '희망', '미래', '소통', '공약실천', '시민참여', '지역발전', '신뢰'],
  education: ['성장', '미래인재', '창의력', '맞춤학습', '실력향상', '자기주도', '문제해결', '역량강화'],
  general: ['혁신', '편리함', '가성비', '프리미엄', '트렌드', '스마트', '효율적', '신뢰'],
  realestate: ['입지조건', '투자가치', '교통편리', '학군우수', '개발호재', '미래가치', '생활인프라', '시세상승'],
  finance: ['안정수익', '노후준비', '절세혜택', '맞춤설계', '자산관리', '보장내용', '전문상담', '월납입'],
  beauty: ['자연스러운', '피부관리', '맞춤케어', '트렌드', '프리미엄', '전문가', '안전시술', '효과만족'],
  food: ['신선재료', '정성가득', '맛집추천', '분위기좋은', '프리미엄', '수제음식', '건강식단', '인기메뉴'],
  custom: ['전문성', '신뢰', '품질', '서비스', '맞춤', '프리미엄', '효과', '만족']
};

// 연령대별 추가 키워드
const AGE_KEYWORDS = {
  '10대': ['학업', '성장기', '교정', '예방'],
  '20대': ['취업', '자기관리', '외모', '가성비'],
  '30대': ['직장생활', '건강관리', '시간절약', '전문성'],
  '40대': ['가족건강', '노후준비', '신뢰', '품질'],
  '50대': ['건강회복', '관리', '경험', '안정'],
  '60대': ['건강유지', '편안함', '꼼꼼함', '배려'],
  '70대': ['건강관리', '편리함', '안심', '케어']
};

// 직업군별 추가 키워드
const JOB_KEYWORDS = {
  '직장인': ['점심시간', '야간진료', '빠른치료', '직장근처'],
  '자영업자': ['시간유연', '비용효율', '단골혜택', '빠른회복'],
  '주부': ['가족케어', '주간시간', '꼼꼼상담', '가격대비'],
  '학생': ['학생할인', '방학기간', '빠른치료', '부담없는'],
  '프리랜서': ['유연예약', '시간절약', '온라인상담', '효율적'],
  '은퇴자': ['충분한상담', '정기관리', '편안함', '친절'],
  '전문직': ['프리미엄', '최신기술', '맞춤서비스', '시간효율']
};

// ============================================
// 도메인 선택
// ============================================
// 현재 커스텀 도메인명 저장
let customDomainName = '';

function selectDomain(domain) {
  // hidden input 값 업데이트
  document.getElementById('domain').value = domain;

  // 모든 버튼 스타일 초기화
  document.querySelectorAll('.domain-btn').forEach(btn => {
    btn.classList.remove('border-blue-500', 'bg-blue-500', 'text-white');
    btn.classList.add('border-slate-300', 'bg-white', 'text-slate-700');
  });

  // 선택된 버튼 스타일 적용
  const selectedBtn = document.getElementById(`domain-btn-${domain}`);
  if (selectedBtn) {
    selectedBtn.classList.remove('border-slate-300', 'bg-white', 'text-slate-700');
    selectedBtn.classList.add('border-blue-500', 'bg-blue-500', 'text-white');
  }

  // 직접입력 선택 시 입력창 표시
  const customInputWrap = document.getElementById('custom-domain-input-wrap');
  if (domain === 'custom') {
    customInputWrap.classList.remove('hidden');
  } else {
    customInputWrap.classList.add('hidden');
  }

  // 키워드 버튼 업데이트
  updateKeywordButtons();
}

// 커스텀 도메인 적용
function applyCustomDomain() {
  const input = document.getElementById('custom-domain-input');
  const domainName = input.value.trim();

  if (!domainName) {
    alert('도메인명을 입력해주세요.');
    return;
  }

  customDomainName = domainName;

  // custom 도메인 규칙 동적 업데이트
  DOMAIN_RULES.custom = {
    displayName: domainName,
    forbiddenWords: ['무조건', '100%', '확실한', '절대', '기적'],
    recommendedWords: ['전문', '신뢰', '품질', '서비스', '맞춤', '프리미엄', '효과', '만족'],
    toneGuide: '친근하고 전문적인 톤.',
    maxLength: { title: 20, content: 80 }
  };

  // custom 키워드도 업데이트
  DOMAIN_KEYWORDS.custom = ['전문성', '신뢰', '품질', '서비스', '맞춤', '프리미엄', '효과', '만족'];

  // 버튼 텍스트 변경
  const customBtn = document.getElementById('domain-btn-custom');
  if (customBtn) {
    customBtn.textContent = domainName;
  }

  // 키워드 버튼 업데이트
  updateKeywordButtons();

  alert(`"${domainName}" 도메인이 적용되었습니다.`);
}

// ============================================
// 톤앤매너 선택
// ============================================
function selectTone(tone) {
  // hidden input 값 업데이트
  document.getElementById('tone').value = tone;

  // 모든 버튼 스타일 초기화
  document.querySelectorAll('.tone-btn').forEach(btn => {
    btn.classList.remove('border-slate-500', 'bg-slate-500', 'text-white');
    btn.classList.add('border-slate-300', 'bg-white', 'text-slate-700');
  });

  // 선택된 버튼 스타일 적용
  const selectedBtn = document.getElementById(`tone-btn-${tone}`);
  if (selectedBtn) {
    selectedBtn.classList.remove('border-slate-300', 'bg-white', 'text-slate-700');
    selectedBtn.classList.add('border-slate-500', 'bg-slate-500', 'text-white');
  }
}

// ============================================
// 연령대 선택
// ============================================
function selectAge(age) {
  selectedAge = age;
  updateTargetAudience();

  // 모든 버튼 스타일 초기화
  document.querySelectorAll('.age-btn').forEach(btn => {
    btn.classList.remove('border-green-500', 'bg-green-500', 'text-white');
    btn.classList.add('border-slate-300', 'bg-white', 'text-slate-700');
  });

  // 선택된 버튼 스타일 적용
  const selectedBtn = document.getElementById(`age-btn-${age}`);
  if (selectedBtn) {
    selectedBtn.classList.remove('border-slate-300', 'bg-white', 'text-slate-700');
    selectedBtn.classList.add('border-green-500', 'bg-green-500', 'text-white');
  }
}

// ============================================
// 직업군 선택
// ============================================
function selectJob(job) {
  selectedJob = job;
  updateTargetAudience();

  // 모든 버튼 스타일 초기화
  document.querySelectorAll('.job-btn').forEach(btn => {
    btn.classList.remove('border-purple-500', 'bg-purple-500', 'text-white');
    btn.classList.add('border-slate-300', 'bg-white', 'text-slate-700');
  });

  // 선택된 버튼 스타일 적용
  const selectedBtn = document.getElementById(`job-btn-${job}`);
  if (selectedBtn) {
    selectedBtn.classList.remove('border-slate-300', 'bg-white', 'text-slate-700');
    selectedBtn.classList.add('border-purple-500', 'bg-purple-500', 'text-white');
  }
}

// ============================================
// 타겟 대상 업데이트
// ============================================
function updateTargetAudience() {
  const targetAudience = `${selectedAge} ${selectedJob}`;
  document.getElementById('target-audience').value = targetAudience;
  // 키워드도 업데이트
  updateKeywordButtons();
}

// ============================================
// 키워드 버튼 업데이트
// ============================================
function updateKeywordButtons() {
  const domain = document.getElementById('domain').value;

  // 도메인, 연령대, 직업군에서 키워드 조합
  const domainKw = DOMAIN_KEYWORDS[domain] || DOMAIN_KEYWORDS.general;
  const ageKw = AGE_KEYWORDS[selectedAge] || [];
  const jobKw = JOB_KEYWORDS[selectedJob] || [];

  // 키워드 조합 (중복 제거, 6개 선택)
  const allKeywords = [...new Set([...domainKw.slice(0, 3), ...ageKw.slice(0, 2), ...jobKw.slice(0, 2)])];
  const displayKeywords = allKeywords.slice(0, 6);

  // 선택된 키워드 초기화 (새 키워드 목록에 없는 것 제거)
  selectedKeywords = selectedKeywords.filter(kw => displayKeywords.includes(kw));

  // 버튼 생성
  const container = document.getElementById('keyword-buttons');
  container.innerHTML = displayKeywords.map(keyword => {
    const isSelected = selectedKeywords.includes(keyword);
    const selectedClass = isSelected
      ? 'border-orange-500 bg-orange-500 text-white'
      : 'border-slate-300 bg-white text-slate-700 hover:border-orange-300';
    return `
      <button
        type="button"
        onclick="toggleKeyword('${keyword}')"
        id="keyword-btn-${keyword}"
        class="keyword-btn px-3 py-2 rounded-lg text-sm font-medium transition border-2 ${selectedClass}"
      >
        ${keyword}
      </button>
    `;
  }).join('');

  // hidden input 업데이트
  document.getElementById('keywords').value = selectedKeywords.join(', ');
}

// ============================================
// 키워드 토글 (선택/해제)
// ============================================
function toggleKeyword(keyword) {
  const index = selectedKeywords.indexOf(keyword);
  if (index > -1) {
    // 이미 선택됨 -> 해제
    selectedKeywords.splice(index, 1);
  } else {
    // 선택 추가
    selectedKeywords.push(keyword);
  }

  // 버튼 스타일 업데이트
  const btn = document.getElementById(`keyword-btn-${keyword}`);
  if (btn) {
    if (selectedKeywords.includes(keyword)) {
      btn.classList.remove('border-slate-300', 'bg-white', 'text-slate-700');
      btn.classList.add('border-orange-500', 'bg-orange-500', 'text-white');
    } else {
      btn.classList.remove('border-orange-500', 'bg-orange-500', 'text-white');
      btn.classList.add('border-slate-300', 'bg-white', 'text-slate-700');
    }
  }

  // hidden input 업데이트
  document.getElementById('keywords').value = selectedKeywords.join(', ');
}

// ============================================
// 커스텀 키워드 추가
// ============================================
function addCustomKeyword() {
  const input = document.getElementById('custom-keyword-input');
  const keyword = input.value.trim();

  if (!keyword) return;

  // 이미 선택된 키워드인지 확인
  if (selectedKeywords.includes(keyword)) {
    input.value = '';
    return;
  }

  // 키워드 추가
  selectedKeywords.push(keyword);

  // 버튼 컨테이너에 새 버튼 추가
  const container = document.getElementById('keyword-buttons');
  const newBtn = document.createElement('button');
  newBtn.type = 'button';
  newBtn.id = `keyword-btn-${keyword}`;
  newBtn.className = 'keyword-btn px-3 py-2 rounded-lg text-sm font-medium transition border-2 border-orange-500 bg-orange-500 text-white';
  newBtn.textContent = keyword;
  newBtn.onclick = () => toggleKeyword(keyword);
  container.appendChild(newBtn);

  // hidden input 업데이트
  document.getElementById('keywords').value = selectedKeywords.join(', ');

  // 입력창 초기화
  input.value = '';
}

// ============================================
// API 키 관리
// ============================================
function saveApiKey() {
  const input = document.getElementById('api-key-input');
  apiKey = input.value.trim();

  if (!apiKey) {
    showApiKeyStatus('API 키를 입력해주세요.', 'error');
    return;
  }

  localStorage.setItem('gemini_api_key', apiKey);
  showApiKeyStatus('API 키가 저장되었습니다.', 'success');
}

function showApiKeyStatus(message, type) {
  const status = document.getElementById('api-key-status');
  status.textContent = message;
  status.className = `text-sm mt-2 ${type === 'success' ? 'text-green-600' : 'text-red-600'}`;
  status.classList.remove('hidden');
}

// ============================================
// 폼 제출 핸들러
// ============================================
async function handleSubmit(e) {
  e.preventDefault();

  if (!apiKey) {
    showError('먼저 Gemini API 키를 설정해주세요.');
    return;
  }

  const businessName = document.getElementById('business-name').value.trim();
  const domain = document.getElementById('domain').value;
  const topic = document.getElementById('topic').value.trim();
  const targetAudience = document.getElementById('target-audience').value.trim();
  const mainMessage = document.getElementById('main-message').value.trim();
  const keywords = document.getElementById('keywords').value.trim();
  const tone = document.getElementById('tone').value;

  if (!businessName || !topic || !targetAudience || !mainMessage) {
    showError('필수 항목을 모두 입력해주세요.');
    return;
  }

  // 전역 변수에 저장
  currentBusinessName = businessName;

  // 로딩 상태
  setLoading(true);
  hideError();

  try {
    // 카드 생성
    const cards = await generateCards({
      domain,
      topic,
      targetAudience,
      mainMessage,
      keywords: keywords ? keywords.split(',').map(k => k.trim()) : [],
      tone
    });

    currentCards = cards;
    currentDomain = domain;

    // 품질 점수 계산
    const qualityScore = calculateQualityScore(cards, { domain });

    // 결과 표시
    displayResults(cards, qualityScore);

  } catch (error) {
    showError(error.message || 'AI 생성 중 오류가 발생했습니다.');
  } finally {
    setLoading(false);
  }
}

// ============================================
// Gemini API 호출
// ============================================
async function generateCards(input) {
  const rule = DOMAIN_RULES[input.domain];
  const toneDescription = TONE_MAP[input.tone] || '자연스러운';

  const prompt = `당신은 카드뉴스 콘텐츠 전문가입니다. 다음 정보를 바탕으로 5장의 카드뉴스 콘텐츠를 생성해주세요.

## 입력 정보
- 도메인: ${rule.displayName}
- 주제: ${input.topic}
- 타겟 대상: ${input.targetAudience}
- 핵심 메시지: ${input.mainMessage}
${input.keywords.length ? `- 키워드: ${input.keywords.join(', ')}` : ''}
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

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048
        }
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'API 호출 실패');
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('AI 응답이 비어 있습니다.');
  }

  // JSON 추출
  let jsonStr = text;

  // 마크다운 코드 블록 제거 (여러 형식 지원)
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1];
  } else {
    // { 로 시작하는 JSON 찾기
    const jsonStartIndex = text.indexOf('{');
    const jsonEndIndex = text.lastIndexOf('}');
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      jsonStr = text.substring(jsonStartIndex, jsonEndIndex + 1);
    }
  }

  // JSON 정리 (일반적인 오류 수정)
  jsonStr = jsonStr.trim();
  // trailing comma 제거 (배열/객체 끝의 불필요한 쉼표)
  jsonStr = jsonStr.replace(/,\s*}/g, '}');
  jsonStr = jsonStr.replace(/,\s*]/g, ']');
  // 줄바꿈 문자 정리
  jsonStr = jsonStr.replace(/[\r\n]+/g, ' ');
  // 연속 공백 제거
  jsonStr = jsonStr.replace(/\s+/g, ' ');

  console.log('Extracted JSON:', jsonStr); // 디버깅용

  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (parseError) {
    console.error('JSON Parse Error:', parseError);
    console.error('Raw text:', text);
    throw new Error('AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.');
  }

  if (!parsed.cards || !Array.isArray(parsed.cards) || parsed.cards.length !== 5) {
    throw new Error('카드 데이터 형식이 올바르지 않습니다.');
  }

  // 타입 매핑
  return parsed.cards.map((card, index) => ({
    type: CARD_TYPES[index],
    title: card.title || '',
    content: card.content || '',
    subContent: card.subContent || ''
  }));
}

// ============================================
// 품질 점수 계산
// ============================================
function calculateQualityScore(cards, input) {
  const feedback = [];
  const rule = DOMAIN_RULES[input.domain];

  // 1. HOOK 강도 (25점)
  let hookStrength = 25;
  const hookCard = cards.find(c => c.type === 'HOOK');
  if (hookCard) {
    if (!hookCard.title.includes('?') && !hookCard.title.includes('!')) {
      hookStrength -= 5;
      feedback.push('HOOK 제목에 질문이나 감탄문을 추가하면 더 효과적입니다.');
    }
    if (hookCard.title.length > rule.maxLength.title) {
      hookStrength -= 5;
      feedback.push('HOOK 제목이 너무 깁니다.');
    }
    if (hookCard.content.length < 20) {
      hookStrength -= 5;
      feedback.push('HOOK 본문이 너무 짧습니다.');
    }
  } else {
    hookStrength = 0;
    feedback.push('HOOK 카드가 없습니다.');
  }

  // 2. 흐름 일관성 (25점)
  let flowCoherence = 25;
  const expectedFlow = CARD_TYPES;
  const actualFlow = cards.map(c => c.type);
  for (let i = 0; i < expectedFlow.length; i++) {
    if (actualFlow[i] !== expectedFlow[i]) {
      flowCoherence -= 5;
    }
  }
  if (flowCoherence < 25) {
    feedback.push('카드 흐름 순서가 권장 구조와 다릅니다.');
  }

  // 3. CTA 명확성 (25점)
  let ctaClarity = 25;
  const ctaCard = cards.find(c => c.type === 'CTA');
  if (ctaCard) {
    const actionWords = ['문의', '연락', '방문', '신청', '시작', '확인', '예약', '상담'];
    const hasActionWord = actionWords.some(word =>
      ctaCard.title.includes(word) || ctaCard.content.includes(word)
    );
    if (!hasActionWord) {
      ctaClarity -= 10;
      feedback.push('CTA에 구체적인 행동 유도 문구를 추가하세요.');
    }
    if (!ctaCard.subContent) {
      ctaClarity -= 5;
      feedback.push('CTA에 연락처나 추가 정보를 포함하면 좋습니다.');
    }
  } else {
    ctaClarity = 0;
    feedback.push('CTA 카드가 없습니다.');
  }

  // 4. 도메인 적합성 (25점)
  let domainRelevance = 25;
  for (const card of cards) {
    for (const word of rule.forbiddenWords) {
      if (card.title.includes(word) || card.content.includes(word)) {
        domainRelevance -= 5;
        feedback.push(`금지어 사용: "${word}"`);
      }
    }
  }

  const allText = cards.map(c => `${c.title} ${c.content}`).join(' ');
  const usedRecommendedWords = rule.recommendedWords.filter(word => allText.includes(word));
  if (usedRecommendedWords.length < 2) {
    domainRelevance -= 5;
    feedback.push('도메인 관련 권장 단어를 더 활용해보세요.');
  }

  // 점수 보정
  hookStrength = Math.max(0, hookStrength);
  flowCoherence = Math.max(0, flowCoherence);
  ctaClarity = Math.max(0, ctaClarity);
  domainRelevance = Math.max(0, domainRelevance);

  const overall = hookStrength + flowCoherence + ctaClarity + domainRelevance;

  // 긍정적 피드백
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
    feedback: [...new Set(feedback)]
  };
}

// ============================================
// 결과 표시
// ============================================
function displayResults(cards, qualityScore) {
  // 폼 숨기고 결과 표시
  document.getElementById('form-section').classList.add('hidden');
  document.getElementById('api-key-section').classList.add('hidden');
  document.getElementById('result-section').classList.remove('hidden');

  // 점수 표시
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  document.getElementById('overall-score').textContent = `${qualityScore.overall}점`;
  document.getElementById('overall-score').className = `text-3xl font-bold ${getScoreColor(qualityScore.overall)}`;

  document.getElementById('hook-score').textContent = `${qualityScore.hookStrength}/25`;
  document.getElementById('hook-score').className = `text-xl font-bold ${getScoreColor(qualityScore.hookStrength * 4)}`;

  document.getElementById('flow-score').textContent = `${qualityScore.flowCoherence}/25`;
  document.getElementById('flow-score').className = `text-xl font-bold ${getScoreColor(qualityScore.flowCoherence * 4)}`;

  document.getElementById('cta-score').textContent = `${qualityScore.ctaClarity}/25`;
  document.getElementById('cta-score').className = `text-xl font-bold ${getScoreColor(qualityScore.ctaClarity * 4)}`;

  document.getElementById('domain-score').textContent = `${qualityScore.domainRelevance}/25`;
  document.getElementById('domain-score').className = `text-xl font-bold ${getScoreColor(qualityScore.domainRelevance * 4)}`;

  // 피드백 표시
  const feedbackList = document.getElementById('feedback-list');
  feedbackList.innerHTML = qualityScore.feedback.map(fb =>
    `<li class="flex items-start gap-2"><span class="text-slate-400">•</span>${fb}</li>`
  ).join('');

  // 첫 번째 카드 표시
  showCard(0);

  // 전체 카드 미리보기 표시
  renderAllCardsPreview(cards);
}

// ============================================
// 개별 카드 표시
// ============================================
function showCard(index) {
  currentCardIndex = index;
  const card = currentCards[index];

  // 탭 버튼 활성화
  document.querySelectorAll('.tab-btn').forEach((btn, i) => {
    if (i === index) {
      btn.classList.add('tab-active');
      btn.classList.remove('bg-slate-100');
    } else {
      btn.classList.remove('tab-active');
      btn.classList.add('bg-slate-100');
    }
  });

  // 카드 렌더링
  const container = document.getElementById('card-container');
  container.innerHTML = renderCard(card, index);
}

function getImageId(card, index) {
  // 카드 타입과 인덱스 기반으로 일관된 이미지 ID 생성
  const baseIds = {
    HOOK: [1005, 1015, 1025, 1035, 1045],
    EMPATHY: [1006, 1016, 1026, 1036, 1046],
    PROBLEM: [1008, 1018, 1028, 1038, 1048],
    SOLUTION: [1009, 1019, 1029, 1039, 1049],
    CTA: [1011, 1021, 1031, 1041, 1051]
  };
  const ids = baseIds[card.type] || baseIds.HOOK;
  return ids[index % ids.length];
}

function renderCard(card, index) {
  const colors = CARD_TYPE_COLORS[card.type];
  // Lorem Picsum - 안정적인 무료 이미지 서비스
  const imageId = getImageId(card, index);
  const imageUrl = `https://picsum.photos/id/${imageId}/800/1000`;

  return `
    <div id="card-${index}" class="w-[400px] h-[500px] rounded-2xl overflow-hidden shadow-xl text-white flex flex-col relative">
      <!-- 배경 이미지 -->
      <div class="absolute inset-0">
        <img
          src="${imageUrl}"
          alt="배경 이미지"
          class="w-full h-full object-cover"
          crossorigin="anonymous"
          onerror="this.style.display='none'"
        />
        <!-- 어두운 오버레이 (가독성 향상) -->
        <div class="absolute inset-0 bg-black/50"></div>
        <!-- 그라데이션 오버레이 -->
        <div class="absolute inset-0 ${colors.gradient} opacity-60"></div>
      </div>

      <!-- Header -->
      <div class="relative z-10 p-6 pb-4">
        <div class="flex items-center justify-end mb-4">
          <span class="text-white font-bold text-sm" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">${index + 1} / 5</span>
        </div>
      </div>

      <!-- Content -->
      <div class="relative z-10 flex-1 px-6 flex flex-col justify-center">
        <h2 class="text-3xl font-black mb-4 leading-tight text-white" style="text-shadow: 3px 3px 6px rgba(0,0,0,0.9), -1px -1px 0 rgba(0,0,0,0.5);">${card.title}</h2>
        <p class="text-xl font-bold leading-relaxed text-white" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.9);">${card.content}</p>
        ${card.subContent ? `
          <p class="mt-4 text-base font-bold border-t border-white/30 pt-4 text-yellow-200" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.9);">
            ${card.subContent}
          </p>
        ` : ''}
      </div>

      <!-- Footer -->
      <div class="relative z-10 p-6 pt-4">
        <div class="text-center">
          <span class="text-lg font-black text-white" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.9);">${currentBusinessName}</span>
        </div>
      </div>
    </div>
  `;
}

function renderAllCardsPreview(cards) {
  const container = document.getElementById('all-cards-container');
  container.innerHTML = cards.map((card, index) => {
    const imageId = getImageId(card, index);
    const imageUrl = `https://picsum.photos/id/${imageId}/240/300`;

    return `
      <div onclick="showCard(${index})" class="cursor-pointer transform hover:scale-105 transition">
        <div class="w-[120px] h-[150px] rounded-lg overflow-hidden shadow text-white relative">
          <img
            src="${imageUrl}"
            alt=""
            class="absolute inset-0 w-full h-full object-cover"
            onerror="this.style.display='none'"
          />
          <div class="absolute inset-0 ${CARD_TYPE_COLORS[card.type].gradient} opacity-75"></div>
          <div class="relative z-10 p-2 h-full flex flex-col">
            <div class="text-[8px] opacity-70 mb-1">${CARD_TYPE_LABELS[card.type]}</div>
            <div class="text-[10px] font-bold leading-tight line-clamp-2">${card.title}</div>
            <div class="flex-1"></div>
            <div class="text-[8px] opacity-50 text-center">${index + 1}/5</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================
// PNG 다운로드
// ============================================
async function downloadCurrentCard() {
  const cardElement = document.getElementById(`card-${currentCardIndex}`);
  if (!cardElement) return;

  try {
    const canvas = await html2canvas(cardElement, {
      scale: 2,
      backgroundColor: null,
      useCORS: true
    });

    const link = document.createElement('a');
    link.download = `cardnews_${currentCards[currentCardIndex].type}_${currentCardIndex + 1}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    alert('이미지 다운로드 중 오류가 발생했습니다.');
    console.error(error);
  }
}

async function downloadAllCards() {
  for (let i = 0; i < currentCards.length; i++) {
    showCard(i);
    await new Promise(resolve => setTimeout(resolve, 300));

    const cardElement = document.getElementById(`card-${i}`);
    if (!cardElement) continue;

    try {
      const canvas = await html2canvas(cardElement, {
        scale: 2,
        backgroundColor: null,
        useCORS: true
      });

      const link = document.createElement('a');
      link.download = `cardnews_${currentCards[i].type}_${i + 1}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Card ${i + 1} download error:`, error);
    }
  }
}

// ============================================
// 유틸리티 함수
// ============================================
function setLoading(isLoading) {
  const btn = document.getElementById('generate-btn');
  if (isLoading) {
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div><span>AI가 생성 중입니다...</span>';
  } else {
    btn.disabled = false;
    btn.innerHTML = '<span>카드뉴스 생성하기</span>';
  }
}

function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
}

function hideError() {
  document.getElementById('error-message').classList.add('hidden');
}

function resetForm() {
  document.getElementById('form-section').classList.remove('hidden');
  document.getElementById('api-key-section').classList.remove('hidden');
  document.getElementById('result-section').classList.add('hidden');
  currentCards = [];
  currentCardIndex = 0;
}

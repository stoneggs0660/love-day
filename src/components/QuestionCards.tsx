import React, { useState, useRef, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';

interface QuestionItem {
  id: string;
  question: string;
  answer: string;
}

interface QuestionCardData {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  questions: QuestionItem[];
}

const QUESTION_CARDS: QuestionCardData[] = [
  {
    id: 'faith',
    category: '신앙',
    title: '신앙에 대해 궁금하세요?',
    subtitle: '신(GOD) 앞에 마주서기',
    questions: [
      {
        id: 'f1',
        question: '눈에 보이지 않는 신을 어떻게 믿을 수 있나요?',
        answer:
          "바람은 보이지 않지만 흔들리는 나뭇가지를 보며 그 존재를 압니다. 사랑과 양심도 눈에 보이지 않지만 우리 삶을 움직이는 가장 분명한 실체입니다. 믿음은 맹목적인 어떠함 아니라, 정교한 자연의 질서와 내면의 갈망 속에 남겨진 '창조주의 지문'을 읽어내는 눈입니다.",
      },
      {
        id: 'f2',
        question: '꼭 교회에 가야 하나요? 착하게 살면 충분하지 않나요?',
        answer:
          "선하게 사는 것은 귀한 일입니다. 하지만 길을 잃은 아이에게 필요한 것은 '착한 행동'이 아니라 '부모의 품'입니다. 신앙은 도덕적 자격을 갖추는 수양이 아니라, 나를 지으신 삶의 근원과 다시 연결되는 '관계의 회복'입니다.",
      },
      {
        id: 'f3',
        question: '신앙생활을 하면 자유를 잃고 얽매이게 되지 않나요?',
        answer:
          "기차에게 철로는 자유를 빼앗는 족쇄가 아니라, 탈선하지 않고 가장 멀리 달릴 수 있게 하는 보호 장치입니다. 성경이 말하는 삶의 기준은 우리를 옥죄는 규칙이 아니라, 상처와 후회로부터 우리를 지켜 가장 나답게 살게 하는 '참된 자유의 울타리'입니다.",
      },
      {
        id: 'f4',
        question: '사랑의 신이 계시다면, 왜 세상에는 고통이 존재하나요?',
        answer:
          "고통은 신의 존재를 부정하기 보다 신의 존재로 가까이 가게 합니다. 하나님은 당신의 고통을 멀리서 방관하지 않고 인간의 아픔 한 가운데로 직접 찾아오셨습니다. 십자가는 신이 우리의 고통에 동참하셨다는 가장 깊은 사랑의 증거입니다.",
      },
    ],
  },
  {
    id: 'happiness',
    category: '행복',
    title: '행복에 대해 궁금하세요?',
    subtitle: '채움에서 머묾으로',
    questions: [
      {
        id: 'h1',
        question: '남들만큼 열심히 살았는데, 왜 마음 한구석은 늘 공허할까요?',
        answer:
          "바닷물은 마실수록 갈증이 깊어집니다. 성취와 소유로도 마음이 채워지지 않는 이유는, 우리 영혼의 그릇이 세상의 유한한 것들보다 더 크게 지어졌기 때문입니다. 철학자 파스칼의 고백처럼, 인간에게는 오직 영원한 존재만이 채울 수 있는 '하나님 모양의 빈 공간'이 있습니다.",
      },
      {
        id: 'h2',
        question: '남들과 비교하지 않고 온전히 나로서 행복할 수 있을까요?',
        answer:
          "타인의 시선에 나를 맞추는 한 비교의 감옥에서 벗어날 수 없습니다. 진정한 자존감은 내가 무엇을 이루었는가가 아니라, '내가 누구에게 사랑받고 있는가'에서 시작됩니다. 창조주에게 세상 단 하나뿐인 걸작으로 사랑받고 있음을 깨달을 때, 비로소 타인의 기준에서 자유로워집니다.",
      },
      {
        id: 'h3',
        question: '환경이 바뀌지 않아도 진짜 행복할 수 있나요?',
        answer:
          "좋은 일이 생길 때만 웃는 것이 '행운'이라면, 폭풍우 속에서도 흔들리지 않는 내면의 고요는 '은혜와 평강' 입니다. 삶의 무게를 홀로 견디지 않고 나를 가장 잘 아시는 분과 함께 걷기 시작할 때, 환경에 휘둘리지 않는 단단한 평안이 찾아옵니다.",
      },
    ],
  },
  {
    id: 'peace',
    category: '불안과 쉼',
    title: '불안을 많이 느끼세요?',
    subtitle: '통제에서 신뢰로',
    questions: [
      {
        id: 'p1',
        question: '앞날이 막막하고 불안해서 밤잠을 설칠 때가 많습니다.',
        answer:
          "안개 낀 밤길을 운전할 때 수십 킬로미터 앞을 다 봐야만 갈 수 있는 것은 아닙니다. 바로 앞을 비추는 전조등 불빛만 있으면 결국 목적지에 닿습니다. 신앙은 미래의 안개를 단번에 걷어내는 마법이 아니라, 한 걸음 앞을 비추며 내 손을 잡고 함께 걸어가 주시는 분을 신뢰하는 일입니다.",
      },
      {
        id: 'p2',
        question: '내가 모든 것을 책임져야 한다는 무게감이 너무 버겁습니다.',
        answer:
          "우리가 지치는 가장 큰 이유는 내 삶의 모든 결과를 내가 완벽히 통제해야 한다고 믿기 때문입니다. 하지만 내 심장 박동과 호흡조차 내 힘으로 하는 것이 아님을 기억해 보세요. 삶의 주인이 따로 있음을 인정하는 순간, 어깨를 짓누르던 무거운 책임감은 평안한 맡김으로 바뀝니다.",
      },
      {
        id: 'p3',
        question: '지친 마음으로 교회에 가도 평안을 얻을 수 있을까요?',
        answer:
          "교회는 완벽한 사람들의 쇼윈도가 아니라, 상처 입은 사람들이 모여 숨을 고르는 '영혼의 응급실과 피난처'입니다.\n\n\"수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라\" (마태복음 11:28)\n\n무거운 가방을 잠시 내려놓으세요. 무엇을 요구받는 자리가 아니라, 지친 당신의 마음이 조용히 쉬어가는 쉼표의 시간으로 초대합니다.",
      },
    ],
  },
  {
    id: 'church',
    category: '교회 생활',
    title: '교회 생활이 궁금하세요?',
    subtitle: '낯선 문턱을 넘어 따뜻한 이웃으로',
    questions: [
      {
        id: 'c1',
        question: '성경도 모르고 교회 문화도 낯선데, 가면 어색하지 않을까요?',
        answer:
          "누구나 처음 걷는 길은 낯설기 마련입니다. 하지만 좋은 숲 길은 길 안내 표지판이 친절하듯, 교회 역시 처음 오시는 분들의 어색함을 가장 먼저 배려합니다. 무엇을 알아야만 올 수 있는 곳이 아닙니다. 그저 편안한 산책을 나오듯 가벼운 발걸음으로 오시면 됩니다.",
      },
      {
        id: 'c2',
        question: '교회에 가면 헌금을 내야 하거나 등록을 강요받지 않나요?',
        answer:
          "선물은 받는 사람에게 대가를 요구하지 않습니다. 헌금이나 등록에 대한 어떠한 부담도 내려놓으시고, 당신을 위해 준비된 예배 앞에서 하나님 앞에 마주앉아 있어 보십시오. 그리고 당신의 질문이 안개처럼 벗겨지는 것을 경험해 보십시오.",
      },
      {
        id: 'c3',
        question: '사람들의 시선이나 지나친 관심이 조금 부담스럽습니다.',
        answer:
          "식물이 자랄 때 따스한 햇살도 필요하지만, 스스로 뿌리내릴 조용한 시간과 거리도 필요합니다. 저희는 방문하신 분들의 마음과 부담을 존중합니다. 원치 않는 간섭이나 무례한 권유 대신, 당신이 편안히 머물다 갈 수 있도록 그래서 당신의 삶에 여운의 파도가 잔잔히 울렁이도록 존중해 드릴 것입니다.",
      },
      {
        id: 'c4',
        question: '바쁜 주말에 시간을 내어 교회에 가는 것이 어떤 의미가 있을까요?',
        answer:
          "나무꾼이 바쁘다고 도끼날을 가는 시간을 아끼면 결국 나무를 벨 수 없습니다. 일주일 중 단 한 시간, 세상의 소음을 끄고 내 삶의 방향을 점검하는 시간은 소비가 아니라 가장 깊은 '회복'입니다. 멈추어 서서 영혼의 숨을 고를 때, 당신의 일상은 더 단단하고 맑아질 것입니다.",
      },
    ],
  },
];

export const QuestionCards: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [openQuestionId, setOpenQuestionId] = useState<string | null>('f1');
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  const toggleQuestion = (qId: string) => {
    // 1. 이미 열려 있는 답을 다시 누른 경우 즉시 닫음
    if (openQuestionId === qId) {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      setOpenQuestionId(null);
      return;
    }

    // 2. 다른 답이 이미 열려 있던 경우: 먼저 기존 답 닫힘 -> 일정 딜레이 후 누른 답이 천천히 열림
    if (openQuestionId !== null) {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      setOpenQuestionId(null); // 먼저 기존 답 닫기
      transitionTimerRef.current = setTimeout(() => {
        setOpenQuestionId(qId); // 이후 새 답 열기
      }, 220);
    } else {
      // 열려 있던 답이 없으면 바로 열기
      setOpenQuestionId(qId);
    }
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, clientWidth } = containerRef.current;
    const newIdx = Math.round(scrollLeft / clientWidth);
    setActiveCardIndex(Math.min(QUESTION_CARDS.length - 1, Math.max(0, newIdx)));
  };

  const scrollToCard = (index: number) => {
    if (!containerRef.current) return;
    const clientWidth = containerRef.current.clientWidth;
    containerRef.current.scrollTo({
      left: index * clientWidth,
      behavior: 'smooth',
    });
    setActiveCardIndex(index);
  };

  return (
    <section className="py-6 sm:py-8 px-4 sm:px-6 relative overflow-hidden font-gothic">
      <div className="max-w-md mx-auto">
        
        {/* Section Header: 아이콘 삭제, '교회와 신앙에 대한 당신의 질문' 고딕 굵게 */}
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base sm:text-lg font-bold font-gothic text-slate-900 tracking-tight">
            교회와 신앙에 대한 당신의 질문
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            좌우로 넘겨보세요 →
          </span>
        </div>

        {/* Native Touch-Swipe Horizontal Carousel */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar gap-4 pb-2"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {QUESTION_CARDS.map((card) => (
            <div key={card.id} className="w-full shrink-0 snap-center">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 sm:p-7 shadow-xl shadow-slate-900/5 border-2 border-stone-200/90 h-[530px] min-h-[530px] max-h-[530px] flex flex-col justify-between overflow-hidden">
                
                {/* Header: 제목과 부제목 칸을 검은색 배경으로 채우고 흰색 글자로 표시 */}
                <div className="-mx-5 -mt-5 sm:-mx-7 sm:-mt-7 px-5 py-4 sm:px-7 sm:py-5 mb-2 bg-black text-white shrink-0">
                  <h3 className="text-xl sm:text-2xl font-black font-gothic text-white tracking-tight leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/85 font-medium mt-1">
                    {card.subtitle}
                  </p>
                </div>

                {/* Accordion Questions List */}
                <div className="flex-1 overflow-y-auto pr-1 my-3 space-y-2.5 divide-y divide-stone-100 no-scrollbar">
                  {card.questions.map((q) => {
                    const isOpen = openQuestionId === q.id;
                    return (
                      <div key={q.id} className="pt-3 first:pt-0">
                        {/* Question Row with + Icon */}
                        <button
                          type="button"
                          onClick={() => toggleQuestion(q.id)}
                          className="w-full flex items-start justify-between gap-3 text-left py-1 group cursor-pointer"
                          aria-expanded={isOpen}
                        >
                          <span className="text-[14px] sm:text-[15.5px] font-bold text-stone-900 group-hover:text-black leading-snug">
                            {q.question}
                          </span>
                          <span className="text-stone-600 group-hover:text-black shrink-0 mt-0.5 transition-transform">
                            {isOpen ? (
                              <Minus className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.4} />
                            ) : (
                              <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.4} />
                            )}
                          </span>
                        </button>

                        {/* Hidden Answer (부드럽고 천천히 열리는 그리드 트랜지션) */}
                        <div
                          className="grid transition-all ease-out overflow-hidden"
                          style={{
                            gridTemplateRows: isOpen ? '1fr' : '0fr',
                            opacity: isOpen ? 1 : 0,
                            transitionDuration: isOpen ? '450ms' : '200ms',
                          }}
                        >
                          <div className="min-h-0">
                            <div className="pt-2 pb-2 text-[13.5px] sm:text-[14.5px] text-stone-600 leading-relaxed font-normal whitespace-pre-line">
                              {q.answer}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Card Footer: Navigation hint */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400 shrink-0">
                  <span>행복한 마산회원교회</span>
                  <span>{activeCardIndex + 1} / {QUESTION_CARDS.length}</span>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Minimal Bottom Dot Indicators */}
        <div className="flex items-center justify-center gap-2 pt-3">
          {QUESTION_CARDS.map((card, idx) => (
            <button
              key={card.id}
              onClick={() => scrollToCard(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activeCardIndex === idx
                  ? 'w-6 bg-slate-900'
                  : 'w-2 bg-stone-300 hover:bg-stone-400'
              }`}
              aria-label={`질문 카드 ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

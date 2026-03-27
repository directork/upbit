import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, RefreshCcw, Share2, ChevronRight, ExternalLink } from "lucide-react";

// 👉 CU픽 링크 변경
const CU_PICK_URL = "https://chatgpt.com/g/g-68b54b5484808191a859e824c19a0246-oneulyi-cupig-cu-sinsangpum-pyeonyijeom-eumsig-cuceon-gongsig-caesbos";

// 👉 시스템폰트 (나눔바른고딕 우선)
const fontClass = "font-[NanumBarunGothic,system-ui,-apple-system,BlinkMacSystemFont,sans-serif]";

const traitMeta = {
  speed: { label: "초간편", emoji: "⚡", color: "from-cyan-400 to-blue-600" },
  dessert: { label: "달달보상", emoji: "🍰", color: "from-pink-300 to-fuchsia-600" },
  meal: { label: "든든한끼", emoji: "🍱", color: "from-lime-300 to-emerald-600" },
  cafe: { label: "집중부스터", emoji: "☕", color: "from-amber-300 to-orange-600" },
  trendy: { label: "신상도전", emoji: "🔥", color: "from-violet-400 to-indigo-600" },
  healing: { label: "힐링회복", emoji: "🌿", color: "from-emerald-300 to-teal-600" },
};

const questions = [
  {
    id: 1,
    question: "지금 가장 가까운 내 상태는?",
    answers: [
      { text: "머리는 복잡한데 시간은 없다", weights: { speed: 3, cafe: 1 } },
      { text: "괜히 기분이 가라앉고 무기력하다", weights: { healing: 3, dessert: 1 } },
      { text: "몸이 허하고 제대로 먹고 싶다", weights: { meal: 3 } },
      { text: "뭔가 재미없고 자극이 필요하다", weights: { trendy: 3 } },
    ],
  },
  {
    id: 2,
    question: "이럴 때 나는 보통 어떻게 선택하는 편인가?",
    answers: [
      { text: "빨리 해결하고 다음으로 넘어간다", weights: { speed: 2, cafe: 2 } },
      { text: "일단 기분부터 끌어올린다", weights: { dessert: 3 } },
      { text: "제대로 먹고 안정감을 찾는다", weights: { meal: 3 } },
      { text: "새로운 걸로 기분을 바꿔본다", weights: { trendy: 2, dessert: 1 } },
    ],
  },
];

const productDB = {
  speed: ["참치마요 삼각김밥", "델라페 아메리카노"],
  dessert: ["연세우유 생크림빵", "두바이 초코"],
  meal: ["PBICK 도시락", "소불고기 김밥"],
  cafe: ["델라페 아이스티", "헤이즐넛 커피"],
  trendy: ["신상 스낵", "소떡소떡"],
  healing: ["컵라면 + 차", "디저트 세트"],
};

function scoreAnswers(selected) {
  const scores = { speed: 0, dessert: 0, meal: 0, cafe: 0, trendy: 0, healing: 0 };
  selected.forEach((a) => {
    Object.entries(a.weights).forEach(([k, v]) => (scores[k] += v));
  });
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return { primary: sorted[0][0], secondary: sorted[1][0] };
}

// 👉 심리테스트급 운세
function buildFortune(selected, primary, secondary) {
  const first = selected[0].text;
  const second = selected[1].text;

  return {
    text: `당신은 지금 "${first}" 상태에 있습니다. 이건 단순히 바쁘거나 피곤한 게 아니라, 선택 에너지가 줄어든 상태입니다. 그래서 뇌는 자연스럽게 '최소 노력으로 최대 만족'을 찾으려고 합니다.

그리고 "${second}"라는 선택 방식은 당신의 습관적인 대응 패턴을 보여줍니다. 즉, 당신은 스트레스 상황에서 '빠르게 정리'하거나 '기분을 먼저 회복'하는 쪽으로 반응하는 사람입니다.

이 두 가지가 합쳐지면 오늘은 매우 중요한 특징이 생깁니다.
👉 "길게 고민할수록 선택 만족도가 떨어지는 날"

이건 꽤 정확한 신호입니다.
오늘은 메뉴를 오래 고민하면 할수록 오히려 선택 피로가 올라가고, 결과 만족도는 낮아질 가능성이 큽니다.

반대로 직관적으로 '이거다' 싶은 걸 바로 고르면, 그 선택이 생각보다 높은 만족으로 이어질 확률이 높습니다.

또 하나 중요한 포인트는,
오늘은 작은 선택 하나가 하루 전체 기분을 좌우할 가능성이 높다는 점입니다.
즉, 음식 선택이 단순한 소비가 아니라 '오늘 하루 컨디션 리셋 버튼' 역할을 할 수 있습니다.`,

    action: `오늘은 "생각보다 먼저 선택"이 정답입니다.
지금 눈에 들어오는 메뉴를 믿고 바로 고르는 것이 좋습니다.
특히 단일 메뉴보다 조합(음료+간식)을 선택하면 만족도가 더 올라갈 가능성이 높습니다.`
  };
}

function ResultCard({ fortune, products, primary, onRestart }) {
  const meta = traitMeta[primary];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-6 space-y-6 rounded-3xl shadow-xl">

        <div>
          <h2 className="text-xl font-bold">오늘의 추천 상품</h2>
          <div className="mt-3 grid gap-2">
            {products.map((p, i) => (
              <div key={i} className="p-3 bg-slate-100 rounded-xl font-medium">{p}</div>
            ))}
          </div>
        </div>

        <div className={`p-4 rounded-2xl bg-gradient-to-br ${meta.color} text-white`}>
          <h2 className="text-lg font-bold mb-2">오늘의 운세</h2>
          <p className="text-sm leading-6 whitespace-pre-line">{fortune.text}</p>
        </div>

        <div className="p-4 rounded-2xl border">
          <h2 className="text-lg font-bold mb-2">오늘의 행동 가이드</h2>
          <p className="text-sm whitespace-pre-line">{fortune.action}</p>
        </div>

        <div className="space-y-2">
          <Button asChild className="w-full h-12 text-base">
            <a href={CU_PICK_URL} target="_blank">
              더 궁금한게 있다면 오늘의 CU픽으로 <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>

          <Button onClick={onRestart} variant="outline" className="w-full">다시하기</Button>
        </div>

      </Card>
    </motion.div>
  );
}

export default function CUFortunePickGame() {
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);

  const finished = answers.length === questions.length;
  const scored = finished ? scoreAnswers(answers) : null;
  const products = finished ? productDB[scored.primary] : [];
  const fortune = finished ? buildFortune(answers, scored.primary, scored.secondary) : null;

  const select = (a) => {
    setAnswers([...answers, a]);
    setCurrent(current + 1);
  };

  const restart = () => {
    setStarted(false);
    setCurrent(0);
    setAnswers([]);
  };

  return (
    <div className={`p-6 max-w-xl mx-auto text-center ${fontClass}`}>
      <h1 className="text-3xl font-bold">오늘의 운세픽 (CU픽 추천)</h1>
      <p className="mt-2 text-sm text-gray-600">오늘의 기분은 어떠신가요?</p>

      {!started ? (
        <Button onClick={() => setStarted(true)} className="mt-4 w-full h-12">
          <Sparkles className="mr-2 h-4 w-4" /> 시작하기
        </Button>
      ) : finished ? (
        <ResultCard fortune={fortune} products={products} primary={scored.primary} onRestart={restart} />
      ) : (
        <div className="mt-6 text-left">
          <Progress value={(current / questions.length) * 100} className="mb-4" />
          <h2 className="text-xl font-semibold">{questions[current].question}</h2>
          <div className="mt-4 space-y-2">
            {questions[current].answers.map((a) => (
              <Button key={a.text} onClick={() => select(a)} className="w-full justify-between h-14 text-base">
                {a.text} <ChevronRight />
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

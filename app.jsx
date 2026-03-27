import React, { useState } from "react";

const CU_PICK_URL =
  "https://chatgpt.com/g/g-68b54b5484808191a859e824c19a0246-oneulyi-cupig-cu-sinsangpum-pyeonyijeom-eumsig-cuceon-gongsig-caesbos";

const questions = [
  {
    question: "지금 가장 가까운 내 상태는?",
    answers: [
      { text: "머리는 복잡한데 시간은 없다", type: "speed" },
      { text: "괜히 기분이 가라앉고 무기력하다", type: "healing" },
      { text: "몸이 허하고 제대로 먹고 싶다", type: "meal" },
      { text: "심심하고 자극이 필요하다", type: "trendy" },
    ],
  },
  {
    question: "이럴 때 나는 보통 어떻게 선택하는 편인가?",
    answers: [
      { text: "빨리 해결하고 다음으로 넘어간다", type: "speed" },
      { text: "일단 기분부터 끌어올린다", type: "dessert" },
      { text: "제대로 먹고 안정감을 찾는다", type: "meal" },
      { text: "새로운 걸로 기분을 바꿔본다", type: "trendy" },
    ],
  },
];

const resultMap = {
  speed: {
    title: "오늘의 운세픽: 빠른 해결형",
    products: ["참치마요 삼각김밥", "델라페 아메리카노"],
    fortune:
      "오늘은 선택 에너지가 낮아진 상태일 가능성이 큽니다. 이럴 때는 오래 고민할수록 피로감만 커지고 만족도는 오히려 떨어지기 쉬워요. 지금은 빠르게 집고 바로 해결하는 선택이 가장 잘 맞는 날입니다. 단순하고 익숙한 조합이 생각보다 큰 안정감을 줄 수 있어요.",
    action:
      "오늘은 생각보다 먼저 고르는 게 좋습니다. 특히 한 손에 들고 바로 먹을 수 있는 조합이 만족도를 높여줄 가능성이 큽니다.",
  },
  healing: {
    title: "오늘의 운세픽: 회복 우선형",
    products: ["컵라면 + 차 음료", "디저트 세트"],
    fortune:
      "지금은 몸보다 마음이 먼저 지친 상태일 가능성이 큽니다. 그래서 단순히 배를 채우는 것보다 기분을 회복시키는 선택이 더 중요해요. 오늘은 작은 위로가 하루 전체 흐름을 바꿀 수 있는 날입니다. 익숙하고 편안한 메뉴가 생각보다 큰 만족을 줄 수 있어요.",
    action:
      "오늘은 효율보다 회복이 우선입니다. 따뜻하거나 부드러운 조합으로 스스로를 조금 풀어주는 선택이 잘 맞습니다.",
  },
  meal: {
    title: "오늘의 운세픽: 든든 충전형",
    products: ["PBICK 도시락", "소불고기 김밥"],
    fortune:
      "지금은 감정 문제라기보다 에너지 부족이 먼저일 가능성이 큽니다. 이런 날에는 달달한 보상보다 제대로 된 한 끼가 훨씬 높은 만족으로 이어져요. 오늘은 기본기를 챙기는 선택이 정답에 가까운 날입니다. 든든하게 채워야 마음도 같이 안정될 가능성이 큽니다.",
    action:
      "오늘은 가볍게 때우지 말고 식사감 있는 메뉴를 고르는 게 좋습니다. 안정감 있는 한 끼가 전체 컨디션을 끌어올릴 수 있어요.",
  },
  trendy: {
    title: "오늘의 운세픽: 기분 전환형",
    products: ["신상 스낵", "소떡소떡"],
    fortune:
      "지금은 무료함이나 답답함이 쌓여 있어서 새로운 자극이 필요한 상태일 수 있습니다. 이런 날에는 너무 안전한 선택보다 약간은 재밌는 선택이 만족도를 더 높여줘요. 오늘은 예상 가능한 메뉴보다 '오 이거 뭐지?' 싶은 선택이 기분 전환의 포인트가 될 가능성이 큽니다.",
    action:
      "오늘은 평소 안 고르던 메뉴를 한 번 집어보는 게 좋습니다. 작은 반전이 생각보다 기분을 크게 바꿔줄 수 있어요.",
  },
  dessert: {
    title: "오늘의 운세픽: 달달 보상형",
    products: ["연세우유 생크림빵", "두바이 초코"],
    fortune:
      "오늘은 성과보다 감정 보상이 더 중요한 날일 수 있습니다. 머리로는 참아야 한다고 생각해도, 마음은 작은 만족을 통해 균형을 회복하려고 해요. 이런 날의 달달한 선택은 단순한 군것질이 아니라 기분을 다시 세우는 장치가 되기 쉽습니다.",
    action:
      "오늘은 너무 계산적으로만 고르지 말고, 기분이 좋아질 메뉴를 하나 포함해보세요. 작은 보상이 하루의 톤을 바꿀 수 있습니다.",
  },
};

function getResult(answers) {
  const count = {};
  answers.forEach((a) => {
    count[a.type] = (count[a.type] || 0) + 1;
  });
  const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]);
  const topType = sorted[0]?.[0] || "speed";
  return resultMap[topType];
}

export default function App() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);

  const finished = answers.length === questions.length;
  const result = finished ? getResult(answers) : null;

  const handleAnswer = (answer) => {
    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);
    setStep(step + 1);
  };

  const handleRestart = () => {
    setStarted(false);
    setStep(0);
    setAnswers([]);
  };

  return (
    <div
      style={{
        maxWidth: 560,
        margin: "0 auto",
        padding: 24,
        fontFamily: "NanumBarunGothic, system-ui, sans-serif",
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ textAlign: "center", fontSize: 32, marginBottom: 8 }}>
        오늘의 운세픽 (CU픽 추천)
      </h1>
      <p style={{ textAlign: "center", color: "#666", marginBottom: 24 }}>
        오늘의 기분은 어떠신가요?
      </p>

      {!started ? (
        <button
          onClick={() => setStarted(true)}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 12,
            border: "none",
            background: "#111",
            color: "#fff",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          시작하기
        </button>
      ) : finished ? (
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 20,
            padding: 20,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ fontSize: 22, marginBottom: 12 }}>{result.title}</h2>

          <div style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 8 }}>오늘의 추천 상품</h3>
            {result.products.map((p) => (
              <div
                key={p}
                style={{
                  background: "#f5f5f5",
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 8,
                }}
              >
                {p}
              </div>
            ))}
          </div>

          <div
            style={{
              background: "#f8f8ff",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <h3 style={{ marginBottom: 8 }}>오늘의 운세</h3>
            <p style={{ whiteSpace: "pre-line", margin: 0 }}>{result.fortune}</p>
          </div>

          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <h3 style={{ marginBottom: 8 }}>오늘의 행동 가이드</h3>
            <p style={{ margin: 0 }}>{result.action}</p>
          </div>

          <a
            href={CU_PICK_URL}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "block",
              width: "100%",
              textAlign: "center",
              background: "#111",
              color: "#fff",
              padding: "14px 16px",
              borderRadius: 12,
              textDecoration: "none",
              marginBottom: 10,
            }}
          >
            더 궁금한게 있다면 오늘의 CU픽으로
          </a>

          <button
            onClick={handleRestart}
            style={{
              width: "100%",
              height: 44,
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            다시하기
          </button>
        </div>
      ) : (
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 20,
            padding: 20,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              height: 8,
              background: "#eee",
              borderRadius: 999,
              overflow: "hidden",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: `${(step / questions.length) * 100}%`,
                height: "100%",
                background: "#111",
              }}
            />
          </div>

          <h2 style={{ fontSize: 22, marginBottom: 16 }}>
            {questions[step].question}
          </h2>

          {questions[step].answers.map((a) => (
            <button
              key={a.text}
              onClick={() => handleAnswer(a)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: 16,
                borderRadius: 14,
                border: "1px solid #ddd",
                background: "#fff",
                marginBottom: 10,
                cursor: "pointer",
                fontSize: 15,
              }}
            >
              {a.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const schedule = [
  {
    time: "17:50",
    publisher: "서울경제",
    edition: "금일 초판 / e-paper",
    credentialPolicy: "사내 보안 저장소 또는 런타임 환경변수에서만 조회",
  },
];

const keywords = [
  "편의점",
  "BGF / BGF리테일",
  "GS리테일 / GS25",
  "세븐일레븐",
  "이마트24",
  "백화점",
  "유통",
];

const workflow = [
  "크롬 브라우저로 대상 언론사에 접속하고, 로그인 실패 시 1회 새로고침 후 재시도합니다.",
  "실행일 기준 금일 날짜의 초판 또는 e-paper 페이지로 이동해 키워드별 지면 검색을 수행합니다.",
  "관련 기사 발견 시 제목과 본문이 보이도록 기사 영역을 캡처하고 표준 파일명으로 저장합니다.",
  "요약 메시지와 캡처 이미지를 BGF플로우 지정 대화창으로 전송하며, 전송 실패 시 1회 재시도합니다.",
];

const retryPolicy = [
  { label: "초판 미발행", action: "5분 간격으로 최대 3회 재확인 후 실패 로그 기록" },
  { label: "로그인 실패", action: "새로고침 후 1회 재로그인, 재실패 시 확인 불가 보고" },
  { label: "페이지 오류", action: "재시도 후 오류 화면과 로컬 로그를 보관" },
  { label: "전송 실패", action: "BGF플로우 업로드 1회 재시도 후 로컬 로그 생성" },
];

const messageTemplates = {
  found: `금일 초판 보고드립니다.\n[신문사명] [키워드] 관련 기사 있습니다.\n\n기사 제목: [기사 제목]\n요약: [핵심 내용 1~2문장 요약]\n지면/페이지: [확인 가능 시 기재]`,
  failed: `금일 초판 보고드립니다.\n[신문사명] 확인 불가: [초판 미발행 / 로그인 실패 / 페이지 오류 중 선택]`,
};

const fileNameRule = "YYYYMMDD_신문사명_키워드_기사제목.png";

function Section({ title, description, children }) {
  return (
    <section className="card">
      <div className="section-heading">
        <p className="eyebrow">Monitoring Agent</p>
        <h2>{title}</h2>
      </div>
      {description ? <p className="section-description">{description}</p> : null}
      {children}
    </section>
  );
}

export default function App() {
  return (
    <main className="page-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">BGF Retail Press Monitoring</p>
          <h1>언론 지면 모니터링 자동화 에이전트</h1>
          <p className="hero-copy">
            주요 일간지의 금일 초판 지면을 정해진 시간에 확인하고, BGF리테일 관련
            키워드 기사가 발견되면 캡처·요약·전송까지 이어지는 운영 흐름을 관리합니다.
          </p>
        </div>
        <div className="status-panel">
          <span className="status-dot" />
          <strong>운영 기준</strong>
          <p>금일 날짜 초판 기준 · 5분 간격 최대 3회 재시도</p>
        </div>
      </header>

      <Section
        title="실행 스케줄"
        description="계정 정보는 코드나 정적 화면에 저장하지 않고 보안 저장소에서만 주입하는 것을 전제로 합니다."
      >
        <div className="schedule-grid">
          {schedule.map((item) => (
            <article className="schedule-card" key={`${item.publisher}-${item.time}`}>
              <span className="time">{item.time}</span>
              <h3>{item.publisher}</h3>
              <p>{item.edition}</p>
              <small>{item.credentialPolicy}</small>
            </article>
          ))}
        </div>
      </Section>

      <Section title="모니터링 키워드" description="광고와 단순 데이터 표는 리포트 대상에서 제외합니다.">
        <div className="keyword-list">
          {keywords.map((keyword) => (
            <span className="keyword-chip" key={keyword}>
              {keyword}
            </span>
          ))}
        </div>
      </Section>

      <Section title="작업 프로세스">
        <ol className="workflow-list">
          {workflow.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <div className="file-rule">
          <strong>캡처 파일명 규칙</strong>
          <code>{fileNameRule}</code>
        </div>
      </Section>

      <Section title="예외 처리 및 재시도 정책">
        <div className="exception-grid">
          {retryPolicy.map((policy) => (
            <article className="exception-card" key={policy.label}>
              <h3>{policy.label}</h3>
              <p>{policy.action}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="보고 메시지 템플릿">
        <div className="template-grid">
          <article>
            <h3>기사 발견 시</h3>
            <pre>{messageTemplates.found}</pre>
          </article>
          <article>
            <h3>미발행/실패 시</h3>
            <pre>{messageTemplates.failed}</pre>
          </article>
        </div>
      </Section>
    </main>
  );
}

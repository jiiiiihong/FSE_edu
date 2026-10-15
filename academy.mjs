import {
  geometry,
  ratio,
  gradeNumber,
  sampleRange,
  gradeDiagnosis,
} from "./engineering.mjs";
import {
  diagram,
  circlesDiagram,
  involuteDiagram,
  graphDiagram,
  pairDiagram,
} from "./diagrams.mjs";
import {
  loadState,
  saveState,
  exportBackup,
  mergeBackup,
  KEY,
} from "./storage.mjs";
const $ = (id) => document.getElementById(id),
  E = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const storage = {
  getItem: (k) => localStorage.getItem(k),
  setItem: (k, v) => localStorage.setItem(k, v),
};
let data,
  state,
  ids,
  readOnly = false,
  lastStoredRaw = null;
const sections = [
  ["objectives", "학습 목표", "Learning objectives"],
  ["context", "공학적 맥락", "Engineering context"],
  ["theory", "기술 이론", "Technical theory"],
  ["formula", "수식과 가정", "Mathematical formulation"],
  ["diagram", "기술 도식", "Engineering diagram"],
  ["example", "단계별 예제", "Worked example"],
  ["application", "현장 적용", "Application"],
  ["limitations", "모델의 한계", "Limitations"],
  ["mistakes", "흔한 오해", "Common mistakes"],
  ["practice", "실습과 평가", "Practice & assessment"],
];
function notice(message) {
  $("storageStatus").textContent = message;
}
function persist() {
  if (readOnly) {
    notice(
      "원본 보호를 위해 학습 저장이 중단되었습니다. 백업 후 복구 파일을 가져오세요.",
    );
    return false;
  }
  let currentRaw;
  try {
    currentRaw = storage.getItem(KEY);
  } catch {
    notice("브라우저 저장 실패. JSON 백업으로 보관하세요.");
    return false;
  }
  if (currentRaw !== lastStoredRaw) {
    readOnly = true;
    notice(
      "다른 탭 또는 외부에서 학습 데이터가 변경되었습니다. 원본 보호를 위해 저장을 중단합니다. 새로고침하거나 백업·복구하세요.",
    );
    return false;
  }
  const ok = saveState(storage, state);
  if (ok) lastStoredRaw = JSON.stringify(state);
  if (!ok)
    notice(
      "브라우저 저장 실패. 현재 화면의 기록은 메모리에만 있습니다. JSON 백업으로 보관하세요.",
    );
  return ok;
}
const lesson = (id) => data.lessons.find((l) => l.id === id),
  list = (p) => data.lessons.filter((l) => l.part === p);
const doneCount = (ls) => ls.filter((l) => state.completed[l.id]).length;
const linkButton = (route, label, cls = "") =>
  `<button class="${cls}" data-route="${E(route)}">${E(label)}</button>`;
function heading(eyebrow, title, body = "") {
  return `<div class="eyebrow">${E(eyebrow)}</div><h1>${E(title)}</h1>${body ? `<p class="lede">${E(body)}</p>` : ""}`;
}
function scores() {
  const result = Object.fromEntries(
    ["Recall", "Understanding", "Calculation", "Application", "Diagnosis"].map(
      (k) => [k, { pass: 0, total: 0 }],
    ),
  );
  for (const l of data.lessons) {
    for (const [key, q] of [
      ["choice", l.assessment],
      ["number", l.calculation],
      ["diagnosis", l.diagnosis ? { ability: "Diagnosis" } : null],
    ]) {
      if (q) {
        result[q.ability].total++;
        if (state.assessments[l.id]?.[key]) result[q.ability].pass++;
      }
    }
  }
  return result;
}
function mastery() {
  return Object.entries(scores())
    .map(
      ([k, v]) =>
        `<div class="mastery-row"><span>${k}</span><strong>${v.pass} / ${v.total}</strong></div>`,
    )
    .join("");
}
function home() {
  let legacyDone = 0;
  try {
    const v = JSON.parse(storage.getItem("fse3_done") || "{}");
    if (v && typeof v === "object")
      legacyDone = Object.values(v).filter((x) => x === true).length;
  } catch {}
  const last =
    lesson(state.lastLesson) ||
    data.lessons.find((l) => !state.completed[l.id]) ||
    data.lessons[0];
  $("app").innerHTML =
    `<section class="hero"><div>${heading("FIELD SERVICE ENGINEER / LEARNING PATH", "FSE Gear Academy", "기어를 이해하고, 계산하고, 현장에서 검증하다. 기초부터 제조·계측·진단까지 이어지는 엔지니어의 학습 경로.")}<div class="hero-actions">${linkButton("lesson/" + last.id, state.lastLesson ? "학습 이어하기 →" : "첫 레슨 시작 →", "primary")}${linkButton("calc/geometry", "기하 계산 도구")}</div><p class="muted">최근 위치 · ${E(last.title)}<br>초급 → 중급 · 7 PART / 14 CHAPTER / 35 LESSON</p></div><div class="hero-art">${involuteDiagram(40, 1)}</div></section>
 <div class="stats"><div><small>학습 완료</small><strong>${doneCount(data.lessons)}<small> / 35</small></strong><progress aria-label="전체 학습 진도" value="${doneCount(data.lessons)}" max="35"></progress></div><div><small>확인된 평가 결과</small><strong>${Object.values(scores()).reduce((s, v) => s + v.pass, 0)}<small> / 62</small></strong><small>완료와 역량 평가는 별도 기록</small></div><div><small>기존 자료 보존</small><strong>${legacyDone}<small> 강</small></strong><a href="legacy.html">기존 진도·문항·용어 열기 ↗</a></div></div>
 <div class="dashboard"><section><h2>Engineering curriculum</h2><p class="muted">각 챕터는 레슨 → 공학 실습 → 역량 평가로 이어집니다.</p>${data.parts.map((p) => `<div class="part-row"><div class="part-number">${p.roman}</div><div><h3>${E(p.korean)}</h3><p>${E(p.title)}</p><small>2 chapters · 5 lessons · ${doneCount(list(p.id))}/5 완료</small></div><div><progress aria-label="PART ${p.roman} 진도" value="${doneCount(list(p.id))}" max="5"></progress>${linkButton("part/" + p.id, "과정 보기 →")}</div></div>`).join("")}</section><aside><div class="panel"><h3>개념과 역량</h3>${mastery()}<p class="muted">수치는 저장된 최신 정오 결과입니다. 자기 설명은 루브릭으로 별도 확인합니다.</p>${linkButton("quiz", "평가 이어가기")}</div><div class="panel"><h3>Engineering workbench</h3>${linkButton("calc/ratio", "01  속도비·토크", "tool-link")}${linkButton("calc/geometry", "02  법선 / 정면 기하", "tool-link")}${linkButton("calc/involute", "03  인벌류트 생성", "tool-link")}${linkButton("calc/metrology", "04  측정 그래프 해석", "tool-link")}</div><div class="caution"><strong>콘텐츠 검토 상태</strong><p>35개 레슨은 기술 검토 대기 초안입니다. 출처 메타데이터와 수학 모델 검증을 제공하며, 규격 세부조항·공정 설명의 전문 검수 전 출판 준비 완료로 표시하지 않습니다.</p></div></aside></div>`;
}
function toc(p, l) {
  return `<aside class="toc"><div class="eyebrow">PART ${p.roman}</div><h3>${E(p.korean)}</h3><div class="toc-chapters">${p.chapters
    .map(
      (c) =>
        `<h3>${E(c.title)}</h3>${list(p.id)
          .filter((x) => x.chapter === c.id)
          .map(
            (x) =>
              `<a class="${x.id === l?.id ? "current" : ""}" href="#lesson/${x.id}">${state.completed[x.id] ? "✓ " : ""}${E(x.title.split(" | ")[0])}</a>`,
          )
          .join("")}`,
    )
    .join(
      "",
    )}</div>${l ? `<details open><summary>이 레슨 목차</summary>${sections.map(([id, name], i) => `<a href="#${l.id}:${id}" data-anchor="${id}">${String(i + 1).padStart(2, "0")} ${name}</a>`).join("")}<a href="#${l.id}:references" data-anchor="references">참고 문헌</a></details>` : ""}<p>${linkButton("home", "학습 경로로")}</p></aside>`;
}
function partView(p) {
  $("app").innerHTML =
    `<div class="layout">${toc(p)}<article class="reader">${heading("PART " + p.roman, p.title, p.korean)}<p>선행 학습: ${p.id === 1 ? "없음 — 기초부터 시작합니다." : `PART ${data.parts[p.id - 2].roman}의 정의·계산·실습을 먼저 확인하세요.`}</p><h2>챕터 개요와 목표</h2><ul>${list(
      p.id,
    )
      .map((l) => `<li>${E(l.objectives[0])}</li>`)
      .join("")}</ul>${p.chapters
      .map(
        (c) =>
          `<section class="chapter"><div class="eyebrow">CHAPTER ${c.id.split("c")[1]}</div><h2>${E(c.title)}</h2>${list(
            p.id,
          )
            .filter((l) => l.chapter === c.id)
            .map(
              (l) =>
                `<div class="lesson-row"><div>${linkButton("lesson/" + l.id, l.title)}<small>${E(l.objectives[0])}</small></div><small>${state.completed[l.id] ? "✓ 학습 완료" : "미완료"} · ${Object.values(state.assessments[l.id] || {}).filter(Boolean).length} 평가 통과</small></div>`,
            )
            .join(
              "",
            )}<p>${linkButton("quiz/" + list(p.id).find((l) => l.chapter === c.id).id, "이 챕터 실습·평가 시작 →", "primary")}</p></section>`,
      )
      .join("")}</article></div>`;
}
const formula = (f) =>
  `<div class="formula"><div class="expression" role="math" aria-label="${E(f.expression)}">${E(f.expression)}</div><p>${E(f.definitions)}</p></div>`;
function diagnosisExercise(l) {
  const q = l.diagnosis;
  if (!q) return "";
  return `<div class="assessment"><span class="badge">Diagnosis / Evidence &amp; verification</span><h3>${E(q.title)}</h3><div class="example"><strong>관측 데이터</strong><p>${E(q.observations)}</p></div><h3>비교할 가설</h3><ul>${q.hypotheses.map((h) => `<li>${E(h)}</li>`).join("")}</ul><p>유효한 확인 항목을 모두 선택하세요. 아직 근본 원인을 확정하지 않습니다.</p>${q.checks.map((c, i) => `<label><input type="checkbox" name="evidence-${l.id}" value="${i}">${E(c)}</label>`).join("")}<h3>검증 순서 구성</h3><p>각 단계에 순서 1–4를 지정하세요. 같은 순서는 중복할 수 없습니다.</p>${[2, 0, 3, 1].map((i) => `<label>${E(q.steps[i])}<select data-order="${i}" data-order-lesson="${l.id}" aria-label="${E(q.steps[i])} 순서"><option value="">순서 선택</option>${[1, 2, 3, 4].map((n) => `<option value="${n}">${n}</option>`).join("")}</select></label>`).join("")}<button data-diagnosis="${l.id}">진단 계획 평가</button><div id="diagnosis-${l.id}" role="status" aria-live="polite"></div><p class="muted">${E(q.caveat)}</p></div>`;
}
function assessment(l) {
  const q = l.assessment,
    n = l.calculation;
  return `<div class="assessment" data-assessment="${l.id}"><span class="badge">${q.ability}</span><h3>${E(q.prompt)}</h3><div class="choices">${q.choices.map((c, i) => `<button data-choice="${i}" data-lesson="${l.id}">${String.fromCharCode(65 + i)}. ${E(c)}</button>`).join("")}</div><div id="choice-${l.id}" role="status" aria-live="polite">${state.assessments[l.id]?.choice !== undefined ? `<p>저장된 최근 결과: ${state.assessments[l.id].choice ? "통과" : "재학습 필요"}</p>` : ""}</div></div>${n ? `<div class="assessment"><span class="badge">Calculation</span><h3>${E(n.prompt)}</h3><p>단위: <strong>${E(n.unit)}</strong> · 허용 오차: ±${n.tolerance} ${E(n.unit)}</p><p class="muted">${E(n.rounding)}</p><label for="number-${l.id}">계산 답 (${E(n.unit)})</label><input id="number-${l.id}" type="number" step="any" inputmode="decimal"><button data-number="${l.id}">계산 채점</button><div id="numeric-${l.id}" role="status" aria-live="polite">${state.assessments[l.id]?.number !== undefined ? `<p>저장된 최근 결과: ${state.assessments[l.id].number ? "통과" : "재학습 필요"}</p>` : ""}</div></div>` : ""}
 ${diagnosisExercise(l)}<div class="assessment"><span class="badge">Understanding / Engineering exercise</span><h3>자기 설명과 검증 계획</h3><p>${E(l.exercise.prompt)}</p><label for="reflection-${l.id}">정의·가정·증거를 포함한 답안</label><textarea id="reflection-${l.id}" maxlength="10000">${E(state.reflections[l.id] || "")}</textarea><button data-reflection="${l.id}">답안 저장</button><details><summary>자기 검토 루브릭</summary><ol>${l.exercise.rubric.map((s) => `<li>${E(s)}</li>`).join("")}</ol><p>서술 답안은 자동 정답 판정을 하지 않습니다. 아래 항목을 스스로 확인하세요.</p><label><input type="checkbox" data-rubric="${l.id}" ${state.assessments[l.id]?.rubric ? "checked" : ""}> 루브릭에 따라 답안을 검토했습니다.</label></details></div>`;
}
function lessonView(l) {
  const p = data.parts[l.part - 1];
  state.lastLesson = l.id;
  persist();
  const index = data.lessons.indexOf(l),
    next = data.lessons[index + 1];
  const content = {
    objectives: `<ul>${l.objectives.map((o) => `<li>${E(o)}</li>`).join("")}</ul>`,
    context: `<p>${E(l.context)}</p>`,
    theory: `<p>${E(l.theory)}</p>${(l.theoryParagraphs || []).map((t) => `<p>${E(t)}</p>`).join("")}`,
    formula: formula(l.formula),
    diagram: diagram(l.diagram),
    example: `<div class="example"><h3>${E(l.example.title)}</h3><ol>${l.example.steps.map((s) => `<li>${E(s)}</li>`).join("")}</ol></div>`,
    application: `<p>${E(l.application)}</p>`,
    limitations: `<div class="caution"><p>${E(l.limitations)}</p></div>`,
    mistakes: `<ul>${l.mistakes.map((s) => `<li>${E(s)}</li>`).join("")}</ul>`,
    practice: assessment(l),
  };
  $("app").innerHTML =
    `<div class="layout">${toc(p, l)}<article class="reader">${heading("PART " + p.roman + " / " + l.id.toUpperCase(), l.title)}<p class="muted">기술 검토 대기 · 수식의 전제와 단위를 먼저 확인하세요.</p><p>선행 레슨: ${l.prerequisites.length ? l.prerequisites.map((id) => `<a href="#lesson/${id}">${E(lesson(id)?.title || id)}</a>`).join(" · ") : "없음"}</p>${sections.map(([id, title, en], i) => `<section id="section-${id}"><h2><span>${String(i + 1).padStart(2, "0")} / ${en}</span>${title}</h2>${content[id]}</section>`).join("")}<section id="section-references"><h2>참고 문헌과 검토 상태</h2><ul class="references">${l.sources
      .map((id) => {
        const s = data.sources[id];
        return `<li>${s.url ? `<a href="${E(s.url)}" target="_blank" rel="noopener noreferrer">${E(s.title)} ↗</a>` : E(s.title)}<small>${E(s.scope)}<br>${E(s.status)}</small></li>`;
      })
      .join(
        "",
      )}</ul><p>콘텐츠 상태: ${E(l.review.status)} · 출판 준비 완료: 아니오</p><a href="legacy.html">연관 기존 자료실: ${l.legacyRefs.map((i) => i + 1 + "단원 · " + E(DATA.units[i][0])).join(" / ")}</a></section><div class="completion"><label><input type="checkbox" data-complete="${l.id}" ${state.completed[l.id] ? "checked" : ""}> 이 레슨을 학습했습니다.</label>${linkButton("part/" + p.id, "챕터로 돌아가기")}</div><div class="lesson-next">${next ? linkButton("lesson/" + next.id, "다음 레슨 → " + next.title.split(" | ")[0], "primary") : linkButton("quiz", "통합 역량 검토 →", "primary")}</div></article></div>`;
}
function quizView(id) {
  const l = lesson(id) || lesson(state.lastLesson) || data.lessons[0];
  $("app").innerHTML =
    `${heading("ENGINEERING ASSESSMENT", "기억에서 진단까지", "개념 판단, 계산, 서술 실습을 구분합니다. 완료 체크와 평가 정답률은 독립적입니다.")}<div class="tool-grid"><div class="panel"><h2>역량별 결과</h2>${mastery()}</div><div class="panel"><h2>평가 레슨 선택</h2><label for="assessmentLesson">PART / Lesson</label><select id="assessmentLesson">${data.lessons.map((x) => `<option value="${x.id}" ${x.id === l.id ? "selected" : ""}>${x.part} · ${E(x.title)}</option>`).join("")}</select>${linkButton("lesson/" + l.id, "이론과 예제 보기")}</div></div><article class="reader"><h2>${E(l.title)}</h2>${assessment(l)}</article>`;
}
const field = (id, label, value, step = "any") =>
  `<label for="${id}">${label}<input id="${id}" type="number" step="${step}" value="${value}" inputmode="decimal" required></label>`;
function tools(which = "geometry") {
  const names = {
    ratio: "기어비와 동력",
    geometry: "법선·정면 기하",
    involute: "인벌류트 생성",
    metrology: "계측 데이터 해석",
  };
  if (!names[which]) which = "geometry";
  $("app").innerHTML =
    heading(
      "ENGINEERING WORKBENCH",
      names[which],
      "단위·가정·계산 과정을 함께 확인하는 학습 도구",
    ) +
    `<div class="tool-tabs">${Object.entries(names)
      .map(([id, title]) =>
        linkButton("calc/" + id, title, which === id ? "primary" : ""),
      )
      .join("")}</div>`;
  let fields = "",
    caption = "",
    aside = "";
  if (which === "geometry") {
    fields =
      field("mn", "법선 모듈 m_n (mm)", 2) +
      field("z", "잇수 z (정수)", 30, 1) +
      field("beta", "기준 헬릭스각 β (°)", 30) +
      field("alpha", "법선 압력각 α_n (°)", 20);
    caption =
      "원통 외접 인벌류트 기어의 기준 기하. 기준 헬릭스각 사용. 전위와 작동 중심거리는 계산하지 않습니다.";
    aside = formula({
      expression: "m_t=m_n/cosβ\nd=zm_t\ntanα_t=tanα_n/cosβ\nd_b=d cosα_t",
      definitions:
        "모듈·지름·피치: mm. 각 입력: °, 내부 삼각함수: rad. β=0은 평기어. 치끝/치저원은 별도 설계.",
    });
  }
  if (which === "ratio") {
    fields =
      field("z1", "구동 잇수 z₁", 20, 1) +
      field("z2", "피동 잇수 z₂", 60, 1) +
      field("n1", "입력 속도 n₁ (rpm)", 900) +
      field("t1", "입력 토크 T₁ (N·m)", 10) +
      field("eta", "효율 η (0–1)", 0.95);
    caption =
      "정상 상태 단일 기어쌍의 속도 크기·동력 평형. 외접 평행축은 반대 방향, 내접 평행축은 같은 방향. 기어 종류별 효율은 사용자가 지정합니다.";
    aside = formula({
      expression: "i=z₂/z₁\nn₂=n₁/i\nT₂=ηiT₁\nP=2πnT/60",
      definitions:
        "n: rpm, T: N·m, P: W. 입력 ≥ 0인 크기 계산. η는 교육용 가정이며 장비 보증 효율 아님.",
    });
  }
  if (which === "involute") {
    fields =
      field("rb", "기초원 반경 r_b (mm)", 40) +
      `<label for="unwind">풀림 매개변수 t (0–1.5)<input id="unwind" type="range" min="0" max="1.5" step="0.01" value="1"><output id="unwindValue" for="unwind">1.00</output></label>`;
    caption =
      "좌표 원점은 기초원 중심, X축은 초기 접점 방향. 정확한 곡선 한쪽 가지를 그리며 전체 기어 치형·맞물림 시뮬레이션을 뜻하지 않습니다.";
    aside = formula({
      expression: "X=r_b(cos t+t sin t)\nY=r_b(sin t−t cos t)\nr=r_b√(1+t²)",
      definitions:
        "X,Y,r_b: mm, t: 무차원. 기초원 접점과 팽팽한 줄의 끝을 연결한 도식.",
    });
  }
  if (which === "metrology") {
    fields = `<label for="samples">편차 표본 (μm, 쉼표 구분, 2–100개)<textarea id="samples">-4,-2,0,2,4</textarea></label><label for="pattern">가설 비교<select id="pattern"><option value="slope">기울기 형태</option><option value="periodic">회전 주기 형태</option><option value="noise">불규칙 산포</option></select></label>`;
    caption =
      "합성 측정 데이터의 표본 범위와 모양을 학습합니다. ISO 편차 평가·공차 판정·원인 자동 확정을 수행하지 않습니다.";
    aside =
      "<h2>증거를 먼저 정의하기</h2><p>기준축, 좌우 치면, 평가 범위, 설계 수정치형, 온도, 필터와 교정 상태를 확인하세요. 패턴은 원인 가설을 만드는 단서입니다.</p>" +
      linkButton("lesson/p5-l2", "치형·치선 레슨으로");
  }
  $("app").innerHTML +=
    `<div class="tool-grid"><section class="panel"><h2>입력과 계산</h2><form id="toolForm" data-tool="${which}" novalidate><div class="fields">${fields}</div><button type="submit" class="primary">모델 계산</button></form><p class="muted">${E(caption)}</p><div id="toolResult" aria-live="polite"></div></section><section class="panel">${aside}<div id="toolDiagram"></div></section></div>`;
  runTool(which);
}
function input(id) {
  const raw = $(id).value;
  if (!raw.trim()) throw Error("빈 입력을 채워주세요.");
  const n = Number(raw);
  if (!Number.isFinite(n)) throw Error("유한한 숫자를 입력하세요.");
  return n;
}
function runTool(which) {
  try {
    let result = "",
      picture = "";
    const f = (v) => v.toFixed(4);
    if (which === "geometry") {
      const mn = input("mn"),
        z = input("z"),
        b = input("beta"),
        a = input("alpha"),
        g = geometry(mn, z, b, a),
        base = geometry(mn, z, 0, a);
      result = `m_t = ${E(mn)}/cos(${E(b)}°) = ${f(g.mt)} mm<br>d = ${E(z)}×m_t = ${f(g.d)} mm<br>α_t = ${f(g.at)}°<br>d_b = ${f(g.db)} mm<br>p_t = ${f(g.pt)} mm<br>p_bt = ${f(g.pbt)} mm<br>동일 m_n, z의 β=0 비교: d=${f(base.d)} mm<br>지름 차이 = ${f(g.d - base.d)} mm`;
      picture = circlesDiagram(g.d, g.db, mn);
    }
    if (which === "ratio") {
      const r = ratio(
        input("z1"),
        input("z2"),
        input("n1"),
        input("t1"),
        input("eta"),
      );
      result = `i = ${f(r.i)}<br>n₂ = ${f(r.n2)} rpm<br>T₂ = ${f(r.t2)} N·m<br>P₁ = ${f(r.p1)} W<br>P₂ = ${f(r.p2)} W`;
      picture = pairDiagram(input("z1"), input("z2"));
    }
    if (which === "involute") {
      const rb = input("rb"),
        t = input("unwind");
      if (!(rb > 0 && rb <= 100 && t >= 0 && t <= 1.5))
        throw Error("도식 표시 범위: 0 < r_b ≤ 100 mm, 0 ≤ t ≤ 1.5");
      $("unwindValue").textContent = t.toFixed(2);
      picture = involuteDiagram(rb, t);
      result = `줄 길이 = ${f(rb * t)} mm<br>반경 r = ${f(rb * Math.hypot(1, t))} mm`;
    }
    if (which === "metrology") {
      const raw = $("samples").value.split(",");
      if (raw.length > 100 || raw.some((s) => !s.trim()))
        throw Error("빈 표본 없이 2–100개의 숫자를 입력하세요.");
      const v = raw.map(Number),
        range = sampleRange(v);
      if (v.some((x) => Math.abs(x) > 10000))
        throw Error("표시 범위는 |편차| ≤ 10000 μm입니다.");
      result = `표본 수 = ${v.length}<br>최대 = ${Math.max(...v)} μm<br>최소 = ${Math.min(...v)} μm<br>표본 범위 = ${f(range)} μm`;
      const patterns = {
        slope:
          "기울기: 정렬·공구·보정·온도 가설을 비교. 기준과 평가 범위를 먼저 확인.",
        periodic:
          "주기: 고정 편심·분할·동기 가설 비교. 회전 위상별 측정과 재척킹 검증.",
        noise:
          "산포: 측정 반복성·프로브·표면·진동 가설 비교. 교정과 동일 부품 반복 측정.",
      };
      result += `<p>${patterns[$("pattern").value]}</p>`;
      picture = graphDiagram(v, "사용자 입력 편차 표본");
    }
    $("toolResult").innerHTML = `<div class="outputs">${result}</div>`;
    $("toolDiagram").innerHTML = picture;
  } catch (e) {
    $("toolResult").innerHTML =
      `<p class="tool-error" role="alert">입력값을 확인하세요. ${E(e.message)}</p>`;
    $("toolDiagram").replaceChildren();
  }
}
function notes() {
  let memo = "";
  try {
    const parsed = JSON.parse(storage.getItem("fse3_memo") || '""');
    if (typeof parsed === "string") memo = parsed;
  } catch {}
  $("app").innerHTML =
    `${heading("LEARNING RECORD / LOCAL STORAGE", "학습 기록과 데이터 보존", "학습 데이터는 현재 브라우저와 사이트 주소에 저장됩니다. 기밀 정보는 기록하지 마세요.")}<div class="tool-grid"><section class="panel"><h2>기존 현장 메모</h2><p>v1의 동일 저장 키를 사용합니다. 저장 버튼을 누를 때만 메모를 갱신합니다.</p><label for="memo">관찰 / 가설 / 확인 / 검증</label><textarea id="memo">${E(memo)}</textarea><button id="saveMemo">메모 저장</button><div id="memoStatus" role="status"></div></section><section class="panel"><h2>버전별 백업·복구</h2><p>JSON 백업은 v2 학습 상태와 기존 6개 저장 키의 원문을 포함합니다. 복구는 v2 상태를 병합합니다. 기존 데이터 원문은 덮어쓰지 않습니다.</p><button id="exportBackup">전체 JSON 백업</button><label for="restoreBackup">v2 학습 백업 복구 (최대 2 MB)</label><input id="restoreBackup" type="file" accept=".json,application/json"><p id="restoreStatus" role="status"></p><a href="legacy.html">기존 자료실·용어장 전용 복구</a><p class="muted">손상된 v2 데이터는 원본 보호를 위해 저장을 중단합니다. 유효한 백업 복구 시 교체 전 원문을 별도 보관합니다.</p></section></div><section><h2>레슨별 자기 설명</h2>${
      Object.entries(state.reflections).length
        ? Object.entries(state.reflections)
            .map(
              ([id, text]) =>
                `<details class="panel"><summary>${E(lesson(id)?.title || id)}</summary><p>${E(text)}</p>${linkButton("lesson/" + id, "레슨으로")}</details>`,
            )
            .join("")
        : "<p>레슨에서 실습 답안을 저장하면 이곳에 나타납니다.</p>"
    }</section>`;
}
function go(route) {
  if (location.hash.slice(1) === route) renderRoute();
  else location.hash = route;
}
function renderRoute() {
  if (!data) return;
  let route;
  try {
    route = decodeURIComponent(location.hash.slice(1) || "home");
  } catch {
    route = "invalid";
  }
  if (route.includes(":")) {
    const [id, anchor] = route.split(":");
    if (lesson(id)) {
      if (!$("section-" + anchor)) lessonView(lesson(id));
      $("section-" + anchor)?.scrollIntoView();
      return;
    }
  }
  const [type, arg] = route.split("/");
  let tab = "home";
  if (type === "home") home();
  else if (type === "part" && data.parts[Number(arg) - 1])
    partView(data.parts[Number(arg) - 1]);
  else if (type === "lesson" && lesson(arg)) lessonView(lesson(arg));
  else if (type === "calc") {
    tab = "calc";
    tools(arg);
  } else if (type === "quiz") {
    tab = "quiz";
    quizView(arg);
  } else if (type === "notes") {
    tab = "notes";
    notes();
  } else if (type === "dictionary") {
    tab = "dictionary";
    document.querySelector('nav [data-tab="dictionary"]')?.click();
    return;
  } else {
    $("app").innerHTML =
      heading("PAGE NOT FOUND", "학습 위치를 찾지 못했습니다.") +
      linkButton("home", "학습 경로로");
  }
  document.querySelectorAll("body>nav [data-tab]").forEach((b) => {
    b.classList.toggle("active", b.dataset.tab === tab);
    b.setAttribute("aria-current", b.dataset.tab === tab ? "page" : "false");
  });
  const fab = $("dictFab");
  if (fab) fab.hidden = tab !== "home";
  window.scrollTo(0, 0);
  $("app").focus({ preventScroll: true });
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.route) {
    go(b.dataset.route);
    return;
  }
  if (b.dataset.tab) {
    if (b.dataset.tab === "dictionary") {
      document
        .querySelectorAll("body>nav [data-tab]")
        .forEach((x) => x.classList.toggle("active", x === b));
      return;
    }
    go(b.dataset.tab);
    return;
  }
  if (b.dataset.choice !== undefined) {
    const l = lesson(b.dataset.lesson),
      choice = Number(b.dataset.choice),
      ok = choice === l.assessment.answer;
    state.assessments[l.id] ??= {};
    state.assessments[l.id].choice = ok;
    persist();
    $("choice-" + l.id).innerHTML =
      `<div class="feedback ${ok ? "" : "bad"}"><strong>${ok ? "✓ 정답" : "다시 확인"} · ${E(l.assessment.reasons[choice])}</strong><ul>${l.assessment.choices.map((c, i) => `<li>${i === l.assessment.answer ? "정답" : "오답"} ${String.fromCharCode(65 + i)}: ${E(l.assessment.reasons[i])}</li>`).join("")}</ul></div>`;
  }
  if (b.dataset.number) {
    const l = lesson(b.dataset.number),
      ok = gradeNumber($("number-" + l.id).value, l.calculation);
    state.assessments[l.id] ??= {};
    state.assessments[l.id].number = ok;
    persist();
    $("numeric-" + l.id).innerHTML =
      `<div class="feedback ${ok ? "" : "bad"}">${ok ? "✓ 정답" : "다시 확인"}<p>${E(l.calculation.explanation)}</p></div>`;
  }
  if (b.dataset.diagnosis) {
    const l = lesson(b.dataset.diagnosis),
      q = l.diagnosis;
    const checks = [
      ...document.querySelectorAll(`input[name="evidence-${l.id}"]:checked`),
    ].map((x) => Number(x.value));
    const order = Array(4).fill(-1);
    for (const x of document.querySelectorAll(
      `[data-order-lesson="${l.id}"]`,
    )) {
      if (x.value) order[Number(x.value) - 1] = Number(x.dataset.order);
    }
    const result = gradeDiagnosis(checks, order, q);
    state.assessments[l.id] ??= {};
    state.assessments[l.id].diagnosis = result.pass;
    persist();
    $("diagnosis-" + l.id).innerHTML =
      `<div class="feedback ${result.pass ? "" : "bad"}"><strong>${result.pass ? "✓ 계획 통과" : "계획을 다시 확인하세요"}</strong><p>증거 선택: ${result.evidence ? "통과" : "재검토"} / 검증 순서: ${result.sequence ? "통과" : "재검토"}</p><ul>${q.reasons.map((reason, i) => `<li>${q.requiredChecks.includes(i) ? "유효한 확인" : "부적절한 판단"}: ${E(reason)}</li>`).join("")}</ul><ol>${q.steps.map((step) => `<li>${E(step)}</li>`).join("")}</ol><p>적절한 조사 계획의 통과이며 특정 원인 확정이 아닙니다.</p></div>`;
  }
  if (b.dataset.reflection) {
    const id = b.dataset.reflection;
    state.reflections[id] = $("reflection-" + id).value;
    if (persist()) notice("실습 답안을 저장했습니다.");
  }
  if (b.id === "saveMemo") {
    try {
      storage.setItem("fse3_memo", JSON.stringify($("memo").value));
      $("memoStatus").textContent = "이 기기에 저장했습니다.";
    } catch {
      $("memoStatus").textContent = "저장 실패. 메모를 복사하거나 백업하세요.";
    }
  }
  if (b.id === "exportBackup") {
    try {
      const backup = exportBackup(storage, state);
      let raw;
      try {
        raw = storage.getItem(KEY);
      } catch {}
      if (readOnly) backup.rawAcademy = raw;
      const url = URL.createObjectURL(
          new Blob([JSON.stringify(backup, null, 2)], {
            type: "application/json",
          }),
        ),
        a = document.createElement("a");
      a.href = url;
      a.download = "fse-academy-v2-backup.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      notice("백업 실패: " + e.message);
    }
  }
});
document.addEventListener("submit", (e) => {
  if (e.target.id === "toolForm") {
    e.preventDefault();
    runTool(e.target.dataset.tool);
  }
});
document.addEventListener("input", (e) => {
  if (e.target.id === "unwind") runTool("involute");
});
document.addEventListener("change", async (e) => {
  const x = e.target;
  if (x.dataset.complete) {
    state.completed[x.dataset.complete] = x.checked;
    persist();
  }
  if (x.dataset.rubric) {
    state.assessments[x.dataset.rubric] ??= {};
    state.assessments[x.dataset.rubric].rubric = x.checked;
    persist();
  }
  if (x.id === "assessmentLesson") go("quiz/" + x.value);
  if (x.id === "pattern") runTool("metrology");
  if (x.id === "restoreBackup") {
    const file = x.files?.[0];
    if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024)
        throw Error("2 MB 이하의 파일을 선택하세요.");
      const merged = mergeBackup(state, JSON.parse(await file.text()), ids);
      const raw = storage.getItem(KEY);
      if (raw) storage.setItem("fse_academy_v2_before_restore", raw);
      if (!saveState(storage, merged))
        throw Error("저장 공간이 부족하거나 차단되었습니다.");
      state = merged;
      readOnly = false;
      lastStoredRaw = JSON.stringify(merged);
      notice("");
      $("restoreStatus").textContent =
        "v2 학습 데이터를 병합했습니다. 기존 데이터는 보존되었습니다.";
    } catch (err) {
      $("restoreStatus").textContent = "복구 실패: " + err.message;
    } finally {
      x.value = "";
    }
  }
});
document.addEventListener("click", (e) => {
  if (e.target.closest("a.skip")) {
    e.preventDefault();
    $("app").focus();
    $("app").scrollIntoView();
    return;
  }
  const a = e.target.closest("[data-anchor]");
  if (a) {
    e.preventDefault();
    $("section-" + a.dataset.anchor)?.scrollIntoView({ behavior: "auto" });
  }
});
window.addEventListener("hashchange", renderRoute);
async function boot() {
  try {
    const response = await fetch(
      new URL("./content/curriculum.json", import.meta.url),
    );
    if (!response.ok) throw Error("HTTP " + response.status);
    data = await response.json();
    if (data.version !== 2 || data.lessons.length !== 35)
      throw Error("교육과정 형식이 올바르지 않습니다.");
    ids = data.lessons.map((l) => l.id);
    const loaded = loadState(storage, ids);
    state = loaded.state;
    try {
      lastStoredRaw = storage.getItem(KEY);
    } catch {}
    readOnly = Boolean(loaded.error);
    notice(loaded.error);
    renderRoute();
  } catch (e) {
    $("app").innerHTML =
      heading("LOAD ERROR", "교육과정을 불러오지 못했습니다.", e.message) +
      `<button onclick="location.reload()">다시 불러오기</button> <a href="legacy.html">기존 자료실</a>`;
  }
}
boot();

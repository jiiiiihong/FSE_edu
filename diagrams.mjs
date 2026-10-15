import { involute } from "./engineering.mjs";
const text = (x, y, s) => `<text x="${x}" y="${y}">${s}</text>`;
const line = (x, y, a, b, cls = "") =>
  `<line class="${cls}" x1="${x}" y1="${y}" x2="${a}" y2="${b}"/>`;
const circle = (x, y, r, cls = "") =>
  `<circle class="${cls}" cx="${x}" cy="${y}" r="${r}"/>`;
const frame = (body, title, caption) =>
  `<figure class="engineering-diagram"><svg viewBox="0 0 700 320" role="img" aria-label="${title}" xmlns="http://www.w3.org/2000/svg"><title>${title}</title>${body}</svg><figcaption>${caption}</figcaption></figure>`;
export function involuteDiagram(rb = 40, t = 1) {
  const scale = 90 / rb,
    ox = 220,
    oy = 170,
    R = rb * scale;
  const point = (a) => {
    const p = involute(rb, a);
    return [ox + p.x * scale, oy - p.y * scale];
  };
  const path = Array.from({ length: 101 }, (_, i) => point((t * i) / 100))
    .map((p, i) => (i ? "L" : "M") + p.join(","))
    .join(" ");
  const [x, y] = point(t),
    bx = ox + R * Math.cos(t),
    by = oy - R * Math.sin(t);
  return frame(
    circle(ox, oy, R, "base") +
      line(ox, oy, bx, by, "thin") +
      line(bx, by, x, y, "accent") +
      `<path class="curve" d="${path}"/>` +
      circle(x, y, 4, "point") +
      text(30, 35, `기초원 반경 r_b = ${rb} mm`) +
      text(390, 70, `t = ${t.toFixed(2)} (무차원)`) +
      text(390, 110, `풀린 줄 길이 = ${(rb * t).toFixed(2)} mm`) +
      text(30, 300, "기초원 접점 → 접선의 줄 → 곡선점"),
    "인벌류트와 기초원 접선",
    "계산된 인벌류트 한쪽 가지. 전체 치형·치저 필렛·언더컷은 표시하지 않습니다.",
  );
}
export function circlesDiagram(d = 60, db = 56.3816, mn = 2) {
  const k = 110 / (d / 2 + mn),
    ox = 235,
    oy = 165,
    r = (d * k) / 2;
  return frame(
    circle(ox, oy, r + mn * k, "tip") +
      circle(ox, oy, r, "reference") +
      circle(ox, oy, (db * k) / 2, "base") +
      circle(ox, oy, Math.max(0, r - 1.25 * mn * k), "root") +
      line(ox - r - 20, oy, ox + r + 20, oy, "thin") +
      line(ox, oy - r - 30, ox, oy + r + 30, "thin") +
      text(405, 70, "치끝원 · Tip") +
      text(405, 115, `기준원 d = ${d.toFixed(3)} mm`) +
      text(405, 160, `기초원 d_b = ${db.toFixed(3)} mm`) +
      text(405, 205, "치저원 · Root") +
      text(405, 260, "실선/점선은 구별용 스타일"),
    "네 개의 기어 원",
    "기준·기초원은 계산값 비례. 치끝/치저는 입력 법선 모듈, x=0 기본 랙 예시이며 기어 치면을 뜻하지 않습니다.",
  );
}
export function graphDiagram(values = [-4, -2, 0, 2, 4], kind = "치선 표본") {
  const max = Math.max(1, ...values.map(Math.abs)),
    pts = values.map((v, i) => [
      80 + (i * 520) / (values.length - 1),
      155 - (v * 95) / max,
    ]);
  return frame(
    line(80, 45, 80, 265) +
      line(80, 155, 620, 155, "reference") +
      line(80, 265, 620, 265) +
      pts.map(([x, y]) => circle(x, y, 4, "point")).join("") +
      `<path class="curve" d="${pts.map((p, i) => (i ? "L" : "M") + p.join(",")).join(" ")}"/>` +
      text(15, 25, "편차 (μm)") +
      text(18, 65, String(max)) +
      text(35, 160, "0") +
      text(15, 260, String(-max)) +
      text(80, 300, "평가 시작") +
      text(495, 300, "평가 위치 → 끝") +
      text(270, 30, kind),
    "기어 측정 교육용 표본 그래프",
    "교육용 합성 데이터. 선은 표본 연결이며 ISO 평가 알고리즘·공차선이 아닙니다.",
  );
}
export function pairDiagram(z1 = 20, z2 = 60) {
  const k = 100 / Math.max(z1, z2),
    r1 = z1 * k,
    r2 = z2 * k,
    c1 = 280 - r1,
    c2 = 280 + r2;
  return frame(
    circle(c1, 155, r1, "reference") +
      circle(c2, 155, r2, "reference") +
      circle(c1, 155, 5, "point") +
      circle(c2, 155, 5, "point") +
      line(c1 - r1 - 15, 155, c2 + r2 + 15, 155, "thin") +
      line(280, 80, 280, 230, "accent") +
      text(45, 35, `Pinion z₁=${z1} · ↻`) +
      text(355, 35, `Gear z₂=${z2} · ↺`) +
      text(305, 275, "외접: 회전 방향 반대") +
      text(35, 310, "기준원 크기 비 = 잇수 비"),
    "외접 기어의 잇수비와 기준원",
    "동일 모듈의 기준원 반경 비례. 동기 회전 방향 개념이며 실제 치면 접촉·애니메이션은 생략.",
  );
}
export function diagram(kind) {
  if (kind === "involute") return involuteDiagram();
  if (kind === "circles") return circlesDiagram();
  if (["metrology", "runout", "trend"].includes(kind))
    return graphDiagram(
      kind === "runout"
        ? [10, 7, 0, -7, -10, -7, 0, 7, 10]
        : kind === "trend"
          ? [3, 4, 5, 6, 7]
          : [-4, -2, 0, 2, 4],
      kind === "runout"
        ? "순수 편심 E=10 μm, 1회전"
        : kind === "trend"
          ? "공구 사용량에 따른 가상 추세"
          : "치선 기울기 표본",
    );
  if (kind === "ratio") return pairDiagram();
  if (kind === "types")
    return frame(
      text(30, 40, "평행축") +
        text(30, 80, "Spur / Helical / Internal") +
        line(40, 130, 210, 130, "reference") +
        line(40, 180, 210, 180, "reference") +
        text(265, 40, "교차축") +
        text(265, 80, "Bevel") +
        line(280, 230, 380, 130, "accent") +
        line(380, 130, 475, 230, "accent") +
        text(470, 40, "비평행·비교차축") +
        text(470, 80, "Worm") +
        line(520, 120, 520, 235, "reference") +
        line(555, 185, 650, 185, "accent") +
        text(
          30,
          290,
          "축선은 투영 개념도. Worm 두 축은 실제로 한 점에서 만나지 않음.",
        ),
      "기어 형식별 축 배치",
      "헬리컬은 교차축 형태도 가능. 같은 이름만으로 축 배치와 가공 공법을 확정하지 않습니다.",
    );
  if (kind === "forces")
    return frame(
      circle(220, 165, 95, "reference") +
        circle(220, 165, 5, "point") +
        line(220, 165, 315, 165, "thin") +
        line(315, 165, 315, 55, "accent") +
        line(315, 165, 420, 165, "accent") +
        text(335, 65, "↑ F_t (접선)") +
        text(435, 170, "F_r → (반경)") +
        text(70, 300, "d: 기준원 지름") +
        text(435, 245, "⊙ / ⊗ F_a (축방향)") +
        text(435, 285, "회전·손잡이에 따라 부호 결정"),
      "치면 하중의 성분",
      "정면 투영에서 접선/반경 방향을 구분한 개념도. 실제 힘의 부호는 구동·회전 조건으로 정의.",
    );
  if (kind === "backlash")
    return frame(
      `<path class="base" d="M130 80H240L270 230H130Z"/><path class="reference" d="M360 80H490V230H330Z"/>` +
        line(90, 190, 550, 190, "thin") +
        line(262, 170, 342, 170, "accent") +
        text(280, 145, "j_t") +
        text(40, 270, "같은 작동원 접선 방향에서의 치면 간극") +
        text(40, 310, "법선 간극: j_n = j_t cos α_w (평기어)"),
      "원주 백래시의 측정 방향",
      "국소 치면과 작동원 접선을 단순화한 비례 없는 개념도. 치두께·온도·측정 반경/방향을 함께 정의.",
    );
  if (kind === "contact") {
    const a = (20 * Math.PI) / 180,
      px = 250,
      py = 165,
      r1 = 60,
      r2 = 120,
      c1 = px - r1,
      c2 = px + r2,
      u = [Math.sin(a), -Math.cos(a)];
    const point = (t) => [px + t * u[0], py + t * u[1]],
      b1 = point(-r1 * Math.sin(a)),
      b2 = point(r2 * Math.sin(a));
    return frame(
      circle(c1, py, r1, "reference") +
        circle(c2, py, r2, "reference") +
        circle(c1, py, r1 * Math.cos(a), "base") +
        circle(c2, py, r2 * Math.cos(a), "base") +
        line(c1, py, c2, py, "thin") +
        line(...point(-150), ...point(150), "accent") +
        line(c1, py, ...b1, "thin") +
        line(c2, py, ...b2, "thin") +
        circle(px, py, 4, "point") +
        text(30, 40, "기준원/작동원: x=0, a_w=a") +
        text(475, 115, "기초원 공통 접선") +
        text(475, 150, "= 작용선") +
        text(475, 210, "α_w = 20°") +
        text(30, 300, "P: 피치점 · 기초원은 중심거리 변화로 바뀌지 않음"),
      "기초원과 작용선",
      "20/40T 평기어 기준원과 기초원은 수학적 비례. 작용선은 두 기초원 공통 접선. 치끝/치저와 실제 유효 접촉 구간은 생략.",
    );
  }
  if (kind === "helix")
    return frame(
      `<path class="base" d="M120 70H390V240H120Z"/>` +
        Array.from({ length: 7 }, (_, i) =>
          line(130 + i * 35, 235, 200 + i * 35, 75, "curve"),
        ).join("") +
        line(110, 265, 430, 265) +
        text(170, 300, "축방향 / Axis →") +
        text(475, 100, "β: 축과 치선 사이 각") +
        text(475, 155, "정면: 축에 수직") +
        text(475, 205, "법선면: 치선에 수직"),
      "헬리컬 치선과 기준 단면",
      "원통 표면을 펼친 치선 개념도. 각도 변화 계산은 법선/정면 변환 도구에서 확인합니다.",
    );
  if (kind === "skiving")
    return frame(
      circle(435, 185, 75, "reference") +
        circle(255, 120, 45, "base") +
        line(340, 185, 565, 185, "accent") +
        line(175, 60, 435, 210, "accent") +
        text(40, 35, "Tool axis: 교차축") +
        text(465, 290, "Work axis") +
        text(40, 250, "↻ 공구 / ↻ 공작물 동기 회전") +
        text(40, 295, "축방향 이송 + 교차각 → 상대 절삭 성분"),
      "스카이빙의 교차축 운동",
      "3차원 교차축의 투영 개념도. 두 원은 도구/소재 표식이며 치형이나 실제 접촉/충돌 모델이 아닙니다.",
    );
  if (["hobbing", "shaping"].includes(kind)) {
    const labels =
      kind === "hobbing"
        ? [
            "Hob: 회전 n_h, 시작 수 S",
            "Work: 회전 n_w, 잇수 z",
            "축방향 이송 →",
          ]
        : kind === "shaping"
          ? [
              "Pinion tool: 왕복 ↕ + 회전",
              "Work: 동기 회전",
              "복귀 여유·간섭 검토",
            ]
          : ["Tool: 교차축 회전", "Work: 동기 회전", "교차각 → 상대 절삭속도"];
    return frame(
      `<rect class="base" x="100" y="100" width="200" height="60" rx="10"/>` +
        circle(440, 185, 75, "reference") +
        line(75, 130, 325, 130, "accent") +
        line(440, 55, 440, 285, "accent") +
        text(55, 50, labels[0]) +
        text(385, 30, labels[1]) +
        text(75, 270, labels[2]) +
        text(105, 205, kind === "shaping" ? "↕ stroke" : "↻ tool") +
        text(415, 190, "↻"),
      "공구와 공작물의 운동 관계",
      "운동 자유도를 보여주는 개념도. 공구 형상·축각·충돌 여유는 실제 장비/공구 모델과 다릅니다.",
    );
  }
  if (kind === "flank")
    return frame(
      circle(210, 155, 65, "reference") +
        circle(350, 155, 75, "base") +
        line(210, 270, 350, 270, "accent") +
        text(100, 45, "Single flank: 한 치면 접촉") +
        text(410, 110, "각도 비교 → TE") +
        text(410, 175, "Double flank: 양 치면 접촉") +
        text(410, 220, "중심거리 변화 관찰"),
      "맞물림 검사 관측값",
      "개념도. 마스터 기어, 접촉력과 장비 운동 조건을 별도로 정의해야 합니다.",
    );
  const labels =
    kind === "servo"
      ? ["지령 Command", "서보/구동계", "엔코더 Feedback"]
      : kind === "alignment"
        ? ["기준축 Datum", "축 관계/각도 θ", "출력 위치 Δy"]
        : kind === "material"
          ? ["소재/심부", "표면 경화층", "경도·깊이 검사"]
          : kind === "distortion"
            ? ["초기 기준/온도", "열·조직·구속 변화", "동일 조건 재측정"]
            : kind === "spectrum"
              ? ["속도·부하", "소음 스펙트럼", "치면/장비 데이터"]
              : kind === "diagnosis"
                ? ["관측·알람", "가설·확인", "검증·판정"]
                : ["치 절삭", "열처리/정삭", "최종 검사"];
  return frame(
    labels
      .map(
        (s, i) =>
          `<rect class="base" x="${30 + i * 230}" y="100" width="200" height="85" rx="6"/>` +
          text(45 + i * 230, 150, s),
      )
      .join("") +
      line(230, 145, 260, 145, "accent") +
      line(460, 145, 490, 145, "accent") +
      text(
        80,
        255,
        kind === "servo"
          ? "피드백과 실제 치면 위치는 다를 수 있음"
          : "입력 조건과 전후 측정 기준을 기록",
      ),
    "공정 또는 판단 흐름",
    "기술 관계를 설명하는 블록도. 장비별 동작·안전 작업 절차는 제조사 매뉴얼을 따릅니다.",
  );
}

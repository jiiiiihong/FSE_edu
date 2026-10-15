// Pure unit-explicit educational models; these functions never set machine parameters.
const rad = (d) => (d * Math.PI) / 180;
function finite(...v) {
  if (!v.every(Number.isFinite))
    throw new RangeError("유한한 숫자를 입력하세요.");
}
export function geometry(mn, z, beta, alpha) {
  finite(mn, z, beta, alpha);
  if (
    !(
      mn > 0 &&
      Number.isInteger(z) &&
      z >= 3 &&
      Math.abs(beta) < 85 &&
      alpha > 0 &&
      alpha < 45
    )
  )
    throw new RangeError(
      "모듈 > 0, 정수 잇수 ≥ 3, |β| < 85°, 0° < αn < 45°를 입력하세요.",
    );
  const mt = mn / Math.cos(rad(beta)),
    at = Math.atan(Math.tan(rad(alpha)) / Math.cos(rad(beta))),
    d = mt * z;
  const values = {
    mt,
    at: (at * 180) / Math.PI,
    d,
    db: d * Math.cos(at),
    pt: Math.PI * mt,
    pbt: Math.PI * mt * Math.cos(at),
  };
  if (!Object.values(values).every(Number.isFinite))
    throw new RangeError("계산 범위를 초과했습니다.");
  return values;
}
export function ratio(z1, z2, n1, t1, eta) {
  finite(z1, z2, n1, t1, eta);
  if (
    !(
      Number.isInteger(z1) &&
      z1 >= 3 &&
      Number.isInteger(z2) &&
      z2 >= 3 &&
      n1 >= 0 &&
      t1 >= 0 &&
      eta > 0 &&
      eta <= 1
    )
  )
    throw new RangeError(
      "잇수는 정수 ≥ 3, 속도·토크 ≥ 0, 0 < 효율 ≤ 1을 입력하세요.",
    );
  const i = z2 / z1,
    result = {
      i,
      n2: n1 / i,
      t2: eta * i * t1,
      p1: (2 * Math.PI * n1 * t1) / 60,
    };
  result.p2 = result.p1 * eta;
  if (!Object.values(result).every(Number.isFinite))
    throw new RangeError("계산 범위를 초과했습니다.");
  return result;
}
export function involute(rb, t) {
  finite(rb, t);
  if (!(rb > 0 && t >= 0))
    throw new RangeError("기초원 반경 > 0, t ≥ 0이 필요합니다.");
  return {
    x: rb * (Math.cos(t) + t * Math.sin(t)),
    y: rb * (Math.sin(t) - t * Math.cos(t)),
    r: rb * Math.hypot(1, t),
  };
}
export function contact(m, z1, z2, alpha) {
  geometry(m, z1, 0, alpha);
  geometry(m, z2, 0, alpha);
  const a = (m * (z1 + z2)) / 2,
    rb1 = ((m * z1) / 2) * Math.cos(rad(alpha)),
    rb2 = ((m * z2) / 2) * Math.cos(rad(alpha)),
    ra1 = m * (z1 / 2 + 1),
    ra2 = m * (z2 / 2 + 1),
    pb = Math.PI * m * Math.cos(rad(alpha));
  const path =
    Math.sqrt(ra1 * ra1 - rb1 * rb1) +
    Math.sqrt(ra2 * ra2 - rb2 * rb2) -
    a * Math.sin(rad(alpha));
  return { a, rb1, rb2, ra1, ra2, pb, path, epsilon: path / pb };
}
export function gradeNumber(raw, q) {
  if (typeof raw !== "string" || raw.trim() === "") return false;
  const value = Number(raw);
  return (
    Number.isFinite(value) &&
    Math.abs(value - q.answer) <=
      q.tolerance + Number.EPSILON * Math.max(1, Math.abs(q.answer)) * 4
  );
}
export function sampleRange(samples) {
  if (
    !Array.isArray(samples) ||
    samples.length < 2 ||
    !samples.every(Number.isFinite)
  )
    throw new RangeError("유한한 표본 2개 이상이 필요합니다.");
  return Math.max(...samples) - Math.min(...samples);
}
export function gradeDiagnosis(selected, order, q) {
  const unique = [...new Set(selected)];
  const evidence =
    unique.length === q.requiredChecks.length &&
    unique.every((i) => q.requiredChecks.includes(i));
  const sequence =
    order.length === q.order.length && order.every((v, i) => v === q.order[i]);
  return { evidence, sequence, pass: evidence && sequence };
}

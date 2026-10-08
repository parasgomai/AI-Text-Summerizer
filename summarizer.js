/* Core summarizer logic: extractive, frequency-based (runs fully in the browser). */
const STOPWORDS = new Set(("a an the and or but if then else of to in on at by for with from as is are was were be been being " +
  "it its this that these those he she they we you i his her their our your my me him them us not no so such than too very " +
  "can could will would shall should may might must do does did done have has had having about into over under again " +
  "also just more most other some any each both few own same only up down out off what which who whom when where why how").split(" "));

const words = t => (t.toLowerCase().match(/[a-z0-9']+/g) || []);
const countWords = t => (t.trim() ? t.trim().split(/\s+/).length : 0);

function splitSentences(text) {
  return (text.replace(/\s+/g, " ").match(/[^.!?]+(?:[.!?]+["')\]]*|$)/g) || [])
    .map(s => s.trim()).filter(s => words(s).length >= 4);
}

function termFrequencies(sentences) {
  const tf = {};
  sentences.forEach(s => words(s).forEach(w => {
    if (!STOPWORDS.has(w) && w.length > 2) tf[w] = (tf[w] || 0) + 1;
  }));
  const max = Math.max(1, ...Object.values(tf));
  for (const w in tf) tf[w] /= max;
  return tf;
}

function scoreSentences(sentences, tf) {
  return sentences.map((s, i) => {
    const ws = words(s).filter(w => tf[w]);
    const base = ws.reduce((a, w) => a + tf[w], 0) / Math.sqrt(Math.max(words(s).length, 1));
    const position = i === 0 ? 1.25 : i === sentences.length - 1 ? 1.08 : 1;
    return { i, s, score: base * position };
  });
}

/** ratio: 0.1–0.7 of sentences kept. Returns summary, key points and word counts. */
function summarize(text, ratio = 0.3) {
  const sentences = splitSentences(text);
  if (sentences.length < 2) return { summary: text.trim(), keyPoints: [], original: countWords(text), shortened: countWords(text) };
  const tf = termFrequencies(sentences);
  const scored = scoreSentences(sentences, tf);
  const ranked = [...scored].sort((a, b) => b.score - a.score);

  const n = Math.max(1, Math.round(sentences.length * ratio));
  const summary = ranked.slice(0, n).sort((a, b) => a.i - b.i).map(x => x.s).join(" ");

  // Key points: top sentences, skipping near-duplicates, trimmed to ~24 words.
  const keyPoints = [];
  for (const r of ranked) {
    const rw = new Set(words(r.s).filter(w => tf[w]));
    const dup = keyPoints.some(k => {
      const kw = new Set(words(k.s).filter(w => tf[w]));
      const shared = [...rw].filter(w => kw.has(w)).length;
      return shared / Math.max(1, Math.min(rw.size, kw.size)) > 0.6;
    });
    if (!dup) keyPoints.push(r);
    if (keyPoints.length === 5) break;
  }
  const trim = s => { const w = s.split(/\s+/); return w.length > 24 ? w.slice(0, 24).join(" ") + "…" : s; };

  return {
    summary,
    keyPoints: keyPoints.sort((a, b) => a.i - b.i).map(k => trim(k.s)),
    original: countWords(text),
    shortened: countWords(summary),
  };
}

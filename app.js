/* UI wiring: input, file upload, slider, rendering. */
const $ = id => document.getElementById(id);
const input = $("input"), slider = $("length"), fileInput = $("file");
const LABELS = ["", "Very short", "Short", "Medium", "Long", "Very long"];

function levelToRatio(l) { return [0, 0.1, 0.2, 0.3, 0.45, 0.65][l]; }

function run() {
  const text = input.value.trim();
  $("inCount").textContent = countWords(text) + " words";
  if (!text) { $("results").hidden = true; $("error").textContent = "Paste some text or upload a .txt file first."; return; }
  if (splitSentences(text).length < 3) { $("results").hidden = true; $("error").textContent = "Add at least three full sentences to summarize."; return; }
  $("error").textContent = "";
  const r = summarize(text, levelToRatio(+slider.value));
  $("summary").textContent = r.summary;
  $("points").replaceChildren(...r.keyPoints.map(p => Object.assign(document.createElement("li"), { textContent: p })));
  const cut = Math.round((1 - r.shortened / r.original) * 100);
  $("origN").textContent = r.original; $("sumN").textContent = r.shortened;
  $("cut").textContent = cut + "% shorter";
  $("origBar").style.width = "100%";
  $("sumBar").style.width = Math.max(3, (r.shortened / r.original) * 100) + "%";
  $("results").hidden = false;
}

slider.addEventListener("input", () => { $("lenLabel").textContent = LABELS[slider.value]; if (!$("results").hidden) run(); });
input.addEventListener("input", () => { $("inCount").textContent = countWords(input.value) + " words"; });
$("go").addEventListener("click", run);
$("clear").addEventListener("click", () => { input.value = ""; $("results").hidden = true; $("error").textContent = ""; $("inCount").textContent = "0 words"; fileInput.value = ""; });
$("copy").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText($("summary").textContent); $("copy").textContent = "Copied"; setTimeout(() => $("copy").textContent = "Copy summary", 1500); } catch (e) {}
});
fileInput.addEventListener("change", () => {
  const f = fileInput.files[0]; if (!f) return;
  if (!/\.(txt|md|text)$/i.test(f.name)) { $("error").textContent = "Use a .txt or .md file."; return; }
  const rd = new FileReader();
  rd.onload = () => { input.value = rd.result; $("inCount").textContent = countWords(rd.result) + " words"; $("error").textContent = ""; run(); };
  rd.readAsText(f);
});
$("lenLabel").textContent = LABELS[slider.value];

# AI Text Summarizer (Problem 9, Feature Set C)

A small web app that condenses long text into a short summary, pulls out key points, and shows how much shorter the result is. It runs entirely in the browser: no server, no API key, and your text never leaves your device.

## Features
- **Text/file input:** paste text or upload a `.txt` / `.md` file.
- **Generate summary:** picks the most important sentences and keeps them in original order.
- **Extract key points:** up to 5 trimmed, non-repeating bullet points.
- **Word count comparison:** original vs. summary words, bars, and percent reduction.
- **Adjustable summary length:** 5-step slider (Very short to Very long) that updates results live.

## Project structure
```
ai-text-summarizer/
├── index.html      # web page
├── style.css       # styling (light and dark mode)
├── summarizer.js   # core summarization logic
├── app.js          # UI: input, upload, slider, rendering
└── README.md
```

## Run it
Open `index.html` in any modern browser. No install or build step.

## How it works
This is an **extractive** summarizer:
1. Split the text into sentences.
2. Count how often each meaningful word appears (stop words like "the" are ignored) and normalize the counts.
3. Score each sentence by the importance of its words, adjusted for length, with a small boost for the first and last sentences.
4. Keep the top N sentences, where N depends on the length slider (10% to 65% of the sentences), and put them back in original order.
5. Key points are the highest-scoring sentences, with near-duplicates removed and long ones trimmed to 24 words.

## Limitations and ideas
- Extractive only: it selects existing sentences and does not rewrite them.
- English text works best; PDF/DOCX upload is not supported.
- To get true AI (abstractive) summaries, replace `summarize()` in `summarizer.js` with a call to an LLM API and keep the same return shape: `{ summary, keyPoints, original, shortened }`.

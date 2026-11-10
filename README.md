# Clinical Trial Criterion Screener (CRS)

A Transformer system that matches a patient description against the **individual inclusion
and exclusion criteria** of a clinical trial, returns a structured eligibility label for each
criterion, cites the exact patient sentences that justify the decision, and exposes the
low-level inference machinery (KV cache, tiled online-softmax attention, speculative decoding)
behind the predictions.

> **Educational screening prototype — not a clinical enrollment decision tool.**

Built for Generative AI Assignment 2 on the mandatory
[TrialGPT Criterion Annotations](https://huggingface.co/datasets/ncbi/TrialGPT-Criterion-Annotations)
dataset. The original [TrialGPT](https://github.com/ncbi-nlp/TrialGPT) project is referenced only.

## What it does

- **Fine-tunes** Qwen2.5-1.5B-Instruct with LoRA to read `(patient note, criterion type, criterion text)`
  and emit a structured label plus the supporting sentence IDs.
- **Preserves all expert label categories** — `included / not included / not enough information /
  not applicable` for inclusion, and `excluded / not excluded / not enough information / not
  applicable` for exclusion. It never collapses them into a yes/no.
- **Cites evidence** by original sentence ID and flags any verdict that has no cited evidence for
  human review, rather than treating absent evidence as proof.
- **Implements the inference internals from scratch**: a cache-aware greedy decoder, a tiled
  online-softmax attention kernel, and greedy speculative decoding with a smaller draft model —
  each validated for token-level equivalence against a reference path.
- **Ships a browser application** (FastAPI + React/Vite) where a user pastes a note, enters trial
  criteria, runs the model, inspects each criterion-level result with its evidence, compares the
  decoding mechanisms, and exports a readable screening report.

## Repository layout

```
screener/data/        split.py, prepare.py, prompts.py, sentences.py   — fixed split, prompts, sentence IDs
screener/train/       train_lora.py, run_experiments.py, config/*.yaml — LoRA fine-tuning
screener/eval/        metrics.py, evaluate.py, predict.py, verifier.py, explain.py
screener/inference/   cached_decoder.py, uncached_decoder.py, speculative.py, common.py
screener/attention/   reference.py, tiled_online.py, model_patch.py
benchmarks/           bench_cache.py, bench_attention.py, bench_speculative.py
tests/                pytest suite for every component
kaggle/               train.ipynb, final_eval_and_benchmarks.ipynb     — GPU notebooks
app/                  server.py, pipeline.py, report.py + web/ (React frontend)
splits/manifest.json  patient-grouped 37/8/8 split manifest (seed 42)
results/              training logs, held-out metrics, benchmark logs, error analysis
scripts/              fetch_resources.py, fetch_adapters.py, verify_resources.py
docs/                 IMPLEMENTATION_PLAN.md, DECISIONS.md
```

## Dataset split

Patient-grouped, reproducible: sort unique patient IDs, shuffle with
`numpy.random.default_rng(42)`, assign the first 37 patients to train, next 8 to validation,
last 8 to test. Every annotation for a patient stays in one split; GPT-4 prediction/explanation
columns are never loaded. The one blank-criterion row (annotation 883) is removed and recorded.
See [`splits/manifest.json`](splits/manifest.json) for IDs and per-split label counts, and
[`tests/test_split.py`](tests/test_split.py) for the leakage checks.

## Model

| Role | Model | Params | Licence | Notes |
|---|---|---|---|---|
| Target | Qwen2.5-1.5B-Instruct | 1.54B | Apache 2.0 | 28 layers, 32k context |
| Draft (speculative) | Qwen2.5-0.5B-Instruct | 0.49B | Apache 2.0 | identical tokenizer |
| Competing candidate | SmolLM2-1.7B-Instruct | 1.71B | Apache 2.0 | evaluated, not selected |

Fine-tuning is LoRA (rank 32, alpha 64) on the attention projections — see
[`docs/DECISIONS.md`](docs/DECISIONS.md) for the rejected alternatives and failures. The published
adapters are pinned in [`adapters.lock.json`](adapters.lock.json).

## Headline held-out test result (run R3)

Qwen2.5-1.5B + LoRA on the sealed 8-patient test split (206 rows), greedy decoding:
accuracy **0.728**, macro-F1 **0.560**, vs. **0.147** macro-F1 for the same model untrained.
Full metrics in [`results/eval/after_test/metrics.json`](results/eval/after_test/metrics.json).

## Setup

Requires Python 3.11+ and (for training/benchmarks) a CUDA GPU.

```bash
python -m venv .venv && source .venv/bin/activate   # Windows: scripts/setup_env.ps1
pip install torch==2.11.0 --index-url https://download.pytorch.org/whl/cu128
pip install -r requirements.txt
```

Download the base models and the trained LoRA adapters (hosted on Hugging Face, too large for git):

```bash
python scripts/fetch_resources.py     # base models + dataset + papers
python scripts/fetch_adapters.py      # trained LoRA adapters from adapters.lock.json
python scripts/verify_resources.py    # hash-checks everything
```

## Run the tests

```bash
pytest            # split integrity, decoders, attention, speculative, metrics, app
```

## Run the application

Build the frontend once, then start the server (serves API + UI on http://127.0.0.1:8600):

```bash
cd app/web && npm install && npm run build && cd ../..
python -m app.server
```

On Windows, double-click `start_app.bat`. Open http://127.0.0.1:8600, paste a patient note,
enter inclusion/exclusion criteria, and run a screening. The **benchmark view** compares the
cached vs. uncached decoder and speculative decoding live.

## Reproduce training and benchmarks

Training and full benchmarks run on a free Kaggle T4 GPU via the notebooks in
[`kaggle/`](kaggle/). The laptop (RTX 3050 Ti 4 GB) runs the app, tests, and small benchmarks.
Experiment configs are in [`screener/train/config/experiments.yaml`](screener/train/config/experiments.yaml)
and selection logic in [`results/training/selection.json`](results/training/selection.json).

## Documentation

- [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) — task-by-task plan mapped to the rubric
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — alternatives considered, rejected options, and failures
- [`RESOURCES.md`](RESOURCES.md) — every resource, hardware, and manual step
- [`results/error_analysis.md`](results/error_analysis.md) — error analysis on held-out cases

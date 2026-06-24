# Coach Precision Report: 30 days / 5 cycles

Generated at: 2026-06-24T16:14:00.907Z

## What This Test Is

This is a deterministic simulation stress test for the coach decision system. It is more precise than a single static report because it runs multiple feedback/update cycles, but it is still not real student evidence.

Real evidence: weakness_summary, cluster LLM traces, problem-bank traces, generated problem packages, quality reports.

Simulated evidence: daily attempts, hit/miss observations, mock exam scores, first-prize readiness.

## Mock Exam Curve

| Cycle | Day | T1 | T2 | T3 | T4 | Total | Readiness | Verdict |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | 6 | 76 | 67 | 43 | 31 | 217 | 0.38 | Not first-prize ready yet; diagnosis and training focus are still being validated. |
| 2 | 12 | 80 | 72 | 51 | 38 | 241 | 0.48 | Improving, near target zone, but T3/T4 partial-score reliability still decides first-prize probability. |
| 3 | 18 | 85 | 76 | 58 | 45 | 264 | 0.67 | Improving, near target zone, but T3/T4 partial-score reliability still decides first-prize probability. |
| 4 | 24 | 89 | 81 | 66 | 52 | 288 | 0.77 | Close to first-prize target in simulation, but still requires real contest validation. |
| 5 | 30 | 93 | 86 | 74 | 59 | 312 | 0.87 | Close to first-prize target in simulation, but still requires real contest validation. |

## Final Active Weakness State

| weaknessId | status | confidence | priority | recent hit/miss | source coverage |
| --- | --- | ---: | ---: | --- | --- |
| dp_state_error_15 | HYPOTHESIS | 0.86 | 76.95 | 0/0 | 3/9 LLM clusters |
| math_model_error_5 | DOWNGRADED | 0.88 | 76.16 | 5/3 | 1/1 LLM clusters |
| partial_score_partial_score_missed_19 | DOWNGRADED | 0.84 | 74 | 7/4 | 1/1 LLM clusters |
| interval_dp_state_error_4 | DOWNGRADED | 0.83 | 73.03 | 0/3 | 2/7 LLM clusters |
| greedy_partial_score_missed_1 | HYPOTHESIS | 0.82 | 67.37 | 0/0 | 1/1 LLM clusters |
| partial_score_model_error_20 | HYPOTHESIS | 0.82 | 65.66 | 0/0 | 1/1 LLM clusters |
| math_partial_score_missed_18 | DOWNGRADED | 0.8 | 64.72 | 2/6 | 1/1 LLM clusters |
| graph_model_error_37 | HYPOTHESIS | 0.73 | 54.7 | 0/0 | 0/6 LLM clusters |

## Precision Improvements Made For This Run

- Increased simulation cycles from 3 to 5 while keeping the 30-day goal available via `--days 30 --cycles 5`.
- Mock exam score growth now depends on progress ratio, not raw cycle count, reducing optimistic inflation.
- Untested weaknesses are no longer treated as misses.
- The report explicitly separates real evidence from simulated inference.
- Generated problems remain training drafts unless `problem-quality:all` can compile and stress-test them.

## Final Interpretation

Final simulated total is 312, readiness is 0.87. This means the simulated student is close to the target zone, but the system must not claim stable CSP-S first-prize readiness until real daily logs and real mock exams confirm the same trend.

## What To Do Next For Higher Precision

1. Replace `data/coach/training_attempt_log.json` with real student attempts.
2. Run at least 2 real four-problem mock exams and compare with `mock_exam_validation.json`.
3. Increase real LLM cluster diagnosis coverage from 5 to the top 30 clusters.
4. Install a C++17 compiler and rerun `pnpm problem-quality:all` so generated problems can move from TRAINING_DRAFT to PASSED_FOR_TRAINING.
5. Re-run `pnpm coach:all -- --days 30 --cycles 5` after every real feedback batch.

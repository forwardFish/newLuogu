# CSP-S target-score training route

Target score: 200
Weekly hours: 20

## Score Breakdown

| Slot | Target | Current estimate | Gap | Role | Priority |
|---|---:|---:|---:|---|---|
| T1 | 90 | 82 | 8 | Bottom-line score. T1 must be stable. | P0 |
| T2 | 70 | 56 | 14 | Main scoring zone. T2 modeling decides whether 200 is realistic. | P0 |
| T3 | 36 | 20 | 16 | Partial-score zone. Train 30/50/70 routes. | P1 |
| T4 | 4 | 0 | 4 | Strategy score. Take brute force and special properties without hurting T1/T2. | P2 |

## Training Ratio

- t1Ratio: 0.25
- t2Ratio: 0.4
- t3Ratio: 0.25
- t4Ratio: 0.03
- mockRatio: 0.1
- explanationRatio: 0.2
- reviewRatio: 0.2

## Route

- First protect T1 and T2. A 200-point route cannot tolerate unstable low-level mistakes.
- Then train T3 partial-score decomposition. The goal is executable 30/50/70 routes, not immediate full marks.
- Use T4 only as strategy training unless T1/T2 are already stable.
- Every week must include one CSP-S-style set to verify transfer from single-problem practice to exam scoring.

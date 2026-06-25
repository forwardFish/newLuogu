# Weekly CSP-S target-score mock review

Target score: 200

## Planned Set

- T1: P7913 廊桥分配 | target 90 | focus GREEDY.PROOF.EXCHANGE_ARGUMENT
- T2: P7076 动物园 | target 70 | focus GREEDY.PROOF.EXCHANGE_ARGUMENT
- T3: P5659 树上的数 | target 36 | focus PARTIAL_SCORE.SUBTASK_ANALYSIS
- T4: P5664 Emiya 家今天的饭 | target 4 | focus PARTIAL_SCORE.SUBTASK_ANALYSIS

## Fill After Exam

```json
{
  "date": "2026-07-02",
  "scores": {
    "t1": 0,
    "t2": 0,
    "t3": 0,
    "t4": 0,
    "total": 0
  },
  "timeUsage": {
    "t1": 0,
    "t2": 0,
    "t3": 0,
    "t4": 0
  },
  "review": {
    "t1Stable": false,
    "t2MainIssue": "",
    "t3PartialScore": "",
    "t4Strategy": "",
    "nextWeekFocus": []
  }
}
```

## Decision Rules

- If T1 < target, next week returns to T1 stability units.
- If T2 < target, prioritize modeling units before T3/T4 hard practice.
- If T3 has no valid partial-score route, prioritize PARTIAL_SCORE.SUBTASK_ANALYSIS.
- If total reaches target for 3-5 sets, raise the next target score or move toward first-prize safety line.

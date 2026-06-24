# 本地洛谷代码文件分析报告

生成时间：2026-06-23T09:46:21.347Z

## 1. 总览

- 代码文件：2345
- 题目数：829
- 已 AC 题目：614
- 未 AC/未知题目：215
- 平均每题提交次数：2.83
- 平均非空代码行数：125.05
- 静态风险文件数：1955

这份报告没有把全部源码直接交给模型读，而是先抽取 manifest、静态指标、题目时间线、算法模块和候选风险，再挑选深度复盘样本。这样能保留全量统计，同时把人工/LLM 深读集中在最值得看的代码上。

## 2. CSP-S 风险画像

- T1 稳定拿分能力：72.97
- T2 建模与转化能力：81.48
- T3 部分分策略：66.46
- T4 综合策略：71.53
- 综合分：73.11

- Debug iteration cost：medium。Average attempts per problem is 2.83.
- Implementation risk：high。1955/2281 files carry static risk flags.
- Complex code pressure：low。Average non-empty lines: 125.05, max brace depth: 55.
- Hard-problem partial scoring：medium。60 problems have partial-score submissions.

## 3. 算法模块分布

| 模块 | 文件数 | 题目数 | AC题目数 | 平均提交 | 代表题目 |
| --- | ---: | ---: | ---: | ---: | --- |
| math | 907 | 312 | 225 | 3.43 | U465842, U519362, P3585, P1075, P6691 |
| string | 506 | 187 | 130 | 3.44 | U465842, U519362, P3585, P6691, U467266 |
| graph | 332 | 138 | 91 | 3.28 | U465842, P6691, U467266, P2452, P3987 |
| dp | 272 | 101 | 76 | 3.38 | P8699, P1435, P12678, P2285, P1004 |
| greedy | 236 | 98 | 75 | 2.93 | P1955, U619605, U643929, P5740, P3913 |
| dfs_bfs | 218 | 92 | 70 | 3.14 | P6691, P8699, P1030, P2452, P1004 |
| search | 195 | 83 | 65 | 3.27 | P6691, P8699, P1030, P2452, P1004 |
| interval_dp | 199 | 79 | 60 | 4.19 | U467266, P8699, P1435, P1919, U463446 |
| binary_search | 148 | 57 | 41 | 3.61 | P1955, P3987, P1471, CF1927C, P1439 |
| tree | 79 | 38 | 26 | 3.39 | P6691, P8699, P3987, P3379, P1471 |
| dsu | 113 | 35 | 28 | 4.09 | P1955, P6691, P3379, P2820, P5836 |
| knapsack_dp | 56 | 24 | 21 | 3.04 | U643929, P1865, P1616, P1048, U328616 |

## 4. 高频静态风险

- RECURSION：1535
- ARRAY_INDEX_RISK：1013
- LARGE_GLOBAL_ARRAY：895
- DEFINE_INT_LONG_LONG：735
- PARTIAL_SCORE_CODE：566
- LONG_CODE：436
- POSSIBLE_INT_OVERFLOW：347
- MEMSET_SENTINEL：44
- LONG_LINE：41
- DEEP_LOOP_NESTING：9
- DEEP_BRACE_NESTING：6

## 5. 提交流程问题候选

- 多次失败后 AC：262
- 有 WA 后 AC：0
- 有 TLE 后 AC：0
- 有 RE 后 AC：0
- 疑似卡题：86
- 部分分题目：60

候选详情已经写入 `error_pattern_candidates.json`。其中 longCodeRisks=50，deepNestingRisks=15，integerRisks=50，arrayBoundaryRisks=50。

## 6. 建议优先复盘样本

优先顺序：高提交次数题目、多次失败后 AC、长期未 AC、长代码/深嵌套、各算法模块代表代码、最近提交代码。

最近提交样本：

- P8699 AC 100 2026-06-11T12:16:54.000Z：C:\LYH\Code\newLuogu\data\code\luogu-1024038-2026-06-23T03-23-15-197Z\codes\281483009_P8699_AC.cpp
- P8699 PC 30 2026-06-11T12:15:58.000Z：C:\LYH\Code\newLuogu\data\code\luogu-1024038-2026-06-23T03-23-15-197Z\codes\281482841_P8699_PC.cpp
- P8699 PC 50 2026-06-11T11:31:25.000Z：C:\LYH\Code\newLuogu\data\code\luogu-1024038-2026-06-23T03-23-15-197Z\codes\281475051_P8699_PC.cpp
- P8699 PC 40 2026-06-11T11:31:11.000Z：C:\LYH\Code\newLuogu\data\code\luogu-1024038-2026-06-23T03-23-15-197Z\codes\281475011_P8699_PC.cpp
- P8699 PC 40 2026-06-11T11:30:58.000Z：C:\LYH\Code\newLuogu\data\code\luogu-1024038-2026-06-23T03-23-15-197Z\codes\281474963_P8699_PC.cpp
- P8699 PC 40 2026-06-11T11:30:44.000Z：C:\LYH\Code\newLuogu\data\code\luogu-1024038-2026-06-23T03-23-15-197Z\codes\281474916_P8699_PC.cpp
- P8699 PC 40 2026-06-11T11:30:29.000Z：C:\LYH\Code\newLuogu\data\code\luogu-1024038-2026-06-23T03-23-15-197Z\codes\281474861_P8699_PC.cpp
- P8699 PC 40 2026-06-11T11:30:15.000Z：C:\LYH\Code\newLuogu\data\code\luogu-1024038-2026-06-23T03-23-15-197Z\codes\281474818_P8699_PC.cpp

完整样本清单见 `deep_review_samples.json`。

## 7. 训练建议

- Review high-attempt problems first and extract the first wrong assumption from each one.
- For partial-score problems, compare the accepted or best-score code against earlier code to identify missing cases.
- Create a small template-risk checklist: integer range, array boundary, initialization, recursion depth, and complexity proof.
- Use module representatives to build a personal template library, but keep each template tied to a verified problem.

## 8. 产物索引

- `submission_manifest.json`：本地代码清单与洛谷提交元数据
- `code_static_metrics.json`：每份代码的静态特征与风险标记
- `problem_code_timeline.json`：按题聚合的提交时间线
- `algorithm_module_stats.json`：算法模块识别与覆盖统计
- `error_pattern_candidates.json`：错误模式候选
- `deep_review_samples.json`：建议深度复盘样本
- `csp_s_risk_profile.json`：CSP-S 风险画像

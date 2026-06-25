# CSP-S first-prize target gap report

## 1. Target definition

- Target year: 2026
- Target province: UNKNOWN
- Explicit target score: 260
- Weekly training hours: 20
- Safe target score: 260
- Target-line confidence: 0.95
- Note: Explicit target score from --targetScore. Use this when the goal is a concrete score rather than a province-line estimate.

Important boundary: this program cannot mathematically guarantee a first prize. It guarantees a closed loop: benchmark -> diagnosis -> blind validation -> training -> re-evaluation. A first-prize claim is allowed only after real blind CSP-S evidence reaches the target line.

Problem recognition pipeline: Luogu pid is the primary key; every historical submission is grouped by problem id, then merged with code modules, score trajectory, static risks, weakness clusters, CSP-S past-paper mapping, and manual CSV review. If a pid or knowledge tag is uncertain, the conclusion must stay in NEEDS_BLIND_VALIDATION or NEEDS_MANUAL_CONFIRMATION.

## 2. Data reliability

- Past benchmark problems: 28
- Confirmed by manual review: 0
- Need manual confirmation: 28
- CSP-S past problems with your record: 6
- No-evidence abilities: 10

## 3. CSP-S 2019-2025 structure

| Year | T1 | T2 | T3 | T4 |
|---:|---|---|---|---|
| 2019 | P5657 格雷码 | P5658 括号树 | P5659 树上的数 | P5664 Emiya 家今天的饭 |
| 2020 | P7075 儒略日 | P7076 动物园 | P7077 函数调用 | P7078 贪吃蛇 |
| 2021 | P7913 廊桥分配 | P7914 括号序列 | P7915 回文 | P7916 交通规划 |
| 2022 | P8817 假期计划 | P8818 策略游戏 | P8819 星战 | P8820 数据传输 |
| 2023 | P9752 密码锁 | P9753 消消乐 | P9754 结构体 | P9755 种树 |
| 2024 | P11231 决斗 | P11232 超速检测 | P11233 染色 | P11234 擂台游戏 |
| 2025 | P14361 社团招新 | P14362 道路修复 | P14363 谐音替换 | P14364 员工招聘 |

## 4. Knowledge frequency matrix

- PARTIAL_SCORE.SUBTASK_ANALYSIS: 14
- GREEDY.PROOF.EXCHANGE_ARGUMENT: 11
- DP.GENERAL.STATE_TRANSITION: 7
- DATA_STRUCTURE.RANGE_QUERY.TEMPLATE_BOUNDARY: 6
- GRAPH.MODELING.GRAPH_ABSTRACTION: 6
- STRING.PATTERN.BOUNDARY: 5
- IMPLEMENTATION.INDEX_BOUNDARY: 4
- BASIC_ALGORITHM.BINARY_SEARCH.CHECK_MONOTONICITY: 3
- BASIC_ALGORITHM.SIMULATION_ENUMERATION.CASE_SPLIT: 3
- IMPLEMENTATION.INTEGER_OVERFLOW: 2
- MATH.COMBINATORICS.CORE: 2
- DP.INTERVAL.RECOGNIZE_STRUCTURE: 2
- MATH.INVARIANT.CORE: 2
- MATH.RECURRENCE.CORE: 1
- MATH.PERIODICITY.CORE: 1
- MATH.OVERFLOW_RANGE.CORE: 1
- DP.INTERVAL.INIT_AND_ORDER: 1
- SEARCH.DFS_BFS.PRUNING_AND_STATE: 1
- PROGRAMMING_BASICS.READING.CONSTRAINT_EXTRACTION: 1
- MATH.FORMULA_DERIVATION.CORE: 1

## 5. Your historical evidence coverage

- MATH.RECURRENCE.CORE: EXPOSED, score=0, evidence=1, CSP-past=1, blind=0
- IMPLEMENTATION.MULTITEST_CLEAR: NO_EVIDENCE, score=0, evidence=0, CSP-past=0, blind=0
- IMPLEMENTATION.IO_FORMAT: NO_EVIDENCE, score=0, evidence=0, CSP-past=0, blind=0
- IMPLEMENTATION.TEMPLATE_CORRECTNESS: NO_EVIDENCE, score=0, evidence=0, CSP-past=0, blind=0
- MATH.NUMBER_THEORY.CORE: NO_EVIDENCE, score=0, evidence=0, CSP-past=0, blind=0
- MATH.MODULAR.CORE: NO_EVIDENCE, score=0, evidence=0, CSP-past=0, blind=0
- MATH.GCD_FACTOR.CORE: NO_EVIDENCE, score=0, evidence=0, CSP-past=0, blind=0
- MATH.COUNTING.CORE: NO_EVIDENCE, score=0, evidence=0, CSP-past=0, blind=0
- MATH.CONSTRUCTION.CORE: NO_EVIDENCE, score=0, evidence=0, CSP-past=0, blind=0
- COMPREHENSIVE.EXAM_STRATEGY.TIME_ALLOCATION: NO_EVIDENCE, score=0, evidence=0, CSP-past=0, blind=0
- IMPLEMENTATION.STRESS_TEST: NO_EVIDENCE, score=0, evidence=0, CSP-past=0, blind=0
- PARTIAL_SCORE.SUBTASK_ANALYSIS: EXPOSED, score=0.12, evidence=84, CSP-past=1, blind=0
- MATH.COMBINATORICS.CORE: UNSTABLE, score=0.35, evidence=2, CSP-past=0, blind=0
- PROGRAMMING_BASICS.READING.CONSTRAINT_EXTRACTION: UNSTABLE, score=0.35, evidence=1, CSP-past=0, blind=0
- MATH.PERIODICITY.CORE: UNSTABLE, score=0.35, evidence=1, CSP-past=0, blind=0

## 6. CSP-S past-problem completion

- 2019 T1 P5657: UNKNOWN, score=0, blind=false
- 2019 T3 P5659: PC, score=25, blind=false
- 2024 T1 P11231: AC, score=100, blind=false
- 2024 T2 P11232: UNKNOWN, score=0, blind=false
- 2025 T1 P14361: AC, score=100, blind=false
- 2025 T2 P14362: AC, score=100, blind=false


## 7. T1/T2/T3/T4 ability judgment

- T1: abilities=10, expected related loss=23.06, role=STABLE_SCORE
- T2: abilities=13, expected related loss=36.11, role=MODELING_TRANSFER
- T3: abilities=9, expected related loss=42.47, role=PARTIAL_SCORE_AND_CORE_ALGORITHM
- T4: abilities=8, expected related loss=37.69, role=STRATEGY_AND_ADVANCED_PARTIAL_SCORE

## 8. Confirmed weaknesses

- None yet. Current evidence still needs CSP-S blind validation.

## 9. Weaknesses needing validation

- PARTIAL_SCORE.SUBTASK_ANALYSIS: EXPOSED, expected loss 14.53, evidence 59/1/0, action: 先用 T3/T4 真题盲测验证 PARTIAL_SCORE.SUBTASK_ANALYSIS，候选：2019T3P5659, 2019T4P5664, 2020T3P7077。未盲测前不要把它当成已确认短板。
- GREEDY.PROOF.EXCHANGE_ARGUMENT: TRANSFERABLE, expected loss 7.34, evidence 98/4/0, action: 先用 T3/T2/T4/T1 真题盲测验证 GREEDY.PROOF.EXCHANGE_ARGUMENT，候选：2019T3P5659, 2020T2P7076, 2020T4P7078。未盲测前不要把它当成已确认短板。
- IMPLEMENTATION.INDEX_BOUNDARY: UNSTABLE, expected loss 4.96, evidence 650/1/0, action: 先用 T1/T3/T2 真题盲测验证 IMPLEMENTATION.INDEX_BOUNDARY，候选：2020T1P7075, 2023T1P9752, 2023T3P9754。未盲测前不要把它当成已确认短板。
- GRAPH.MODELING.GRAPH_ABSTRACTION: BASIC, expected loss 4.46, evidence 138/2/0, action: 先用 T3/T4/T1/T2 真题盲测验证 GRAPH.MODELING.GRAPH_ABSTRACTION，候选：2019T3P5659, 2020T3P7077, 2021T4P7916。未盲测前不要把它当成已确认短板。

## 10. Watch or downgraded assumptions

- DP.GENERAL.STATE_TRANSITION: BASIC, expected loss 3.82, evidence 108/0/0, action: 先用 T4/T3/T2 真题盲测验证 DP.GENERAL.STATE_TRANSITION，候选：2019T4P5664, 2020T3P7077, 2022T4P8820。未盲测前不要把它当成已确认短板。
- STRING.PATTERN.BOUNDARY: BASIC, expected loss 3.53, evidence 187/0/0, action: 先用 T2/T3 真题盲测验证 STRING.PATTERN.BOUNDARY，候选：2019T2P5658, 2021T2P7914, 2021T3P7915。未盲测前不要把它当成已确认短板。
- DATA_STRUCTURE.RANGE_QUERY.TEMPLATE_BOUNDARY: BASIC, expected loss 3.45, evidence 14/0/0, action: 先用 T2/T4/T3 真题盲测验证 DATA_STRUCTURE.RANGE_QUERY.TEMPLATE_BOUNDARY，候选：2019T2P5658, 2020T4P7078, 2022T2P8818。未盲测前不要把它当成已确认短板。
- BASIC_ALGORITHM.BINARY_SEARCH.CHECK_MONOTONICITY: BASIC, expected loss 2.39, evidence 57/1/0, action: 先用 T1/T4/T2 真题盲测验证 BASIC_ALGORITHM.BINARY_SEARCH.CHECK_MONOTONICITY，候选：2020T1P7075, 2023T4P9755, 2024T2P11232。未盲测前不要把它当成已确认短板。
- IMPLEMENTATION.INTEGER_OVERFLOW: BASIC, expected loss 1.77, evidence 452/1/0, action: 先用 T1/T2 真题盲测验证 IMPLEMENTATION.INTEGER_OVERFLOW，候选：2019T1P5657, 2020T2P7076。未盲测前不要把它当成已确认短板。
- DP.INTERVAL.RECOGNIZE_STRUCTURE: BASIC, expected loss 1.38, evidence 79/0/0, action: 先用 T2/T4 真题盲测验证 DP.INTERVAL.RECOGNIZE_STRUCTURE，候选：2021T2P7914, 2021T4P7916。未盲测前不要把它当成已确认短板。
- MATH.FORMULA_DERIVATION.CORE: BASIC, expected loss 0.84, evidence 59/1/0, action: 先用 T2 真题盲测验证 MATH.FORMULA_DERIVATION.CORE，候选：2024T2P11232。未盲测前不要把它当成已确认短板。
- MATH.OVERFLOW_RANGE.CORE: BASIC, expected loss 0.83, evidence 253/0/0, action: 先用 T2 真题盲测验证 MATH.OVERFLOW_RANGE.CORE，候选：2020T2P7076。未盲测前不要把它当成已确认短板。

## 11. Expected score loss ranking

| Rank | Ability | Level | Loss | Confidence | Impact |
|---:|---|---|---:|---:|---|
| 1 | PARTIAL_SCORE.SUBTASK_ANALYSIS | EXPOSED | 14.53 | 0.54 | CRITICAL |
| 2 | GREEDY.PROOF.EXCHANGE_ARGUMENT | TRANSFERABLE | 7.34 | 0.54 | HIGH |
| 3 | IMPLEMENTATION.INDEX_BOUNDARY | UNSTABLE | 4.96 | 0.59 | MEDIUM |
| 4 | GRAPH.MODELING.GRAPH_ABSTRACTION | BASIC | 4.46 | 0.54 | MEDIUM |
| 5 | DP.GENERAL.STATE_TRANSITION | BASIC | 3.82 | 0.54 | MEDIUM |
| 6 | STRING.PATTERN.BOUNDARY | BASIC | 3.53 | 0.52 | MEDIUM |
| 7 | DATA_STRUCTURE.RANGE_QUERY.TEMPLATE_BOUNDARY | BASIC | 3.45 | 0.54 | MEDIUM |
| 8 | BASIC_ALGORITHM.BINARY_SEARCH.CHECK_MONOTONICITY | BASIC | 2.39 | 0.59 | LOW |
| 9 | IMPLEMENTATION.INTEGER_OVERFLOW | BASIC | 1.77 | 0.51 | LOW |
| 10 | DP.INTERVAL.RECOGNIZE_STRUCTURE | BASIC | 1.38 | 0.59 | LOW |
| 11 | MATH.FORMULA_DERIVATION.CORE | BASIC | 0.84 | 0.59 | LOW |
| 12 | MATH.OVERFLOW_RANGE.CORE | BASIC | 0.83 | 0.59 | LOW |

## 12. Gap to first-prize safety line

- Critical/high expected loss: 21.87
- Risk reduction target before claiming target-score readiness: 11.47
- Readiness proxy: 0.92
- Verdict: Close to target, but still requires real blind CSP-S past-paper validation.

## 13. Next diagnostic past problems

- 2025 T4 P14364 员工招聘: validate PARTIAL_SCORE.SUBTASK_ANALYSIS; time 110 min.
- 2024 T4 P11234 擂台游戏: validate GREEDY.PROOF.EXCHANGE_ARGUMENT; time 110 min.
- 2023 T3 P9754 结构体: validate IMPLEMENTATION.INDEX_BOUNDARY; time 110 min.
- 2021 T4 P7916 交通规划: validate GRAPH.MODELING.GRAPH_ABSTRACTION; time 110 min.
- 2022 T4 P8820 数据传输: validate DP.GENERAL.STATE_TRANSITION; time 110 min.
- 2025 T3 P14363 谐音替换: validate STRING.PATTERN.BOUNDARY; time 110 min.
- 2020 T4 P7078 贪吃蛇: validate DATA_STRUCTURE.RANGE_QUERY.TEMPLATE_BOUNDARY; time 110 min.
- 2023 T4 P9755 种树: validate BASIC_ALGORITHM.BINARY_SEARCH.CHECK_MONOTONICITY; time 110 min.

## 14. Next-stage training plan

1. 先用 T3/T4 真题盲测验证 PARTIAL_SCORE.SUBTASK_ANALYSIS，候选：2019T3P5659, 2019T4P5664, 2020T3P7077。未盲测前不要把它当成已确认短板。
2. 先用 T3/T2/T4/T1 真题盲测验证 GREEDY.PROOF.EXCHANGE_ARGUMENT，候选：2019T3P5659, 2020T2P7076, 2020T4P7078。未盲测前不要把它当成已确认短板。
3. 先用 T1/T3/T2 真题盲测验证 IMPLEMENTATION.INDEX_BOUNDARY，候选：2020T1P7075, 2023T1P9752, 2023T3P9754。未盲测前不要把它当成已确认短板。
4. 先用 T3/T4/T1/T2 真题盲测验证 GRAPH.MODELING.GRAPH_ABSTRACTION，候选：2019T3P5659, 2020T3P7077, 2021T4P7916。未盲测前不要把它当成已确认短板。
5. 先用 T4/T3/T2 真题盲测验证 DP.GENERAL.STATE_TRANSITION，候选：2019T4P5664, 2020T3P7077, 2022T4P8820。未盲测前不要把它当成已确认短板。
6. 先用 T2/T3 真题盲测验证 STRING.PATTERN.BOUNDARY，候选：2019T2P5658, 2021T2P7914, 2021T3P7915。未盲测前不要把它当成已确认短板。

## Appendix. Ability catalog used

- PROGRAMMING_BASICS.READING.CONSTRAINT_EXTRACTION: Extract objective, constraints and hidden cases
- IMPLEMENTATION.INDEX_BOUNDARY: Index and boundary safety
- IMPLEMENTATION.INITIALIZATION: Initialization and reset
- IMPLEMENTATION.INTEGER_OVERFLOW: Integer overflow and range estimate
- IMPLEMENTATION.MULTITEST_CLEAR: Multi-test clearing
- IMPLEMENTATION.RECURSION_STACK: Recursion depth and stack safety
- IMPLEMENTATION.IO_FORMAT: Input/output format stability
- IMPLEMENTATION.TEMPLATE_CORRECTNESS: Template correctness
- IMPLEMENTATION.DEBUG_TIMEOUT: Debugging time control
- BASIC_ALGORITHM.SIMULATION_ENUMERATION.CASE_SPLIT: Correct case split and enumeration
- BASIC_ALGORITHM.BINARY_SEARCH.CHECK_MONOTONICITY: Prove check monotonicity and boundary
- DATA_STRUCTURE.DSU.SET_MEANING: Define set meaning and merge condition
- DATA_STRUCTURE.RANGE_QUERY.TEMPLATE_BOUNDARY: Range data-structure template and boundary
- GRAPH.MODELING.GRAPH_ABSTRACTION: Turn problem relation into graph states and edges
- GRAPH.SHORTEST_PATH.STATE_AND_INIT: Shortest-path state and initialization
- DP.GENERAL.STATE_TRANSITION: State, transition, init and order
- DP.INTERVAL.RECOGNIZE_STRUCTURE: Recognize interval substructure
- DP.INTERVAL.INIT_AND_ORDER: Initialization and length-order enumeration
- DP.STATE_COMPRESSION.MASK_DESIGN: Mask meaning, transition and pruning
- MATH.NUMBER_THEORY.CORE: Number theory core ability
- MATH.MODULAR.CORE: Modular arithmetic core ability
- MATH.GCD_FACTOR.CORE: GCD and factorization core ability
- MATH.COMBINATORICS.CORE: Combinatorics core ability
- MATH.COUNTING.CORE: Counting core ability
- MATH.RECURRENCE.CORE: Recurrence core ability
- MATH.FORMULA_DERIVATION.CORE: Formula derivation core ability
- MATH.INVARIANT.CORE: Invariant core ability
- MATH.CONSTRUCTION.CORE: Construction core ability
- MATH.PERIODICITY.CORE: Periodicity core ability
- MATH.OVERFLOW_RANGE.CORE: Overflow and range core ability
- MATH.MODEL_TO_DP.CORE: Math model to DP core ability
- STRING.PATTERN.BOUNDARY: String boundary and pattern model
- SEARCH.DFS_BFS.PRUNING_AND_STATE: Search state and pruning
- GREEDY.PROOF.EXCHANGE_ARGUMENT: Exchange argument and counterexample search
- COMPREHENSIVE.EXAM_STRATEGY.TIME_ALLOCATION: Contest time allocation and stop-loss
- PARTIAL_SCORE.SUBTASK_ANALYSIS: Subtask and partial-score decomposition
- IMPLEMENTATION.STRESS_TEST: Brute-force stress testing
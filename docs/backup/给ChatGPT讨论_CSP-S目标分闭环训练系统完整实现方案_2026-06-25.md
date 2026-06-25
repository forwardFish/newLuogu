# 给 ChatGPT 讨论：CSP-S 目标分闭环训练系统完整实现方案

> 项目目录：`C:\LYH\Code\newLuogu`  
> 当前目标：准确识别我的洛谷题目和代码表现，生成题目级诊断、知识点差距、目标分差距、训练计划，并在训练中不断纠偏，最终逼近 CSP-S 一等奖或明确目标分。  
> 讨论重点：这不是普通刷题推荐器，而是一套“目标分驱动的竞赛训练闭环系统”。

---

## 1. 一句话目标

我要做的系统应该做到：

```text
准确识别我做过的每一道题
  -> 分析每道题暴露出的真实问题
  -> 映射到 CSP-S 知识点和历年真题能力要求
  -> 计算我离目标分还差在哪里、差多少分
  -> 制定下一阶段训练计划
  -> 通过新的盲测和训练日志不断纠偏
  -> 直到真实模拟赛或真题盲测稳定达到目标分
```

这里的“目标”可以是：

```text
目标 A：CSP-S 一等奖
目标 B：明确目标分，例如 240 / 260 / 280
目标 C：某省一等奖安全线 + 安全垫
```

系统不能空口承诺“一定一等奖”，但必须能持续回答：

```text
我现在距离目标分还差什么？
这些差距有多少证据？
如果不补，会在 CSP-S 哪类题上丢多少分？
下一轮最该练什么？
练完以后怎么验证真的提升了？
```

---

## 2. 当前项目已有基础

当前项目已经有一些重要基础：

```text
data/crawl/
  洛谷提交记录采集数据

data/code/
  洛谷提交代码文件

data/analysis/
  代码静态分析、题目时间线、模块识别、综合报告

data/diagnosis/
  题目特征向量、问题簇、DeepSeek evidence packs、弱点报告

data/problem-bank/
  题目归类、训练任务、诊断题生成

data/coach/
  模拟训练闭环、每日计划、周复诊、训练状态

data/csp-s-benchmark/
  CSP-S 目标基准库、知识能力树、真题库、目标分差距报告
```

已经实现的关键脚本包括：

```text
scripts/analyze-codes.ts
scripts/detect-algorithm-modules.ts
scripts/diagnosis/build-diagnosis-system.ts
scripts/problem-bank/build-problem-engine.ts
scripts/coach/build-coach-decision-system.ts
scripts/csp-benchmark/build-csp-benchmark-system.ts
```

新增的目标分系统命令：

```bash
pnpm csp:all -- --targetScore 260 --weeklyHours 20
```

生成报告：

```text
data/csp-s-benchmark/first_prize_gap_report.md
```

---

## 3. 系统必须解决的核心问题

### 3.1 准确识别“我做过的题”

系统必须以洛谷题号作为主键：

```text
luoguPid = P5657 / P7075 / P9754 / P11234 / P14364 ...
```

每一道题需要合并这些信息：

```text
1. 题号
2. 题目标题
3. 提交次数
4. 每次提交结果
5. 每次提交得分
6. 首次提交时间
7. 最后提交时间
8. 是否最终 AC
9. 最高得分
10. 代码文件路径
11. 每个版本代码静态特征
12. 算法模块识别结果
13. 风险标签
14. 是否属于 CSP-S 历年真题
15. 是否看过题解
16. 是否盲测
17. 是否独立完成
```

不能只看“最后 AC 了没有”。例如：

```text
16 次提交后 AC
从 0 -> 40 -> 30 -> 50 -> 100
```

这说明它不是“掌握”，而是：

```text
存在建模、边界、状态或调试过程问题
```

所以题目识别必须先聚合成题目级时间线：

```json
{
  "problemPid": "P8699",
  "attemptCount": 16,
  "solved": true,
  "bestScore": 100,
  "scoreTrajectory": [0, 40, 40, 30, 50, 100],
  "scorePattern": "PARTIAL_TO_AC",
  "resultPattern": "MULTI_FAIL_THEN_AC"
}
```

---

### 3.2 准确识别“这道题暴露了什么问题”

每道题至少要分析 7 层：

```text
1. 结果层
   AC / 部分分 / 0 分 / 多次提交 / 长期未 AC

2. 分数轨迹层
   一发 AC、快速修复、多次失败后 AC、部分分卡住、长期 0 分

3. 代码静态层
   行数、循环深度、递归、全局数组、long long、数组下标、memset、模板风险

4. 算法模块层
   DP、区间 DP、图论、并查集、二分、数学、字符串、贪心、线段树等

5. 错误类型层
   MODEL_ERROR
   STATE_ERROR
   TRANSITION_ERROR
   INIT_ERROR
   BOUNDARY_ERROR
   INDEX_ERROR
   OVERFLOW_ERROR
   COMPLEXITY_ERROR
   PARTIAL_SCORE_MISSED
   DEBUG_TIMEOUT

6. 竞赛阶段层
   读题
   建模
   部分分拆解
   算法设计
   实现
   调试
   复盘

7. 证据可信度层
   真实 CSP-S 盲测 > 模拟赛 > 未做过新题 > 历史 AC > 看题解后 AC > 规则推断
```

一个题目最终要输出类似：

```json
{
  "problemPid": "P8699",
  "mainDiagnosis": "区间/DP 类状态设计与边界顺序不稳定",
  "evidence": [
    "提交 16 次才 AC",
    "多次卡在 30-50 分",
    "代码包含数组下标和递归风险",
    "分数轨迹属于 PARTIAL_TO_AC"
  ],
  "candidateAbilities": [
    "DP.GENERAL.STATE_TRANSITION",
    "DP.INTERVAL.INIT_AND_ORDER",
    "IMPLEMENTATION.INDEX_BOUNDARY",
    "PARTIAL_SCORE.SUBTASK_ANALYSIS"
  ],
  "confidence": 0.68,
  "status": "NEEDS_BLIND_VALIDATION"
}
```

---

## 4. 知识点体系不能太粗

不能只写：

```text
数学不好
DP 不好
图论不好
```

必须拆成可训练、可验证的三级能力点。

### 4.1 一级领域

```text
PROGRAMMING_BASICS
BASIC_ALGORITHM
DATA_STRUCTURE
GRAPH
DP
MATH
STRING
SEARCH
GREEDY
COMPREHENSIVE
NON_KNOWLEDGE_SKILL
```

### 4.2 三级能力点示例

DP：

```text
DP.GENERAL.STATE_TRANSITION
DP.INTERVAL.RECOGNIZE_STRUCTURE
DP.INTERVAL.INIT_AND_ORDER
DP.STATE_COMPRESSION.MASK_DESIGN
```

数学：

```text
MATH.NUMBER_THEORY.CORE
MATH.MODULAR.CORE
MATH.GCD_FACTOR.CORE
MATH.COMBINATORICS.CORE
MATH.COUNTING.CORE
MATH.RECURRENCE.CORE
MATH.FORMULA_DERIVATION.CORE
MATH.INVARIANT.CORE
MATH.CONSTRUCTION.CORE
MATH.PERIODICITY.CORE
MATH.OVERFLOW_RANGE.CORE
MATH.MODEL_TO_DP.CORE
```

实现能力：

```text
IMPLEMENTATION.INDEX_BOUNDARY
IMPLEMENTATION.INITIALIZATION
IMPLEMENTATION.INTEGER_OVERFLOW
IMPLEMENTATION.MULTITEST_CLEAR
IMPLEMENTATION.RECURSION_STACK
IMPLEMENTATION.IO_FORMAT
IMPLEMENTATION.TEMPLATE_CORRECTNESS
IMPLEMENTATION.DEBUG_TIMEOUT
IMPLEMENTATION.STRESS_TEST
```

非知识点能力：

```text
PARTIAL_SCORE.SUBTASK_ANALYSIS
COMPREHENSIVE.EXAM_STRATEGY.TIME_ALLOCATION
```

每个能力点必须包含：

```json
{
  "abilityId": "DP.INTERVAL.INIT_AND_ORDER",
  "name": "区间 DP 初始化与枚举顺序",
  "observableBehaviors": [
    "能写出 len=1 或空区间初始化",
    "能按区间长度枚举",
    "能解释为什么不能随意枚举 l 和 r"
  ],
  "errorTypes": [
    "INIT_ERROR",
    "BOUNDARY_ERROR",
    "ENUMERATION_ORDER_ERROR"
  ],
  "trainingMethods": [
    "经典区间 DP 重做",
    "变式题迁移",
    "提交前初始化清单"
  ],
  "verifyMethods": [
    "同类盲测提交次数 <= 2",
    "能在编码前写出状态、初始化、枚举顺序"
  ]
}
```

---

## 5. CSP-S 历年真题基准库

为了围绕 CSP-S 一等奖或目标分训练，系统不能只分析我的洛谷历史题。

必须建立 CSP-S 真题基准库：

```text
2019-2025
每年 T1 / T2 / T3 / T4
每题 100 分
共 28 道
```

每道真题需要字段：

```json
{
  "year": 2024,
  "slot": "T3",
  "luoguPid": "P11233",
  "title": "染色",
  "fullScore": 100,
  "slotRole": {
    "role": "PARTIAL_SCORE_AND_CORE_ALGORITHM",
    "firstPrizeTargetScore": {
      "conservative": 35,
      "normal": 55,
      "strong": 80
    }
  },
  "knowledgeMapping": {
    "primary": ["DP", "DATA_STRUCTURE"],
    "secondary": ["DP.GENERAL", "DATA_STRUCTURE.RANGE_QUERY"],
    "thirdLevelAbilities": [
      "DP.GENERAL.STATE_TRANSITION",
      "DATA_STRUCTURE.RANGE_QUERY.TEMPLATE_BOUNDARY",
      "PARTIAL_SCORE.SUBTASK_ANALYSIS"
    ]
  },
  "partialScoreStructure": [
    {
      "score": 20,
      "condition": "小数据",
      "expectedMethod": "暴力"
    },
    {
      "score": 50,
      "condition": "特殊性质",
      "expectedMethod": "简化模型"
    },
    {
      "score": 100,
      "condition": "完整数据",
      "expectedMethod": "正解"
    }
  ],
  "classification": {
    "status": "NEEDS_MANUAL_CONFIRMATION",
    "confidence": 0.62
  }
}
```

注意：

```text
真题顺序、题号、知识点、部分分结构必须允许人工确认。
如果没确认，不能当成最终真值。
```

---

## 6. 证据权重设计

不同证据不能同等对待。

建议权重：

| 证据类型 | 权重 |
|---|---:|
| CSP-S 真题盲测独立完成 | 1.00 |
| 四题模拟赛中完成 | 0.95 |
| 未做过同类新题独立完成 | 0.80 |
| 历史题一发 AC | 0.65 |
| 历史题 2-3 次提交 AC | 0.50 |
| 历史题多次提交后 AC | 0.35 |
| 历史题部分分卡住 | 0.30 |
| 看题解后 AC | 0.15 |
| 规则推断但未验证 | 0.10 |

掌握等级：

```text
NO_EVIDENCE      没证据
EXPOSED          已暴露明显问题
UNSTABLE         不稳定
BASIC            基础可用
TRANSFERABLE     可迁移
CONTEST_STABLE   考场稳定
```

示例：

```json
{
  "abilityId": "PARTIAL_SCORE.SUBTASK_ANALYSIS",
  "masteryLevel": "EXPOSED",
  "evidenceCount": 84,
  "historicalProblemCount": 59,
  "cspPastProblemCount": 1,
  "blindTestCount": 0,
  "masteryScore": 0.12,
  "confidence": 0.54
}
```

---

## 7. 目标分差距模型

系统必须支持显式目标分：

```bash
pnpm csp:all -- --targetScore 260 --weeklyHours 20
```

也支持：

```text
目标省份一等奖线 + 安全垫
```

预计失分公式：

```text
expectedLoss =
  cspFrequency
  × slotImpact
  × scoreWeight
  × failureProbability
  × unrecoveredScoreRatio
  × firstPrizeSensitivity
  × confidence
```

解释：

```text
cspFrequency
  该能力点在 2019-2025 真题中出现频率

slotImpact
  T1/T2/T3/T4 对一等奖的影响权重

scoreWeight
  一等奖目标选手在该题位应该拿的分

failureProbability
  根据当前掌握度估计失败概率

unrecoveredScoreRatio
  一旦失败，预计无法补回的比例

firstPrizeSensitivity
  对目标分或一等奖线的敏感度

confidence
  证据可信度
```

输出示例：

```json
{
  "abilityId": "PARTIAL_SCORE.SUBTASK_ANALYSIS",
  "masteryLevel": "EXPOSED",
  "expectedLoss": {
    "value": 14.53,
    "confidenceInterval": [7.99, 22.52],
    "confidence": 0.54
  },
  "firstPrizeImpact": "CRITICAL",
  "status": "NEEDS_BLIND_VALIDATION",
  "recommendedAction": "先用 T3/T4 真题盲测验证部分分拆解能力"
}
```

---

## 8. 训练计划生成逻辑

训练计划不能只是“多刷 DP”。

它应该由目标分缺口决定。

### 8.1 输入

```text
目标分：260
每周训练时间：20 小时
当前预计高风险失分：21.87
需要压降的风险：11.47
高风险能力点：
  PARTIAL_SCORE.SUBTASK_ANALYSIS
  GREEDY.PROOF.EXCHANGE_ARGUMENT
  IMPLEMENTATION.INDEX_BOUNDARY
  GRAPH.MODELING.GRAPH_ABSTRACTION
  DP.GENERAL.STATE_TRANSITION
```

### 8.2 输出

```text
本周目标：
  不是刷满多少题，而是验证并压降最高预计失分能力点

训练结构：
  30% 真题盲测
  25% 错题复盘
  25% 同知识点新题迁移
  10% 对拍/边界专项
  10% 四题制时间分配训练
```

### 8.3 每日任务格式

```json
{
  "day": 1,
  "focusAbility": "PARTIAL_SCORE.SUBTASK_ANALYSIS",
  "task": {
    "type": "CSP_PAST_PROBLEM_BLIND_TEST",
    "problem": "P14364 员工招聘",
    "timeLimitMinutes": 110
  },
  "beforeCodingRequiredOutput": [
    "题意复述",
    "约束提取",
    "30/50/70/100 分路线",
    "预计复杂度",
    "实现风险清单"
  ],
  "afterCodingRequiredOutput": [
    "实际得分",
    "提交次数",
    "失败阶段",
    "错误类型",
    "是否与系统预测一致"
  ]
}
```

---

## 9. 持续纠偏机制

系统必须每次训练后重新判断。

### 9.1 每次训练后记录

```csv
date,problemPid,isBlindTest,hasSeenSolution,result,score,timeMinutes,submissionCount,errorTypes,failedStage,reviewNote
2026-06-25,P14364,true,false,PC,45,110,2,"PARTIAL_SCORE_MISSED;MODEL_ERROR",partialScorePlanning,"只写了正解方向，没有先写暴力"
```

### 9.2 纠偏规则

如果系统预测会在部分分拆解失败，实际也失败：

```text
命中
提高该弱点置信度
继续安排同类但不同模型的训练
```

如果系统预测会失败，但实际稳定 AC：

```text
未命中
降低该弱点优先级
检查历史题分类是否误判
```

如果出现新问题：

```text
新增弱点候选
下周计划加入验证任务
```

如果连续 5 道盲测通过：

```text
该能力点可从 BASIC / TRANSFERABLE 升级到 CONTEST_STABLE
训练比例下降
```

### 9.3 命中率标准

| 预测命中率 | 结论 |
|---:|---|
| ≥70% | 确认薄弱点 |
| 50%-70% | 中等可信 |
| 30%-50% | 弱假设 |
| <30% | 大概率误判 |
| 未盲测 | 不允许下最终结论 |

---

## 10. 最终报告应该长什么样

最终报告必须包含：

```text
1. 目标定义
   目标分 / 目标省份 / 每周训练时间 / 安全线

2. 数据可信度说明
   哪些是真实提交
   哪些是历史推断
   哪些是真题盲测
   哪些还需要人工确认

3. CSP-S 2019-2025 真题结构
   年份、T1/T2/T3/T4、题号、题名、知识点

4. 知识点频率矩阵
   哪些能力点在 CSP-S 高频出现

5. 我的历史题覆盖
   每个能力点有多少题证据

6. 我的 CSP-S 真题完成记录
   是否盲测、是否看题解、得分、提交次数

7. T1/T2/T3/T4 能力判断
   不是泛泛地说强弱，而是预计在哪个题位丢多少分

8. 已确认薄弱点
   必须有盲测命中证据

9. 待验证薄弱点
   有历史证据，但缺真题盲测

10. 降权或误判
   分类可能错误的弱点

11. 预计失分排序
   abilityId、掌握等级、预计失分、影响等级

12. 与目标分差距
   当前预计高风险失分
   需要压降多少

13. 下一轮诊断题
   用哪些真题验证哪些能力

14. 下一阶段训练计划
   每周、每日、验收标准
```

---

## 11. 页面展示建议

页面不用花哨，优先让用户看懂：

```text
1. 目标分卡片
   目标分、当前风险、需要压降风险、数据可信度

2. 最高预计失分能力点
   排名前 10

3. T1/T2/T3/T4 风险
   哪个题位最危险

4. 下一轮盲测题
   题号、题名、验证能力、限时、记录入口

5. 最近纠偏记录
   系统预测 vs 实际结果

6. 知识点热力图
   CSP-S 高频 × 我的掌握度
```

页面最重要的不是好看，而是让用户能回答：

```text
今天练什么？
为什么练这个？
练完怎么判断有用？
这个训练和目标分有什么关系？
```

---

## 12. 数据文件设计

### 12.1 真题库

```text
data/csp-s-benchmark/past_problems_2019_2025.json
```

### 12.2 知识能力树

```text
data/csp-s-benchmark/knowledge_ability_tree.json
```

### 12.3 学生真题记录

```text
data/csp-s-benchmark/student_past_problem_records.csv
```

### 12.4 人工确认真题索引

```text
data/csp-s-benchmark/manual_past_problem_index.csv
```

### 12.5 人工确认知识点

```text
data/csp-s-benchmark/manual_knowledge_review.csv
```

### 12.6 省一等奖线或目标分

```text
data/csp-s-benchmark/province_first_prize_lines.csv
```

### 12.7 能力证据

```text
data/csp-s-benchmark/student_skill_evidence.json
```

### 12.8 掌握度

```text
data/csp-s-benchmark/skill_mastery.json
```

### 12.9 预计失分

```text
data/csp-s-benchmark/expected_score_loss.json
```

### 12.10 最终报告

```text
data/csp-s-benchmark/first_prize_gap_report.md
data/csp-s-benchmark/first_prize_gap_report.json
```

---

## 13. DeepSeek / 大模型应该怎么用

大模型不能直接决定结论。

它应该做：

```text
1. 阅读 evidence pack
2. 帮忙解释代码版本变化
3. 判断可能的错误阶段
4. 拆分知识点
5. 给出训练建议
6. 输出置信度和不确定点
```

它不应该做：

```text
1. 凭空判断题目属于哪个 CSP-S 真题
2. 凭空宣布我已经达到一等奖
3. 把历史 AC 当作考场稳定
4. 没有盲测证据就确认短板
```

大模型输出必须受证据约束：

```json
{
  "diagnosis": "部分分拆解不足",
  "evidenceUsed": [
    "P8699 16 次提交",
    "多次卡 30-50 分",
    "出现 PARTIAL_SCORE_CODE"
  ],
  "uncertainty": [
    "题目标签可能误判为区间 DP",
    "缺少真题盲测记录"
  ],
  "confidence": 0.62,
  "requiredValidation": [
    "选择 3 道 T3/T4 真题盲测"
  ]
}
```

---

## 14. 验收标准

### 14.1 题目识别

```text
1. 能识别所有洛谷 pid
2. 能聚合每题所有提交
3. 能找到对应代码文件
4. 能输出每题提交轨迹
5. 能标记题目识别置信度
```

### 14.2 题目级分析

```text
1. 每题有 scorePattern
2. 每题有 resultPattern
3. 每题有 candidateErrorTypes
4. 每题有 codeModules
5. 每题有 riskFlags
6. 每题有能力点映射
7. 每题有是否需要盲测验证
```

### 14.3 目标分分析

```text
1. 支持 --targetScore
2. 支持省一等奖线 + 安全垫
3. 输出预计失分排序
4. 输出高风险失分总量
5. 输出需要压降的风险值
```

### 14.4 训练计划

```text
1. 每个任务对应一个能力点
2. 每个任务说明为什么练
3. 每个任务说明怎么验证
4. 每周能根据新反馈重新排序
5. 未盲测的结论不能升级为确认短板
```

---

## 15. 推荐开发阶段

### 阶段 1：题目识别可靠化

目标：

```text
所有洛谷提交都能准确聚合到题目级
```

输出：

```text
problem_code_timeline.json
problem_feature_vectors.json
```

### 阶段 2：题目级诊断

目标：

```text
每道题有明确 scorePattern、错误类型、代码风险、模块识别
```

输出：

```text
problem_diagnosis.json
problem_diagnosis.md
```

### 阶段 3：CSP-S 基准库

目标：

```text
建立 2019-2025 真题库和知识点能力树
```

输出：

```text
knowledge_ability_tree.json
past_problems_2019_2025.json
```

### 阶段 4：目标分差距报告

目标：

```text
按 targetScore 计算预计失分和训练优先级
```

输出：

```text
first_prize_gap_report.md
expected_score_loss.json
```

### 阶段 5：训练闭环

目标：

```text
盲测 -> 记录 -> 纠偏 -> 重新计划
```

输出：

```text
daily_plan/
weekly_reports/
student_skill_evidence.json
skill_mastery.json
```

### 阶段 6：页面展示

目标：

```text
让用户能看到目标分、当前差距、下一步练什么、为什么练、练完怎么判断
```

---

## 16. 与 ChatGPT 讨论的问题

我想让 ChatGPT 帮我重点讨论：

```text
1. 这套证据权重是否合理？
2. expectedLoss 公式是否还需要加入真实模拟赛分数？
3. 如何避免算法模块误判？
4. 如何区分“知识点不会”和“考场策略不好”？
5. 如何设计 T1/T2/T3/T4 的目标分模型？
6. 如何判断一个能力点已经从 UNSTABLE 升级到 CONTEST_STABLE？
7. 如何设计每周训练计划，让它真的服务目标分？
8. 如何让大模型参与诊断，但不让它凭空下结论？
9. 如何设计页面，让训练计划和纠偏过程清晰可见？
10. 如何把省一等奖线、目标分、真题难度结合起来？
```

---

## 17. 可以直接发给 ChatGPT 的 Prompt

```text
我正在开发一个 CSP-S 目标分闭环训练系统。

我的核心要求是：
1. 准确识别我做过的洛谷题目；
2. 对每一道题做详细诊断；
3. 把诊断结果映射到 CSP-S 知识点和历年真题能力要求；
4. 根据目标分或一等奖线计算预计失分；
5. 生成下一阶段训练计划；
6. 通过真题盲测和训练日志不断纠偏；
7. 最终让训练围绕 CSP-S 一等奖或明确目标分展开。

当前系统已有：
- 洛谷提交记录和代码文件；
- 题目级提交轨迹；
- 代码静态分析；
- 算法模块识别；
- DeepSeek evidence packs；
- 弱点报告；
- CSP-S 2019-2025 真题基准库；
- 知识能力树；
- expectedLoss 预计失分模型；
- first_prize_gap_report.md。

我希望你从算法、数据结构、证据权重、报告结构、训练闭环、页面展示、纠偏机制几个角度，帮我评审这套方案：
1. 哪些地方可能不准确？
2. 哪些地方容易误判？
3. 目标分模型怎么改更科学？
4. 如何设计训练计划才能真正提高 CSP-S 分数？
5. 如何判断用户已经接近一等奖水平？
6. 如何用大模型增强诊断，但避免大模型胡乱判断？

请给出一套可落地的改进建议。
```

---

## 18. 最关键原则

这套系统必须始终坚持：

```text
没有题目级证据，不下结论。
没有真题盲测，不确认短板。
没有目标分映射，不安排训练优先级。
没有训练反馈，不宣布提升。
没有连续稳定表现，不说接近一等奖。
```

最终追求的不是“报告写得好看”，而是：

```text
每一次训练都能解释：
为什么练这道题？
它对应哪个知识点？
它预计能减少多少失分？
练完以后如何判断有没有进步？
下一轮计划为什么要调整？
```


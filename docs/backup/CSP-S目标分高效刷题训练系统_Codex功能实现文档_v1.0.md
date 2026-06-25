# CSP-S 目标分高效刷题训练系统 · Codex 功能实现文档 v1.0

> 项目：AI 信奥训练教练  
> 开发对象：Codex  
> 当前目标：实现一套以 **CSP-S 目标分 200 分 / 一等奖线** 为导向的高效刷题训练系统。  
> 系统定位：不是报告系统，不是泛泛分析系统，而是“讲解 + 刷题 + 过关 + 复盘 + 套题验证”的训练系统。  
> 核心任务：通过有目标的刷题、AI 分层讲解、错题复盘和套题验证，让学生更快理解并逐步达到 CSP-S 200 分目标。  

---

# 0. 一句话目标

本系统要做到：

```text
目标分 200
  ↓
拆分 T1/T2/T3/T4 得分路径
  ↓
拆分必须掌握的知识点和能力点
  ↓
生成每天的高效刷题任务
  ↓
每道题配套做题前讲解、分级提示、提交后讲解、复盘
  ↓
每个知识点设置过关标准
  ↓
过关后进入下一组题
  ↓
每周通过 CSP-S 套题验证是否接近 200 分
```

本系统不是：

```text
1. 只生成一份分析报告
2. 只推荐一堆题目
3. 只输出泛泛训练计划
4. 只让大模型讲完整题解
```

本系统是：

```text
面向 CSP-S 目标分的高效刷题训练引擎
```

---

# 1. 核心训练思想

## 1.1 目标分拆解

如果目标是 CSP-S 200 分，四题得分策略建议：

```text
T1：80-100 分，必须稳定拿分
T2：60-90 分，主要提分区
T3：30-60 分，训练部分分
T4：0-30 分，能拿则拿，不影响前面
```

因此系统刷题优先级：

```text
第一优先级：T1 稳定性
第二优先级：T2 建模和常见算法
第三优先级：T3 部分分拆解
第四优先级：T4 策略识别和暴力/特殊性质
```

---

## 1.2 刷题不是随机刷，而是按“关卡”刷

每个知识点都要变成训练关卡：

```text
知识点讲解
  ↓
基础题
  ↓
标准题
  ↓
同构变式题
  ↓
CSP-S 真题 / 类真题
  ↓
过关判定
```

比如二分答案：

```text
第 1 关：理解答案单调性
第 2 关：会写 check 函数
第 3 关：会处理 l/r/mid 边界
第 4 关：做 2 道洛谷标准题
第 5 关：做 1 道变式题
第 6 关：做 1 道 CSP-S 类似题
```

---

# 2. 系统核心模块

系统需要实现 8 个模块：

```text
1. Goal Score Engine：目标分拆解
2. Knowledge Unit Engine：知识点训练单元
3. Problem Ladder Engine：题目阶梯
4. Explanation Engine：AI 分层讲解
5. Hint Engine：卡住时分级提示
6. Mastery Engine：知识点过关判断
7. Daily Training Engine：每日刷题计划
8. Mock Exam Engine：CSP-S 套题验证
```

---

# 3. Goal Score Engine：目标分拆解

## 3.1 目标

根据目标分生成训练策略。

输入：

```json
{
  "targetScore": 200,
  "weeklyHours": 20,
  "currentProfile": {
    "t1": 75,
    "t2": 65,
    "t3": 35,
    "t4": 10
  }
}
```

输出：

```text
data/training-goal/goal_score_plan.json
data/training-goal/goal_score_plan.md
```

## 3.2 goal_score_plan.json

```json
{
  "targetScore": 200,
  "scoreBreakdown": {
    "t1": {
      "targetRange": [80, 100],
      "role": "保底分",
      "trainingPriority": "P0"
    },
    "t2": {
      "targetRange": [60, 90],
      "role": "主要提分区",
      "trainingPriority": "P0"
    },
    "t3": {
      "targetRange": [30, 60],
      "role": "部分分区",
      "trainingPriority": "P1"
    },
    "t4": {
      "targetRange": [0, 30],
      "role": "策略拿分区",
      "trainingPriority": "P2"
    }
  },
  "trainingStrategy": {
    "t1Ratio": 0.25,
    "t2Ratio": 0.40,
    "t3Ratio": 0.25,
    "mockRatio": 0.10
  }
}
```

---

# 4. Knowledge Unit Engine：知识点训练单元

## 4.1 目标

把 CSP-S 知识点变成可讲解、可刷题、可过关的训练单元。

输出：

```text
data/learning-units/learning_units.json
data/learning-units/learning_units.md
```

## 4.2 learning_units.json 结构

```json
{
  "unitId": "BINARY_SEARCH.ANSWER_CHECK",
  "title": "二分答案 check 单调性",
  "targetScoreRole": ["T2", "T3"],
  "goal": "能识别答案单调性，写出正确 check 函数并处理边界。",
  "prerequisites": [
    "基础二分",
    "贪心扫描",
    "复杂度估计"
  ],
  "conceptExplanation": {
    "short": "二分答案不是二分位置，而是二分一个可能的答案，并用 check 判断这个答案是否可行。",
    "keyQuestions": [
      "答案是什么？",
      "check(x) 表示什么？",
      "x 变大时，check 更容易还是更难成立？",
      "l/r 边界是什么？"
    ]
  },
  "commonMistakes": [
    "check 函数含义写反",
    "单调性方向判断错误",
    "l/r 边界错误",
    "mid 更新死循环",
    "答案范围估计错误"
  ],
  "passCriteria": [
    "连续 2 道二分答案题提交次数 <= 2",
    "能写出 check 的自然语言含义",
    "能解释单调性",
    "不再出现边界收缩错误"
  ]
}
```

---

## 4.3 初始必须支持的训练单元

### T1 稳定性单元

```text
T1.SIMULATION
T1.ENUMERATION
T1.SORTING
T1.PREFIX_SUM
T1.SIMPLE_GREEDY
T1.STRING_BASIC
T1.MATH_BASIC
IMPLEMENTATION.INDEX_BOUNDARY
IMPLEMENTATION.INTEGER_OVERFLOW
IMPLEMENTATION.MULTITEST_CLEAR
```

### T2 建模单元

```text
BINARY_SEARCH.ANSWER_CHECK
DP.LINEAR.STATE_TRANSITION
DP.KNAPSACK.BASIC
DP.INTERVAL.INIT_AND_ORDER
GRAPH.BASIC_MODELING
DSU.SET_MEANING
SHORTEST_PATH.BASIC
GREEDY.PROOF_EXCHANGE
SEARCH.PRUNING_BASIC
MATH.MODELING_BASIC
```

### T3 部分分单元

```text
PARTIAL_SCORE.SUBTASK_ANALYSIS
PARTIAL_SCORE.BRUTE_FORCE
PARTIAL_SCORE.SPECIAL_PROPERTY
PARTIAL_SCORE.DATA_RANGE_TO_ALGO
```

### T4 策略单元

```text
CONTEST.QUESTION_ORDER
CONTEST.TIME_ALLOCATION
CONTEST.STOP_LOSS
CONTEST.PARTIAL_SCORE_FIRST
```

---

# 5. Problem Ladder Engine：题目阶梯

## 5.1 目标

为每个知识点生成题目阶梯，而不是随便给题。

输出：

```text
data/problem-ladders/problem_ladders.json
data/problem-ladders/problem_ladders.md
```

## 5.2 题目阶梯结构

```json
{
  "unitId": "BINARY_SEARCH.ANSWER_CHECK",
  "ladder": [
    {
      "level": 1,
      "name": "讲解题",
      "taskType": "EXPLANATION_PROBLEM",
      "purpose": "理解 check 单调性",
      "problemSource": "SELECT_EXISTING",
      "difficulty": "入门/普及-"
    },
    {
      "level": 2,
      "name": "基础题",
      "taskType": "PRACTICE_BASIC",
      "purpose": "能写标准二分答案",
      "problemSource": "SELECT_EXISTING",
      "difficulty": "普及"
    },
    {
      "level": 3,
      "name": "标准题",
      "taskType": "PRACTICE_STANDARD",
      "purpose": "稳定处理边界",
      "problemSource": "SELECT_EXISTING",
      "difficulty": "普及+/提高"
    },
    {
      "level": 4,
      "name": "同构变式题",
      "taskType": "MUTATION",
      "purpose": "验证迁移能力",
      "problemSource": "MUTATE_EXISTING"
    },
    {
      "level": 5,
      "name": "CSP-S 真题/类真题",
      "taskType": "CSP_STYLE_PROBLEM",
      "purpose": "验证考试能力",
      "problemSource": "SELECT_EXISTING"
    }
  ]
}
```

## 5.3 题目来源

题目来源分三类：

```text
1. SELECT_EXISTING
   从洛谷、CSP-S 真题、已有题库选择成熟题。

2. MUTATE_EXISTING
   基于已有题生成同构变式题，验证迁移。

3. GENERATE_DIAGNOSTIC
   生成原创诊断题，用于暴露某个弱点。
```

默认比例：

```text
SELECT_EXISTING：60%-70%
MUTATE_EXISTING：20%
GENERATE_DIAGNOSTIC：10%-20%
```

---

# 6. Explanation Engine：AI 分层讲解

## 6.1 目标

每道训练题必须有配套讲解，但不能一开始直接给完整题解。

输出：

```text
data/explanations/problem_explanations.json
```

---

## 6.2 讲解分四层

### 1. 做题前讲解

```json
{
  "stage": "PRE_SOLVE",
  "content": {
    "thisProblemTrains": "二分答案 check 单调性",
    "beforeCodingQuestions": [
      "答案是什么？",
      "check(x) 表示什么？",
      "check 是否单调？",
      "l/r 边界是什么？",
      "复杂度是多少？"
    ],
    "doNotReveal": [
      "完整代码",
      "完整题解"
    ]
  }
}
```

### 2. 卡住时提示

分 3 级：

```json
{
  "hints": [
    {
      "level": 1,
      "type": "DIRECTION",
      "content": "考虑答案是否具有单调性。"
    },
    {
      "level": 2,
      "type": "MODEL",
      "content": "可以二分答案 x，然后判断 x 是否可行。"
    },
    {
      "level": 3,
      "type": "KEY_STEP",
      "content": "check(x) 可以贪心扫描一遍。"
    }
  ]
}
```

### 3. 提交后错因讲解

```json
{
  "stage": "AFTER_SUBMISSION",
  "result": "WA",
  "diagnosis": "check 函数含义写反，导致二分边界收缩方向错误。",
  "errorTypes": [
    "MODEL_ERROR",
    "BOUNDARY_ERROR"
  ],
  "fixSuggestion": [
    "重新用自然语言写 check(x) 的含义",
    "用小样例验证 check 的 true/false 变化",
    "再确定 l/r 的移动方向"
  ]
}
```

### 4. 复盘讲解

```json
{
  "stage": "REVIEW",
  "summary": {
    "keyIdea": "二分答案的核心是定义可判定的答案 x。",
    "studentMistake": "没有先定义 check 的语义。",
    "nextTimeChecklist": [
      "先写答案范围",
      "再写 check 含义",
      "再判断单调性",
      "最后写二分模板"
    ],
    "needRedo": true
  }
}
```

---

# 7. Hint Engine：卡住时分级提示

## 7.1 目标

让学生卡住时先获得少量提示，而不是直接看完整题解。

## 7.2 提示等级

```text
HINT_1_DIRECTION：提示方向
HINT_2_MODEL：提示模型
HINT_3_KEY_STEP：提示关键步骤
HINT_4_SOLUTION_OUTLINE：简要解法
HINT_5_FULL_SOLUTION：完整题解
```

## 7.3 记录提示使用

每次提示都要记录：

```json
{
  "problemPid": "Pxxxx",
  "hintLevelUsed": 2,
  "usedAtMinute": 25,
  "beforeSubmission": true
}
```

提示使用会影响 mastery 评价：

```text
完全独立 AC > 使用 Hint 1 AC > 使用 Hint 3 AC > 看完整题解 AC
```

---

# 8. Mastery Engine：知识点过关判断

## 8.1 目标

判断一个知识点是否已经过关。

输出：

```text
data/mastery/ability_mastery.json
```

## 8.2 mastery 状态

```text
NOT_STARTED
LEARNING
PRACTICING
UNSTABLE
PASSED_BASIC
PASSED_TRANSFER
CONTEST_READY
```

## 8.3 过关规则示例

```json
{
  "unitId": "BINARY_SEARCH.ANSWER_CHECK",
  "passRules": {
    "PASSED_BASIC": [
      "完成 2 道基础题",
      "提交次数 <= 2",
      "能写出 check 含义"
    ],
    "PASSED_TRANSFER": [
      "完成 1 道变式题",
      "没有出现边界错误",
      "能解释单调性"
    ],
    "CONTEST_READY": [
      "完成 1 道 CSP-S 类题",
      "限时内 AC 或拿到目标分",
      "不使用完整题解"
    ]
  }
}
```

---

# 9. Daily Training Engine：每日刷题计划

## 9.1 目标

每天生成一个训练单元，而不是一堆随机题。

输出：

```text
data/training/daily_training_plan.json
data/training/daily_training_plan.md
```

## 9.2 每日训练计划结构

```json
{
  "date": "2026-06-25",
  "targetScore": 200,
  "todayGoal": "T2 二分答案 check 单调性",
  "whyToday": [
    "目标 200 分中 T2 是主要提分区",
    "历史二分题提交次数偏高",
    "二分答案常见于 T2/T3"
  ],
  "tasks": [
    {
      "order": 1,
      "type": "CONCEPT_EXPLANATION",
      "durationMinutes": 10,
      "contentId": "BINARY_SEARCH.ANSWER_CHECK"
    },
    {
      "order": 2,
      "type": "PRACTICE_BASIC",
      "problemPid": "Pxxxx",
      "durationMinutes": 35,
      "goal": "写出 check 函数"
    },
    {
      "order": 3,
      "type": "PRACTICE_STANDARD",
      "problemPid": "Pyyyy",
      "durationMinutes": 60,
      "goal": "处理边界"
    },
    {
      "order": 4,
      "type": "MUTATION",
      "problemId": "mut_binary_search_001",
      "durationMinutes": 45,
      "goal": "验证迁移能力"
    },
    {
      "order": 5,
      "type": "REVIEW",
      "durationMinutes": 20
    }
  ],
  "passCriteria": [
    "至少完成 2 道题",
    "提交次数 <= 2",
    "能写出 check 含义",
    "无边界错误"
  ]
}
```

---

# 10. Training Log：训练记录

每道题必须记录：

```json
{
  "date": "2026-06-25",
  "unitId": "BINARY_SEARCH.ANSWER_CHECK",
  "problemPid": "Pxxxx",
  "taskType": "PRACTICE_STANDARD",
  "result": "AC",
  "score": 100,
  "timeMinutes": 45,
  "submissionCount": 2,
  "hintLevelUsed": 1,
  "hasSeenSolution": false,
  "errorTypes": [],
  "failedStage": null,
  "studentSummary": "check(x) 表示是否能在 x 限制内完成。",
  "needRedo": false
}
```

文件：

```text
data/training/training_log.json
```

---

# 11. Mock Exam Engine：套题验证

## 11.1 目标

每周用套题验证是否接近 200 分。

输出：

```text
data/mock-exam/mock_exam_plan.json
data/mock-exam/mock_exam_review.md
```

## 11.2 套题记录

```json
{
  "date": "2026-06-30",
  "targetScore": 200,
  "examSource": "CSP-S past paper / mixed set",
  "scores": {
    "t1": 90,
    "t2": 65,
    "t3": 35,
    "t4": 10,
    "total": 200
  },
  "timeUsage": {
    "t1": 35,
    "t2": 70,
    "t3": 80,
    "t4": 40
  },
  "review": {
    "t1Stable": true,
    "t2MainIssue": "二分边界",
    "t3PartialScore": "写出 30 分暴力",
    "t4Strategy": "未投入过多时间",
    "nextWeekFocus": [
      "BINARY_SEARCH.ANSWER_CHECK",
      "PARTIAL_SCORE.SUBTASK_ANALYSIS"
    ]
  }
}
```

---

# 12. Select / Mutate / Generate 实现

## 12.1 Select：从题库选题

输入：

```text
knowledge unit
目标分
学生当前 mastery
题库标签
历史做题记录
```

输出：

```json
{
  "unitId": "BINARY_SEARCH.ANSWER_CHECK",
  "selectedProblems": [
    {
      "problemPid": "Pxxxx",
      "reason": "基础二分答案题，用于训练 check 含义。",
      "level": "basic"
    }
  ]
}
```

---

## 12.2 Mutate：同构变式题

要求：

```text
不能换皮。
必须改变状态定义、输出目标、数据范围、约束或特殊性质。
```

输出：

```json
{
  "mutationId": "mut_binary_search_001",
  "baseProblemPid": "Pxxxx",
  "unitId": "BINARY_SEARCH.ANSWER_CHECK",
  "mutationGoal": "改变 check 的单调方向，验证是否真正理解。",
  "statementDraft": "",
  "solutionOutline": "",
  "verifyMethod": "学生必须重新定义 check 函数。"
}
```

---

## 12.3 Generate：原创诊断题

必须包含：

```text
题面
输入输出
数据范围
样例
标准解
暴力解
数据生成器
对拍方案
测试点设计
```

状态：

```text
DRAFT_NOT_USABLE
LLM_GENERATED_NEEDS_REVIEW
PASSED_FOR_TRAINING
```

---

# 13. 200 分训练路线

## 阶段 1：T1 稳定性，7-10 天

目标：

```text
T1 稳拿 80-100
```

训练：

```text
模拟
枚举
排序
前缀和
简单贪心
字符串
边界
long long
```

过关：

```text
10 道 T1 类题，一次 AC 率 >= 70%
平均用时 <= 40 分钟
没有低级错误连续复发
```

---

## 阶段 2：T2 建模，20 天

目标：

```text
T2 稳拿 60-90
```

训练：

```text
二分
DP
并查集
图论
贪心
数学建模
搜索
```

每个模块走：

```text
讲解 → 基础题 → 标准题 → 变式题 → 真题类题
```

过关：

```text
每个核心模块至少 3 道达标题
提交次数 <= 2
能讲出模型
```

---

## 阶段 3：T3 部分分，15-20 天

目标：

```text
不会正解也拿 30-60
```

训练：

```text
读题后先写 30/50/70 分方案
小数据暴力
特殊性质
弱化约束
简化模型
```

过关：

```text
5 道 T3/T4 难题中，至少 3 道能写出有效部分分方案
```

---

## 阶段 4：每周套题验证

目标：

```text
把单题能力变成 200 分考试能力
```

达标：

```text
连续 3-5 套达到 200+
T1/T2 不崩
T3 有稳定部分分
```

---

# 14. Codex 开发任务

## 14.1 新增脚本

```json
{
  "scripts": {
    "train:goal": "tsx scripts/training/build-goal-score-plan.ts",
    "train:units": "tsx scripts/training/build-learning-units.ts",
    "train:ladders": "tsx scripts/training/build-problem-ladders.ts",
    "train:explain": "tsx scripts/training/build-explanations.ts",
    "train:daily": "tsx scripts/training/generate-daily-training.ts",
    "train:log": "tsx scripts/training/record-training-log.ts",
    "train:mastery": "tsx scripts/training/update-mastery.ts",
    "train:mock": "tsx scripts/training/build-mock-exam.ts",
    "train:all": "tsx scripts/training/build-target-score-training-system.ts"
  }
}
```

---

## 14.2 必须实现文件

```text
scripts/training/build-goal-score-plan.ts
scripts/training/build-learning-units.ts
scripts/training/build-problem-ladders.ts
scripts/training/build-explanations.ts
scripts/training/generate-daily-training.ts
scripts/training/record-training-log.ts
scripts/training/update-mastery.ts
scripts/training/build-mock-exam.ts
scripts/training/build-target-score-training-system.ts
```

---

# 15. 输出文件汇总

```text
data/training-goal/goal_score_plan.json
data/training-goal/goal_score_plan.md

data/learning-units/learning_units.json
data/learning-units/learning_units.md

data/problem-ladders/problem_ladders.json
data/problem-ladders/problem_ladders.md

data/explanations/problem_explanations.json

data/training/daily_training_plan.json
data/training/daily_training_plan.md
data/training/training_log.json

data/mastery/ability_mastery.json

data/mock-exam/mock_exam_plan.json
data/mock-exam/mock_exam_review.md
```

---

# 16. 验收标准

## 16.1 功能验收

```text
1. 能根据 targetScore=200 生成目标分拆解
2. 能生成核心知识点训练单元
3. 每个训练单元有讲解、题目阶梯、过关标准
4. 每天能生成训练单元，而不是随机题单
5. 每题有做题前讲解、分级提示、提交后讲解、复盘
6. 能记录提示使用、提交次数、错误类型、是否看题解
7. 能判断知识点是否过关
8. 能每周生成套题训练和复盘
```

## 16.2 质量验收

```text
1. 不允许只输出“多刷题”
2. 不允许只给一堆题号
3. 每道题必须说明训练目的
4. 每道题必须有做题前问题
5. 每道题必须有卡住提示
6. 每道题必须有提交后错因讲解
7. 每个知识点必须有过关标准
8. 每周必须用套题验证是否接近 200 分
```

---

# 17. 给 Codex 的最终指令

```text
请实现 CSP-S 目标分高效刷题训练系统。系统目标不是生成分析报告，而是围绕 targetScore=200，拆分 T1/T2/T3/T4 得分路径，生成知识点训练单元、题目阶梯、AI 分层讲解、每日刷题计划、训练日志、知识点过关判断和每周套题验证。每个知识点都要通过“讲解 → 基础题 → 标准题 → 变式题 → 真题类题 → 过关判定”的方式训练。每道题必须有做题前讲解、分级提示、提交后错因讲解和复盘。系统最终要帮助学生通过一系列高效刷题和讲解，稳定达到 CSP-S 200 分目标。
```

---

# 18. 最终判断

本系统的核心不是：

```text
报告
分析
题单
```

而是：

```text
目标 200 分
→ 知识点关卡
→ AI 讲解
→ 分层刷题
→ 错因复盘
→ 过关判定
→ 套题验证
```

一句话：

```text
这是一个以 CSP-S 200 分为目标的“高效刷题 + AI 讲解 + 知识点过关”系统。
```

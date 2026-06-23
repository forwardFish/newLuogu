# CSP-S 一等奖训练闭环系统 · 最终可开发需求文档 v2.0

> 项目：AI 信奥训练教练  
> 开发对象：Codex  
> 当前阶段：基于 `data/analysis/` 的历史代码分析结果，开发“训练计划生成 + 训练记录 + 复盘调整 + 模拟赛验证”的闭环系统。  
> 核心目标：把历史做题/代码分析结果转化为训练计划，并通过训练记录、复盘、调整和模拟赛验证，持续逼近 CSP-S 一等奖稳定区间。  
> 重要边界：系统不能承诺 100% 一定拿 CSP-S 一等奖；系统要做的是把训练过程变成可执行、可记录、可复盘、可调整、可验证的闭环。

---

# 0. 系统最终定位

本系统不是：

```text
刷题工具
题单生成器
AI 题解器
只会写训练计划的文本生成器
```

本系统是：

```text
基于历史代码与提交行为的 CSP-S 一等奖训练闭环引擎
```

唯一核心闭环：

```text
诊断
  ↓
出题
  ↓
训练
  ↓
记录
  ↓
复盘
  ↓
调整
  ↓
模拟赛验证
  ↓
重新诊断
```

系统最终要回答：

```text
1. 当前水平到底在哪里？
2. 为什么当前短板是这些？
3. 接下来应该练什么？
4. 每道题为什么现在该做？
5. 做完后暴露了什么问题？
6. 明天/下周计划是否应该调整？
7. 模拟赛结果是否证明训练有效？
8. 是否逐步接近 CSP-S 一等奖稳定区间？
```

---

# 1. 开发阶段划分

## 1.1 当前阶段：7 天闭环验证版

第一版不要直接做完整商业系统，也不要直接做复杂 UI。

第一版只实现：

```text
1. 读取 data/analysis/ 已有分析结果
2. 生成训练画像 training_profile.json
3. 生成训练优先级 training_priority.json
4. 生成 7 天训练计划
5. 生成训练记录模板 training_progress_log.json
6. 支持用户手动填写训练记录
7. 生成第 1 周复盘报告
8. 生成训练闭环验证文件
```

第一版目标：

```text
验证“诊断 → 出题 → 训练 → 记录 → 复盘 → 调整 → 模拟赛验证”是否真实闭环。
```

## 1.2 第二阶段：30 天训练计划版

7 天闭环验证通过后，再扩展到：

```text
1. 30 天训练计划
2. 每周复盘
3. 每周动态调整
4. 模拟赛趋势分析
5. 一等奖稳定区间判断
```

---

# 2. 不能承诺 100% 一定一等奖

系统不能写：

```text
刷完 30 天保证 CSP-S 一等奖
```

正确目标：

```text
通过 30 / 60 / 90 天结构化训练，让学生逐步进入 CSP-S 一等奖稳定区间。
```

不能保证的原因：

```text
比赛当天题目风格不可控
省份或地区分数线不可控
临场状态不可控
读题失误不可完全避免
时间分配可能失误
评测数据强度不可控
比赛心理因素不可控
```

系统能保证的是训练过程：

```text
训练目标明确
每日任务明确
每题训练目的明确
每题结果可记录
每周可复盘
未达标可调整
达标可验证
模拟赛可追踪
```

---

# 3. CSP-S 一等奖稳定区间定义

系统不能只用“刷题数量”判断是否接近一等奖。

必须用以下指标判断：

```text
1. T1/T2 正确率 >= 90%
2. T1 平均用时 <= 35 分钟
3. T2 平均用时 <= 60 分钟
4. T3 至少稳定拿 30 到 60 分
5. T4 至少能识别可拿分子任务
6. 四题模拟赛总分 >= 目标省份一等奖线 + 20 分安全垫
7. 连续 5 场模拟赛达到目标
8. 平均提交次数下降
9. 一次 AC 率提高
10. 高提交次数题减少
11. 低级错误数量下降
```

如果用户没有配置省份线，系统使用默认目标：

```text
四题模拟赛目标分：200+
T1 目标：90+
T2 目标：70+
T3 目标：30-60
T4 目标：能识别暴力/特殊性质/部分分子任务
```

用户可配置：

```json
{
  "province": "福建",
  "targetFirstPrizeLine": 180,
  "safetyMargin": 20,
  "targetMockScore": 200
}
```

---

# 4. 输入文件

系统必须读取：

```text
data/analysis/submission_manifest.json
data/analysis/code_static_metrics.json
data/analysis/problem_code_timeline.json
data/analysis/algorithm_module_stats.json
data/analysis/error_pattern_candidates.json
data/analysis/deep_review_samples.json
data/analysis/csp_s_risk_profile.json
data/analysis/final_code_analysis_report.md
```

这些文件的作用：

| 文件 | 用途 |
|---|---|
| submission_manifest.json | 每份代码对应哪道题、结果、时间、语言 |
| code_static_metrics.json | 代码稳定性、实现风险、编码习惯 |
| problem_code_timeline.json | 每道题提交轨迹、一次 AC、多次失败后 AC |
| algorithm_module_stats.json | 算法模块覆盖与模块表现 |
| error_pattern_candidates.json | 高频错误候选 |
| deep_review_samples.json | 高价值复盘题 |
| csp_s_risk_profile.json | T1/T2/T3/T4 当前风险画像 |
| final_code_analysis_report.md | 可读版历史分析摘要 |

---

# 5. 输出文件

当前阶段输出目录：

```text
data/training/
```

如果目录不存在，程序必须自动创建。

7 天验证版必须生成：

```text
data/training/training_profile.json
data/training/training_priority.json
data/training/training_task_plan_7d.json
data/training/training_task_plan_7d.md
data/training/training_progress_log.json
data/training/mock_exam_log.json
data/training/training_review_report_week1.md
data/training/training_loop_verification.json
data/training/readiness_checklist.json
data/training/readiness_report.md
```

30 天扩展版后续生成：

```text
data/training/training_task_plan_30d.json
data/training/training_task_plan_30d.md
data/training/weekly_review_report_week1.md
data/training/weekly_review_report_week2.md
data/training/weekly_review_report_week3.md
data/training/weekly_review_report_week4.md
data/training/readiness_report_30d.md
```

---

# 6. 系统模块设计

系统拆成 8 个核心模块：

```text
1. Profile Engine：能力画像生成
2. Priority Engine：训练优先级生成
3. Planning Engine：训练计划生成
4. Log Engine：训练记录模板与记录读取
5. Review Engine：周复盘生成
6. Adjust Engine：动态调整规则
7. Mock Engine：模拟赛记录与验证
8. Readiness Engine：一等奖稳定区间判断
```

---

# 7. Profile Engine：能力画像生成

## 7.1 输出文件

```text
data/training/training_profile.json
```

## 7.2 必须读取

```text
csp_s_risk_profile.json
problem_code_timeline.json
algorithm_module_stats.json
error_pattern_candidates.json
deep_review_samples.json
```

## 7.3 training_profile.json 结构

```json
{
  "generatedAt": "2026-06-23T00:00:00.000Z",
  "goal": "CSP-S_FIRST_PRIZE",
  "currentScores": {
    "t1Stability": 75.51,
    "t2Modeling": 81.48,
    "t3PartialScore": 66.46,
    "t4Strategy": 71.53,
    "overall": 73.75
  },
  "currentDiagnosis": {
    "summary": "题型覆盖较广，T2 建模较强，但 T1 实现稳定性和 T3 部分分策略需要加强。",
    "strengths": [],
    "weaknesses": [],
    "mainRisks": []
  },
  "moduleProfile": {
    "dp": {
      "problemCount": 101,
      "acProblemCount": 76,
      "avgAttempts": 3.38,
      "priority": "high",
      "reason": "覆盖不少，但平均提交次数偏高，需要提升稳定转化。"
    }
  },
  "highValueReviewProblems": [],
  "trainingFocus": {
    "t1": [],
    "t2": [],
    "t3": [],
    "t4": []
  }
}
```

## 7.4 T1 能力画像规则

T1 衡量：

```text
基础题和中等偏简单题是否稳定拿分
会做的题是否容易因实现细节丢分
比赛开局是否能快速保底
```

T1 主要来自：

```text
静态风险比例
一次 AC 比例
疑似卡题比例
基础题/中档题稳定性
数组、边界、long long、初始化风险
```

如果以下任意成立，T1 训练优先级提高：

```text
T1 < 82
ARRAY_INDEX_RISK 高
DEFINE_INT_LONG_LONG 高
RECURSION 风险高
平均提交次数 > 2.5
一次 AC 题比例偏低
```

默认判断：

```text
T1 当前 75.51，未达到稳定一等奖区间。
后续必须安排 T1 稳定性专项。
```

## 7.5 T2 能力画像规则

T2 衡量：

```text
中档题建模转化能力
能否从题意转为状态、图、判定函数或贪心结构
能否把常见算法模块稳定写出来
```

T2 主要来自：

```text
DP 覆盖
图论覆盖
数学/字符串/贪心/二分覆盖
中档题 AC 情况
模块平均提交次数
```

如果覆盖较广但平均提交次数偏高，说明：

```text
不是缺少算法接触量，而是需要提高稳定转化和实现质量。
```

默认判断：

```text
T2 当前 81.48，是相对优势，但还需要降低提交次数，提高一次或少量提交通过率。
```

## 7.6 T3 能力画像规则

T3 衡量：

```text
面对难题时，不会满分正解也能拿部分分
是否能根据数据范围拆子任务
是否能写暴力、特殊性质、弱化版本
```

T3 主要来自：

```text
部分分题目数量
高提交次数题
未 AC / UNKNOWN 题
难题是否能拿部分分
是否有从 30 分到 60 分的训练记录
```

如果以下任意成立，T3 是短板：

```text
T3 < 75
部分分题目多但没有系统复盘
卡题多
未 AC / UNKNOWN 题多
```

默认判断：

```text
T3 当前 66.46，是最需要专项补强的能力。
后续必须加入“难题拆分 + 部分分策略训练”。
```

## 7.7 T4 能力画像规则

T4 衡量：

```text
正式模拟赛中的综合表现
开题顺序
时间分配
调试节奏
弃题判断
部分分取舍
```

T4 主要来自：

```text
平均提交次数
卡题比例
多次失败后 AC 数量
模拟赛记录
开题顺序与时间分配记录
```

如果没有模拟赛记录，T4 只能做初步估计：

```text
没有模拟赛过程数据时，不能断言综合策略稳定。
```


---

# 8. Priority Engine：训练优先级生成

## 8.1 输出文件

```text
data/training/training_priority.json
```

## 8.2 默认训练比例

```json
{
  "priorityWeights": {
    "t1Stability": 0.30,
    "t2Modeling": 0.35,
    "t3PartialScore": 0.20,
    "t4Strategy": 0.15
  },
  "oldProblemReviewWeight": 0.25,
  "newProblemWeight": 0.60,
  "mockExamWeight": 0.15
}
```

## 8.3 动态权重规则

如果：

```text
T1 < 80
```

则：

```text
旧题复盘比例提高到 35%
基础稳定性训练提高
减少难题比例
```

如果：

```text
T3 < 70
```

则：

```text
部分分难题提高到 25%
每周至少安排 1 天部分分拆解
```

如果：

```text
平均提交次数 > 3
```

则：

```text
增加旧题重写
增加提交前检查清单
减少超难新题
```

## 8.4 当前推荐模块权重

默认：

```json
{
  "moduleWeights": {
    "interval_dp": 1.4,
    "dsu": 1.4,
    "binary_search": 1.3,
    "graph": 1.2,
    "dp": 1.2,
    "math": 1.0,
    "string": 1.0
  }
}
```

优先级解释：

```text
高优先级：
1. 并查集
2. 区间 DP
3. 二分答案
4. 基础 DP 到中档 DP
5. 图论建模

中优先级：
1. 字符串边界
2. 数学推导与数据范围
3. 贪心证明
4. 搜索剪枝
```

---

# 9. Planning Engine：训练计划生成

## 9.1 输出文件

7 天版：

```text
data/training/training_task_plan_7d.json
data/training/training_task_plan_7d.md
```

30 天版：

```text
data/training/training_task_plan_30d.json
data/training/training_task_plan_30d.md
```

## 9.2 每日任务结构

每一天必须包含：

```json
{
  "day": 1,
  "theme": "T1 稳定性诊断",
  "targetAbility": "T1",
  "why": "T1 当前 75.51，存在数组边界、long long、初始化、平均提交次数偏高等风险。",
  "tasks": [
    {
      "type": "new_problem",
      "module": "implementation",
      "difficulty": "普及/提高-",
      "selectionRule": "选择一道模拟、前缀和或简单贪心题，重点训练边界和实现稳定性。",
      "trainingGoal": "提高一次 AC 率，减少边界错误。",
      "timeLimitMinutes": 40,
      "reviewRequired": true,
      "successCriteria": [
        "提交次数 <= 2",
        "提交前完成边界检查清单",
        "复盘中说明数据范围和数组边界"
      ]
    }
  ],
  "oldProblemReview": [],
  "successCriteria": [],
  "failureAction": []
}
```

## 9.3 任务类型

```text
new_problem：新题
old_problem_review：旧题复盘
redo_problem：重做题
partial_score_training：部分分训练
mock_exam：模拟赛
mock_review：模拟赛复盘
```

## 9.4 选题说明

第一版可以不直接给具体洛谷题号。

如果没有题库，训练计划输出“选题标准”：

```json
{
  "module": "interval_dp",
  "targetAbility": "T2",
  "difficulty": "普及+/提高",
  "selectionRule": "选择一道区间 DP 中档题，要求写出状态定义、转移、初始化和遍历顺序。"
}
```

后续接入题库后，再把 `selectionRule` 替换为具体题号。

## 9.5 7 天训练计划框架

### Day 0：诊断确认

```text
确认 training_profile.json
确认 training_priority.json
人工检查旧题复盘池
确认 T1/T2/T3/T4 解释是否合理
```

### Day 1：T1 稳定性

```text
目标：降低基础错误，提高一次 AC 率。
任务：基础实现、模拟、前缀和、简单贪心。
记录：是否一次 AC、错误类型、边界检查是否完成。
```

### Day 2：DP / 区间 DP

```text
目标：训练状态设计与边界处理。
任务：线性 DP、背包 DP、区间 DP。
要求：写状态定义、转移方程、初始化、遍历顺序。
```

### Day 3：图论 / 并查集 / 二分

```text
目标：针对平均提交次数高的模块做稳定性训练。
任务：并查集、二分答案、图论基础。
要求：集合含义、check 单调性、点边含义必须写清楚。
```

### Day 4：高提交次数旧题复盘

```text
目标：从历史错误中提取真实短板。
任务：复盘提交次数最多或多次失败后 AC 的旧题。
要求：比较早期错误版本与最终 AC 版本。
```

### Day 5：T3 部分分训练

```text
目标：训练不会正解时的拿分能力。
任务：1-2 道难题，不要求 AC。
要求：写 30 分、50 分、70 分做法。
```

### Day 6：四题模拟赛

```text
目标：训练完整比赛节奏。
任务：CSP-S 四题模拟。
记录：得分、用时、开题顺序、放弃点、部分分策略。
```

### Day 7：周复盘

```text
目标：判断训练闭环是否成立。
输出：training_review_report_week1.md
输出：training_loop_verification.json
生成下一周调整建议。
```

## 9.6 30 天训练计划框架

第 1 周：

```text
稳定性与基础修正
目标：降低基础错误，提高一次 AC 率，降低平均提交次数。
```

第 2 周：

```text
中档建模强化
目标：提高 T2 建模转化速度。
```

第 3 周：

```text
部分分策略专项
目标：提高 T3/T4 难题下限。
```

第 4 周：

```text
模拟赛与查漏补缺
目标：检验是否进入一等奖稳定区间。
```

---

# 10. Log Engine：训练过程记录

## 10.1 输出文件

```text
data/training/training_progress_log.json
```

## 10.2 训练记录结构

每道题训练后必须记录：

```json
{
  "date": "2026-06-23",
  "day": 1,
  "problemId": "P3371",
  "problemTitle": "单源最短路径",
  "source": "luogu",
  "module": "shortest_path",
  "targetAbility": "T2",
  "difficulty": "green",
  "startTime": "string",
  "endTime": "string",
  "durationMinutes": 45,
  "attemptCount": 2,
  "isOneShotAc": false,
  "finalResult": "AC",
  "score": 100,
  "errorTypes": ["BOUNDARY_ERROR"],
  "solutionUsage": "none",
  "needRedo": true,
  "notes": "初始化 dist 时边界处理不稳"
}
```

## 10.3 errorTypes 枚举

```text
READING_ERROR
MODEL_ERROR
ALGO_ERROR
STATE_ERROR
TRANSITION_ERROR
BOUNDARY_ERROR
INDEX_ERROR
OVERFLOW_ERROR
INIT_ERROR
MULTITEST_ERROR
COMPLEXITY_ERROR
DEBUG_TIMEOUT
STRATEGY_ERROR
PARTIAL_SCORE_MISSED
TEMPLATE_UNFAMILIAR
UNKNOWN
```

## 10.4 solutionUsage 枚举

```text
none：完全独立完成
hint_only：只看提示
idea_only：看了题解思路
full_solution：看了完整题解
copied_code：照着代码写
```

---

# 11. Review Engine：复盘系统

## 11.1 普通题复盘模板

```md
# 普通题复盘

题号：
模块：
目标能力：T1 / T2 / T3 / T4
结果：
用时：
提交次数：
是否一次 AC：
是否看题解：

## 1. 本题考什么

## 2. 我的第一思路

## 3. 错误原因

## 4. 正确关键点

## 5. 下次遇到同类题的检查清单

## 6. 是否需要重做
```

## 11.2 高提交次数题复盘模板

```md
# 高提交次数题复盘

题号：
提交次数：
最终结果：
最高分：

## 1. 为什么提交这么多次

## 2. 第一版错在哪里

## 3. 中间版本主要改了什么

## 4. 最终 AC 的关键变化

## 5. 如果在比赛中遇到，如何更快拿分

## 6. 是否暴露固定错误模式

## 7. 对应训练任务
```

## 11.3 部分分题复盘模板

```md
# 部分分题复盘

题号：
最高分：
最终是否 AC：

## 1. 原题数据范围

## 2. 可以拿 30 分的做法

## 3. 可以拿 50 分的做法

## 4. 可以拿 70 分的做法

## 5. 正解需要什么关键算法

## 6. 我错过了哪些可拿分

## 7. 下次难题部分分策略
```

## 11.4 周复盘输出

输出：

```text
data/training/training_review_report_week1.md
```

结构：

```md
# 第 1 周训练复盘

## 1. 本周目标

## 2. 本周完成情况

## 3. T1/T2/T3/T4 表现变化

## 4. 模块表现

## 5. 高频错误

## 6. 模拟赛表现

## 7. 是否接近一等奖稳定区间

## 8. 下周调整建议
```

---

# 12. Adjust Engine：动态调整规则

## 12.1 TLE 多

如果当天：

```text
TLE >= 2
```

明天必须调整：

```text
1. 降低难度
2. 增加复杂度分析训练
3. 要求写时间复杂度
4. 安排同模块基础题回炉
```

## 12.2 WA 多

如果当天：

```text
WA >= 2
```

明天必须调整：

```text
1. 同类基础题
2. 边界专项
3. 提交前检查清单
4. 旧题重写
```

## 12.3 独立 AC 多

如果当天：

```text
独立 AC >= 2
提交次数低
复盘质量合格
```

明天可以调整：

```text
1. 小幅提高难度
2. 加入中档综合题
3. 增加限时训练
```

## 12.4 T3 空

如果一周中：

```text
T3 题得分长期为 0
或部分分题没有写出 30 分方案
```

下周必须调整：

```text
1. 增加部分分训练
2. 每周固定 1-2 道难题拆分
3. 不要求 AC，但必须写 30/50/70 分方案
```

## 12.5 T4 崩

如果模拟赛中：

```text
时间分配失控
T1/T2 未保住
T3/T4 没拿部分分
```

下周必须调整：

```text
1. 增加模拟赛
2. 记录开题顺序
3. 记录每题止损时间
4. 训练放弃和转部分分策略
```


---

# 13. Mock Engine：模拟赛验证

## 13.1 输出文件

```text
data/training/mock_exam_log.json
```

## 13.2 模拟赛记录结构

```json
{
  "date": "2026-06-29",
  "examName": "CSP-S mock 01",
  "totalScore": 0,
  "targetScore": 200,
  "tasks": [
    {
      "slot": "T1",
      "score": 0,
      "timeMinutes": 0,
      "result": "AC/PC/WA/TLE/RE/UNKNOWN",
      "startedAt": "string",
      "endedAt": "string",
      "strategyNote": "string",
      "mainError": "string"
    }
  ],
  "openOrder": ["T1", "T2", "T3", "T4"],
  "lowLevelErrorCount": 0,
  "debugTimeMinutes": 0,
  "partialScoreMissed": false,
  "review": "string"
}
```

## 13.3 模拟赛复盘必须回答

```text
1. 开题顺序是否正确？
2. T1/T2 是否稳定？
3. 哪题调试时间过长？
4. 哪题应该先拿部分分？
5. 哪个错误最不应该出现？
6. 如果重新做，能多拿多少分？
7. 下周应该加强哪个模块？
```

---

# 14. Readiness Engine：达标验证

## 14.1 输出文件

```text
data/training/readiness_checklist.json
data/training/readiness_report.md
```

## 14.2 readiness_checklist.json

```json
{
  "generatedAt": "string",
  "target": "CSP-S_FIRST_PRIZE",
  "criteria": {
    "t1T2Accuracy": {
      "target": 0.9,
      "actual": null,
      "passed": false
    },
    "t1AvgTimeMinutes": {
      "target": 35,
      "actual": null,
      "passed": false
    },
    "t2AvgTimeMinutes": {
      "target": 60,
      "actual": null,
      "passed": false
    },
    "t3StablePartialScore": {
      "target": 30,
      "actual": null,
      "passed": false
    },
    "mockExamScoreStreak": {
      "target": 5,
      "actual": 0,
      "passed": false
    },
    "mockExamSafetyMargin": {
      "target": 20,
      "actual": null,
      "passed": false
    }
  },
  "overallReadiness": "NOT_READY"
}
```

## 14.3 readiness 状态

```text
NOT_READY：
还不能判断接近一等奖稳定区间

APPROACHING：
部分指标达标，但还不稳定

STABLE_ZONE：
连续多场模拟赛达标，且 T1/T2 稳定，T3/T4 有部分分能力

HIGH_CONFIDENCE：
稳定区间基础上，错误率低、模拟赛连续达标、安全垫充足
```

---

# 15. 7 天闭环验证流程

## Day 0：诊断确认

系统生成：

```text
training_profile.json
training_priority.json
```

人工确认：

```text
1. 短板是否合理
2. 旧题复盘池是否合理
3. T1/T2/T3/T4 分数是否能解释
4. 训练优先级是否有证据
```

## Day 1-6：执行训练

每天记录：

```text
计划题
实际做题
结果
用时
错误类型
是否看题解
复盘
```

## Day 7：四题模拟赛

记录：

```text
T1/T2/T3/T4 得分
每题用时
开题顺序
调试时间
低级错误
部分分情况
```

## Day 7 晚上：周复盘

系统输出：

```text
1. 本周训练是否有效？
2. T1 是否更稳？
3. T2 是否更快？
4. T3 是否有部分分意识？
5. T4 是否知道取舍？
6. 下周计划怎么改？
```

---

# 16. 7 天验证通过标准

如果 7 天后满足以下条件，系统第一版有效：

```text
1. 每天任务不是随机生成，而是能解释为什么安排
2. 每道题都有记录
3. 错题能进入复盘池
4. 次日计划会根据前一天错误调整
5. 周复盘能指出真实问题
6. 模拟赛复盘能影响下一周计划
7. 用户看了计划后觉得比手动安排更清楚
```

如果达不到，不要扩展 30 天计划，先改诊断和调整规则。

---

# 17. Codex 开发任务

## 17.1 package.json scripts

新增：

```json
{
  "scripts": {
    "train:profile": "tsx scripts/training/build-training-profile.ts",
    "train:priority": "tsx scripts/training/build-training-priority.ts",
    "train:plan": "tsx scripts/training/generate-training-plan.ts",
    "train:review": "tsx scripts/training/generate-weekly-review.ts",
    "train:verify": "tsx scripts/training/verify-training-loop.ts",
    "train:readiness": "tsx scripts/training/build-readiness-checklist.ts",
    "train:all": "tsx scripts/training/build-training-system.ts"
  }
}
```

## 17.2 必须实现脚本

```text
scripts/training/build-training-profile.ts
scripts/training/build-training-priority.ts
scripts/training/generate-training-plan.ts
scripts/training/generate-training-plan-md.ts
scripts/training/generate-weekly-review.ts
scripts/training/verify-training-loop.ts
scripts/training/build-readiness-checklist.ts
scripts/training/build-training-system.ts
```

## 17.3 train:all 流程

```text
1. 读取 data/analysis/ 下的分析结果
2. 生成 training_profile.json
3. 生成 training_priority.json
4. 生成 training_task_plan_7d.json
5. 生成 training_task_plan_7d.md
6. 生成 training_progress_log.json
7. 生成 mock_exam_log.json
8. 生成 readiness_checklist.json
9. 生成 readiness_report.md
10. 生成 training_loop_verification.json
```

## 17.4 最小命令

```bash
pnpm train:all
```

也必须支持单独命令：

```bash
pnpm train:profile
pnpm train:priority
pnpm train:plan --days 7
pnpm train:review --week 1
pnpm train:verify
pnpm train:readiness
```

---

# 18. 验收标准

## 18.1 功能验收

```text
1. 能读取已有 data/analysis 文件
2. 能生成 training_profile.json
3. 能生成 training_priority.json
4. 能生成 7 天训练计划
5. 能生成训练记录模板
6. 能根据训练记录生成周复盘
7. 能验证训练闭环是否成立
8. 能生成 readiness 判断
```

## 18.2 质量验收

```text
1. 计划不是随机生成
2. 每个任务都有原因
3. 每个任务能对应 T1/T2/T3/T4
4. 每个任务能对应历史短板
5. 错误能反馈到下一天计划
6. 模拟赛能反馈到下一周计划
7. 每周复盘能给出可执行调整
```

## 18.3 不合格情况

```text
1. 只说多刷题
2. 只输出自然语言计划
3. 不读取历史分析结果
4. 不区分 T1/T2/T3/T4
5. 不要求记录训练过程
6. 不生成复盘
7. 不生成调整
8. 不做模拟赛验证
9. 承诺一定一等奖
10. 没有 JSON 输出
11. 没有 MD 输出
```

---

# 19. 给 Codex 的最终一句话

```text
请实现 CSP-S 一等奖训练系统的统一闭环训练引擎：读取 data/analysis/ 下的历史代码分析结果，生成训练画像、训练优先级、7 天训练计划、训练记录模板、模拟赛记录模板、周复盘报告、闭环验证文件和 readiness 判断。核心不是生成漂亮计划，而是让“诊断 → 出题 → 训练 → 记录 → 复盘 → 调整 → 模拟赛验证”真正闭环。不能承诺一定一等奖，但必须定义并验证是否逐步接近 CSP-S 一等奖稳定区间。
```

---

# 20. 最终判断

本系统的最终目标不是：

```text
刷更多题
```

而是：

```text
基于历史诊断，刷最该刷的题；
基于训练反馈，动态调整计划；
基于模拟赛表现，判断是否进入一等奖稳定区间。
```

一句话：

```text
从随机刷题，变成数据驱动的 CSP-S 一等奖训练闭环。
```

# CSP-S 一等奖训练系统 · 训练计划生成与达标验证 Codex 开发需求文档 v1.0

> 项目：AI 信奥训练教练  
> 当前文档定位：在“本地代码分析结果”之后，继续实现“训练计划生成 + 刷题反馈 + 阶段达标判断”系统。  
> 核心目标：把已经做过的题目转化为能力画像，再根据当前水平生成后续训练计划，并用量化标准判断是否逐步进入 CSP-S 一等奖稳定区间。  
> 重要原则：不能承诺 100% 一定拿一等奖，但系统必须尽可能把训练过程变成可执行、可记录、可复盘、可调整、可验证的闭环。

---

# 0. 本文档解决什么问题

当前已经完成第一阶段代码分析，已经有以下分析产物：

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

这些文件回答的是：

```text
过去做过什么题
代码习惯怎么样
哪些题卡过
哪些模块覆盖多
T1/T2/T3/T4 当前大概是什么水平
```

但用户真正目标是：

```text
1. 已经做过的题目如何生成能力分析
2. 如何根据目前水平生成后续训练计划
3. 如何在一定时间内通过刷题尽可能达到 CSP-S 一等奖稳定水平
4. 如何判断训练是否有效
5. 如何动态调整训练任务
```

所以本阶段要开发：

```text
训练计划生成系统
训练过程记录系统
阶段复盘系统
达标验证系统
动态调整系统
```

---

# 1. 最重要的边界说明：不能保证 100% 一定一等奖

系统不能写：

```text
刷完 30 天保证 CSP-S 一等奖
```

正确目标应该写成：

```text
通过 30 / 60 / 90 天结构化训练，让学生逐步进入 CSP-S 一等奖稳定区间。
```

原因：

```text
CSP-S 最终结果受比赛题目风格、省份分数线、临场状态、读题失误、时间分配、评测数据强度等影响。
```

但是系统必须做到：

```text
1. 训练目标明确
2. 每天任务明确
3. 每题训练目的明确
4. 每题结果可记录
5. 每周可复盘
6. 每阶段可评估
7. 未达标时可以调整
8. 达标时可以判断是否接近一等奖稳定区间
```

本系统的“保证”不是保证结果，而是保证训练过程可控：

```text
诊断 → 出题 → 训练 → 记录 → 复盘 → 调整 → 模拟赛验证
```

---

# 2. 一等奖稳定区间定义

系统判断“接近 CSP-S 一等奖”的标准不能只看刷题数量。

必须用以下标准判断：

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
```

如果无法获取省份一等奖线，则允许用户手动配置：

```json
{
  "province": "福建",
  "targetFirstPrizeLine": 180,
  "safetyMargin": 20,
  "targetMockScore": 200
}
```

如果未配置，则系统使用通用目标：

```text
四题模拟赛目标：200+
T1：90+
T2：70+
T3：30-60
T4：能拿特殊性质/暴力部分分
```

---

# 3. 系统输入

## 3.1 必需输入

训练计划生成依赖以下文件：

```text
data/analysis/submission_manifest.json
data/analysis/code_static_metrics.json
data/analysis/problem_code_timeline.json
data/analysis/algorithm_module_stats.json
data/analysis/error_pattern_candidates.json
data/analysis/deep_review_samples.json
data/analysis/csp_s_risk_profile.json
```

---

## 3.2 当前分析基础数据

系统需要读取 `csp_s_risk_profile.json` 中的四维能力：

```json
{
  "t1": 75.51,
  "t2": 81.48,
  "t3": 66.46,
  "t4": 71.53,
  "overall": 73.75
}
```

如果 JSON 中字段名不同，Codex 应该做兼容解析。

---

## 3.3 当前历史代码分析摘要

系统需要从已有分析文件中读取或计算：

```text
代码文件总数
题目总数
已 AC 题目数
未 AC / UNKNOWN 题目数
平均每题提交次数
一次 AC 题目数
多次失败后 AC 题目数
部分分题目数
疑似卡题数
静态风险文件数
算法模块题目数
算法模块平均提交次数
高价值复盘题
```

---

# 4. 系统输出

本阶段必须新增以下输出文件：

```text
data/training/training_profile.json
data/training/training_priority.json
data/training/training_task_plan.json
data/training/training_task_plan.md
data/training/training_progress_log.json
data/training/weekly_review_template.md
data/training/mock_exam_template.json
data/training/readiness_checklist.json
data/training/readiness_report.md
```

如果 `data/training/` 不存在，程序必须自动创建。

---

# 5. 第一部分：如何把已经做过的题目转化为能力画像

## 5.1 数据来源对应关系

| 输入文件 | 用途 |
|---|---|
| submission_manifest.json | 每份代码对应哪道题、结果、时间、语言 |
| code_static_metrics.json | 代码稳定性、实现风险、编码习惯 |
| problem_code_timeline.json | 每道题提交轨迹、是否一次 AC、是否多次失败后 AC |
| algorithm_module_stats.json | 算法模块覆盖与模块表现 |
| error_pattern_candidates.json | 高频错误候选 |
| deep_review_samples.json | 高价值复盘题 |
| csp_s_risk_profile.json | T1/T2/T3/T4 当前风险画像 |

---

## 5.2 能力画像结构

输出文件：

```text
data/training/training_profile.json
```

结构：

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
      "priority": "high"
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

---

## 5.3 T1 能力画像生成规则

T1 主要来自：

```text
1. 静态风险比例
2. 一次 AC 比例
3. 疑似卡题比例
4. 基础题/中档题稳定性
5. 数组、边界、long long、初始化风险
```

如果出现以下情况，T1 训练优先级提高：

```text
1. T1 < 82
2. ARRAY_INDEX_RISK 很高
3. DEFINE_INT_LONG_LONG 很多
4. RECURSION 风险高
5. 平均提交次数 > 2.5
6. 一次 AC 题比例偏低
```

当前默认判断：

```text
T1 当前 75.51，未达到稳定一等奖区间。
后续训练必须安排 T1 稳定性专项。
```

---

## 5.4 T2 能力画像生成规则

T2 主要来自：

```text
1. DP 覆盖
2. 图论覆盖
3. 数学/字符串/贪心/二分覆盖
4. 中档题 AC 情况
5. 模块平均提交次数
```

如果出现以下情况，T2 训练重点不是“学新算法”，而是“稳定转化”：

```text
1. 覆盖较广
2. AC 题不少
3. 但平均提交次数偏高
```

当前默认判断：

```text
T2 当前 81.48，是相对优势，但还需要降低提交次数，提高一次或少量提交通过率。
```

---

## 5.5 T3 能力画像生成规则

T3 主要来自：

```text
1. 部分分题目数量
2. 高提交次数题
3. 未 AC / UNKNOWN 题
4. 难题是否能拿部分分
5. 是否有从 30 分到 60 分的训练记录
```

如果出现以下情况，T3 是短板：

```text
1. T3 < 75
2. 部分分题目多但没有系统复盘
3. 卡题多
4. 未 AC / UNKNOWN 题多
```

当前默认判断：

```text
T3 当前 66.46，是最需要专项补强的能力。
后续必须加入“难题拆分 + 部分分策略训练”。
```

---

## 5.6 T4 能力画像生成规则

T4 主要来自：

```text
1. 平均提交次数
2. 卡题比例
3. 多次失败后 AC 数量
4. 模拟赛记录
5. 开题顺序与时间分配记录
```

如果没有模拟赛记录，则 T4 只能做初步估计。

当前默认判断：

```text
T4 当前 71.53，中等偏上，但需要每周模拟赛验证。
没有模拟赛过程数据时，不能断言综合策略稳定。
```

---

# 6. 第二部分：如何根据当前水平生成后续计划

## 6.1 训练优先级生成

输出文件：

```text
data/training/training_priority.json
```

结构：

```json
{
  "generatedAt": "string",
  "priorityWeights": {
    "t1Stability": 0.30,
    "t2Modeling": 0.35,
    "t3PartialScore": 0.20,
    "t4Strategy": 0.15
  },
  "moduleWeights": {
    "interval_dp": 1.4,
    "dsu": 1.4,
    "binary_search": 1.3,
    "graph": 1.2,
    "dp": 1.2,
    "math": 1.0,
    "string": 1.0
  },
  "oldProblemReviewWeight": 0.25,
  "newProblemWeight": 0.60,
  "mockExamWeight": 0.15,
  "reason": []
}
```

---

## 6.2 当前推荐训练比例

根据当前画像，默认训练比例：

```text
T1 稳定性题：30%
T2 建模题：35%
T3 部分分难题：20%
T4 模拟赛与复盘：15%
```

解释：

```text
1. T1 不能弱，一等奖首先要稳住基础分。
2. T2 是当前优势，需要继续转化为稳定得分。
3. T3 是当前短板，需要专项强化。
4. T4 通过模拟赛检验整体策略。
```

---

## 6.3 当前推荐模块权重

根据已有分析，后续出题优先级：

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

低优先级：
1. 已经较稳定的简单模拟题
2. 过度偏难且当前阶段无法沉淀的省选难题
```

---

# 7. 第三部分：训练计划生成

## 7.1 输出文件

```text
data/training/training_task_plan.json
data/training/training_task_plan.md
```

---

## 7.2 training_task_plan.json 结构

```json
{
  "generatedAt": "string",
  "goal": "CSP-S_FIRST_PRIZE",
  "durationDays": 30,
  "currentProfile": {
    "t1": 75.51,
    "t2": 81.48,
    "t3": 66.46,
    "t4": 71.53,
    "overall": 73.75
  },
  "weeklyFocus": [
    {
      "week": 1,
      "theme": "稳定性与基础修正",
      "goals": [],
      "focusModules": [],
      "milestones": []
    }
  ],
  "dailyTasks": [
    {
      "day": 1,
      "theme": "T1 稳定性诊断",
      "taskTypes": [],
      "requiredTasks": [],
      "optionalTasks": [],
      "reviewRequirements": [],
      "successCriteria": []
    }
  ],
  "reviewPool": [],
  "moduleWeights": {},
  "milestones": []
}
```

---

## 7.3 30 天计划框架

### 第 1 周：稳定性与基础修正

目标：

```text
1. 降低基础错误
2. 建立复盘模板
3. 提高一次 AC 率
4. 降低平均提交次数
```

重点：

```text
T1 稳定性
数组边界
数据范围
初始化
简单 DP
简单图论
旧题复盘
```

---

### 第 2 周：中档建模强化

目标：

```text
提高 T2 建模转化速度
```

重点：

```text
DP
区间 DP
背包 DP
图论建模
二分答案
并查集
搜索剪枝
```

---

### 第 3 周：部分分策略专项

目标：

```text
提高 T3/T4 难题下限
```

重点：

```text
暴力设计
特殊性质
子任务拆分
数据范围分析
难题分层拿分
30 分 / 50 分 / 70 分策略
```

---

### 第 4 周：模拟赛与查漏补缺

目标：

```text
检验是否进入一等奖稳定区间
```

重点：

```text
每周 2 到 3 场模拟赛
赛后复盘
错题重写
模块补洞
策略调整
```

---

## 7.4 每周训练结构

默认每周结构：

```text
周一：T1 稳定性 + 错题重写
周二：DP / 区间 DP / 背包 DP 专项
周三：图论 / 并查集 / 二分专项
周四：T3 部分分难题拆分训练
周五：字符串 / 数学 / 贪心专项
周六：CSP-S 四题模拟赛
周日：模拟赛复盘 + 高提交次数旧题复盘
```

---

## 7.5 每日任务结构

每天必须包含：

```text
1. 今日主题
2. 今日目标
3. 必做训练
4. 选做训练
5. 旧题复盘
6. 记录要求
7. 达标标准
8. 失败调整规则
```

每道题必须说明：

```text
1. 训练类型：新题 / 旧题 / 模拟赛题 / 部分分题
2. 对应能力：T1 / T2 / T3 / T4
3. 模块：DP / 图论 / 二分 / 并查集 / 等
4. 训练目的
5. 限时
6. 完成标准
7. 复盘要求
```

---

# 8. 第四部分：训练过程记录

## 8.1 输出文件

```text
data/training/training_progress_log.json
```

---

## 8.2 训练记录结构

每做一道题，必须记录：

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

---

## 8.3 errorTypes 枚举

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

---

## 8.4 solutionUsage 枚举

```text
none：完全独立完成
hint_only：只看提示
idea_only：看了题解思路
full_solution：看了完整题解
copied_code：照着代码写
```

---

# 9. 第五部分：复盘模板

## 9.1 普通题复盘模板

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

---

## 9.2 高提交次数题复盘模板

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

---

## 9.3 部分分题复盘模板

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

---

## 9.4 模拟赛复盘模板

```md
# CSP-S 模拟赛复盘

日期：
总分：
目标分：
是否达标：

## 1. 各题得分

T1：
T2：
T3：
T4：

## 2. 开题顺序

## 3. 时间分配

## 4. 调试时间

## 5. 哪题该放弃但没放弃

## 6. 哪题该拿部分分但没拿

## 7. 最不应该出现的错误

## 8. 如果重做，最多能多拿多少分

## 9. 下周训练调整
```

---

# 10. 第六部分：周复盘系统

## 10.1 输出文件

```text
data/training/training_review_report.md
```

---

## 10.2 每周统计字段

系统每周统计：

```text
1. 完成题量
2. 新题数量
3. 旧题复盘数量
4. 一次 AC 率
5. 平均用时
6. 平均提交次数
7. 模块分布
8. 错误类型分布
9. 是否完成模拟赛
10. 模拟赛分数
11. 是否达到本周目标
```

---

## 10.3 周复盘结构

```md
# 第 N 周训练复盘

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

# 11. 第七部分：达标验证系统

## 11.1 输出文件

```text
data/training/readiness_checklist.json
data/training/readiness_report.md
```

---

## 11.2 readiness_checklist.json

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

---

## 11.3 readiness 状态

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

## 11.4 不同状态的处理

### NOT_READY

```text
继续基础和模块专项训练。
不要过早追求难题。
```

### APPROACHING

```text
增加模拟赛密度。
补最明显短板。
```

### STABLE_ZONE

```text
保持模拟赛节奏。
重点减少低级错误和调试时间。
```

### HIGH_CONFIDENCE

```text
进入考前策略训练。
保持状态，减少新难题干扰。
```

---

# 12. 第八部分：动态调整规则

## 12.1 如果 T1 错

调整：

```text
1. 减少难题
2. 增加基础稳定性训练
3. 每题强制提交前检查清单
4. 增加旧题重写
```

---

## 12.2 如果 T2 错

调整：

```text
1. 补模块专项
2. 做中档题模型识别
3. 每题写算法选择理由
4. 限制看题解前必须写思路
```

---

## 12.3 如果 T3 空

调整：

```text
1. 训练部分分拆解
2. 每周固定做 1-2 道难题
3. 不要求 AC，但必须写 30/50/70 分做法
4. 记录错过的部分分
```

---

## 12.4 如果 T4 崩

调整：

```text
1. 增加模拟赛
2. 记录开题顺序
3. 记录每题止损时间
4. 训练放弃和转部分分策略
```

---

## 12.5 如果调试太久

调整：

```text
1. 增加错题重写
2. 增加代码模板规范
3. 训练手写检查清单
4. 减少复杂新题
```

---

# 13. Codex 开发任务

## 13.1 新增脚本

在 `package.json` 中新增：

```json
{
  "scripts": {
    "train:profile": "tsx scripts/training/build-training-profile.ts",
    "train:priority": "tsx scripts/training/build-training-priority.ts",
    "train:plan": "tsx scripts/training/generate-training-plan.ts",
    "train:readiness": "tsx scripts/training/build-readiness-checklist.ts",
    "train:all": "tsx scripts/training/build-training-system.ts"
  }
}
```

---

## 13.2 必须实现的脚本

```text
scripts/training/build-training-profile.ts
scripts/training/build-training-priority.ts
scripts/training/generate-training-plan.ts
scripts/training/generate-training-plan-md.ts
scripts/training/build-review-templates.ts
scripts/training/build-readiness-checklist.ts
scripts/training/build-training-system.ts
```

---

## 13.3 train:all 流程

```text
1. 读取 data/analysis/ 下的分析结果
2. 生成 training_profile.json
3. 生成 training_priority.json
4. 生成 training_task_plan.json
5. 生成 training_task_plan.md
6. 生成 weekly_review_template.md
7. 生成 mock_exam_template.json
8. 生成 readiness_checklist.json
9. 生成 readiness_report.md
```

---

# 14. 训练计划生成规则

## 14.1 每天题目数量

默认：

```text
平日：3 到 5 道题
周六：1 场四题模拟赛
周日：复盘 + 旧题重写
```

如果用户每日时间不足 2 小时：

```text
平日：2 到 3 道题
周六：半套模拟或两题限时
周日：复盘
```

---

## 14.2 新题、旧题、模拟赛比例

默认：

```text
新题：60%
旧题复盘：25%
模拟赛：15%
```

如果 T1 < 80：

```text
旧题复盘提高到 35%
```

如果 T3 < 70：

```text
部分分难题提高到 25%
```

---

## 14.3 选题原则

Codex 第一版可以不直接接洛谷题库。

如果没有题库，训练计划可以输出“选题标准”，而不是具体题号。

例如：

```json
{
  "taskType": "new_problem",
  "module": "interval_dp",
  "targetAbility": "T2",
  "difficulty": "普及+/提高",
  "selectionRule": "选择一道区间 DP 中档题，要求写出状态定义、转移、初始化和遍历顺序。",
  "durationLimitMinutes": 60
}
```

如果后续接入题库，再把 `selectionRule` 替换为具体题号。

---

# 15. training_task_plan.md 必须长什么样

必须包含：

```md
# 30 天 CSP-S 一等奖训练计划

## 1. 当前能力画像

## 2. 本阶段核心目标

## 3. 训练比例

## 4. 第 1 周：稳定性与基础修正

### Day 1
- 主题
- 训练目标
- 任务 1
- 任务 2
- 任务 3
- 复盘要求
- 达标标准

...

## 5. 第 2 周：中档建模强化

## 6. 第 3 周：部分分策略专项

## 7. 第 4 周：模拟赛与查漏补缺

## 8. 每日记录表

## 9. 每周达标标准

## 10. 未达标调整规则
```

---

# 16. 验收标准

## 16.1 画像验收

```text
1. 能读取已有分析文件
2. 能输出 training_profile.json
3. 能明确 T1/T2/T3/T4 当前强弱
4. 能列出主要优势
5. 能列出主要短板
```

---

## 16.2 计划验收

```text
1. 能生成 30 天计划
2. 每天有主题
3. 每天有任务
4. 每个任务有训练目的
5. 每个任务有复盘要求
6. 包含旧题复盘
7. 包含部分分训练
8. 包含模拟赛
```

---

## 16.3 达标判断验收

```text
1. 能生成 readiness_checklist.json
2. 能说明为什么不能保证 100% 一等奖
3. 能定义一等奖稳定区间
4. 能根据模拟赛结果判断是否接近目标
5. 能给出未达标调整策略
```

---

## 16.4 不合格情况

```text
1. 只输出“多刷题、多总结”
2. 不读取历史分析结果
3. 不区分 T1/T2/T3/T4
4. 不包含旧题复盘
5. 不包含部分分训练
6. 不包含模拟赛
7. 不定义达标标准
8. 承诺一定拿一等奖
```

---

# 17. 给 Codex 的最终指令

```text
请基于 data/analysis/ 中已经生成的本地洛谷代码分析结果，实现 CSP-S 一等奖训练计划生成系统。系统需要把已经做过的题目转化为能力画像，根据当前 T1/T2/T3/T4 水平生成 30 天训练计划，输出训练任务、复盘要求、模拟赛安排、阶段达标标准和未达标调整规则。不能承诺 100% 一等奖，但必须定义“稳定一等奖区间”，并用训练记录和模拟赛结果判断是否逐步接近该区间。
```

---

# 18. 关键判断

本系统的最终目标不是“刷更多题”，而是：

```text
基于历史诊断，刷最该刷的题；
基于训练反馈，动态调整计划；
基于模拟赛表现，判断是否进入一等奖稳定区间。
```

一句话：

```text
从随机刷题，变成数据驱动的 CSP-S 一等奖训练闭环。
```

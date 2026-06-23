# CSP-S 一等奖训练系统 · 训练闭环验证与验收 Codex 开发需求文档 v1.0

> 项目：AI 信奥训练教练  
> 当前文档定位：验证“诊断 → 出题 → 训练 → 记录 → 复盘 → 调整 → 模拟赛验证”是否真正形成闭环  
> 使用对象：Codex 开发任务 / 本地训练系统验收  
> 核心目标：不是看系统能不能生成漂亮计划，而是验证系统能否根据训练反馈持续修正计划，并逐步逼近 CSP-S 一等奖稳定区间。  
> 重要边界：系统不能承诺 100% 一定拿 CSP-S 一等奖，但必须能把训练过程变成可记录、可复盘、可调整、可验证的闭环。

---

# 1. 核心闭环

本系统的核心不是“生成训练计划”，而是完整闭环：

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

系统是否有效，不能只看：

```text
生成了多少题
生成的计划有多长
报告写得是否好看
```

而要看：

```text
1. 诊断是否基于历史数据
2. 出题是否针对当前短板
3. 训练是否有明确目标
4. 每题是否有过程记录
5. 复盘是否能定位真实问题
6. 明日/下周计划是否因训练结果改变
7. 模拟赛是否验证能力提升
8. 是否逐步接近 CSP-S 一等奖稳定区间
```

---

# 2. 系统验证分层

系统验证分为三层：

```text
第一层：功能是否跑通
第二层：推荐是否合理
第三层：训练后是否真的变强
```

只有第三层成立，系统才有真实训练价值。

---

# 3. 第一层验证：功能闭环是否跑通

## 3.1 验证目标

输入已有分析数据后，系统必须能生成以下文件：

```text
data/training/training_profile.json
data/training/training_priority.json
data/training/training_task_plan.json
data/training/training_task_plan.md
data/training/training_progress_log.json
data/training/weekly_review_report.md
data/training/readiness_report.md
```

---

## 3.2 系统必须能回答的问题

系统必须能回答：

```text
1. 当前 T1/T2/T3/T4 分别是多少？
2. 当前最弱的是哪一项？
3. 为什么这一项最弱？
4. 下一周为什么安排这些题型？
5. 每天做完题后应该记录什么？
6. 如果今天没达标，明天怎么调整？
7. 如果一周后没提升，下一周怎么改？
```

---

## 3.3 第一层合格标准

```text
1. 能读取 data/analysis/ 下已有分析文件
2. 能生成 training_profile.json
3. 能生成 training_priority.json
4. 能生成 7 天训练计划
5. 能生成 30 天训练计划
6. 能生成训练记录模板
7. 能生成周复盘模板
8. 能生成 readiness 判断文件
```

如果这些不能跑通，说明系统还只是“分析工具”，不是训练系统。

---

# 4. 第二层验证：诊断是否合理

## 4.1 当前基线数据

系统应能读取当前历史分析数据，例如：

```text
代码文件总数：2345
题目总数：829
已 AC 题目：614
未 AC / UNKNOWN 题目：215
平均每题提交次数：2.83
一次 AC 题目：247
多次失败后 AC：262
部分分题目：60
疑似卡题：86
```

当前四维评分：

```text
T1 稳定拿分：75.51
T2 建模转化：81.48
T3 部分分策略：66.46
T4 综合策略：71.53
综合分：73.75
```

---

## 4.2 诊断验证方法

从历史题中抽样 20 道人工核验。

抽样规则：

```text
1. 提交次数最多的 10 道题
2. 多次失败后 AC 的 5 道题
3. 部分分题 5 道
```

人工检查：

```text
1. 系统判断的短板是否和真实错误一致
2. 系统识别的模块是否正确
3. 系统给出的风险是否有证据
4. 系统是否能解释为什么这些题值得复盘
```

---

## 4.3 诊断合格标准

```text
20 道样本中，至少 14 道的错误归因基本准确。
```

也就是：

```text
诊断准确率 >= 70%
```

如果低于 70%，先不要生成长期训练计划，必须先调整诊断规则。

---

# 5. 第三层验证：出题是否合理

## 5.1 出题不能随机

系统不能只输出：

```text
今天练 DP
```

必须输出：

```text
为什么今天练 DP
练 DP 的哪个子模块
这道题训练什么能力
做完以后如何判断有效
如果没达标明天怎么调整
```

---

## 5.2 合格任务结构

每一天任务必须包含：

```json
{
  "day": 2,
  "theme": "区间 DP 状态设计专项",
  "targetAbility": "T2",
  "why": "历史区间 DP 平均提交次数偏高，说明状态设计和边界转移不稳。",
  "tasks": [
    {
      "type": "new_problem",
      "module": "interval_dp",
      "difficulty": "普及+/提高",
      "selectionRule": "选择一道区间 DP 中档题。",
      "trainingGoal": "写清状态定义、转移方程、初始化、枚举顺序。",
      "timeLimitMinutes": 60,
      "reviewRequired": true
    }
  ],
  "successCriteria": [
    "写代码前完成状态定义",
    "提交次数 <= 2",
    "复盘中说明边界处理"
  ]
}
```

---

## 5.3 第一周出题合格标准

第一周计划必须满足：

```text
1. 至少 30% 是 T1 稳定性训练
2. 至少 30% 是 T2 建模训练
3. 至少 1 天是 T3 部分分训练
4. 至少 1 次模拟赛或半套模拟
5. 至少 20% 是历史高提交题复盘
6. 每道题都有训练目的
7. 每道题都有达标标准
8. 每道题都有复盘要求
```

---

# 6. 第四层验证：训练记录是否有效

## 6.1 每题必须记录的字段

每道题训练后必须记录：

```json
{
  "date": "2026-06-23",
  "day": 1,
  "problemId": "P3371",
  "problemTitle": "单源最短路径",
  "module": "shortest_path",
  "targetAbility": "T2",
  "startTime": "string",
  "endTime": "string",
  "durationMinutes": 45,
  "attemptCount": 2,
  "finalResult": "AC",
  "score": 100,
  "isOneShotAc": false,
  "solutionUsage": "none",
  "errorTypes": ["BOUNDARY_ERROR"],
  "needRedo": true,
  "notes": "初始化 dist 时边界处理不稳"
}
```

---

## 6.2 errorTypes 枚举

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

## 6.3 solutionUsage 枚举

```text
none：完全独立完成
hint_only：只看提示
idea_only：看了题解思路
full_solution：看了完整题解
copied_code：照着代码写
```

---

## 6.4 训练记录合格标准

连续训练 7 天后，系统必须能统计：

```text
1. 完成题量
2. 一次 AC 率
3. 平均用时
4. 平均提交次数
5. 错误类型分布
6. 模块完成情况
7. 哪些题需要重做
8. 哪些短板仍然高频出现
9. 下一周调整建议
```

如果记录不完整，后续调整不可信。

---

# 7. 第五层验证：复盘是否改变下一步任务

这是系统是否真正闭环的核心。

如果今天错了，明天任务必须变化。

---

## 7.1 TLE 多的调整规则

如果当天出现：

```text
TLE >= 2
```

明天计划必须调整为：

```text
1. 降低难度
2. 增加复杂度分析训练
3. 要求写时间复杂度
4. 安排同模块基础题回炉
```

---

## 7.2 WA 多的调整规则

如果当天出现：

```text
WA >= 2
```

明天计划必须调整为：

```text
1. 同类基础题
2. 边界专项
3. 提交前检查清单
4. 旧题重写
```

---

## 7.3 独立 AC 多的调整规则

如果当天出现：

```text
独立 AC >= 2
提交次数低
复盘质量合格
```

明天计划可以调整为：

```text
1. 小幅提高难度
2. 加入中档综合题
3. 增加限时训练
```

---

## 7.4 复盘闭环验收

连续 7 天训练后，随机抽查 3 天：

```text
当天错误 → 次日任务
```

必须能看出明确因果关系。

如果次日任务和当天错误无关，说明“调整”是假的。

---

# 8. 第六层验证：模拟赛是否逐步变好

最终不是看刷题数量，而是看模拟赛表现。

---

## 8.1 模拟赛记录字段

每场模拟赛必须记录：

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

---

## 8.2 模拟赛复盘必须回答

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

## 8.3 稳定一等奖区间验证标准

不能说：

```text
刷够 30 天就一等奖
```

只能说：

```text
是否进入稳定一等奖区间
```

推荐标准：

```text
1. 连续 5 场模拟赛达到目标分数
2. T1/T2 正确率 >= 90%
3. T1 平均用时 <= 35 分钟
4. T2 平均用时 <= 60 分钟
5. T3 至少稳定拿 30-60 分
6. T4 至少能识别可拿分子任务
7. 平均提交次数下降
8. 低级错误数量下降
```

---

# 9. 7 天验证版流程

不要一开始跑 30 天。  
先做 7 天验证版。

---

## 9.1 第 0 天：验证诊断

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

---

## 9.2 第 1-6 天：执行训练

每天记录：

```text
1. 计划题
2. 实际做题
3. 结果
4. 用时
5. 错误类型
6. 是否看题解
7. 复盘
```

---

## 9.3 第 7 天：四题模拟赛

记录：

```text
1. T1/T2/T3/T4 得分
2. 每题用时
3. 开题顺序
4. 调试时间
5. 低级错误
6. 部分分情况
```

---

## 9.4 第 7 天晚上：生成周复盘

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

# 10. 7 天验证通过标准

如果 7 天后满足以下条件，系统第一版有效：

```text
1. 每天任务不是随机生成，而是能解释为什么安排
2. 每道题都有记录
3. 错题能进入复盘池
4. 次日计划会根据前一天错误调整
5. 周复盘能指出真实问题
6. 模拟赛复盘能影响下一周计划
7. 用户看了计划后觉得“比手动安排更清楚”
```

如果达不到，不要扩展 30 天计划，先改诊断和调整规则。

---

# 11. 最小可实现版本

Codex 先做这 5 个功能：

```text
1. 读取 data/analysis/*
2. 生成 training_profile.json
3. 生成 7 天训练计划
4. 提供 training_progress_log.json 填写模板
5. 根据 7 天记录生成 weekly_review_report.md
```

---

## 11.1 最小命令

```bash
pnpm train:profile
pnpm train:plan --days 7
pnpm train:review --week 1
```

---

## 11.2 最小输出文件

```text
data/training/training_profile.json
data/training/training_task_plan_7d.json
data/training/training_task_plan_7d.md
data/training/training_progress_log.json
data/training/training_review_report_week1.md
```

---

# 12. 关键验证问题

每天只问这 5 个问题：

```text
1. 今天这道题为什么是现在该做？
2. 做完以后暴露了什么问题？
3. 这个问题是不是历史短板之一？
4. 明天计划有没有因此改变？
5. 一周后模拟赛有没有体现改善？
```

如果这 5 个问题能闭环，系统就是有效的。

如果不能闭环，只是“AI 生成计划”，没有训练价值。

---

# 13. Codex 开发任务

## 13.1 新增脚本

```json
{
  "scripts": {
    "train:profile": "tsx scripts/training/build-training-profile.ts",
    "train:plan": "tsx scripts/training/generate-training-plan.ts",
    "train:review": "tsx scripts/training/generate-weekly-review.ts",
    "train:verify": "tsx scripts/training/verify-training-loop.ts"
  }
}
```

---

## 13.2 必须实现脚本

```text
scripts/training/build-training-profile.ts
scripts/training/generate-training-plan.ts
scripts/training/generate-weekly-review.ts
scripts/training/verify-training-loop.ts
```

---

## 13.3 build-training-profile.ts

输入：

```text
data/analysis/csp_s_risk_profile.json
data/analysis/problem_code_timeline.json
data/analysis/algorithm_module_stats.json
data/analysis/error_pattern_candidates.json
data/analysis/deep_review_samples.json
```

输出：

```text
data/training/training_profile.json
```

必须包含：

```text
1. 当前 T1/T2/T3/T4
2. 当前优势
3. 当前短板
4. 高价值复盘题
5. 训练优先级
```

---

## 13.4 generate-training-plan.ts

输入：

```text
data/training/training_profile.json
```

输出：

```text
data/training/training_task_plan_7d.json
data/training/training_task_plan_7d.md
data/training/training_progress_log.json
```

必须生成：

```text
1. 7 天训练计划
2. 每天主题
3. 每天训练任务
4. 每题训练目的
5. 每题复盘要求
6. 每天达标标准
7. 未达标调整规则
```

---

## 13.5 generate-weekly-review.ts

输入：

```text
data/training/training_progress_log.json
data/training/mock_exam_log.json
```

输出：

```text
data/training/training_review_report_week1.md
```

必须生成：

```text
1. 本周完成情况
2. T1/T2/T3/T4 表现
3. 高频错误
4. 模拟赛表现
5. 是否有效
6. 下周调整
```

---

## 13.6 verify-training-loop.ts

输入：

```text
data/training/training_task_plan_7d.json
data/training/training_progress_log.json
data/training/training_review_report_week1.md
```

输出：

```text
data/training/training_loop_verification.json
```

必须检查：

```text
1. 是否每天有任务
2. 是否每题有训练目的
3. 是否每题有记录项
4. 是否有复盘
5. 是否有调整规则
6. 次日任务是否和前一日错误有关
7. 是否有模拟赛验证
```

---

# 14. 验收标准

## 14.1 功能验收

```text
1. 能读取已有 analysis 文件
2. 能生成 training_profile.json
3. 能生成 7 天训练计划
4. 能生成训练记录模板
5. 能根据训练记录生成周复盘
6. 能验证训练闭环是否成立
```

---

## 14.2 质量验收

```text
1. 计划不是随机生成
2. 每个任务都有原因
3. 每个任务能对应 T1/T2/T3/T4
4. 每个任务能对应历史短板
5. 错误能反馈到下一天计划
6. 模拟赛能反馈到下一周计划
```

---

## 14.3 不合格情况

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
```

---

# 15. 给 Codex 的最终一句话

```text
请实现 CSP-S 一等奖训练系统的 7 天闭环验证版：读取 data/analysis/ 下的历史分析结果，生成 training_profile.json、7 天训练计划、训练记录模板、周复盘报告和训练闭环验证文件。核心不是生成漂亮计划，而是验证“诊断 → 出题 → 训练 → 记录 → 复盘 → 调整 → 模拟赛验证”是否真的闭环。不能承诺一定一等奖，但必须定义并验证是否逐步接近 CSP-S 一等奖稳定区间。
```

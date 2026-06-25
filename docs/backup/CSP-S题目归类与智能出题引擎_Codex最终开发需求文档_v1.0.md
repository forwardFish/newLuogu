# CSP-S 题目归类、薄弱点诊断与智能出题引擎 · Codex 最终开发需求文档 v1.0

> 项目：AI 信奥训练教练  
> 开发对象：Codex  
> 当前阶段：在已有历史代码分析基础上，新增“题目归类 → 问题簇 → 代表题大模型分析 → 诊断回填 → Select / Mutate / Generate 出题”的核心系统。  
> 核心目标：不要把全部题目和全部源码直接丢给大模型，而是先在代码中完成全量归类、证据压缩和代表题选择，再让大模型分析典型问题，最后生成针对 CSP-S 的训练任务。

---

# 0. 本文档解决的问题

当前系统已经能做：

```text
1. 读取本地洛谷代码文件
2. 统计题目数、代码数、AC 数
3. 识别部分算法模块
4. 统计高提交次数题
5. 生成初步 T1/T2/T3/T4 能力画像
```

但当前系统还不够：

```text
1. 只是粗粒度统计，不够找到真实薄弱点
2. 没有对所有题目生成逐题诊断
3. 没有把相似题目归类成“问题簇”
4. 没有找到每类问题的 3-5 道代表题
5. 没有让大模型分析“问题簇共性”
6. 没有把大模型诊断回填到全量题目
7. 没有根据薄弱点自动生成 Select / Mutate / Generate 训练任务
```

本阶段要实现：

```text
全题目规则诊断
  ↓
题目特征向量
  ↓
问题模式标签
  ↓
问题簇归类
  ↓
代表题选择
  ↓
大模型证据包
  ↓
大模型分析问题簇
  ↓
诊断回填到所有题目
  ↓
薄弱点总结
  ↓
Select / Mutate / Generate 出题
  ↓
CSP-S 针对性训练任务包
```

一句话：

```text
用代码覆盖全部题目，用大模型分析典型问题，再把典型问题回填到全量题目。
```

---

# 1. 核心原则

## 1.1 不要让大模型直接分析全部题目

错误做法：

```text
把 829 道题、2345 份代码全部交给大模型逐题分析。
```

问题：

```text
1. 成本高
2. 上下文过长
3. 相似问题重复分析
4. 输出容易空泛
5. 不能稳定形成结构化诊断
```

正确做法：

```text
1. 代码先完成全题目特征提取
2. 代码先完成规则标签和问题簇归类
3. 每个问题簇选择 3-5 道代表题
4. 大模型只分析代表题证据包
5. 大模型输出“问题簇诊断”
6. 系统将诊断回填到同簇全部题目
```

---

## 1.2 洛谷标签只作为第一层归类

洛谷可以提供：

```text
题目标签
难度
来源
题单
通过率
题库筛选
```

但洛谷标签只能回答：

```text
这道题属于什么知识点。
```

它不能回答：

```text
学生为什么在这道题上错。
```

所以系统需要三层标签：

```text
第一层：洛谷原始标签
第二层：CSP-S 能力定位标签
第三层：个人薄弱点标签
```

---

## 1.3 出题优先级

出题引擎必须按下面顺序：

```text
Select > Mutate > Generate
```

解释：

```text
1. Select：先从洛谷现有成熟题中选题
2. Mutate：再基于薄弱点生成同构变式题
3. Generate：最后少量生成原创诊断题
```

默认比例：

```text
洛谷现有题 / 题单选题：50%
历史错题重做：20%
同构变式题：20%
原创诊断题：10%
```

---

# 2. 新增目录

```text
data/diagnosis/
data/problem-bank/
data/generated-problems/
```

---

# 3. 输入文件

必须读取已有分析结果：

```text
data/analysis/submission_manifest.json
data/analysis/code_static_metrics.json
data/analysis/problem_code_timeline.json
data/analysis/algorithm_module_stats.json
data/analysis/error_pattern_candidates.json
data/analysis/deep_review_samples.json
data/analysis/csp_s_risk_profile.json
```

可选读取洛谷题库目录：

```text
data/problem-bank/luogu_problem_catalog.json
```

如果没有洛谷题库目录，第一版允许只生成“选题标准”，不强制输出具体题号。

---

# 4. 输出文件

## 4.1 诊断输出

```text
data/diagnosis/problem_feature_vectors.json
data/diagnosis/problem_pattern_tags.json
data/diagnosis/problem_clusters.json
data/diagnosis/cluster_representatives.json
data/diagnosis/llm_evidence_packs.json
data/diagnosis/cluster_llm_diagnosis.json
data/diagnosis/problem_diagnosis.json
data/diagnosis/weakness_summary.json
data/diagnosis/module_weakness_matrix.json
data/diagnosis/error_type_distribution.json
data/diagnosis/version_diff_insights.json
data/diagnosis/weakness_report.md
data/diagnosis/targeted_training_plan.md
```

## 4.2 题库与出题输出

```text
data/problem-bank/luogu_problem_catalog.json
data/problem-bank/csp_s_problem_map.json
data/problem-bank/selected_training_tasks.json
data/problem-bank/mutated_problem_specs.json
data/problem-bank/generated_problem_specs.json
data/problem-bank/task_pack_7d.json
data/problem-bank/task_pack_7d.md
```

## 4.3 原创题输出

```text
data/generated-problems/<problemId>/statement.md
data/generated-problems/<problemId>/solution.md
data/generated-problems/<problemId>/bruteforce.cpp
data/generated-problems/<problemId>/std.cpp
data/generated-problems/<problemId>/generator.cpp
data/generated-problems/<problemId>/checker.md
data/generated-problems/<problemId>/tests/
data/generated-problems/<problemId>/metadata.json
```

---

# 5. 第一阶段：Problem Feature Vector

## 5.1 目标

对所有题目生成结构化特征向量。  
这一步由代码完成，不使用大模型。

输出：

```text
data/diagnosis/problem_feature_vectors.json
```

## 5.2 每题特征结构

```json
{
  "problemPid": "P8699",
  "problemTitle": "",
  "attemptCount": 16,
  "solved": true,
  "bestScore": 100,
  "finalResult": "AC",
  "scoreTrajectory": [0, 40, 40, 50, 100],
  "scorePattern": "PARTIAL_TO_AC",
  "resultPattern": "MULTI_FAIL_THEN_AC",
  "firstSubmitTime": "string",
  "lastSubmitTime": "string",
  "isRecent": true,
  "luoguTags": ["动态规划", "区间 DP"],
  "luoguDifficulty": "提高",
  "luoguPassRate": null,
  "codeModules": ["dp", "interval_dp"],
  "riskFlags": ["ARRAY_INDEX_RISK", "DEFINE_INT_LONG_LONG"],
  "staticMetrics": {
    "maxLineCount": 180,
    "maxBraceDepth": 5,
    "maxLoopDepth": 3,
    "hasGlobalArray": true,
    "usesRecursion": false
  },
  "versionDelta": {
    "versionCount": 8,
    "lineCountChange": "+85",
    "riskAdded": [],
    "riskRemoved": ["POSSIBLE_INT_OVERFLOW"],
    "featureAdded": ["dp_array", "init_logic"]
  },
  "candidateErrorTypes": [
    "STATE_ERROR",
    "BOUNDARY_ERROR",
    "IMPLEMENTATION_RISK"
  ]
}
```

## 5.3 scorePattern 枚举

```text
ONE_SHOT_AC
QUICK_FIX_AC
MULTI_FAIL_THEN_AC
ZERO_STUCK
PARTIAL_STUCK
PARTIAL_TO_AC
SCORE_VOLATILE
UNKNOWN_PATTERN
```

规则：

```text
一次提交 AC：ONE_SHOT_AC
2-4 次提交后 AC：QUICK_FIX_AC
>=5 次提交后 AC：MULTI_FAIL_THEN_AC
长期 0 分：ZERO_STUCK
长期部分分但未 AC：PARTIAL_STUCK
多次部分分后 AC：PARTIAL_TO_AC
分数上下波动：SCORE_VOLATILE
```

---

# 6. 第二阶段：Rule-based Pattern Tags

## 6.1 目标

给每道题打规则标签，作为后续聚类依据。

输出：

```text
data/diagnosis/problem_pattern_tags.json
```

## 6.2 标签类型

### 提交轨迹标签

```text
ONE_SHOT_AC
QUICK_FIX_AC
MULTI_FAIL_THEN_AC
PARTIAL_STUCK
ZERO_STUCK
UNSOLVED_HIGH_ATTEMPT
SCORE_VOLATILE
RECENT_WEAKNESS
```

### 模块风险标签

```text
DP_STATE_RISK
DP_INIT_RISK
INTERVAL_DP_ORDER_RISK
BINARY_SEARCH_BOUNDARY_RISK
BINARY_SEARCH_CHECK_RISK
DSU_MODEL_RISK
DSU_DISCRETIZATION_RISK
GRAPH_MODEL_RISK
SHORTEST_PATH_INIT_RISK
SEGMENT_TREE_TEMPLATE_RISK
FENWICK_INDEX_RISK
STRING_BOUNDARY_RISK
MATH_OVERFLOW_RISK
SEARCH_PRUNING_RISK
```

### 实现风险标签

```text
ARRAY_INDEX_RISK
OVERFLOW_RISK
INIT_RISK
RECURSION_STACK_RISK
LONG_CODE_DEBUG_RISK
DEEP_NESTING_RISK
MULTITEST_CLEAR_RISK
```

### CSP-S 能力标签

```text
T1_STABILITY
T2_MODELING
T3_PARTIAL_SCORE
T4_STRATEGY
```

---

# 7. 第三阶段：Problem Clusters 问题簇归类

## 7.1 目标

将相似问题的题目归为同一个问题簇。

输出：

```text
data/diagnosis/problem_clusters.json
```

## 7.2 聚类依据

不要只按算法模块聚类，要按以下组合：

```text
1. primaryModule
2. scorePattern
3. resultPattern
4. mainRiskTags
5. candidateErrorTypes
6. cspAbilityRole
7. difficultyBand
8. versionChangePattern
```

推荐 clusterKey：

```text
{primaryModule}:{mainErrorType}:{scorePattern}:{difficultyBand}:{cspRole}
```

示例：

```text
interval_dp:STATE_INIT_BOUNDARY:PARTIAL_TO_AC:提高:T2_T3
binary_search:CHECK_BOUNDARY:MULTI_FAIL_THEN_AC:普及+/提高:T2
dsu:MODEL_DISCRETIZATION:MULTI_FAIL_THEN_AC:提高:T2
implementation:LONG_CODE_DEBUG:MULTI_FAIL_THEN_AC:提高:T1_T4
partial_score:PARTIAL_SCORE_MISSED:PARTIAL_STUCK:提高+/省选-:T3
```

## 7.3 problem_clusters.json 结构

```json
{
  "clusters": [
    {
      "clusterId": "interval_dp_state_init_boundary_001",
      "clusterName": "区间 DP 状态设计、初始化和边界问题",
      "primaryModule": "interval_dp",
      "cspRoles": ["T2_MODELING", "T3_PARTIAL_SCORE"],
      "problemCount": 18,
      "avgAttempts": 4.9,
      "solvedCount": 12,
      "unsolvedCount": 6,
      "partialScoreCount": 8,
      "commonTags": [
        "INTERVAL_DP_ORDER_RISK",
        "DP_INIT_RISK",
        "BOUNDARY_ERROR"
      ],
      "problemPids": ["P8699", "P1435", "U467266"],
      "weaknessScore": 86.5,
      "hypothesis": "区间 DP 的状态设计、初始化和枚举顺序不稳定"
    }
  ]
}
```

## 7.4 weaknessScore 计算

```text
weaknessScore =
  avgAttemptsNormalized * 25
  + unsolvedRatio * 20
  + partialScoreRatio * 20
  + highAttemptRatio * 15
  + recentWeaknessRatio * 10
  + cspImportance * 10
```

归一化到 0-100。

---

# 8. 第四阶段：Representative Problems 代表题选择

## 8.1 目标

每个问题簇选 3-5 道代表题，交给大模型分析。

输出：

```text
data/diagnosis/cluster_representatives.json
```

## 8.2 每簇选择策略

每个簇最多选 5 道：

```text
1. 最典型的一道：最接近簇中心
2. 最严重的一道：提交次数最高或未 AC
3. 分数轨迹最有信息量的一道：从部分分到 AC
4. 最近做的一道：代表当前水平
5. 多版本变化明显的一道：方便分析错误修正过程
```

如果一个簇题目少于 5 道，则全部作为代表题。

## 8.3 输出结构

```json
{
  "clusterId": "interval_dp_state_init_boundary_001",
  "representatives": [
    {
      "problemPid": "P8699",
      "reason": "提交次数最高，且存在部分分到 AC 的轨迹",
      "role": "SEVERE_AND_INFORMATIVE",
      "attemptCount": 16,
      "scorePattern": "PARTIAL_TO_AC",
      "includeCodeVersions": ["first", "best", "firstAc", "final"]
    }
  ]
}
```

---

# 9. 第五阶段：LLM Evidence Pack 证据包

## 9.1 目标

给大模型的输入不是所有代码，而是压缩后的证据包。

输出：

```text
data/diagnosis/llm_evidence_packs.json
```

## 9.2 证据包结构

```json
{
  "clusterId": "interval_dp_state_init_boundary_001",
  "clusterHypothesis": "区间 DP 的状态设计、初始化和边界处理不稳定",
  "commonFeatures": {
    "primaryModule": "interval_dp",
    "avgAttempts": 4.9,
    "partialScoreRatio": 0.44,
    "commonRiskFlags": ["ARRAY_INDEX_RISK", "INIT_RISK"],
    "commonScorePatterns": ["PARTIAL_TO_AC", "MULTI_FAIL_THEN_AC"]
  },
  "representativeProblems": [
    {
      "problemPid": "P8699",
      "attemptCount": 16,
      "scoreTrajectory": [0, 40, 40, 50, 100],
      "modules": ["dp", "interval_dp"],
      "versionDiffSummary": "从低分到 AC，增加了 dp 数组、初始化逻辑和边界处理。",
      "selectedCodeSnippets": {
        "firstVersion": "只截取关键 DP/初始化/转移部分，不放完整代码",
        "bestVersion": "只截取关键 DP/初始化/转移部分，不放完整代码"
      }
    }
  ],
  "requiredOutputSchema": {
    "clusterDiagnosis": "string",
    "commonErrorTypes": [],
    "evidenceSummary": [],
    "trainingAction": {},
    "verifyMethod": "string",
    "confidence": 0.0
  }
}
```

## 9.3 代码片段抽取规则

不要把完整代码都给大模型。

只截取：

```text
1. 涉及 dp/f/g 数组的定义和转移
2. 涉及 find/union/fa 的并查集部分
3. 涉及 check/l/r/mid 的二分部分
4. 涉及 init/memset/边界初始化的部分
5. 涉及核心函数 main/solve 的关键 80-160 行
```

每个代表题最多给：

```text
firstVersion 关键片段
bestVersion 关键片段
finalVersion 关键片段
```

每个片段建议不超过：

```text
160 行
```

---

# 10. 第六阶段：LLM Cluster Diagnosis

## 10.1 目标

大模型只分析问题簇，不逐题盲读全部题。

输出：

```text
data/diagnosis/cluster_llm_diagnosis.json
```

## 10.2 大模型输出结构

```json
{
  "clusterId": "interval_dp_state_init_boundary_001",
  "clusterDiagnosis": "区间 DP 的状态设计、初始化和枚举顺序不稳定。",
  "commonErrorTypes": [
    "STATE_ERROR",
    "INIT_ERROR",
    "BOUNDARY_ERROR"
  ],
  "evidenceSummary": [
    "多道题出现部分分后才 AC",
    "代表题中 DP 数组和初始化逻辑在后续版本明显变化",
    "提交次数明显高于平均水平"
  ],
  "representativeProblems": ["P8699", "P1435", "U467266"],
  "trainingAction": {
    "module": "interval_dp",
    "tasks": [
      "2 道基础区间 DP",
      "2 道中档区间 DP",
      "每题必须先写状态、转移、初始化、len 枚举"
    ],
    "verifyMethod": "同类题提交次数 <= 2，且能独立解释枚举顺序和边界初始化。"
  },
  "confidence": 0.82,
  "confidenceLevel": "HIGH"
}
```

## 10.3 confidenceLevel

```text
HIGH：代表题证据充分，版本变化和提交轨迹支持结论
MEDIUM：有多条证据，但仍需要训练记录验证
LOW：证据较弱，仅作为观察项
UNKNOWN：信息不足
```

---

# 11. 第七阶段：Diagnosis Propagation 诊断回填

## 11.1 目标

把大模型对问题簇的诊断回填到该簇所有题目。

输出：

```text
data/diagnosis/problem_diagnosis.json
```

## 11.2 每题诊断结构

```json
{
  "problemPid": "Pxxxx",
  "clusterId": "interval_dp_state_init_boundary_001",
  "mainWeakness": "疑似区间 DP 状态设计和初始化不稳定",
  "likelyErrorTypes": [
    "STATE_ERROR",
    "INIT_ERROR",
    "BOUNDARY_ERROR"
  ],
  "evidence": [
    "属于 interval_dp_state_init_boundary_001",
    "提交次数 7，高于平均值",
    "出现部分分轨迹",
    "存在 ARRAY_INDEX_RISK"
  ],
  "trainingAction": {
    "actionType": "module_drill",
    "module": "interval_dp",
    "recommendation": "安排区间 DP 专项训练，每题必须写状态、转移、初始化和枚举顺序。",
    "verifyMethod": "同类题提交次数 <= 2，且能独立解释状态定义和初始化。"
  },
  "confidence": 0.76,
  "confidenceLevel": "MEDIUM",
  "source": "CLUSTER_INFERRED"
}
```

---

# 12. 第八阶段：Weakness Summary 薄弱点总结

## 12.1 输出

```text
data/diagnosis/weakness_summary.json
data/diagnosis/weakness_report.md
```

## 12.2 weakness_summary.json

```json
{
  "topWeaknesses": [
    {
      "weaknessId": "interval_dp_state_init",
      "title": "区间 DP 状态设计、初始化和枚举顺序不稳定",
      "severity": 86.5,
      "relatedModules": ["interval_dp", "dp"],
      "relatedErrorTypes": ["STATE_ERROR", "INIT_ERROR", "BOUNDARY_ERROR"],
      "evidenceProblems": ["P8699", "P1435", "U467266"],
      "problemCount": 18,
      "trainingAction": "安排 4 道区间 DP 训练题，2 道基础，2 道中档。",
      "verifyMethod": "提交次数 <= 2，并能独立说明状态和 len 枚举顺序。"
    }
  ]
}
```

## 12.3 weakness_report.md 结构

```md
# 全题目级薄弱点诊断报告

## 1. 总览

## 2. 最严重的 10 个薄弱点

## 3. 每个薄弱点的证据题目

## 4. 模块弱点矩阵

## 5. 错误类型分布

## 6. 高价值复盘题

## 7. 针对性训练建议

## 8. 下一步执行计划
```

要求：

```text
每个结论必须有证据题目
每个薄弱点必须有训练动作
每个训练动作必须有验证方式
```

---

# 13. 第九阶段：Problem Selection & Generation Engine

## 13.1 目标

根据薄弱点自动生成下一步训练任务。

三种出题方式：

```text
1. Select：从洛谷选题
2. Mutate：生成同构变式题
3. Generate：原创诊断题
```

优先级：

```text
Select > Mutate > Generate
```

---

# 14. Luogu Problem Catalog：洛谷题库目录

## 14.1 输出文件

```text
data/problem-bank/luogu_problem_catalog.json
```

## 14.2 数据来源

第一版支持三种方式：

```text
1. 手动导入 JSON / CSV
2. 从已有题目信息缓存导入
3. 后续通过浏览器授权或公开页面补充
```

不要强依赖匿名接口。

## 14.3 catalog 结构

```json
{
  "problemPid": "P1435",
  "title": "string",
  "difficulty": "提高",
  "difficultyLevel": 5,
  "luoguTags": ["动态规划", "字符串"],
  "source": "luogu",
  "problemUrl": "https://www.luogu.com.cn/problem/P1435",
  "passRate": null,
  "submitCount": null,
  "acceptedCount": null,
  "isAlreadySolved": true,
  "isAlreadyAttempted": true,
  "historicalAttemptCount": 6,
  "relatedWeaknessTags": ["DP_STATE_ERROR", "BOUNDARY_ERROR"],
  "lastUpdatedAt": "string"
}
```

---

# 15. Select：从洛谷选题

## 15.1 目标

根据薄弱点，从洛谷题库目录中选择合适题目。

输出：

```text
data/problem-bank/selected_training_tasks.json
```

## 15.2 选题输入

```text
weakness_summary.json
luogu_problem_catalog.json
problem_diagnosis.json
training_priority.json
```

## 15.3 选题规则

每个薄弱点选题时考虑：

```text
1. 模块匹配度
2. 难度匹配度
3. 是否已做过
4. 历史是否高提交
5. 是否适合 T1/T2/T3/T4
6. 是否能验证该薄弱点
7. 是否有成熟评测
```

## 15.4 任务结构

```json
{
  "weaknessId": "interval_dp_state_init",
  "targetAbility": "T2_MODELING",
  "tasks": [
    {
      "taskType": "SELECT_EXISTING",
      "source": "luogu",
      "problemPid": "P1435",
      "problemUrl": "https://www.luogu.com.cn/problem/P1435",
      "module": "interval_dp",
      "difficulty": "提高",
      "selectionReason": "用于训练区间 DP 状态定义和初始化。",
      "trainingGoal": "写清状态定义、转移、初始化和 len 枚举顺序。",
      "timeLimitMinutes": 60,
      "verifyMethod": "提交次数 <= 2，能说明初始化和 len 枚举。"
    }
  ]
}
```

## 15.5 Select 适用场景

```text
1. T1 稳定性训练
2. T2 建模训练
3. 标准算法模块训练
4. 需要成熟评测的训练
```

---

# 16. Mutate：同构变式题

## 16.1 目标

基于已有薄弱点和代表题，生成同构变式题。

注意：

```text
不能直接复制洛谷原题题面。
不能只是换人名、换故事背景。
不能照搬原题表达。
```

正确做法：

```text
抽象算法结构
保留核心能力点
重写题面语境
改变约束或输出目标
生成新的训练题规格
```

## 16.2 输出文件

```text
data/problem-bank/mutated_problem_specs.json
```

## 16.3 有效变式方式

有效变式应该改变：

```text
1. 状态定义
2. 转移方向
3. 数据范围
4. 输出目标
5. 特殊性质
6. 多测要求
7. 子任务设计
8. 优化要求
```

无效变式：

```text
小明换小红
苹果换石子
n 改成 m
题面换皮但算法完全显性
```

## 16.4 mutated_problem_specs.json

```json
{
  "mutationId": "mut_interval_dp_001",
  "baseWeaknessId": "interval_dp_state_init",
  "baseProblemPids": ["P8699", "P1435"],
  "mutationGoal": "改变输出目标，验证是否真正理解区间 DP 状态定义和初始化。",
  "targetAbility": "T2_MODELING",
  "module": "interval_dp",
  "difficulty": "提高",
  "problemArchetype": {
    "coreAlgorithm": "interval_dp",
    "stateShape": "dp[l][r]",
    "keyChallenge": "初始化与区间长度枚举",
    "mustTest": ["len=1", "len=2", "full interval", "empty transition"]
  },
  "newProblemSpec": {
    "title": "string",
    "storyBrief": "全新语境，不复制原题题面",
    "inputSpec": "string",
    "outputSpec": "string",
    "constraints": "string",
    "requiredSubtasks": [
      "30 分暴力",
      "60 分基础 DP",
      "100 分完整区间 DP"
    ]
  },
  "verifyMethod": "学生必须独立写出状态定义、初始化和 len 枚举顺序。"
}
```

---

# 17. Generate：原创诊断题

## 17.1 目标

直接生成用于诊断某个薄弱点的新题。

原创题不用于大量刷题，主要用于：

```text
1. 专项诊断
2. 部分分训练
3. 模拟赛 T3/T4 子任务训练
4. 检查迁移能力
```

## 17.2 输出文件

```text
data/problem-bank/generated_problem_specs.json
data/generated-problems/<problemId>/
```

## 17.3 原创题必须包含完整题包

每道原创题必须包含：

```text
1. 题面
2. 输入格式
3. 输出格式
4. 数据范围
5. 样例
6. 标准解法
7. 暴力解法
8. 数据生成器
9. 对拍器设计
10. 测试点设计
11. 难度定位
12. 对应薄弱点
13. 验收标准
```

如果缺少标准解、暴力或数据生成器，则题目状态必须标记为：

```text
DRAFT_NOT_FOR_FORMAL_TEST
```

## 17.4 generated_problem_specs.json

```json
{
  "generatedProblemId": "gen_interval_dp_001",
  "weaknessId": "interval_dp_state_init",
  "targetAbility": "T3_PARTIAL_SCORE",
  "module": "interval_dp",
  "difficulty": "提高+/省选-",
  "goal": "训练 30/50/70 分分层拿分能力",
  "problemPackage": {
    "statementPath": "data/generated-problems/gen_interval_dp_001/statement.md",
    "solutionPath": "data/generated-problems/gen_interval_dp_001/solution.md",
    "bruteForcePath": "data/generated-problems/gen_interval_dp_001/bruteforce.cpp",
    "standardSolutionPath": "data/generated-problems/gen_interval_dp_001/std.cpp",
    "generatorPath": "data/generated-problems/gen_interval_dp_001/generator.cpp",
    "testsPath": "data/generated-problems/gen_interval_dp_001/tests/"
  },
  "subtasks": [
    {
      "score": 30,
      "description": "小 n 暴力"
    },
    {
      "score": 60,
      "description": "特殊性质"
    },
    {
      "score": 100,
      "description": "完整正解"
    }
  ],
  "status": "DRAFT_NOT_FOR_FORMAL_TEST"
}
```

---

# 18. 针对 CSP-S 的出题策略

## 18.1 T1 稳定性题

目标：

```text
稳拿基础分
减少低级错误
提高一次 AC
```

题型：

```text
模拟
枚举
排序
前缀和
简单贪心
简单字符串
简单数学
```

推荐出题方式：

```text
Select 为主
少量 Mutate
不需要大量 Generate
```

验收：

```text
限时 30-40 分钟
提交次数 <= 1-2
不能看题解
必须写边界检查清单
```

## 18.2 T2 建模转化题

目标：

```text
看到题后快速判断模型
稳定写出中档算法
```

题型：

```text
二分答案
基础 DP
区间 DP
并查集
图论建模
搜索剪枝
贪心证明
```

推荐出题方式：

```text
Select + Mutate
```

验收：

```text
写代码前必须写：
1. 算法模型
2. 状态/图/集合/check 函数含义
3. 复杂度
4. 边界
```

## 18.3 T3 部分分训练题

目标：

```text
不会正解也能拿 30-60 分
```

题型：

```text
难题
有多个子任务
数据范围分层明显
特殊性质明显
```

推荐出题方式：

```text
Mutate + Generate
```

验收：

```text
不要求 AC
必须写：
1. 30 分暴力
2. 50 分优化
3. 70 分特殊性质
4. 正解猜测
```

## 18.4 T4 模拟赛策略题

目标：

```text
整场比赛策略
时间分配
取舍
止损
部分分
```

题型：

```text
四题组合
T1 + T2 + T3 + T4
```

推荐出题方式：

```text
真实 CSP-S / NOIP / 联赛模拟题组合为主
少量原创组合
```

验收：

```text
记录开题顺序
记录每题用时
记录哪题硬刚失败
记录哪题没拿到部分分
复盘如果重做能多拿多少
```

---

# 19. Task Pack：最终训练任务包

输出：

```text
data/problem-bank/task_pack_7d.json
data/problem-bank/task_pack_7d.md
```

## 19.1 task_pack_7d.json

```json
{
  "generatedAt": "string",
  "goal": "CSP-S_FIRST_PRIZE",
  "basedOnWeaknesses": [
    "interval_dp_state_init",
    "binary_search_boundary",
    "dsu_model_discretization"
  ],
  "days": [
    {
      "day": 1,
      "theme": "T1 稳定性 + 边界检查",
      "tasks": [
        {
          "taskType": "SELECT_EXISTING",
          "targetAbility": "T1_STABILITY",
          "selectionRule": "选择 2 道模拟/前缀和/简单贪心题。",
          "trainingGoal": "提高一次 AC，减少边界错误。",
          "verifyMethod": "提交次数 <= 2，提交前完成检查清单。"
        }
      ]
    },
    {
      "day": 2,
      "theme": "区间 DP 状态和初始化",
      "tasks": [
        {
          "taskType": "SELECT_EXISTING",
          "module": "interval_dp",
          "trainingGoal": "训练状态定义和初始化。"
        },
        {
          "taskType": "MUTATE_EXISTING",
          "module": "interval_dp",
          "trainingGoal": "验证是否能迁移到变式题。"
        }
      ]
    }
  ]
}
```

---

# 20. 脚本设计

## 20.1 diagnosis 脚本

```text
scripts/diagnosis/build-problem-feature-vectors.ts
scripts/diagnosis/classify-problem-patterns.ts
scripts/diagnosis/build-problem-clusters.ts
scripts/diagnosis/select-cluster-representatives.ts
scripts/diagnosis/build-llm-evidence-packs.ts
scripts/diagnosis/run-cluster-llm-diagnosis.ts
scripts/diagnosis/propagate-cluster-diagnosis.ts
scripts/diagnosis/generate-weakness-summary.ts
scripts/diagnosis/generate-weakness-report.ts
scripts/diagnosis/build-diagnosis-system.ts
scripts/diagnosis/diagnosis-lib.ts
```

## 20.2 problem-bank 脚本

```text
scripts/problem-bank/build-luogu-catalog.ts
scripts/problem-bank/build-csp-s-problem-map.ts
scripts/problem-bank/select-training-tasks.ts
scripts/problem-bank/mutate-problem-specs.ts
scripts/problem-bank/generate-diagnostic-problems.ts
scripts/problem-bank/build-task-pack.ts
scripts/problem-bank/build-problem-engine.ts
```

---

# 21. package.json scripts

新增：

```json
{
  "scripts": {
    "diagnosis:vectors": "tsx scripts/diagnosis/build-problem-feature-vectors.ts",
    "diagnosis:patterns": "tsx scripts/diagnosis/classify-problem-patterns.ts",
    "diagnosis:clusters": "tsx scripts/diagnosis/build-problem-clusters.ts",
    "diagnosis:representatives": "tsx scripts/diagnosis/select-cluster-representatives.ts",
    "diagnosis:evidence": "tsx scripts/diagnosis/build-llm-evidence-packs.ts",
    "diagnosis:llm": "tsx scripts/diagnosis/run-cluster-llm-diagnosis.ts",
    "diagnosis:propagate": "tsx scripts/diagnosis/propagate-cluster-diagnosis.ts",
    "diagnosis:report": "tsx scripts/diagnosis/generate-weakness-report.ts",
    "diagnosis:all": "tsx scripts/diagnosis/build-diagnosis-system.ts",

    "problem-bank:catalog": "tsx scripts/problem-bank/build-luogu-catalog.ts",
    "problem-bank:select": "tsx scripts/problem-bank/select-training-tasks.ts",
    "problem-bank:mutate": "tsx scripts/problem-bank/mutate-problem-specs.ts",
    "problem-bank:generate": "tsx scripts/problem-bank/generate-diagnostic-problems.ts",
    "problem-bank:pack": "tsx scripts/problem-bank/build-task-pack.ts",
    "problem-bank:all": "tsx scripts/problem-bank/build-problem-engine.ts"
  }
}
```

---

# 22. 最小运行流程

第一阶段只跑诊断，不跑大模型：

```bash
pnpm diagnosis:vectors
pnpm diagnosis:patterns
pnpm diagnosis:clusters
pnpm diagnosis:representatives
pnpm diagnosis:evidence
```

第二阶段开启大模型：

```bash
pnpm diagnosis:llm
pnpm diagnosis:propagate
pnpm diagnosis:report
```

第三阶段生成训练任务包：

```bash
pnpm problem-bank:select
pnpm problem-bank:mutate
pnpm problem-bank:generate
pnpm problem-bank:pack
```

完整流程：

```bash
pnpm diagnosis:all
pnpm problem-bank:all
```

---

# 23. LLM 使用边界

大模型只做：

```text
1. 分析代表题之间的共性问题
2. 总结问题簇主薄弱点
3. 生成训练动作说明
4. 生成 Mutate / Generate 的题目规格草案
```

大模型不做：

```text
1. 直接逐题分析所有题目
2. 直接替代规则诊断
3. 直接复制洛谷题面
4. 在没有标准解/暴力/数据生成器时把原创题标记为正式可用
```

---

# 24. 验收标准

## 24.1 诊断验收

```text
1. 所有题目都有 problem_feature_vector
2. 所有题目都有 pattern tags
3. 所有题目都归入 problem cluster
4. 每个 cluster 有 hypothesis
5. 每个 cluster 选出 3-5 个代表题
6. 每个 cluster 有 evidence pack
7. LLM 只分析 cluster，不逐题盲读全部题
8. 诊断能回填到所有题
9. 每题有 mainWeakness、likelyErrorTypes、evidence、confidence
```

## 24.2 出题验收

```text
1. 能根据 weakness_summary 生成训练任务
2. Select 能输出洛谷选题标准或具体题号
3. Mutate 能输出同构变式题规格
4. Generate 能输出原创诊断题规格
5. 每个任务都有 trainingGoal
6. 每个任务都有 verifyMethod
7. 任务能对应 T1/T2/T3/T4
8. 任务能对应具体薄弱点
```

## 24.3 不合格情况

```text
1. 只输出“多练 DP”
2. 只按洛谷标签简单分类
3. 不结合个人提交轨迹
4. 不结合代码版本变化
5. 不生成问题簇
6. 不选代表题
7. 所有题都直接丢给大模型
8. Mutate 只是换皮
9. Generate 没有标准解/暴力/数据生成器
10. 训练任务没有验收方法
```

---

# 25. 给 Codex 的最终指令

```text
请实现 CSP-S 题目归类、薄弱点诊断与智能出题引擎。系统需要读取 data/analysis/ 中已有历史代码分析结果，先为所有题目生成 problem_feature_vectors，再用规则标签归类成 problem_clusters，每个问题簇选择 3-5 道代表题构建 llm_evidence_packs，让大模型只分析问题簇而不是逐题分析全部源码。随后将大模型的问题簇诊断回填到所有题目，生成 problem_diagnosis、weakness_summary 和 weakness_report。最后实现 Problem Selection & Generation Engine，包括 Select 从洛谷题库选题、Mutate 生成同构变式题、Generate 生成原创诊断题，并输出 task_pack_7d。核心目标是：从“统计我做过什么”升级为“诊断我为什么错，以及下一步具体怎么练”。
```

---

# 26. 最终目标

最终系统要让用户看到：

```text
我到底弱在哪里
为什么说我弱
证据是哪几道题
这些题共同暴露了什么模式
下一步具体练什么
练完怎么验证是否改善
```

一句话：

```text
洛谷负责题目基础分类；
系统负责个人薄弱点分类；
大模型负责分析代表题共性；
出题引擎负责 Select / Mutate / Generate 针对性训练。
```

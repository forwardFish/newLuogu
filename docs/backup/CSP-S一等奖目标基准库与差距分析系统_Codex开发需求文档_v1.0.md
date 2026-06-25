# CSP-S 一等奖目标基准库与差距分析系统 · Codex 开发需求文档 v1.0

> 项目：AI 信奥训练教练  
> 开发对象：Codex  
> 当前目标：先建立“CSP-S 一等奖目标基准”，再把用户的洛谷历史题、代码分析、训练日志映射到这个基准上，最终准确判断“离 CSP-S 一等奖差在哪里、差多少、下一步练什么”。  
> 本文重点：两个最核心基准库  
> 1. 知识点 / 能力树  
> 2. CSP-S 历年真题库  

---

# 0. 先说结论：哪些资料能找到，哪些需要人工准备

## 0.1 可以公开找到的资料入口

### A. 知识点 / 能力大纲

可以找到官方来源：

```text
NOI 官网已经发布《NOI 大纲（2025 年修订版）》。
```

系统使用方式：

```text
1. 保存官方来源 URL
2. 下载或由用户提供 PDF
3. 抽取其中的知识体系
4. 转换成 CSP-S 训练能力树
5. 再细分为可训练、可验证的三级/四级能力点
```

注意：

```text
NOI 大纲是最高级知识依据，但不能直接等同于 CSP-S 一等奖训练能力树。
必须二次拆解为“可诊断、可训练、可验证”的能力点。
```

---

### B. CSP-S 历年真题

可以找到两个公开入口：

```text
1. NOI 官网“题目与数据”栏目
2. 洛谷 CSP-S 提高级题库标签页
```

用途：

```text
NOI 官网：官方题目与数据来源
洛谷：题号、标签、难度、题目链接、训练入口
```

注意：

```text
洛谷标签不能直接作为最终知识点真值。
洛谷题库中可能包含地方题、省份题、模拟题或扩展题。
最终 2019—2025 每年 T1/T2/T3/T4 顺序，必须以官方资料或人工确认表为准。
```

---

## 0.2 不能完全自动完成的部分

以下内容不能完全靠自动抓取，必须人工确认或大模型复核：

```text
1. 2019—2025 每年 CSP-S 全国统一第二轮四题的准确 T1/T2/T3/T4 顺序
2. 每道真题的主知识点、次知识点、三级能力点
3. 每道题的部分分结构
4. 每道题的一等奖目标分
5. 每道题的常见失分点
6. 一道题到底是满分知识点，还是部分分知识点
7. 某个洛谷标签是否误导
8. 用户是否做过该真题、是否看过题解、是否独立完成
9. 目标省份一等奖线
```

所以系统必须支持：

```text
自动采集 + 人工确认 + 大模型复核 + 置信度字段
```

---

# 1. 用户需要准备什么

## 1.1 必须准备

```text
1. 目标年份
   例如：2026

2. 目标省份
   例如：福建、浙江、广东、北京等

3. 每周可训练时间
   例如：每周 12 小时 / 20 小时 / 30 小时

4. 是否已经做过 CSP-S 历年真题
   包括是否看过题解、是否独立 AC、是否只看过讲解

5. 当前已有系统目录
   例如：C:\LYH\Code\newLuogu

6. 已有分析目录
   data/analysis/
   data/diagnosis/
```

---

## 1.2 强烈建议准备的 4 个 CSV

### 1. manual_past_problem_index.csv

路径：

```text
data/csp-s-benchmark/manual_past_problem_index.csv
```

用途：

```text
人工确认 2019—2025 每年 4 道 CSP-S 提高级第二轮真题。
这是最关键的基准表。
```

字段：

```csv
year,slot,title,luoguPid,problemUrl,officialUrl,isNationalOfficial,notes
2019,T1,格雷码,P5657,https://www.luogu.com.cn/problem/P5657,,true,
2019,T2,括号树,P5658,https://www.luogu.com.cn/problem/P5658,,true,
```

---

### 2. manual_knowledge_review.csv

路径：

```text
data/csp-s-benchmark/manual_knowledge_review.csv
```

用途：

```text
人工或大模型复核每道真题的知识点、能力点、部分分结构。
```

字段：

```csv
year,slot,luoguPid,primary,secondary,thirdLevelAbilities,nonKnowledgeSkills,partialScoreNotes,classificationConfidence,reviewerNote
2024,T1,Pxxxx,BASIC_ALGORITHM,SIMULATION,"READING;BOUNDARY","IMPLEMENTATION_STABILITY","小数据暴力",0.8,
```

---

### 3. student_past_problem_records.csv

路径：

```text
data/csp-s-benchmark/student_past_problem_records.csv
```

用途：

```text
记录孩子是否做过这些 CSP-S 真题，是否独立完成，是否看过题解。
```

字段：

```csv
year,slot,luoguPid,hasDone,doneDate,isBlindTest,hasSeenSolution,result,score,timeMinutes,submissionCount,errorTypes,reviewNote
2024,T1,Pxxxx,true,2026-06-25,false,true,AC,100,40,2,"BOUNDARY_ERROR","看过题解后重写，不能作为盲测证据"
```

---

### 4. province_first_prize_lines.csv

路径：

```text
data/csp-s-benchmark/province_first_prize_lines.csv
```

用途：

```text
保存目标省份近几年 CSP-S 一等奖线。
如果暂时找不到省线，可以先用全国基准线 + 安全垫。
```

字段：

```csv
year,province,nationalBaseline,provinceLine,sourceUrl,notes
2024,福建,165,,,
2025,福建,131,,,
```

---

# 2. 核心库一：知识点 / 能力树

## 2.1 文件位置

```text
data/csp-s-benchmark/knowledge_ability_tree.json
data/csp-s-benchmark/knowledge_ability_tree.md
```

---

## 2.2 设计原则

不要机械复制 NOI 大纲。

必须把大纲转换为：

```text
可诊断
可训练
可出题
可验证
可映射到 CSP-S 真题
```

每个知识点至少拆成：

```text
一级领域
二级模块
三级可观察能力
四级错误模式
CSP-S 相关题位
训练方式
验证方式
```

---

## 2.3 knowledge_ability_tree.json 结构

```json
{
  "version": "1.0",
  "source": [
    {
      "name": "NOI 大纲（2025 年修订版）",
      "type": "official",
      "url": "https://www.noi.cn/xw/2025-04-18/841584.shtml"
    }
  ],
  "domains": [
    {
      "domainId": "DP",
      "name": "动态规划",
      "modules": [
        {
          "moduleId": "DP.INTERVAL",
          "name": "区间 DP",
          "cspRelevance": {
            "slots": ["T2", "T3", "T4"],
            "role": ["MODELING", "PARTIAL_SCORE"]
          },
          "abilities": [
            {
              "abilityId": "DP.INTERVAL.RECOGNIZE_STRUCTURE",
              "name": "识别区间子结构",
              "observableBehaviors": [
                "能从题意中识别子问题是连续区间",
                "能判断状态是否应使用 dp[l][r]"
              ],
              "errorTypes": [
                "MODEL_ERROR",
                "STATE_ERROR"
              ],
              "trainingMethods": [
                "Select: 选区间 DP 基础题",
                "Mutate: 改变输出目标验证状态迁移",
                "Generate: 生成必须定义 dp[l][r] 的诊断题"
              ],
              "verifyMethods": [
                "做题前能写出状态含义",
                "同类新题提交次数 <= 2"
              ]
            },
            {
              "abilityId": "DP.INTERVAL.INIT_AND_ORDER",
              "name": "初始化与 len 枚举顺序",
              "observableBehaviors": [
                "能写出 len=1 或空区间初始化",
                "能按区间长度枚举",
                "能解释为什么不能随意枚举 l 和 r"
              ],
              "errorTypes": [
                "INIT_ERROR",
                "BOUNDARY_ERROR",
                "ENUMERATION_ORDER_ERROR"
              ]
            }
          ]
        }
      ]
    }
  ],
  "nonKnowledgeSkills": [
    {
      "skillId": "PARTIAL_SCORE.SUBTASK_ANALYSIS",
      "name": "部分分子任务拆解能力",
      "description": "面对不会正解的 T3/T4，能根据数据范围写出 30/50/70 分方案。",
      "cspSlots": ["T3", "T4"],
      "observableBehaviors": [
        "20 分钟内写出暴力方案",
        "能识别小数据、特殊性质、弱化约束",
        "能写出可运行的部分分代码"
      ],
      "errorTypes": [
        "PARTIAL_SCORE_MISSED",
        "STRATEGY_ERROR"
      ]
    }
  ]
}
```

---

## 2.4 必须包含的一级领域

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

---

## 2.5 math 必须拆细

不能再只有 `math`。

至少拆成：

```text
MATH.NUMBER_THEORY
MATH.MODULAR
MATH.GCD_FACTOR
MATH.COMBINATORICS
MATH.COUNTING
MATH.RECURRENCE
MATH.FORMULA_DERIVATION
MATH.INVARIANT
MATH.CONSTRUCTION
MATH.PERIODICITY
MATH.OVERFLOW_RANGE
MATH.MODEL_TO_DP
```

---

## 2.6 implementation 必须拆细

不能再只有 `implementation risk`。

至少拆成：

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

---

# 3. 核心库二：CSP-S 历年真题库

## 3.1 文件位置

```text
data/csp-s-benchmark/past_problems_2019_2025.json
data/csp-s-benchmark/past_problems_2019_2025.md
```

---

## 3.2 数据来源优先级

```text
优先级 1：用户人工确认表
优先级 2：NOI 官网题目与数据
优先级 3：NOI 官网题目分析报告
优先级 4：洛谷 CSP-S 提高级题库标签页
优先级 5：大模型辅助分类
优先级 6：规则推断
```

说明：

```text
最终 T1/T2/T3/T4 顺序必须以人工确认表或官方资料为准。
不能只靠洛谷列表顺序。
```

---

## 3.3 past_problems_2019_2025.json 结构

```json
{
  "version": "1.0",
  "range": {
    "from": 2019,
    "to": 2025
  },
  "problems": [
    {
      "year": 2024,
      "slot": "T1",
      "problemId": "CSP-S-2024-T1",
      "luoguPid": "Pxxxx",
      "title": "题目名称",
      "isNationalOfficial": true,
      "sourceUrls": {
        "noi": "",
        "luogu": "",
        "analysis": ""
      },
      "fullScore": 100,
      "slotRole": {
        "position": "T1",
        "role": "STABLE_SCORE",
        "firstPrizeTargetScore": {
          "conservative": 80,
          "normal": 90,
          "strong": 100
        }
      },
      "knowledgeMapping": {
        "primary": [],
        "secondary": [],
        "thirdLevelAbilities": [],
        "nonKnowledgeSkills": []
      },
      "modelType": [],
      "requiredTransformations": [],
      "implementationRisks": [],
      "partialScoreStructure": [
        {
          "score": 30,
          "condition": "小数据暴力",
          "expectedMethod": "枚举 / 搜索"
        },
        {
          "score": 60,
          "condition": "特殊性质",
          "expectedMethod": "简化模型"
        },
        {
          "score": 100,
          "condition": "完整数据",
          "expectedMethod": "正解"
        }
      ],
      "commonFailureModes": [],
      "classification": {
        "status": "NEEDS_REVIEW",
        "confidence": 0.0,
        "reviewedBy": null,
        "reviewNote": ""
      }
    }
  ]
}
```

---

## 3.4 每道题必须标注的字段

```text
1. 年份
2. 题位 T1/T2/T3/T4
3. 洛谷题号
4. 官方题目来源
5. 题目标题
6. 满分
7. 主知识点
8. 次知识点
9. 三级能力点
10. 非知识点能力
11. 建模类型
12. 关键转化
13. 实现风险
14. 部分分结构
15. 常见失败模式
16. 一等奖目标选手合理目标分
17. 是否用户做过
18. 是否看过题解
19. 是否独立完成
20. 分类置信度
```

---

## 3.5 真题库校验规则

必须校验：

```text
1. 每年必须有 4 道全国统一 CSP-S 第二轮题
2. 每道题必须有 slot
3. 每道题必须有 sourceUrls
4. 每道题必须有至少 1 个 knowledgeMapping
5. 每道题必须有 firstPrizeTargetScore
6. 每道题必须有 classification.status
7. 不能把地方题、省选题、模拟题混入全国统一四题
```

如果无法确认，标记：

```text
NEEDS_MANUAL_CONFIRMATION
```

---

# 4. 系统实现流程

## 4.1 总流程

```text
抓取/导入 NOI 大纲
  ↓
生成 knowledge_ability_tree
  ↓
抓取/导入 CSP-S 历年真题索引
  ↓
生成 past_problems_2019_2025
  ↓
人工确认 T1/T2/T3/T4
  ↓
把每道真题映射到知识能力树
  ↓
把用户历史题映射到知识能力树
  ↓
计算知识覆盖和掌握等级
  ↓
计算预计失分
  ↓
生成一等目标差距报告
  ↓
选择下一轮诊断题和训练题
```

---

## 4.2 新增脚本

目录：

```text
scripts/csp-benchmark/
```

脚本：

```text
scripts/csp-benchmark/build-source-registry.ts
scripts/csp-benchmark/import-noi-syllabus.ts
scripts/csp-benchmark/build-knowledge-tree.ts
scripts/csp-benchmark/import-past-problem-index.ts
scripts/csp-benchmark/build-past-problem-db.ts
scripts/csp-benchmark/classify-past-problems.ts
scripts/csp-benchmark/validate-past-problem-db.ts
scripts/csp-benchmark/map-student-evidence-to-skills.ts
scripts/csp-benchmark/calculate-skill-mastery.ts
scripts/csp-benchmark/calculate-expected-score-loss.ts
scripts/csp-benchmark/generate-first-prize-gap-report.ts
scripts/csp-benchmark/select-diagnostic-past-problems.ts
scripts/csp-benchmark/build-csp-benchmark-system.ts
```

---

## 4.3 package.json scripts

```json
{
  "scripts": {
    "csp:sources": "tsx scripts/csp-benchmark/build-source-registry.ts",
    "csp:syllabus": "tsx scripts/csp-benchmark/import-noi-syllabus.ts",
    "csp:tree": "tsx scripts/csp-benchmark/build-knowledge-tree.ts",
    "csp:import-problems": "tsx scripts/csp-benchmark/import-past-problem-index.ts",
    "csp:build-problems": "tsx scripts/csp-benchmark/build-past-problem-db.ts",
    "csp:classify": "tsx scripts/csp-benchmark/classify-past-problems.ts",
    "csp:validate": "tsx scripts/csp-benchmark/validate-past-problem-db.ts",
    "csp:map-evidence": "tsx scripts/csp-benchmark/map-student-evidence-to-skills.ts",
    "csp:mastery": "tsx scripts/csp-benchmark/calculate-skill-mastery.ts",
    "csp:loss": "tsx scripts/csp-benchmark/calculate-expected-score-loss.ts",
    "csp:report": "tsx scripts/csp-benchmark/generate-first-prize-gap-report.ts",
    "csp:diagnostic": "tsx scripts/csp-benchmark/select-diagnostic-past-problems.ts",
    "csp:all": "tsx scripts/csp-benchmark/build-csp-benchmark-system.ts"
  }
}
```

运行：

```bash
pnpm csp:all
```

---

# 5. 自动抓取能力边界

## 5.1 可以自动做

```text
1. 从洛谷 CSP-S 标签页抓候选题号、标题、年份、标签、难度
2. 从 NOI 题目与数据页面抓题目与数据入口
3. 从 NOI 大纲页面保存来源 URL
4. 读取用户提供的 CSV
5. 合并自动抓取数据和人工表
6. 生成待复核列表
```

---

## 5.2 不建议完全自动做

```text
1. 自动判定全国统一四题
2. 自动判定 T1/T2/T3/T4 顺序
3. 自动判定部分分结构
4. 自动判定一等奖目标分
5. 自动判定用户是否看过题解
6. 自动判定某道题是否真正属于某个三级能力
```

这些必须：

```text
规则 + 大模型 + 人工确认
```

---

# 6. 数据合并优先级

同一个字段有多来源时，优先级：

```text
1. 用户人工确认表
2. NOI 官方来源
3. 洛谷题库信息
4. 大模型分类
5. 规则推断
```

每个字段必须保存：

```json
{
  "value": "DP.INTERVAL",
  "source": "manual",
  "confidence": 0.95
}
```

---

# 7. 一等奖差距计算

## 7.1 掌握等级

每个三级能力输出一个掌握等级：

```text
NO_EVIDENCE
EXPOSED
UNSTABLE
BASIC
TRANSFERABLE
CONTEST_STABLE
```

---

## 7.2 证据权重

| 证据类型 | 权重 |
|---|---:|
| CSP-S 真题盲测独立完成 | 1.00 |
| 四题模拟赛中完成 | 0.95 |
| 未做过洛谷同类新题独立完成 | 0.80 |
| 历史题一次 AC | 0.65 |
| 历史题多次提交后 AC | 0.35 |
| 看过题解后 AC | 0.15 |
| 规则推断但未验证 | 0.10 |
| 模拟训练日志 | 0.00～0.20 |

---

## 7.3 预计失分

公式：

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

输出：

```json
{
  "abilityId": "PARTIAL_SCORE.SUBTASK_ANALYSIS",
  "name": "部分分子任务拆解能力",
  "status": "NEEDS_BLIND_VALIDATION",
  "historicalEvidenceCount": 18,
  "pastProblemEvidenceCount": 0,
  "blindTestCount": 0,
  "masteryLevel": "UNSTABLE",
  "expectedLoss": {
    "value": 21.6,
    "confidenceInterval": [12, 35],
    "confidence": 0.55
  },
  "firstPrizeImpact": "HIGH",
  "recommendedAction": "优先安排 3 道 T3/T4 真题盲测。"
}
```

---

# 8. 最终报告

输出：

```text
data/csp-s-benchmark/first_prize_gap_report.json
data/csp-s-benchmark/first_prize_gap_report.md
```

报告结构：

```md
# CSP-S 一等奖目标差距分析报告

## 1. 目标定义

## 2. 数据可信度说明

## 3. CSP-S 2019—2025 真题结构

## 4. 知识能力频率矩阵

## 5. 我的历史题能力覆盖

## 6. 我的真题完成记录

## 7. T1/T2/T3/T4 真实能力判断

## 8. 已确认薄弱点

## 9. 待验证薄弱点

## 10. 已排除或降级的误判

## 11. 预计失分排序

## 12. 与一等奖安全线的差距

## 13. 下一轮诊断题

## 14. 下一阶段训练计划
```

---

# 9. 验收标准

## 9.1 知识点库验收

```text
1. 有 knowledge_ability_tree.json
2. math 不再是单一大类
3. implementation 不再是单一大类
4. 每个能力点有 observableBehaviors
5. 每个能力点有 errorTypes
6. 每个能力点有 verifyMethods
7. 每个能力点能映射到 CSP-S 题位
```

---

## 9.2 真题库验收

```text
1. 2019—2025 每年 4 道 CSP-S 提高级第二轮真题
2. 每题有 year、slot、title、luoguPid
3. 每题有 official / luogu source
4. 每题有知识点映射
5. 每题有部分分结构或标记为 UNKNOWN
6. 每题有 classification.status
7. 不混入地方题、模拟题、非全国统一题
```

---

## 9.3 差距报告验收

```text
1. 不能只基于洛谷历史题下结论
2. 每个薄弱点必须映射到 CSP-S 真题能力
3. 每个薄弱点必须有预计失分
4. 每个薄弱点必须有证据等级
5. 待验证结论必须明确标记
6. 模拟数据不能冒充真实成绩
7. 能输出下一轮诊断题
```

---

# 10. Codex 最终任务

```text
请实现 CSP-S 一等奖目标基准库与差距分析系统。重点先完成两个核心基准库：knowledge_ability_tree.json 和 past_problems_2019_2025.json。系统需要支持从 NOI 官网、洛谷 CSP-S 题库标签页和用户人工 CSV 中导入资料，但最终 T1/T2/T3/T4 顺序、知识点映射和部分分结构必须支持人工确认与置信度字段。完成后，将用户历史洛谷题、代码分析和训练日志映射到知识能力树，计算掌握等级、预计失分，生成 first_prize_gap_report.md。目标是从“洛谷历史薄弱点报告”升级为“基于 CSP-S 历年真题和知识能力树的一等奖目标差距分析报告”。
```

---

# 11. 当前你要准备的最小资料清单

如果你要马上推进，优先准备这 4 个文件：

```text
1. manual_past_problem_index.csv
   2019—2025 每年 4 道 CSP-S 真题，题号、洛谷链接、T1/T2/T3/T4。

2. manual_knowledge_review.csv
   每道真题的主知识点、次知识点、部分分结构。

3. student_past_problem_records.csv
   孩子是否做过这些真题、是否看过题解、是否独立完成。

4. province_first_prize_lines.csv
   目标省份近几年一等奖线；找不到就先用全国基准线 + 安全垫。
```

只要这 4 个文件准备好，系统就能从“泛泛分析”进入“CSP-S 一等奖目标差距分析”。

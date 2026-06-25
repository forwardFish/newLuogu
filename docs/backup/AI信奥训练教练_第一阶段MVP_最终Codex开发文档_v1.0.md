# AI 信奥训练教练 · 第一阶段 MVP 最终开发文档 v1.0

> 给 Codex 使用的最终版开发文档  
> 第一阶段运行方式：本地运行优先  
> 技术栈：Next.js 单体项目 + TypeScript + PostgreSQL 本地 Docker + Prisma + 大模型接入  
> 后续上线：可切换到 Supabase PostgreSQL  
> 当前阶段：只实现“洛谷 UID 数据收集与 CSP-S 一等奖差距分析 MVP”  
> 暂不实现：30 天训练计划、每日任务、每日复盘、页面美化、家长端、机构端、商业化  
> 第一阶段目标：输入任意公开洛谷 UID，生成一份可信的 CSP-S 提高组一等奖差距分析报告

---

# 0. 给 Codex 的总指令

请从 0 创建一个 Next.js 单体项目，实现第一阶段 MVP。

本阶段只做：

```text
输入任意公开洛谷 UID
→ 同步洛谷公开数据
→ 保存原始响应
→ 解析提交记录
→ 获取题目信息
→ 标准化数据
→ 映射 CSP-S 知识点
→ 生成数据质量报告
→ 提取分析特征
→ 生成 CSP-S 提高组一等奖差距分析
→ 调用大模型生成教练式报告说明
```

本阶段不要做：

```text
1. 不做 30 天训练计划
2. 不做每日训练任务
3. 不做每日复盘
4. 不做漂亮 UI
5. 不做家长端
6. 不做机构端
7. 不做商业化
8. 不做支付
9. 不做登录系统
10. 不做自动登录洛谷
11. 不保存洛谷账号密码
12. 不保存洛谷 Cookie
13. 不自动提交代码
14. 不生成完整题解
15. 不生成完整代码解答
```

最终验收标准只有一句：

```text
输入任意公开洛谷 UID，系统能生成一份可信的 CSP-S 提高组一等奖差距分析报告。
```

---

# 1. 本地运行优先原则

第一阶段必须能在本地完整运行。

## 1.1 本地运行目标

本地运行需要做到：

```text
1. 本地启动 Next.js
2. 本地启动 PostgreSQL
3. 本地执行 Prisma migration
4. 本地 seed CSP-S 知识点图谱
5. 本地输入洛谷 UID
6. 本地抓取公开数据
7. 本地保存 raw_snapshots
8. 本地生成 data_quality_report
9. 本地生成 baseline_analysis_report
10. 本地页面展示分析结果
```

---

## 1.2 本地依赖

推荐环境：

```text
Node.js >= 20
pnpm >= 9
Docker Desktop
PostgreSQL 16 Docker 容器
Prisma
Next.js App Router
```

---

## 1.3 本地启动命令

项目完成后，必须支持以下命令：

```bash
pnpm install

docker compose up -d

pnpm prisma:migrate

pnpm prisma:seed

pnpm dev
```

访问：

```text
http://localhost:3000/analyze
```

---

# 2. 项目技术栈

## 2.1 必选技术

```text
Next.js 14+ / 15+
TypeScript
App Router
PostgreSQL
Prisma ORM
Zod
TailwindCSS，可用但不追求美观
OpenAI-compatible LLM SDK
```

---

## 2.2 数据库策略

第一阶段：

```text
本地 Docker PostgreSQL
```

后续上线：

```text
Supabase PostgreSQL
```

不要第一阶段强制依赖 Supabase。Supabase 只需要保证 DATABASE_URL 可替换。

---

# 3. 项目初始化要求

## 3.1 Codex 从 0 创建项目

推荐初始化：

```bash
pnpm create next-app ai-oi-coach \
  --ts \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"

cd ai-oi-coach
```

安装依赖：

```bash
pnpm add prisma @prisma/client zod cheerio p-limit
pnpm add openai
pnpm add -D tsx
```

初始化 Prisma：

```bash
pnpm prisma init
```

---

## 3.2 package.json scripts

必须添加：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "tsx prisma/seed.ts",
    "prisma:studio": "prisma studio"
  }
}
```

---

# 4. 本地 Docker Compose

创建：

```text
docker-compose.yml
```

内容：

```yaml
services:
  postgres:
    image: postgres:16
    container_name: ai_oi_coach_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ai_oi_coach
    ports:
      - "5432:5432"
    volumes:
      - ai_oi_coach_pg_data:/var/lib/postgresql/data

volumes:
  ai_oi_coach_pg_data:
```

本地数据库连接：

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_oi_coach?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/ai_oi_coach?schema=public"
```

---

# 5. 环境变量

创建：

```text
.env.example
```

内容：

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_oi_coach?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/ai_oi_coach?schema=public"

APP_BASE_URL="http://localhost:3000"

# LLM：OpenAI-compatible
LLM_PROVIDER="openai"
LLM_BASE_URL="https://api.openai.com/v1"
LLM_API_KEY=""
LLM_MODEL="gpt-4.1-mini"

# 如果临时没有大模型 Key，允许规则分析先跑通，但接口必须预留大模型
LLM_ENABLE="true"

# 洛谷请求限制
LUOGU_REQUEST_TIMEOUT_MS="10000"
LUOGU_REQUEST_RETRY_TIMES="3"
LUOGU_REQUEST_INTERVAL_MS="500"
LUOGU_MAX_RECORD_PAGES="20"
LUOGU_PROBLEM_CACHE_DAYS="7"

# 测试 UID，用户自行填写
TEST_LUOGU_UID=""
```

创建：

```text
.env
```

本地开发先复制 `.env.example`，再填写真实 LLM_API_KEY 和 TEST_LUOGU_UID。

---

# 6. 推荐目录结构

```text
ai-oi-coach/
  app/
    page.tsx
    analyze/
      page.tsx
    sync/
      [syncJobId]/
        page.tsx
    data-quality/
      [subjectId]/
        page.tsx
    baseline/
      [reportId]/
        page.tsx

    api/
      subjects/
        route.ts
      sync/
        start/
          route.ts
        [syncJobId]/
          route.ts
      data-quality/
        [subjectId]/
          route.ts
      analysis/
        baseline/
          route.ts
        baseline/
          [reportId]/
            route.ts
      manual-reviews/
        route.ts
      import/
        submissions/
          route.ts

  src/
    lib/
      prisma.ts
      env.ts
      time.ts
      hash.ts
      sleep.ts
      http.ts
      json.ts

    server/
      luogu/
        luogu-client.ts
        luogu-parser.ts
        luogu-normalizer.ts
        luogu-types.ts

      sync/
        sync-job-service.ts
        raw-snapshot-service.ts

      problem/
        problem-service.ts

      submission/
        submission-service.ts

      knowledge/
        knowledge-seed.ts
        knowledge-service.ts
        tag-mapping.ts

      quality/
        data-quality-service.ts

      features/
        feature-extractor-service.ts

      analysis/
        baseline-analysis-service.ts
        scoring-service.ts
        weakness-detection-service.ts
        csp-readiness-service.ts

      llm/
        llm-service.ts
        prompts.ts
        schemas.ts

  prisma/
    schema.prisma
    seed.ts

  docker-compose.yml
  .env.example
  README.md
```

---

# 7. 数据边界与合规要求

## 7.1 支持任意公开 UID

系统支持输入任意公开洛谷 UID 进行分析。

分析模式：

```text
SELF_CHILD:
自己的孩子，可长期跟踪，后续可接训练计划。

PUBLIC_UID:
任意公开 UID，只做公开数据分析。

AUTHORIZED_UID:
后续扩展，账号本人授权后导入更多数据。
```

第一阶段实现：

```text
SELF_CHILD
PUBLIC_UID
```

---

## 7.2 只能采集公开数据

第一阶段只能使用：

```text
1. 洛谷公开用户页面
2. 洛谷公开提交记录
3. 洛谷公开题目信息
4. 手动导入数据
5. 手动复盘数据
```

禁止：

```text
1. 不要求洛谷密码
2. 不保存洛谷密码
3. 不保存洛谷 Cookie
4. 不绕过登录限制
5. 不绕过验证码
6. 不自动提交代码
7. 不抓取非公开数据
8. 不做高频批量抓取
```

---

## 7.3 分析可信度

不同数据来源可信度不同。

只用公开数据时，可以判断：

```text
1. 做题覆盖
2. 提交稳定性
3. 知识点大概分布
4. 难度上限
5. 最近活跃度
```

不能准确判断：

```text
1. 是否独立完成
2. 是否看题解
3. 是否老师讲过
4. 是否本地调试后一次 AC
5. 比赛临场表现
```

所以系统必须输出：

```text
analysis_confidence
confidence_level
data_quality_issues
```

---

# 8. 第一阶段必须实现的功能

## 8.1 创建分析对象

接口：

```http
POST /api/subjects
```

功能：

```text
输入洛谷 UID，创建 analyzed_subject。
```

Request：

```json
{
  "luoguUid": "123456",
  "displayName": "孩子",
  "subjectType": "SELF_CHILD",
  "target": "CSP-S_FIRST_PRIZE"
}
```

Response：

```json
{
  "subjectId": 1,
  "luoguUid": "123456",
  "subjectType": "SELF_CHILD",
  "target": "CSP-S_FIRST_PRIZE"
}
```

---

## 8.2 启动洛谷数据同步任务

接口：

```http
POST /api/sync/start
```

Request：

```json
{
  "subjectId": 1,
  "maxRecordPages": 20,
  "syncType": "baseline"
}
```

Response：

```json
{
  "syncJobId": 1001,
  "status": "PENDING"
}
```

必须完成：

```text
1. 获取用户公开信息
2. 获取提交记录分页
3. 提取 problemPid
4. 获取题目信息
5. 保存原始响应 raw_snapshots
6. 标准化 submissions
7. 写入 problems
8. 写入 problem_attempt_stats
9. 写入 subject_knowledge_stats
10. 生成 sync_job 状态
```

第一阶段可以同步执行，不强制做后台队列。  
但必须用 sync_jobs 记录每一步状态。

---

## 8.3 查询同步状态

接口：

```http
GET /api/sync/:syncJobId
```

Response 示例：

```json
{
  "syncJobId": 1001,
  "status": "DONE",
  "progress": {
    "recordPagesFetched": 8,
    "rawRecordsParsed": 136,
    "submissionsUpserted": 136,
    "uniqueProblemsFound": 40,
    "problemsFetched": 35,
    "problemFetchFailed": 5
  },
  "errors": []
}
```

---

## 8.4 查询数据质量报告

接口：

```http
GET /api/data-quality/:subjectId
```

必须计算：

```text
1. 提交记录深度分
2. 题目信息完整分
3. 标签覆盖分
4. 数据新鲜度分
5. 手动复盘补充分
6. overallScore
7. confidenceLevel
8. issue_json
```

Response 示例：

```json
{
  "overallScore": 78,
  "confidenceLevel": "MEDIUM",
  "recordDepthScore": 70,
  "problemDetailScore": 85,
  "tagCoverageScore": 80,
  "freshnessScore": 70,
  "manualReviewScore": 10,
  "issues": [
    "手动复盘数据较少，无法准确判断独立完成能力。"
  ]
}
```

---

## 8.5 生成初始分析

接口：

```http
POST /api/analysis/baseline
```

Request：

```json
{
  "subjectId": 1,
  "syncJobId": 1001,
  "target": "CSP-S_FIRST_PRIZE"
}
```

Response：

```json
{
  "analysisReportId": 2001,
  "totalScore": 72,
  "level": "B",
  "analysisConfidence": 0.72,
  "llmSummary": "当前具备一定提高组基础，但距离稳定冲击一等奖仍需要补强图论、DP 和复杂度控制。"
}
```

---

## 8.6 查询初始分析报告

接口：

```http
GET /api/analysis/baseline/:reportId
```

必须返回：

```json
{
  "analysisReportId": 2001,
  "subjectId": 1,
  "totalScore": 72,
  "level": "B",
  "analysisConfidence": 0.72,
  "dataQuality": {
    "score": 78,
    "confidenceLevel": "MEDIUM"
  },
  "abilityScores": {
    "knowledgeCoverage": 68,
    "difficultyCeiling": 70,
    "submissionStability": 62,
    "implementation": 75,
    "trainingConsistency": 60,
    "cspReadiness": 70
  },
  "cspReadiness": {
    "t1Stability": 82,
    "t2Solving": 68,
    "t3Partial": 45,
    "t4Strategy": 25
  },
  "weaknesses": [
    {
      "module": "graph",
      "name": "图论综合能力不足",
      "severity": "medium",
      "evidence": [
        "最短路覆盖不足",
        "拓扑排序未覆盖",
        "图论难度上限偏低"
      ],
      "impact": "影响 CSP-S T2/T3 解题能力",
      "trainingDirection": "先补最短路、拓扑、MST，再做图论综合题"
    }
  ],
  "llmReportText": "..."
}
```

---

# 9. 洛谷数据采集实现

## 9.1 LuoguClient

文件：

```text
src/server/luogu/luogu-client.ts
```

职责：

```text
1. 发起 HTTP 请求
2. 设置 User-Agent
3. 设置 Referer
4. 超时控制
5. 重试控制
6. 限流控制
7. 返回原始响应
```

默认配置：

```ts
const LUOGU_REQUEST_CONFIG = {
  timeoutMs: 10000,
  retryTimes: 3,
  retryBaseDelayMs: 1000,
  requestIntervalMs: 500,
  userAgent: "Mozilla/5.0",
  referer: "https://www.luogu.com.cn/"
};
```

必须实现：

```ts
fetchUserProfile(uid: string): Promise<RawHttpResponse>

fetchRecordPage(uid: string, page: number): Promise<RawHttpResponse>

fetchProblem(pid: string): Promise<RawHttpResponse>
```

---

## 9.2 用户公开信息

URL：

```http
GET https://www.luogu.com.cn/user/{uid}?_contentOnly=1
```

保存：

```text
raw_snapshots.source_type = USER_PROFILE
```

标准化输出：

```ts
interface NormalizedLuoguProfile {
  luoguUid: string;
  username?: string;
  rating?: number | null;
  passedProblemPids: string[];
  fetchedAt: string;
  parserVersion: string;
}
```

---

## 9.3 提交记录

URL：

```http
GET https://www.luogu.com.cn/record/list?user={uid}&page={page}
```

默认策略：

```text
maxPages = 20
requestIntervalMs = 500
retryTimes = 3
stopWhenEmptyPageCount = 2
```

保存：

```text
raw_snapshots.source_type = RECORD_LIST_PAGE
raw_snapshots.source_key = `${uid}:page:${page}`
```

标准化输出：

```ts
interface NormalizedSubmission {
  luoguRecordId?: string;
  luoguUid: string;
  problemPid: string;
  problemTitle?: string;
  result: string;
  normalizedResult: NormalizedResult;
  score?: number;
  language?: string;
  submitTime?: string;
  source: "luogu";
}
```

结果枚举：

```ts
export type NormalizedResult =
  | "AC"
  | "WA"
  | "TLE"
  | "MLE"
  | "RE"
  | "CE"
  | "PC"
  | "UKE"
  | "JUDGING"
  | "WAITING"
  | "UNKNOWN";
```

---

## 9.4 题目信息

URL：

```http
GET https://www.luogu.com.cn/problem/{pid}?_contentOnly=1
```

触发条件：

```text
1. 提交记录中出现的新题目
2. 用户已 AC 题目中出现的新题目
3. 后续训练候选题
```

缓存策略：

```text
1. 题目信息缓存 7 天
2. 7 天内不重复获取
3. 获取失败不影响同步任务继续
4. 获取失败计入 problem_fetch_failed
```

标准化输出：

```ts
interface NormalizedProblem {
  luoguPid: string;
  title?: string;
  difficulty?: number;
  difficultyName?: string;
  tags: string[];
  source?: string;
  acceptedCount?: number;
  submittedCount?: number;
  fetchedAt: string;
}
```

---

# 10. Prisma 数据模型

以下是第一阶段必须实现的数据模型。Codex 应在 `prisma/schema.prisma` 中实现。

```prisma
model AnalyzedSubject {
  id                  BigInt   @id @default(autoincrement())
  displayName         String?
  luoguUid            String
  subjectType         String   @default("PUBLIC_UID")
  target              String   @default("CSP-S_FIRST_PRIZE")
  grade               String?
  dailyTrainingMinutes Int     @default(120)
  currentLevel        String?
  analysisConfidence  Decimal  @default(0)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  syncJobs            SyncJob[]
  rawSnapshots        RawSnapshot[]
  profile             LuoguProfile?
  submissions         Submission[]
  attemptStats        ProblemAttemptStat[]
  manualReviews       ManualReview[]
  knowledgeStats      SubjectKnowledgeStat[]
  dataQualityReports  DataQualityReport[]
  featureSnapshots    FeatureSnapshot[]
  baselineReports     BaselineAnalysisReport[]

  @@unique([luoguUid, subjectType])
  @@map("analyzed_subjects")
}

model SyncJob {
  id                  BigInt   @id @default(autoincrement())
  subjectId           BigInt
  luoguUid            String
  status              String   @default("PENDING")
  syncType            String   @default("baseline")
  maxRecordPages      Int      @default(20)
  recordPagesFetched  Int      @default(0)
  rawRecordsParsed    Int      @default(0)
  submissionsUpserted Int      @default(0)
  uniqueProblemsFound Int      @default(0)
  problemsFetched     Int      @default(0)
  problemFetchFailed  Int      @default(0)
  errorJson           Json     @default("[]")
  summaryJson         Json     @default("{}")
  startedAt           DateTime?
  finishedAt          DateTime?
  createdAt           DateTime @default(now())

  subject             AnalyzedSubject @relation(fields: [subjectId], references: [id])
  steps               SyncJobStep[]
  rawSnapshots        RawSnapshot[]
  dataQualityReports  DataQualityReport[]
  featureSnapshots    FeatureSnapshot[]
  baselineReports     BaselineAnalysisReport[]

  @@map("sync_jobs")
}

model SyncJobStep {
  id           BigInt   @id @default(autoincrement())
  syncJobId    BigInt
  stepName     String
  status       String   @default("PENDING")
  inputJson    Json     @default("{}")
  outputJson   Json     @default("{}")
  errorMessage String?
  startedAt    DateTime?
  finishedAt   DateTime?
  createdAt    DateTime @default(now())

  syncJob      SyncJob @relation(fields: [syncJobId], references: [id])

  @@map("sync_job_steps")
}

model RawSnapshot {
  id            BigInt   @id @default(autoincrement())
  syncJobId     BigInt?
  subjectId     BigInt
  sourceType    String
  sourceKey     String?
  url           String?
  httpStatus    Int?
  rawContent    String?
  rawJson       Json?
  parserVersion String?
  fetchedAt     DateTime @default(now())

  subject       AnalyzedSubject @relation(fields: [subjectId], references: [id])
  syncJob       SyncJob? @relation(fields: [syncJobId], references: [id])
  profile       LuoguProfile[]
  submissions   Submission[]

  @@map("raw_snapshots")
}

model LuoguProfile {
  id                BigInt   @id @default(autoincrement())
  subjectId         BigInt   @unique
  luoguUid          String
  username          String?
  rating            Int?
  passedProblemPids Json     @default("[]")
  rawSnapshotId     BigInt?
  fetchedAt         DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  subject           AnalyzedSubject @relation(fields: [subjectId], references: [id])
  rawSnapshot       RawSnapshot? @relation(fields: [rawSnapshotId], references: [id])

  @@map("luogu_profiles")
}

model Problem {
  id             BigInt   @id @default(autoincrement())
  luoguPid       String   @unique
  title          String?
  difficulty     Int?
  difficultyName String?
  tags           Json     @default("[]")
  source         String?
  acceptedCount  Int?
  submittedCount Int?
  cspWeight      Decimal  @default(0)
  fetchStatus    String   @default("unknown")
  lastFetchedAt  DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  submissions    Submission[]
  attemptStats   ProblemAttemptStat[]
  knowledgeMaps  ProblemKnowledgeMap[]
  manualReviews  ManualReview[]

  @@map("problems")
}

model Submission {
  id                BigInt   @id @default(autoincrement())
  subjectId         BigInt
  problemId         BigInt?
  luoguRecordId     String?
  fallbackRecordKey String?
  problemPid        String?
  problemTitle      String?
  result            String?
  normalizedResult  String?
  score             Int?
  language          String?
  submitTime        DateTime?
  source            String   @default("luogu")
  rawSnapshotId     BigInt?
  createdAt         DateTime @default(now())

  subject           AnalyzedSubject @relation(fields: [subjectId], references: [id])
  problem           Problem? @relation(fields: [problemId], references: [id])
  rawSnapshot       RawSnapshot? @relation(fields: [rawSnapshotId], references: [id])

  @@unique([subjectId, luoguRecordId])
  @@index([subjectId])
  @@index([problemPid])
  @@map("submissions")
}

model ProblemAttemptStat {
  id              BigInt   @id @default(autoincrement())
  subjectId       BigInt
  problemId       BigInt?
  problemPid      String
  totalAttempts   Int      @default(0)
  acAttempts      Int      @default(0)
  wrongAttempts   Int      @default(0)
  firstSubmitTime DateTime?
  firstAcTime     DateTime?
  lastSubmitTime  DateTime?
  isAc            Boolean  @default(false)
  bestScore       Int?
  mainErrorType   String?
  avgScore        Decimal?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  subject         AnalyzedSubject @relation(fields: [subjectId], references: [id])
  problem         Problem? @relation(fields: [problemId], references: [id])

  @@unique([subjectId, problemPid])
  @@map("problem_attempt_stats")
}

model ManualReview {
  id               BigInt   @id @default(autoincrement())
  subjectId         BigInt
  problemId         BigInt?
  problemPid        String
  result            String?
  timeSpentMinutes  Int?
  solutionUsage     String   @default("unknown")
  errorTypes        Json     @default("[]")
  selfNote          String?
  reviewedAt        DateTime @default(now())
  createdAt         DateTime @default(now())

  subject           AnalyzedSubject @relation(fields: [subjectId], references: [id])
  problem           Problem? @relation(fields: [problemId], references: [id])

  @@map("manual_reviews")
}

model KnowledgeNode {
  id            BigInt   @id @default(autoincrement())
  code          String   @unique
  name          String
  parentCode    String?
  level         Int      @default(1)
  cspStage      String?
  cspImportance Int      @default(3)
  sortOrder     Int      @default(0)
  createdAt     DateTime @default(now())

  @@map("knowledge_nodes")
}

model ProblemKnowledgeMap {
  id            BigInt   @id @default(autoincrement())
  problemId     BigInt
  knowledgeCode String
  weight        Decimal  @default(1)
  source        String   @default("tag_rule")
  confidence    Decimal  @default(0.8)
  createdAt     DateTime @default(now())

  problem       Problem @relation(fields: [problemId], references: [id])

  @@unique([problemId, knowledgeCode])
  @@map("problem_knowledge_maps")
}

model SubjectKnowledgeStat {
  id                    BigInt   @id @default(autoincrement())
  subjectId              BigInt
  knowledgeCode          String
  solvedProblemCount     Int      @default(0)
  attemptedProblemCount  Int      @default(0)
  acSubmissionCount      Int      @default(0)
  totalSubmissionCount   Int      @default(0)
  acRate                 Decimal?
  avgAttemptsToAc        Decimal?
  maxDifficulty          Int?
  avgDifficulty          Decimal?
  recent30dAttempts      Int      @default(0)
  score                  Int      @default(0)
  weaknessLevel          String?
  calculatedAt           DateTime @default(now())

  subject                AnalyzedSubject @relation(fields: [subjectId], references: [id])

  @@unique([subjectId, knowledgeCode])
  @@map("subject_knowledge_stats")
}

model DataQualityReport {
  id                 BigInt   @id @default(autoincrement())
  subjectId           BigInt
  syncJobId           BigInt?
  overallScore        Int
  recordDepthScore    Int
  problemDetailScore  Int
  tagCoverageScore    Int
  freshnessScore      Int
  manualReviewScore   Int
  confidenceLevel     String
  issueJson           Json     @default("[]")
  summary             String?
  createdAt           DateTime @default(now())

  subject             AnalyzedSubject @relation(fields: [subjectId], references: [id])
  syncJob             SyncJob? @relation(fields: [syncJobId], references: [id])
  baselineReports     BaselineAnalysisReport[]

  @@map("data_quality_reports")
}

model FeatureSnapshot {
  id              BigInt   @id @default(autoincrement())
  subjectId        BigInt
  syncJobId        BigInt?
  featureJson      Json
  featureVersion   String   @default("feature-v1.0.0")
  createdAt        DateTime @default(now())

  subject          AnalyzedSubject @relation(fields: [subjectId], references: [id])
  syncJob          SyncJob? @relation(fields: [syncJobId], references: [id])
  baselineReports  BaselineAnalysisReport[]

  @@map("feature_snapshots")
}

model BaselineAnalysisReport {
  id                  BigInt   @id @default(autoincrement())
  subjectId            BigInt
  syncJobId            BigInt?
  featureSnapshotId    BigInt?
  dataQualityReportId  BigInt?
  target               String   @default("CSP-S_FIRST_PRIZE")
  totalScore           Int
  level                String
  analysisConfidence   Decimal
  abilityJson          Json
  gapJson              Json
  weaknessJson         Json
  recommendationJson   Json
  llmReportText        String?
  createdAt            DateTime @default(now())

  subject              AnalyzedSubject @relation(fields: [subjectId], references: [id])
  syncJob              SyncJob? @relation(fields: [syncJobId], references: [id])
  featureSnapshot      FeatureSnapshot? @relation(fields: [featureSnapshotId], references: [id])
  dataQualityReport    DataQualityReport? @relation(fields: [dataQualityReportId], references: [id])

  @@map("baseline_analysis_reports")
}
```

---

# 11. CSP-S 知识点 Seed

Codex 必须在 `prisma/seed.ts` 中初始化 `knowledge_nodes`。

## 11.1 一级知识点

```json
[
  { "code": "basic", "name": "基础能力", "cspImportance": 5 },
  { "code": "greedy", "name": "贪心", "cspImportance": 5 },
  { "code": "binary_search", "name": "二分", "cspImportance": 5 },
  { "code": "data_structure", "name": "数据结构", "cspImportance": 5 },
  { "code": "dp", "name": "动态规划", "cspImportance": 5 },
  { "code": "graph", "name": "图论", "cspImportance": 5 },
  { "code": "math", "name": "数学", "cspImportance": 4 },
  { "code": "search", "name": "搜索", "cspImportance": 4 },
  { "code": "string", "name": "字符串", "cspImportance": 3 }
]
```

## 11.2 二级知识点

```json
[
  { "parent": "basic", "code": "implementation", "name": "模拟与实现", "cspImportance": 5 },
  { "parent": "basic", "code": "prefix_sum", "name": "前缀和", "cspImportance": 5 },
  { "parent": "basic", "code": "difference", "name": "差分", "cspImportance": 4 },

  { "parent": "data_structure", "code": "stack_queue", "name": "栈与队列", "cspImportance": 4 },
  { "parent": "data_structure", "code": "monotonic_stack_queue", "name": "单调栈/单调队列", "cspImportance": 4 },
  { "parent": "data_structure", "code": "heap", "name": "堆/优先队列", "cspImportance": 4 },
  { "parent": "data_structure", "code": "dsu", "name": "并查集", "cspImportance": 5 },
  { "parent": "data_structure", "code": "fenwick", "name": "树状数组", "cspImportance": 4 },
  { "parent": "data_structure", "code": "segment_tree", "name": "线段树", "cspImportance": 5 },
  { "parent": "data_structure", "code": "lca", "name": "LCA", "cspImportance": 4 },

  { "parent": "dp", "code": "linear_dp", "name": "线性 DP", "cspImportance": 5 },
  { "parent": "dp", "code": "knapsack_dp", "name": "背包 DP", "cspImportance": 5 },
  { "parent": "dp", "code": "interval_dp", "name": "区间 DP", "cspImportance": 5 },
  { "parent": "dp", "code": "tree_dp", "name": "树形 DP", "cspImportance": 5 },
  { "parent": "dp", "code": "state_compression_dp", "name": "状压 DP", "cspImportance": 4 },
  { "parent": "dp", "code": "dp_optimization", "name": "DP 优化", "cspImportance": 4 },

  { "parent": "graph", "code": "bfs_dfs_graph", "name": "图上 DFS/BFS", "cspImportance": 5 },
  { "parent": "graph", "code": "shortest_path", "name": "最短路", "cspImportance": 5 },
  { "parent": "graph", "code": "mst", "name": "最小生成树", "cspImportance": 4 },
  { "parent": "graph", "code": "toposort", "name": "拓扑排序", "cspImportance": 4 },
  { "parent": "graph", "code": "scc", "name": "强连通分量", "cspImportance": 3 },
  { "parent": "graph", "code": "tarjan", "name": "Tarjan", "cspImportance": 3 },

  { "parent": "math", "code": "number_theory", "name": "数论", "cspImportance": 4 },
  { "parent": "math", "code": "combinatorics", "name": "组合数学", "cspImportance": 4 },

  { "parent": "search", "code": "dfs_bfs", "name": "DFS/BFS", "cspImportance": 5 },
  { "parent": "search", "code": "pruning", "name": "剪枝", "cspImportance": 4 },
  { "parent": "search", "code": "memorized_search", "name": "记忆化搜索", "cspImportance": 4 },

  { "parent": "string", "code": "kmp", "name": "KMP", "cspImportance": 3 },
  { "parent": "string", "code": "trie", "name": "Trie", "cspImportance": 3 },
  { "parent": "string", "code": "hash", "name": "字符串 Hash", "cspImportance": 3 }
]
```

---

# 12. 标签映射规则

文件：

```text
src/server/knowledge/tag-mapping.ts
```

内容：

```ts
export const LUOGU_TAG_TO_KNOWLEDGE: Record<string, string[]> = {
  "模拟": ["implementation"],
  "贪心": ["greedy"],
  "二分": ["binary_search"],
  "前缀和": ["prefix_sum"],
  "差分": ["difference"],

  "动态规划": ["dp"],
  "dp": ["dp"],
  "背包": ["knapsack_dp"],
  "区间 dp": ["interval_dp"],
  "区间DP": ["interval_dp"],
  "树形 dp": ["tree_dp"],
  "树形DP": ["tree_dp"],
  "状压 dp": ["state_compression_dp"],
  "状态压缩": ["state_compression_dp"],
  "单调队列优化": ["dp_optimization", "monotonic_stack_queue"],

  "图论": ["graph"],
  "最短路": ["shortest_path"],
  "dijkstra": ["shortest_path"],
  "Dijkstra": ["shortest_path"],
  "spfa": ["shortest_path"],
  "SPFA": ["shortest_path"],
  "floyd": ["shortest_path"],
  "Floyd": ["shortest_path"],
  "最小生成树": ["mst"],
  "拓扑排序": ["toposort"],
  "强连通分量": ["scc"],
  "tarjan": ["tarjan"],
  "Tarjan": ["tarjan"],

  "数据结构": ["data_structure"],
  "并查集": ["dsu"],
  "树状数组": ["fenwick"],
  "线段树": ["segment_tree"],
  "堆": ["heap"],
  "优先队列": ["heap"],
  "lca": ["lca"],
  "LCA": ["lca"],

  "搜索": ["search"],
  "dfs": ["dfs_bfs"],
  "DFS": ["dfs_bfs"],
  "bfs": ["dfs_bfs"],
  "BFS": ["dfs_bfs"],
  "剪枝": ["pruning"],
  "记忆化搜索": ["memorized_search"],

  "数学": ["math"],
  "数论": ["number_theory"],
  "组合数学": ["combinatorics"],

  "字符串": ["string"],
  "kmp": ["kmp"],
  "KMP": ["kmp"],
  "trie": ["trie"],
  "Trie": ["trie"],
  "hash": ["hash"],
  "Hash": ["hash"]
};
```

---

# 13. 数据质量评分

## 13.1 总分公式

```text
DataQualityScore =
提交记录深度分 * 30%
+ 题目信息完整分 * 25%
+ 标签覆盖分 * 20%
+ 数据新鲜度分 * 15%
+ 手动复盘补充分 * 10%
```

---

## 13.2 提交记录深度分

```ts
function calcRecordDepthScore(totalSubmissions: number): number {
  if (totalSubmissions >= 1000) return 100;
  if (totalSubmissions >= 500) return 85;
  if (totalSubmissions >= 200) return 70;
  if (totalSubmissions >= 100) return 55;
  if (totalSubmissions >= 50) return 40;
  return 20;
}
```

---

## 13.3 题目信息完整分

```ts
function calcProblemDetailScore(totalProblems: number, fetchedProblems: number): number {
  if (totalProblems === 0) return 0;
  return Math.round((fetchedProblems / totalProblems) * 100);
}
```

---

## 13.4 标签覆盖分

```ts
function calcTagCoverageScore(problemsWithTags: number, totalProblems: number): number {
  if (totalProblems === 0) return 0;
  return Math.round((problemsWithTags / totalProblems) * 100);
}
```

---

## 13.5 数据新鲜度分

```ts
function calcFreshnessScore(lastSubmitTime: Date | null): number {
  if (!lastSubmitTime) return 0;

  const days = daysBetween(lastSubmitTime, new Date());

  if (days <= 7) return 100;
  if (days <= 14) return 85;
  if (days <= 30) return 70;
  if (days <= 60) return 50;
  if (days <= 90) return 35;
  return 20;
}
```

---

## 13.6 手动复盘补充分

第一阶段没有手动复盘时也要计算：

```ts
function calcManualReviewScore(manualReviewCount: number): number {
  if (manualReviewCount >= 50) return 100;
  if (manualReviewCount >= 30) return 80;
  if (manualReviewCount >= 15) return 60;
  if (manualReviewCount >= 5) return 40;
  return 10;
}
```

---

## 13.7 confidence_level

```text
HIGH:
overall_score >= 80

MEDIUM:
overall_score >= 60

LOW:
overall_score < 60
```

---

# 14. 特征提取

## 14.1 feature_snapshot 必须包含

```ts
interface FeatureSnapshot {
  subjectId: number;
  target: "CSP-S_FIRST_PRIZE";

  dataSummary: DataSummary;
  activityFeatures: ActivityFeatures;
  difficultyFeatures: DifficultyFeatures;
  resultFeatures: ResultFeatures;
  attemptFeatures: AttemptFeatures;
  knowledgeFeatures: KnowledgeFeatures;
  cspReadinessFeatures: CspReadinessFeatures;
}
```

---

## 14.2 DataSummary

```ts
interface DataSummary {
  totalSubmissions: number;
  totalAttemptedProblems: number;
  totalSolvedProblems: number;
  totalProblemsWithDetail: number;
  firstSubmitTime?: string;
  lastSubmitTime?: string;
  dataQualityScore: number;
  confidenceLevel: "HIGH" | "MEDIUM" | "LOW";
}
```

---

## 14.3 ActivityFeatures

```ts
interface ActivityFeatures {
  activeDaysLast7: number;
  activeDaysLast30: number;
  activeDaysLast90: number;
  submissionsLast7: number;
  submissionsLast30: number;
  submissionsLast90: number;
  longestActiveStreak: number;
  currentActiveStreak: number;
}
```

---

## 14.4 DifficultyFeatures

```ts
interface DifficultyFeatures {
  attemptedByDifficulty: Record<string, number>;
  solvedByDifficulty: Record<string, number>;
  acRateByDifficulty: Record<string, number>;
  maxSolvedDifficulty: number;
  avgSolvedDifficulty: number;
  top20SolvedDifficultyAvg: number;
}
```

洛谷难度映射：

```text
0: 暂无评定
1: 入门
2: 普及-
3: 普及/提高-
4: 普及+/提高
5: 提高+/省选-
6: 省选/NOI-
7: NOI/NOI+/CTSC
```

---

## 14.5 ResultFeatures

```ts
interface ResultFeatures {
  acCount: number;
  waCount: number;
  tleCount: number;
  mleCount: number;
  reCount: number;
  ceCount: number;
  pcCount: number;
  unknownCount: number;
  acRate: number;
  wrongRate: number;
  tleRate: number;
  reRate: number;
  ceRate: number;
}
```

---

## 14.6 AttemptFeatures

```ts
interface AttemptFeatures {
  avgAttemptsPerProblem: number;
  avgAttemptsToAc: number;
  oneShotAcCount: number;
  oneShotAcRate: number;
  hardStuckProblemCount: number;
  hardStuckProblems: string[];
}
```

hardStuck 定义：

```text
同一题提交次数 >= 5 且未 AC
或
同一题提交次数 >= 8 后才 AC
```

---

## 14.7 KnowledgeFeatures

```ts
interface KnowledgeFeatures {
  knowledgeStats: Array<{
    code: string;
    name: string;
    attemptedProblemCount: number;
    solvedProblemCount: number;
    acRate: number;
    maxDifficulty: number;
    avgDifficulty: number;
    score: number;
    weaknessLevel: "none" | "mild" | "medium" | "severe";
  }>;
}
```

---

## 14.8 CspReadinessFeatures

```ts
interface CspReadinessFeatures {
  t1StabilityScore: number;
  t2SolvingScore: number;
  t3PartialScore: number;
  t4StrategyScore: number;
  implementationScore: number;
  timeManagementScore: number;
}
```

---

# 15. CSP-S 一等奖能力评分

## 15.1 总分公式

```text
TotalScore =
知识点覆盖分 * 20%
+ 难度上限分 * 20%
+ 提交稳定性分 * 15%
+ 实现能力分 * 15%
+ 训练连续性分 * 10%
+ CSP-S 题型准备度 * 20%
```

---

## 15.2 知识点覆盖分

CSP-S 核心知识点：

```text
基础实现
二分
贪心
前缀和/差分
搜索
背包 DP
线性 DP
区间 DP
树形 DP
图论 DFS/BFS
最短路
最小生成树
拓扑排序
并查集
树状数组
线段树
数论基础
组合数学基础
```

covered 定义：

```text
该知识点至少 AC 3 道题
或
至少 AC 1 道难度 >= 4 的题
```

---

## 15.3 难度上限分

```ts
function calcDifficultyCeilingScore(top20SolvedDifficultyAvg: number): number {
  if (top20SolvedDifficultyAvg >= 5.5) return 95;
  if (top20SolvedDifficultyAvg >= 5.0) return 85;
  if (top20SolvedDifficultyAvg >= 4.5) return 75;
  if (top20SolvedDifficultyAvg >= 4.0) return 65;
  if (top20SolvedDifficultyAvg >= 3.5) return 55;
  if (top20SolvedDifficultyAvg >= 3.0) return 45;
  return 30;
}
```

---

## 15.4 提交稳定性分

```ts
function calcSubmissionStabilityScore(acRate: number): number {
  if (acRate >= 0.55) return 90;
  if (acRate >= 0.45) return 80;
  if (acRate >= 0.35) return 65;
  if (acRate >= 0.25) return 50;
  return 35;
}
```

说明：

```text
公开提交记录 AC 率不能直接代表能力。
有的人本地调好再提交，有的人频繁提交调试。
这个分数只能作为辅助参考。
```

---

## 15.5 实现能力分

综合：

```text
1. RE 比例
2. CE 比例
3. 平均提交次数
4. 一次 AC 率
```

```ts
function calcImplementationScore(input: {
  reRate: number;
  ceRate: number;
  avgAttemptsToAc: number;
  oneShotAcRate: number;
}): number {
  let score = 100;

  score -= input.reRate * 100 * 0.8;
  score -= input.ceRate * 100 * 0.6;

  if (input.avgAttemptsToAc > 5) score -= 25;
  else if (input.avgAttemptsToAc > 3) score -= 15;
  else if (input.avgAttemptsToAc > 2) score -= 8;

  if (input.oneShotAcRate > 0.4) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}
```

---

## 15.6 训练连续性分

```ts
function calcTrainingConsistencyScore(activeDaysLast30: number): number {
  if (activeDaysLast30 >= 24) return 100;
  if (activeDaysLast30 >= 18) return 85;
  if (activeDaysLast30 >= 12) return 70;
  if (activeDaysLast30 >= 6) return 50;
  return 30;
}
```

---

## 15.7 CSP-S 题型准备度

```text
T1 稳定性：
黄题、绿题基础题 AC 稳定性。

T2 解题能力：
绿题、蓝题中档题覆盖。

T3 部分分能力：
蓝题、紫题尝试记录，综合题训练记录。

T4 策略能力：
高难题尝试、部分分、模拟赛记录。
```

近似计算：

```text
cspReadinessScore =
t1StabilityScore * 0.35
+ t2SolvingScore * 0.30
+ t3PartialScore * 0.25
+ t4StrategyScore * 0.10
```

注意：

```text
第一阶段没有模拟赛数据时，T4 策略能力必须低置信度。
不能断言 T4 策略强。
```

---

# 16. 弱项识别规则

## 16.1 知识点弱项

```ts
function getKnowledgeWeakness(score: number, solvedProblemCount: number): string {
  if (solvedProblemCount === 0) return "severe";
  if (score < 40) return "severe";
  if (score < 60) return "medium";
  if (score < 75) return "mild";
  return "none";
}
```

---

## 16.2 DP 弱项

判定 DP 弱，如果以下任意成立：

```text
1. dp 总分 < 65
2. 背包 DP AC 题数 < 3
3. 区间 DP AC 题数 < 2
4. 树形 DP AC 题数 < 2
5. DP 难度上限 < 4
```

---

## 16.3 图论弱项

判定图论弱，如果以下任意成立：

```text
1. graph 总分 < 65
2. 最短路 AC 题数 < 3
3. 拓扑排序没有覆盖
4. 最小生成树没有覆盖
5. 图论难度上限 < 4
```

---

## 16.4 数据结构弱项

判定数据结构弱，如果以下任意成立：

```text
1. data_structure 总分 < 65
2. 并查集未覆盖
3. 树状数组未覆盖
4. 线段树未覆盖
5. 相关题平均提交次数过高
```

---

## 16.5 复杂度弱项

```text
如果 TLE 比例 >= 20%，判定复杂度控制弱。
如果 TLE 集中在图论/DP/数据结构，输出对应模块原因。
```

---

## 16.6 实现弱项

```text
如果 RE + CE 比例 >= 10%，判定实现稳定性不足。
如果平均提交次数 > 4，判定调试能力不足。
```

---

# 17. 大模型接入

## 17.1 接入要求

第一阶段要接入大模型，但评分和弱项判断不能依赖大模型。

大模型只负责：

```text
1. 把结构化分析结果转成自然语言报告
2. 解释短板
3. 给出第一阶段训练方向建议
4. 说明数据可信度
```

大模型不能负责：

```text
1. 原始评分
2. 编造数据
3. 断言一定一等奖
4. 生成完整题解
5. 生成完整代码
```

---

## 17.2 LLMService

文件：

```text
src/server/llm/llm-service.ts
```

必须实现：

```ts
generateBaselineCoachReport(input: BaselineCoachReportInput): Promise<string>
```

如果没有 LLM_API_KEY：

```text
允许返回规则模板报告，但要在返回中标记 llmStatus = DISABLED
```

---

## 17.3 Prompt

文件：

```text
src/server/llm/prompts.ts
```

Prompt：

```text
你是专业 CSP-S 竞赛训练教练。

系统已经完成结构化数据分析，请你只基于输入数据生成训练诊断说明。

禁止：
1. 不要编造数据
2. 不要承诺一定拿一等奖
3. 不要输出完整题解
4. 不要输出代码
5. 不要建议作弊
6. 不要夸大公开数据的可信度

输入：
数据质量：
{{dataQuality}}

能力分：
{{abilityScores}}

CSP-S 准备度：
{{cspReadiness}}

知识点统计：
{{knowledgeStats}}

弱项列表：
{{weaknesses}}

请输出：

# CSP-S 初始诊断

## 1. 当前水平判断

## 2. 距离提高组一等奖的主要差距

## 3. 最优先补强的 3 个模块

## 4. 第一阶段训练建议

## 5. 数据可信度说明
```

---

# 18. 最小页面

页面只要求能用，不追求美观。

## 18.1 /analyze

功能：

```text
1. 输入洛谷 UID
2. 选择 subjectType：SELF_CHILD / PUBLIC_UID
3. 点击创建分析对象
4. 点击开始同步
5. 显示 syncJobId
```

---

## 18.2 /sync/:syncJobId

功能：

```text
1. 显示同步状态
2. 显示抓取页数
3. 显示提交记录数
4. 显示题目信息获取数
5. 显示错误列表
6. 同步完成后显示“生成分析报告”按钮
```

---

## 18.3 /data-quality/:subjectId

功能：

```text
1. 显示数据质量总分
2. 显示分析可信度
3. 显示各分项
4. 显示缺失问题
```

---

## 18.4 /baseline/:reportId

功能：

```text
1. 显示总分
2. 显示 A/B/C/D 档
3. 显示 abilityScores
4. 显示 cspReadiness
5. 显示 weaknesses
6. 显示 LLM 生成报告
7. 显示数据可信度说明
```

---

# 19. 本地开发 README 要求

Codex 必须生成 README.md，包含：

```md
# AI OI Coach MVP

## 本地启动

```bash
pnpm install
docker compose up -d
cp .env.example .env
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev
```

访问：

```text
http://localhost:3000/analyze
```

## 环境变量

填写：

```text
DATABASE_URL
DIRECT_URL
LLM_API_KEY
LLM_MODEL
TEST_LUOGU_UID
```

## 第一阶段功能

```text
输入任意公开洛谷 UID，生成 CSP-S 提高组一等奖差距分析。
```

## 注意

```text
不需要洛谷账号密码。
不保存 Cookie。
不自动提交代码。
不输出完整题解。
```
```

---

# 20. Codex 开发顺序

请严格按以下顺序实现。

## 第 1 步：项目初始化

```text
1. 创建 Next.js 项目
2. 配置 TypeScript
3. 配置 Prisma
4. 配置 Docker PostgreSQL
5. 配置 env.ts
6. 配置 prisma.ts
```

验收：

```text
pnpm dev 能启动
docker compose up -d 能启动 PostgreSQL
pnpm prisma:migrate 能建表
```

---

## 第 2 步：数据库模型

实现：

```text
1. prisma/schema.prisma
2. prisma/seed.ts
3. knowledge_nodes seed
```

验收：

```text
pnpm prisma:seed 后，knowledge_nodes 有数据。
```

---

## 第 3 步：洛谷数据同步

实现：

```text
1. LuoguClient
2. LuoguParser
3. LuoguNormalizer
4. SyncJobService
5. RawSnapshotService
6. SubmissionService
7. ProblemService
```

验收：

```text
输入测试 UID，能生成 sync_job、raw_snapshots、submissions、problems。
```

---

## 第 4 步：知识点映射

实现：

```text
1. tag-mapping.ts
2. KnowledgeService
3. problem_knowledge_maps
4. subject_knowledge_stats
```

验收：

```text
同步后题目可以映射到知识点。
```

---

## 第 5 步：数据质量报告

实现：

```text
1. DataQualityService
2. data_quality_reports
3. /api/data-quality/:subjectId
```

验收：

```text
能输出 overallScore 和 confidenceLevel。
```

---

## 第 6 步：特征提取

实现：

```text
1. FeatureExtractorService
2. feature_snapshots
3. activityFeatures
4. difficultyFeatures
5. resultFeatures
6. attemptFeatures
7. knowledgeFeatures
8. cspReadinessFeatures
```

验收：

```text
能生成 feature_snapshot。
```

---

## 第 7 步：初始分析

实现：

```text
1. ScoringService
2. CspReadinessService
3. WeaknessDetectionService
4. BaselineAnalysisService
5. baseline_analysis_reports
```

验收：

```text
能输出 totalScore、level、weaknesses、recommendations。
```

---

## 第 8 步：大模型报告

实现：

```text
1. LLMService
2. prompts.ts
3. 调用 LLM 生成 report_text
4. LLM_API_KEY 缺失时 fallback
```

验收：

```text
baseline_analysis_report.llmReportText 有内容。
```

---

## 第 9 步：最小页面

实现：

```text
1. /analyze
2. /sync/:syncJobId
3. /data-quality/:subjectId
4. /baseline/:reportId
```

验收：

```text
浏览器可以完成从输入 UID 到查看报告的完整流程。
```

---

# 21. API 验收清单

## 21.1 POST /api/subjects

必须：

```text
1. 校验 luoguUid
2. 创建或复用 analyzed_subject
3. 返回 subjectId
```

---

## 21.2 POST /api/sync/start

必须：

```text
1. 创建 sync_job
2. 同步用户 profile
3. 同步 record pages
4. 保存 raw_snapshots
5. 写 submissions
6. 写 problems
7. 写 attempt stats
8. 写 knowledge stats
9. 写 data quality report
10. 返回 syncJobId
```

---

## 21.3 GET /api/sync/:syncJobId

必须：

```text
1. 返回状态
2. 返回进度
3. 返回错误
```

---

## 21.4 GET /api/data-quality/:subjectId

必须：

```text
1. 返回最新 data_quality_report
```

---

## 21.5 POST /api/analysis/baseline

必须：

```text
1. 读取 data_quality_report
2. 生成 feature_snapshot
3. 生成结构化分析
4. 调用 LLM
5. 写 baseline_analysis_report
6. 返回 reportId
```

---

## 21.6 GET /api/analysis/baseline/:reportId

必须：

```text
1. 返回完整分析报告
```

---

# 22. 最终验收标准

第一阶段完成后，必须满足：

```text
1. 本地可以运行
2. PostgreSQL 本地 Docker 可以运行
3. Prisma migration 成功
4. Prisma seed 成功
5. 输入任意公开洛谷 UID
6. 系统创建 analyzed_subject
7. 系统创建 sync_job
8. 系统能同步公开提交记录
9. 系统保存 raw_snapshots
10. 系统写入 submissions
11. 系统写入 problems
12. 系统完成 tag -> knowledge 映射
13. 系统生成 data_quality_report
14. 系统生成 feature_snapshot
15. 系统生成 baseline_analysis_report
16. 系统调用大模型生成自然语言报告
17. 页面能看到 CSP-S 一等奖差距分析
```

---

# 23. 不合格情况

如果出现以下情况，视为不合格：

```text
1. 没有 raw_snapshots
2. 没有 sync_jobs
3. 没有数据质量评分
4. 没有 feature_snapshot
5. 直接让大模型凭空分析
6. 没有知识点映射
7. 没有分析可信度
8. 把 30 天训练计划提前做了但数据分析不准
9. 需要用户输入洛谷密码
10. 保存 Cookie
11. 自动提交代码
12. 输出完整题解代码
```

---

# 24. 给 Codex 的最终一句话

```text
请先实现一个本地可运行的 Next.js 单体 MVP：输入任意公开洛谷 UID，采集公开数据，保存原始响应，清洗并分析数据，生成数据质量报告、特征快照和 CSP-S 提高组一等奖差距分析，并接入大模型生成教练式报告。不要实现 30 天训练计划和任何页面美化。
```

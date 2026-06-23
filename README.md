# AI OI Coach MVP

本项目是第一阶段 MVP：输入任意公开洛谷 UID，采集公开数据，保存原始响应，清洗并分析数据，生成数据质量报告、特征快照和 CSP-S 提高组一等奖差距分析。

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

## 核心 API

```text
POST /api/subjects
POST /api/sync/start
GET  /api/sync/:syncJobId
GET  /api/data-quality/:subjectId
POST /api/analysis/baseline
GET  /api/analysis/baseline/:reportId
```

## 无数据库采集：浏览器 CDP 模式

如果暂时不用 Docker/PostgreSQL，可以先把洛谷提交记录保存成本地数据文件。

启动一个独立 Chrome：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-luogu-chrome.ps1 -Uid 1024038 -Port 9223
```

在打开的 Chrome 里登录洛谷，然后运行：

```bash
pnpm luogu:crawl -- --uid 1024038 --cdp-url http://127.0.0.1:9223 --max-pages 20
```

输出文件：

```text
data/crawl/luogu-1024038-<timestamp>/
  raw-pages/
  raw_snapshots.json
  submissions.json
  problem_attempt_stats.json
  summary.json

data/import/luogu-1024038-latest.json
```

这个模式只连接你本机已经打开的 Chrome 浏览器上下文，不要求你提供洛谷密码，不把 Cookie 写入项目数据文件，也不自动提交代码。

## 环境变量

填写：

```text
DATABASE_URL
DIRECT_URL
LLM_API_KEY
LLM_MODEL
TEST_LUOGU_UID
```

如果没有 `LLM_API_KEY`，系统仍会完成规则分析，并返回带 `llmStatus=DISABLED` 的模板报告。

## 注意

```text
不需要洛谷账号密码。
不保存 Cookie。
不自动提交代码。
不输出完整题解。
不输出完整代码。
```

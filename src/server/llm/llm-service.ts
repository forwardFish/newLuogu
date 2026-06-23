import OpenAI from "openai";
import { env } from "@/src/lib/env";
import { BASELINE_COACH_SYSTEM_PROMPT } from "./prompts";
import type { BaselineCoachReportInput } from "./schemas";

export class LLMService {
  async generateBaselineCoachReport(input: BaselineCoachReportInput): Promise<string> {
    if (!env.LLM_ENABLE || !env.LLM_API_KEY) {
      return fallbackReport(input);
    }
    const client = new OpenAI({
      apiKey: env.LLM_API_KEY,
      baseURL: env.LLM_BASE_URL
    });
    const response = await client.chat.completions.create({
      model: env.LLM_MODEL,
      messages: [
        { role: "system", content: BASELINE_COACH_SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify(
            {
              dataQuality: input.dataQuality,
              abilityScores: input.abilityScores,
              cspReadiness: input.cspReadiness,
              knowledgeStats: input.knowledgeStats,
              weaknesses: input.weaknesses
            },
            null,
            2
          )
        }
      ],
      temperature: 0.3
    });
    return response.choices[0]?.message.content?.trim() || fallbackReport(input);
  }
}

function fallbackReport(input: BaselineCoachReportInput) {
  const topWeaknesses = input.weaknesses.slice(0, 3);
  return `llmStatus=DISABLED

# CSP-S 初始诊断

## 1. 当前水平判断
系统已完成规则分析。当前判断只基于洛谷公开提交、公开题目信息和标签映射，不包含是否独立完成、是否看题解、比赛临场表现等非公开信息。

## 2. 距离提高组一等奖的主要差距
主要差距集中在：${topWeaknesses.map((item) => item.name).join("、") || "暂未识别出明确结构性短板"}。

## 3. 最优先补强的 3 个模块
${topWeaknesses.map((item, index) => `${index + 1}. ${item.module}: ${item.trainingDirection}`).join("\n") || "1. 继续补充公开提交数据和手动复盘数据。"}

## 4. 第一阶段训练建议
先围绕弱项模块做小范围题组训练，训练后复盘错误类型、提交次数和复杂度判断，不生成完整题解或代码。

## 5. 数据可信度说明
公开数据可以反映做题覆盖、难度上限、提交稳定性和活跃度，但不能准确判断独立完成程度。`;
}

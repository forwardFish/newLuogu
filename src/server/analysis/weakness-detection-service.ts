import type { FeatureJson } from "./scoring-service";

export interface Weakness {
  module: string;
  name: string;
  severity: "mild" | "medium" | "severe";
  evidence: string[];
  impact: string;
  trainingDirection: string;
}

export class WeaknessDetectionService {
  detect(feature: FeatureJson): Weakness[] {
    const stats = new Map(feature.knowledgeFeatures.knowledgeStats.map((stat) => [stat.code, stat]));
    const weaknesses: Weakness[] = [];
    const dpScore = avgCodes(stats, ["dp", "knapsack_dp", "interval_dp", "tree_dp"]);
    if (
      dpScore < 65 ||
      (stats.get("knapsack_dp")?.solvedProblemCount ?? 0) < 3 ||
      (stats.get("interval_dp")?.solvedProblemCount ?? 0) < 2 ||
      (stats.get("tree_dp")?.solvedProblemCount ?? 0) < 2
    ) {
      weaknesses.push({
        module: "dp",
        name: "动态规划体系覆盖不足",
        severity: dpScore < 45 ? "severe" : "medium",
        evidence: [
          `DP 综合分 ${Math.round(dpScore)}`,
          `背包 DP AC ${(stats.get("knapsack_dp")?.solvedProblemCount ?? 0)} 题`,
          `区间/树形 DP 覆盖偏少`
        ],
        impact: "影响 CSP-S T2/T3 中状态设计和转移能力。",
        trainingDirection: "先补背包、线性 DP，再进入区间 DP 和树形 DP 的题组训练。"
      });
    }
    const graphScore = avgCodes(stats, ["graph", "bfs_dfs_graph", "shortest_path", "mst", "toposort"]);
    if (
      graphScore < 65 ||
      (stats.get("shortest_path")?.solvedProblemCount ?? 0) < 3 ||
      (stats.get("toposort")?.solvedProblemCount ?? 0) === 0 ||
      (stats.get("mst")?.solvedProblemCount ?? 0) === 0
    ) {
      weaknesses.push({
        module: "graph",
        name: "图论综合能力不足",
        severity: graphScore < 45 ? "severe" : "medium",
        evidence: [
          `图论综合分 ${Math.round(graphScore)}`,
          `最短路 AC ${(stats.get("shortest_path")?.solvedProblemCount ?? 0)} 题`,
          "拓扑排序或最小生成树覆盖不足"
        ],
        impact: "影响 CSP-S T2/T3 图建模和综合题推进能力。",
        trainingDirection: "先补最短路、拓扑、MST，再做图论综合题。"
      });
    }
    const dsScore = avgCodes(stats, ["data_structure", "dsu", "fenwick", "segment_tree"]);
    if (
      dsScore < 65 ||
      (stats.get("dsu")?.solvedProblemCount ?? 0) === 0 ||
      (stats.get("fenwick")?.solvedProblemCount ?? 0) === 0 ||
      (stats.get("segment_tree")?.solvedProblemCount ?? 0) === 0
    ) {
      weaknesses.push({
        module: "data_structure",
        name: "核心数据结构覆盖不足",
        severity: dsScore < 45 ? "severe" : "medium",
        evidence: [
          `数据结构综合分 ${Math.round(dsScore)}`,
          "并查集、树状数组、线段树至少一项覆盖不足"
        ],
        impact: "影响区间维护、连通性和复杂度优化题。",
        trainingDirection: "按并查集、树状数组、线段树顺序补核心模板和变式。"
      });
    }
    if (feature.resultFeatures.tleRate >= 0.2) {
      weaknesses.push({
        module: "complexity",
        name: "复杂度控制偏弱",
        severity: "medium",
        evidence: [`TLE 比例 ${Math.round(feature.resultFeatures.tleRate * 100)}%`],
        impact: "容易在 CSP-S 中档题上被数据规模卡住。",
        trainingDirection: "训练读约束、估复杂度和替换低效算法的能力。"
      });
    }
    if (feature.resultFeatures.reRate + feature.resultFeatures.ceRate >= 0.1) {
      weaknesses.push({
        module: "implementation",
        name: "实现稳定性不足",
        severity: "medium",
        evidence: [`RE+CE 比例 ${Math.round((feature.resultFeatures.reRate + feature.resultFeatures.ceRate) * 100)}%`],
        impact: "会损失基础题稳定拿分。",
        trainingDirection: "建立边界、数组范围、类型和编译检查清单。"
      });
    }
    return weaknesses.slice(0, 6);
  }
}

function avgCodes(stats: Map<string, { score: number }>, codes: string[]) {
  const values = codes.map((code) => stats.get(code)?.score ?? 0);
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

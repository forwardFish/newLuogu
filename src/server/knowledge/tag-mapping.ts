export const LUOGU_TAG_TO_KNOWLEDGE: Record<string, string[]> = {
  模拟: ["implementation"],
  贪心: ["greedy"],
  二分: ["binary_search"],
  前缀和: ["prefix_sum"],
  差分: ["difference"],
  动态规划: ["dp"],
  dp: ["dp"],
  DP: ["dp"],
  背包: ["knapsack_dp"],
  "区间 dp": ["interval_dp"],
  区间DP: ["interval_dp"],
  "树形 dp": ["tree_dp"],
  树形DP: ["tree_dp"],
  "状压 dp": ["state_compression_dp"],
  状态压缩: ["state_compression_dp"],
  单调队列优化: ["dp_optimization", "monotonic_stack_queue"],
  图论: ["graph"],
  最短路: ["shortest_path"],
  dijkstra: ["shortest_path"],
  Dijkstra: ["shortest_path"],
  spfa: ["shortest_path"],
  SPFA: ["shortest_path"],
  floyd: ["shortest_path"],
  Floyd: ["shortest_path"],
  最小生成树: ["mst"],
  拓扑排序: ["toposort"],
  强连通分量: ["scc"],
  tarjan: ["tarjan"],
  Tarjan: ["tarjan"],
  数据结构: ["data_structure"],
  并查集: ["dsu"],
  树状数组: ["fenwick"],
  线段树: ["segment_tree"],
  堆: ["heap"],
  优先队列: ["heap"],
  lca: ["lca"],
  LCA: ["lca"],
  搜索: ["search"],
  dfs: ["dfs_bfs"],
  DFS: ["dfs_bfs"],
  bfs: ["dfs_bfs"],
  BFS: ["dfs_bfs"],
  剪枝: ["pruning"],
  记忆化搜索: ["memorized_search"],
  数学: ["math"],
  数论: ["number_theory"],
  组合数学: ["combinatorics"],
  字符串: ["string"],
  kmp: ["kmp"],
  KMP: ["kmp"],
  trie: ["trie"],
  Trie: ["trie"],
  hash: ["hash"],
  Hash: ["hash"]
};

export function mapTagsToKnowledge(tags: string[]) {
  const codes = new Set<string>();
  for (const tag of tags) {
    const normalized = tag.trim();
    for (const [keyword, mapped] of Object.entries(LUOGU_TAG_TO_KNOWLEDGE)) {
      if (normalized === keyword || normalized.toLowerCase().includes(keyword.toLowerCase())) {
        mapped.forEach((code) => codes.add(code));
      }
    }
  }
  return Array.from(codes);
}

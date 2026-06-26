#include <bits/stdc++.h>
using namespace std;

/*
 * 兔兔与蛋蛋游戏求解
 * 游戏规则：棋盘上有黑色(X)和白色(O)棋子，以及一个空格(.)。兔兔和蛋蛋轮流移动棋子：
 *   - 兔兔只能将空格旁边的白色棋子移动到空格中；
 *   - 蛋蛋只能将空格旁边的黑色棋子移动到空格中；
 * 不能移动的一方输掉比赛。现给出一局长度为2k的完整对局记录，且蛋蛋最终获胜。
 * 需要找出兔兔所有“犯错误”的操作序号：即在该操作前兔兔有必胜策略，但操作后(轮到蛋蛋)蛋蛋有必胜策略。
 *
 * 算法思路（基于二分图匹配）：我们用棋盘格子与空格位置的曼哈顿距离奇偶性来分组，
 * 将距离为空格偶数距离的黑棋和奇数距离的白棋加入图中作为顶点。
 * 如果两个这样的格子相邻，则在它们对应的顶点间加一条边。这样形成一个二分图：
 * 左侧为黑棋(偶数距)，右侧为白棋(奇数距)。
 * 在该图上求最大匹配，匹配情况可以用于判断当前位置的胜负状态。
 *
 * 关键判定：根据博弈论，如果当前空格对应的顶点在当前最大匹配中被匹配，
 * 则当前执棋方(可以移动空格相邻对应颜色棋子的一方)处于必胜状态。否则必败。
 * 每进行一步棋，相当于从图中删除当前空格对应的顶点(因为空格移走该位置不可再次作为棋子源)，
 * 如果被删除顶点在匹配中有配对顶点v，则尝试为v重新找匹配。如果找不到增广路，则表示当前玩家必胜。
 * 
 * 整体步骤：
 * 1. 读入棋盘并找出空格位置，将其临时设为黑棋'X'以便统一处理；
 * 2. 按照曼哈顿距离奇偶性和棋子颜色为每个满足条件的格子编号，构建二分图顶点；
 * 3. 构建邻接表并求初始最大匹配；
 * 4. 模拟对局过程：每一步都删除当前空格对应的顶点并尝试更新匹配，记录胜负状态；
 * 5. 找出所有在兔兔回合中犯错的操作(即前一状态兔兔必胜、后一状态蛋蛋必胜)，输出结果。
 */

const int MAXNM = 45;
int n, m;
int id[MAXNM][MAXNM];        // 每个格子对应的编号(0表示不加入图)
int tot;                     // 有效顶点总数
vector<vector<int>> adj;     // 邻接表，存储图的边
vector<bool> deletedNode;    // 标记删除的顶点
vector<int> matchTo;         // 匹配结果: matchTo[u] = v 表示 u 与 v 匹配
vector<int> visited;         // DFS访问标记
int timestampMark = 0;       // 时间戳，用于区分不同轮的访问

// DFS 寻找增广路径
bool dfs(int u) {
    for (int v : adj[u]) {
        if (deletedNode[v]) continue;            // 如果 v 已被删除，则跳过
        if (visited[v] == timestampMark) continue;
        visited[v] = timestampMark;
        // 如果 v 未匹配，或者可以为 v 的匹配点找到其他匹配
        if (matchTo[v] == 0 || dfs(matchTo[v])) {
            matchTo[v] = u;
            matchTo[u] = v;
            return true;
        }
    }
    return false;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // 读入棋盘尺寸
    cin >> n >> m;
    vector<string> board(n);
    for(int i = 0; i < n; i++) {
        cin >> board[i];
    }

    // 找到空格的位置，并将空格设为黑棋'X'(便于后续统一处理)
    int emptyX = -1, emptyY = -1;
    for(int i = 0; i < n; i++) {
        for(int j = 0; j < m; j++) {
            if (board[i][j] == '.') {
                emptyX = i;
                emptyY = j;
                board[i][j] = 'X';
            }
        }
    }

    // 编号：根据曼哈顿距离奇偶性和棋子颜色选择有效格子
    // 距离为空格偶数的格子只考虑黑棋('X')，距离奇数的格子只考虑白棋('O')
    tot = 0;
    for(int i = 0; i < n; i++) {
        for(int j = 0; j < m; j++) {
            int dist = abs(emptyX - i) + abs(emptyY - j);
            if ( (board[i][j] == 'O' && (dist % 2) == 1) ||
                 (board[i][j] == 'X' && (dist % 2) == 0) ) {
                id[i][j] = ++tot;
            } else {
                id[i][j] = 0;
            }
        }
    }

    // 构建邻接表：四个方向上有编号则连接边
    adj.assign(tot + 1, vector<int>());
    deletedNode.assign(tot + 1, false);
    int dx[4] = {0, 0, 1, -1};
    int dy[4] = {1, -1, 0, 0};
    for(int i = 0; i < n; i++) {
        for(int j = 0; j < m; j++) {
            int u = id[i][j];
            if (u == 0) continue;  // 跳过不参与匹配的格子
            for(int k = 0; k < 4; k++) {
                int ni = i + dx[k], nj = j + dy[k];
                if (ni >= 0 && ni < n && nj >= 0 && nj < m) {
                    int v = id[ni][nj];
                    if (v != 0) {
                        adj[u].push_back(v);
                    }
                }
            }
        }
    }

    // 初始化匹配关系数组和访问标记
    matchTo.assign(tot + 1, 0);
    visited.assign(tot + 1, 0);

    // 求初始最大匹配：对每个顶点尝试增广
    for(int u = 1; u <= tot; u++) {
        if (matchTo[u] == 0) {
            timestampMark++;
            dfs(u);
        }
    }

    // 读入操作数 k，随后 2k 步操作
    int k;
    cin >> k;
    int totalMoves = 2 * k;
    vector<bool> win(totalMoves + 2, false);

    // 模拟每一步操作
    for(int step = 1; step <= totalMoves; step++) {
        int ux = emptyX;
        int uy = emptyY;
        int u = id[ux][uy];  // 空格位置对应的图顶点编号

        if (matchTo[u] != 0) {
            // 如果当前顶点在匹配中被匹配，则断开匹配，尝试为配对顶点重找匹配
            int v = matchTo[u];
            matchTo[u] = 0;
            matchTo[v] = 0;
            // 删除顶点 u
            deletedNode[u] = true;
            // 对 v 重找匹配
            timestampMark++;
            if (!dfs(v)) {
                // 找不到增广路径，当前移动者获胜
                win[step] = true;
            }
        } else {
            // 顶点 u 未匹配，直接删除
            deletedNode[u] = true;
        }

        // 读入新空格位置（即移动的棋子原先所在位置）
        int nx, ny;
        cin >> nx >> ny;
        nx--; ny--;  // 将1-index转换为0-index
        emptyX = nx;
        emptyY = ny;
    }

    // 统计兔兔犯错的操作：兔兔在奇数步 (1,3,5,...) 操作
    vector<int> mistakes;
    for(int step = 1; step <= totalMoves; step += 2) {
        // 如果兔兔操作前 (win[step]) 兔兔必胜，而在蛋蛋回合前 (win[step+1]) 蛋蛋必胜，则该操作犯错
        if (win[step] && win[step + 1]) {
            int opIndex = (step + 1) / 2;
            mistakes.push_back(opIndex);
        }
    }

    // 输出结果
    cout << mistakes.size() << "\n";
    for(int op : mistakes) {
        cout << op << "\n";
    }

    return 0;
}

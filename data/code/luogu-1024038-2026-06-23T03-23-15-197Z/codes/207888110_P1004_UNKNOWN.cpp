#include <iostream>
#include <vector>
#include <queue>
#include <cstring>

using namespace std;

const int MAXN = 100;
const int INF = 1e9;

struct Edge {
    int to, cap, rev;
};

vector<Edge> G[MAXN * MAXN];

void add_edge(int from, int to, int cap) {
    G[from].push_back((Edge){to, cap, (int)G[to].size()});
    G[to].push_back((Edge){from, 0, (int)G[from].size() - 1});
}

int level[MAXN * MAXN];
int iter[MAXN * MAXN];

void bfs(int s) {
    memset(level, -1, sizeof(level));
    queue<int> q;
    level[s] = 0;
    q.push(s);
    while (!q.empty()) {
        int v = q.front();
        q.pop();
        for (int i = 0; i < G[v].size(); i++) {
            Edge &e = G[v][i];
            if (e.cap > 0 && level[e.to] < 0) {
                level[e.to] = level[v] + 1;
                q.push(e.to);
            }
        }
    }
}

int dfs(int v, int t, int f) {
    if (v == t) return f;
    for (int &i = iter[v]; i < G[v].size(); i++) {
        Edge &e = G[v][i];
        if (e.cap > 0 && level[v] < level[e.to]) {
            int d = dfs(e.to, t, min(f, e.cap));
            if (d > 0) {
                e.cap -= d;
                G[e.to][e.rev].cap += d;
                return d;
            }
        }
    }
    return 0;
}

int max_flow(int s, int t) {
    int flow = 0;
    while (true) {
        bfs(s);
        if (level[t] < 0) return flow;
        memset(iter, 0, sizeof(iter));
        int f;
        while ((f = dfs(s, t, INF)) > 0) {
            flow += f;
        }
    }
}

int main() {
    int N;
    cin >> N;
    int S = 0, T = N * N * 2 + 1;
    int grid[N + 1][N + 1];
    memset(grid, 0, sizeof(grid));

    while (true) {
        int x, y, val;
        cin >> x >> y >> val;
        if (x == 0 && y == 0 && val == 0) break;
        grid[x][y] = val;
    }

    for (int i = 1; i <= N; i++) {
        for (int j = 1; j <= N; j++) {
            int id = (i - 1) * N + j;
            int id2 = id + N * N;
            add_edge(id, id2, grid[i][j]);
            if (i < N) add_edge(id2, id + N, INF);
            if (j < N) add_edge(id2, id + 1, INF);
        }
    }

    add_edge(S, 1, INF);
    add_edge(N * N * 2, T, INF);

    cout << max_flow(S, T) << endl;

    return 0;
}

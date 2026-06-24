
#include <cstdio>
#include <algorithm>

using namespace std;

// Define Infinity. 0x3f3f3f3f is approximately 1e9, which is large enough 
// for this problem (max path < 200 * 10000 = 2e6) and safe from overflow 
// when adding two INFs in a 32-bit signed integer.
const int INF = 0x3f3f3f3f;
const int MAXN = 205;

int N, M;
int t[MAXN];          // Reconstruction time for each village
int dist[MAXN][MAXN]; // Adjacency matrix for shortest paths

int main() {
    // Read N and M
    if (scanf("%d %d", &N, &M) != 2) return 0;
    
    // Read reconstruction times. 
    // The problem guarantees t[0] <= t[1] <= ... <= t[N-1].
    for (int i = 0; i < N; ++i) {
        scanf("%d", &t[i]);
    }
    
    // Initialize distance matrix
    for (int i = 0; i < N; ++i) {
        for (int j = 0; j < N; ++j) {
            if (i == j) dist[i][j] = 0;
            else dist[i][j] = INF;
        }
    }
    
    // Read roads
    for (int i = 0; i < M; ++i) {
        int u, v, w;
        scanf("%d %d %d", &u, &v, &w);
        // Although the problem guarantees only one road between any pair,
        // using min is safer for robustness.
        if (w < dist[u][v]) {
            dist[u][v] = dist[v][u] = w;
        }
    }
    
    int Q;
    scanf("%d", &Q);
    
    // k_idx tracks the next village to be included in the Floyd-Warshall relaxation.
    // Since t[i] is sorted and query times are sorted, we can incrementally update.
    int k_idx = 0;
    
    for (int q = 0; q < Q; ++q) {
        int x, y, time;
        scanf("%d %d %d", &x, &y, &time);
        
        // Update the shortest paths by including all villages that have been 
        // reconstructed by the current query time.
        // In Floyd-Warshall, the outermost loop variable 'k' represents the 
        // set of allowed intermediate nodes. Here, village k becomes available 
        // at time t[k].
        while (k_idx < N && t[k_idx] <= time) {
            int k = k_idx;
            for (int i = 0; i < N; ++i) {
                for (int j = 0; j < N; ++j) {
                    // Relaxation step
                    if (dist[i][k] != INF && dist[k][j] != INF) {
                        if (dist[i][j] > dist[i][k] + dist[k][j]) {
                            dist[i][j] = dist[i][k] + dist[k][j];
                        }
                    }
                }
            }
            k_idx++;
        }
        
        // Check if the start and end villages are reconstructed at the given time
        if (t[x] > time || t[y] > time) {
            printf("-1\n");
        } else {
            // Check if a path exists
            if (dist[x][y] == INF) {
                printf("-1\n");
            } else {
                printf("%d\n", dist[x][y]);
            }
        }
    }
    
    return 0;
}

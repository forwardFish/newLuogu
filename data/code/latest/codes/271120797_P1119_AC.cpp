#include <iostream>
#include <cstring>
#include <algorithm>
using namespace std;

const int N = 210;
const int INF = 0x3f3f3f3f;

int n, m;
int t[N];
int dist[N][N];

int main() {
    cin >> n >> m;
    for (int i = 0; i < n; i++) {
        cin >> t[i];
    }

    memset(dist, 0x3f, sizeof(dist));
    for (int i = 0; i < n; i++) {
        dist[i][i] = 0;
    }

    for (int i = 0; i < m; i++) {
        int a, b, w;
        cin >> a >> b >> w;
        dist[a][b] = dist[b][a] = w;
    }

    int q;
    cin >> q;

    int k = 0;  
    while (q--) {
        int x, y, time;
        cin >> x >> y >> time;

        while (k < n && t[k] <= time) {
            for (int i = 0; i < n; i++) {
                for (int j = 0; j < n; j++) {
                    if (dist[i][k] + dist[k][j] < dist[i][j]) {
                        dist[i][j] = dist[i][k] + dist[k][j];
                    }
                }
            }
            k++;
        }

        if (t[x] > time || t[y] > time) {
            cout << -1 << endl;
        } else {
            if (dist[x][y] == INF) {
                cout << -1 << endl;
            } else {
                cout << dist[x][y] << endl;
            }
        }
    }

    return 0;
}
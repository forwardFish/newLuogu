#include <bits/stdc++.h>
using namespace std;

#define MAXN 405
#define INF 0x7f7f7f7f

int n, s, t;
double P, p[MAXN], tx[5], ty[5], x[MAXN], y[MAXN], pri[MAXN][MAXN], ans = INF;

double calc(int a, int b, int c) {
    if (tx[a] == tx[b] && ty[b] == ty[c] || tx[c] == tx[b] && ty[a] == ty[b]) return -1;
    return (tx[a] - tx[b]) / (ty[a] - ty[b]) * (tx[b] - tx[c]) / (ty[b] - ty[c]);
}

double getp(int a, int b) {
    return sqrt((x[a] - x[b]) * (x[a] - x[b]) + (y[a] - y[b]) * (y[a] - y[b])) * (a / 4 == b / 4 ? p[a / 4] : P);
}

int main() {
    cin >> n >> P >> s >> t;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= 3; j++)
            cin >> tx[j] >> ty[j];
        if (calc(1, 2, 3) == -1) {
            tx[4] = tx[1] + tx[3] - tx[2];
            ty[4] = ty[1] + ty[3] - ty[2];
        }
        else if (calc(2, 1, 3) == -1) {
            tx[4] = tx[2] + tx[3] - tx[1];
            ty[4] = ty[2] + ty[3] - ty[1];
        }
        else {
            tx[4] = tx[1] + tx[2] - tx[3];
            ty[4] = ty[1] + ty[2] - ty[3];
        }
        for (int j = 1; j <= 4; j++) {
            int o = i * 4 + j - 5;
            x[o] = tx[j], y[o] = ty[j];
        }
        cin >> p[i - 1];
    }
    memset(pri, INF, sizeof(pri));
    for (int i = 0; i < n * 4; i++)
        for (int j = 0; j < n * 4; j++)
            pri[i][j] = pri[j][i] = getp(i, j);
    for (int i = 0; i < n * 4; i++)
        for (int j = 0; j < n * 4; j++) {
            if (i == j) continue;
            for (int k = 0; k < n * 4; k++) {
                if (j == k || i == k) continue;
                pri[i][j] = pri[j][i] = min(pri[i][j], pri[i][k] + pri[j][k]);
            }
        }
    for (int i = 1; i <= 4; i++)
        for (int j = 1; j <= 4; j++)
            ans = min(ans, pri[s * 4 + i - 5][t * 4 + j - 5]);
    cout << fixed << setprecision(1) << ans;
    return 0;
}
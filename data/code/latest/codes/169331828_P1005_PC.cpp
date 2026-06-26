#include <iostream>
#include <vector>
#include <cmath>
#include <algorithm>

using namespace std;

const int MAXN = 80;
const int MAXM = 80;

int n, m;
int a[MAXN][MAXM];
long long dp[MAXM][MAXM];

long long solve_row(int row) {
    for (int len = 1; len <= m; ++len) {
        for (int i = 0; i + len - 1 < m; ++i) {
            int j = i + len - 1;
            int p = m - len + 1;
            if (i == j) {
                dp[i][j] = a[row][i] * (1LL << p);
            } else {
                dp[i][j] = max(a[row][i] * (1LL << p) + dp[i+1][j], a[row][j] * (1LL << p) + dp[i][j-1]);
            }
        }
    }
    return dp[0][m-1];
}

int main() {
    cin >> n >> m;
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < m; ++j) {
            cin >> a[i][j];
        }
    }

    long long total_score = 0;
    for (int i = 0; i < n; ++i) {
        total_score += solve_row(i);
    }

    cout << total_score << endl;
    return 0;
}

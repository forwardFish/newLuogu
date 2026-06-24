#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int N;
    cin >> N;
    vector<vector<int>> grid(N + 1, vector<int>(N + 1, 0));
    int x, y, value;
    while (cin >> x >> y >> value && (x || y || value)) {
        grid[x][y] = value;
    }

    vector<vector<vector<vector<int>>>> dp(N + 1, vector<vector<vector<int>>>(N + 1, vector<vector<int>>(N + 1, vector<int>(N + 1, 0))));

    for (int i = 1; i <= N; ++i) {
        for (int j = 1; j <= N; ++j) {
            for (int k = 1; k <= N; ++k) {
                for (int l = 1; l <= N; ++l) {
                    int current = grid[i][j];
                    if (i != k || j != l) {
                        current += grid[k][l];
                    }
                    dp[i][j][k][l] = max({
                        dp[i-1][j][k-1][l],
                        dp[i-1][j][k][l-1],
                        dp[i][j-1][k-1][l],
                        dp[i][j-1][k][l-1]
                    }) + current;
                }
            }
        }
    }

    cout << dp[N][N][N][N] << endl;

    return 0;
}
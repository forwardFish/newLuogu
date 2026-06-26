#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int m, n;
    cin >> m >> n;
    vector<vector<int>> matrix(m, vector<int>(n));
    for (int i = 0; i < m; ++i) {
        for (int j = 0; j < n; ++j) {
            cin >> matrix[i][j];
        }
    }

    vector<vector<vector<int>>> dp(m + n - 1, vector<vector<int>>(m, vector<int>(m, 0)));
    dp[0][0][0] = matrix[0][0];

    for (int k = 1; k < m + n - 1; ++k) {
        for (int i = 0; i < m; ++i) {
            for (int j = 0; j < m; ++j) {
                if (k - i >= 0 && k - i < n && k - j >= 0 && k - j < n) {
                    int maxVal = 0;
                    if (i > 0 && j > 0) maxVal = max(maxVal, dp[k-1][i-1][j-1]);
                    if (i > 0 && k - j > 0) maxVal = max(maxVal, dp[k-1][i-1][j]);
                    if (k - i > 0 && j > 0) maxVal = max(maxVal, dp[k-1][i][j-1]);
                    if (k - i > 0 && k - j > 0) maxVal = max(maxVal, dp[k-1][i][j]);
                    dp[k][i][j] = maxVal + matrix[i][k-i] + (i != j ? matrix[j][k-j] : 0);
                }
            }
        }
    }

    cout << dp[m+n-2][m-1][m-1] << endl;
    return 0;
}

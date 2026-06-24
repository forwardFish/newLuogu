#include <iostream>
#include <vector>
#include <string>
#include <climits>
#include <algorithm>
using namespace std;

const int MAXN = 200;
const int INF = INT_MAX;

int main() {
    int p, k;
    cin >> p >> k;
    string str;
    for (int i = 0; i < p; ++i) {
        string line;
        cin >> line;
        str += line;
    }
    int n = str.size();
    int s;
    cin >> s;
    vector<string> dict(s);
    for (int i = 0; i < s; ++i) {
        cin >> dict[i];
    }

    vector<int> min_len(n, INF);
    for (const string& word : dict) {
        int len = word.size();
        for (int i = 0; i <= n - len; ++i) {
            if (str.substr(i, len) == word) {
                if (len < min_len[i]) {
                    min_len[i] = len;
                }
            }
        }
    }

    vector<vector<int>> cnt(n, vector<int>(n, 0));
    for (int l = 0; l < n; ++l) {
        for (int r = l; r < n; ++r) {
            int sum = 0;
            for (int k = l; k <= r; ++k) {
                if (min_len[k] != INF && min_len[k] <= (r - k + 1)) {
                    sum++;
                }
            }
            cnt[l][r] = sum;
        }
    }

    vector<vector<int>> dp(n + 1, vector<int>(k + 1, -INF));
    dp[0][0] = 0;
    for (int i = 1; i <= n; ++i) {
        for (int j = 1; j <= k; ++j) {
            for (int m = j - 1; m < i; ++m) {
                if (m >= 0 && dp[m][j - 1] != -INF) {
                    dp[i][j] = max(dp[i][j], dp[m][j - 1] + cnt[m][i - 1]);
                }
            }
        }
    }

    cout << dp[n][k] << endl;
    return 0;
}
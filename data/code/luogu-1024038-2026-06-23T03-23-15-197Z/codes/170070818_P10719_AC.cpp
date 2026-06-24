#include <iostream>
#include <vector>
#include <climits>
using namespace std;
int main() {
    int n, m, k;
    cin >> n >> m >> k;
    vector<vector<int>> grid(n, vector<int>(m));
    vector<vector<int>> prefix_sum(n + 1, vector<int>(m + 1, 0));
    for (int i = 0; i < n; ++i) {
        string row;
        cin >> row;
        for (int j = 0; j < m; ++j) {
            grid[i][j] = row[j] - '0';
            prefix_sum[i + 1][j + 1] = prefix_sum[i + 1][j] + prefix_sum[i][j + 1] - prefix_sum[i][j] + grid[i][j];
        }
    }
    int min_area = INT_MAX;
    for (int x1 = 1; x1 <= n; ++x1) {
        for (int y1 = 1; y1 <= m; ++y1) {
            for (int x2 = x1; x2 <= n; ++x2) {
                for (int y2 = y1; y2 <= m; ++y2) {
                    int black_count = prefix_sum[x2][y2] - prefix_sum[x2][y1 - 1] - prefix_sum[x1 - 1][y2] + prefix_sum[x1 - 1][y1 - 1];
                    if (black_count >= k) {
                        int area = (x2 - x1 + 1) * (y2 - y1 + 1);
                        min_area = min(min_area, area);
                    }
                }
            }
        }
    }
    if (min_area == INT_MAX) {
        cout << 0 << endl;
    } else {
        cout << min_area << endl;
    }

    return 0;
}

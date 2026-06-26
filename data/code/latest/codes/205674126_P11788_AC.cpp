#include <iostream>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int H, W;
    cin >> H >> W;

    vector<string> grid(H);
    for (int i = 0; i < H; ++i) {
        cin >> grid[i];
    }

    vector<vector<int>> row_O(H, vector<int>(W));
    vector<vector<int>> col_I(H, vector<int>(W));

    // 预处理每行的O的后缀数量
    for (int i = 0; i < H; ++i) {
        int sum = 0;
        for (int j = W - 1; j >= 0; --j) {
            row_O[i][j] = sum;
            if (grid[i][j] == 'O') {
                sum++;
            }
        }
    }

    // 预处理每列的I的后缀数量
    for (int j = 0; j < W; ++j) {
        int sum = 0;
        for (int i = H - 1; i >= 0; --i) {
            col_I[i][j] = sum;
            if (grid[i][j] == 'I') {
                sum++;
            }
        }
    }

    long long ans = 0;
    for (int i = 0; i < H; ++i) {
        for (int j = 0; j < W; ++j) {
            if (grid[i][j] == 'J') {
                ans += (long long)row_O[i][j] * col_I[i][j];
            }
        }
    }

    cout << ans << "\n";
    return 0;
}
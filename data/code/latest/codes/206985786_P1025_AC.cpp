#include <iostream>
#include <cstring>

using namespace std;

int memo[201][7][201]; // 用于记忆化搜索的三维数组

int dfs(int r, int p, int min_val) {
    if (memo[r][p][min_val] != -1) {
        return memo[r][p][min_val];
    }
    if (p == 1) {
        return (r >= min_val) ? 1 : 0;
    }
    int res = 0;
    int max_x = r / p;
    for (int x = min_val; x <= max_x; ++x) {
        res += dfs(r - x, p - 1, x);
    }
    memo[r][p][min_val] = res;
    return res;
}

int main() {
    int n, k;
    cin >> n >> k;
    memset(memo, -1, sizeof(memo)); // 初始化memo数组为-1
    cout << dfs(n, k, 1) << endl;
    return 0;
}
#include <iostream>
#include <vector>
#include <algorithm>
#include <cmath>
using namespace std;

// 高精度加法
vector<int> add(const vector<int>& a, const vector<int>& b) {
    vector<int> c;
    int carry = 0;
    int n = max(a.size(), b.size());
    for (int i = 0; i < n; ++i) {
        int sum = carry;
        if (i < a.size()) sum += a[i];
        if (i < b.size()) sum += b[i];
        c.push_back(sum % 10);
        carry = sum / 10;
    }
    if (carry) c.push_back(carry);
    return c;
}

// 高精度减法，假设 a >= b
vector<int> sub(const vector<int>& a, const vector<int>& b) {
    vector<int> c;
    int borrow = 0;
    for (size_t i = 0; i < a.size(); ++i) {
        int diff = a[i] - borrow;
        if (i < b.size()) diff -= b[i];
        if (diff < 0) {
            diff += 10;
            borrow = 1;
        } else {
            borrow = 0;
        }
        c.push_back(diff);
    }
    // 去掉前导零
    while (c.size() > 1 && c.back() == 0) c.pop_back();
    return c;
}

// 输出高精度数
void print(const vector<int>& v) {
    if (v.empty()) {
        cout << 0 << endl;
        return;
    }
    for (int i = v.size() - 1; i >= 0; --i) {
        cout << v[i];
    }
    cout << endl;
}

int main() {
    int k, w;
    cin >> k >> w;

    int M = (1 << k) - 1;           // 最大数字
    int r = w % k;                  // 最高位二进制位数
    int len = (w + k - 1) / k;      // 最大可能位数

    if (len < 2) {
        cout << 0 << endl;
        return 0;
    }

    // 预处理组合数 C[i][j]，i 从 0 到 M
    vector<vector<vector<int>>> C(M + 1);
    for (int i = 0; i <= M; ++i) {
        C[i].resize(i + 1);
    }
    // C[0][0] = 1
    C[0][0] = {1};

    for (int i = 1; i <= M; ++i) {
        C[i][0] = {1};
        C[i][i] = {1};
        for (int j = 1; j < i; ++j) {
            C[i][j] = add(C[i - 1][j - 1], C[i - 1][j]);
        }
    }

    vector<int> ans = {0};

    // 位数 n = 2 .. len-1  (但 n <= M)
    int max_n = min(len - 1, M);
    for (int n = 2; n <= max_n; ++n) {
        ans = add(ans, C[M][n]);
    }

    // 位数 n = len
    if (len <= M) {
        if (r == 0) {
            // 所有位都是完整的 k 位
            ans = add(ans, C[M][len]);
        } else {
            // 最高位只有 r 位
            int t = (1 << k) - (1 << r);   // 2^k - 2^r
            if (len <= t) {
                ans = add(ans, sub(C[M][len], C[t][len]));
            } else {
                ans = add(ans, C[M][len]); // C[t][len] = 0
            }
        }
    }

    print(ans);
    return 0;
}
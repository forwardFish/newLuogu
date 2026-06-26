#include <iostream>
#include <vector>
#include <algorithm>
#include <cmath>

using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a(n + 1);
    for (int i = 1; i <= n; ++i) {
        cin >> a[i];
    }

    // 计算差分数组
    vector<long long> d(n + 1);
    for (int i = 1; i <= n; ++i) {
        d[i] = a[i] - a[i - 1];
    }

    // 计算最少操作次数
    long long positive_sum = 0, negative_sum = 0;
    for (int i = 2; i <= n; ++i) {
        if (d[i] > 0) {
            positive_sum += d[i];
        } else {
            negative_sum -= d[i];
        }
    }
    long long s = min(positive_sum, negative_sum) + abs(positive_sum - negative_sum);

    // 计算最终能得到多少种结果
    long long results = abs(positive_sum - negative_sum) + 1;

    cout << operations << endl;
    cout << results << endl;

    return 0;
}

#include<bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; ++i) {
        cin >> a[i];
    }

    // 找到数列中的最大值和最小值
    int max_val = *max_element(a.begin(), a.end());
    int min_val = *min_element(a.begin(), a.end());

    // 计算最少操作次数
    int s = 0;
    for (int i = 1; i < n; ++i) {
        s += abs(a[i] - a[i - 1]);
    }
    s /= 2;

    // 计算最终能得到多少种结果
    int results = max_val - min_val + 1;

    cout << s << endl;
    cout << results << endl;

    return 0;
}

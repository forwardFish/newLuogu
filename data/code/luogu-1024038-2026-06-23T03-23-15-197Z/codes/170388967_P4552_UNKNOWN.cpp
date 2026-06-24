#include <iostream>
#include <vector>
#include <algorithm>
#include <climits>

using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; ++i) {
        cin >> a[i];
    }

    // 找到数列中的最小值和最大值
    int min_val = *min_element(a.begin(), a.end());
    int max_val = *max_element(a.begin(), a.end());

    long long min_operations = LLONG_MAX;
    for (int target = min_val; target <= max_val; ++target) {
        long long operations = 0;
        for (int i = 0; i < n; ++i) {
            operations += abs(a[i] - target);
        }
        if (operations < min_operations) {
            min_operations = operations;
        }
    }

    // 计算最终能得到多少种结果
    int results = max_val - min_val + 1;

    cout << min_operations << endl;
    cout << results << endl;

    return 0;
}

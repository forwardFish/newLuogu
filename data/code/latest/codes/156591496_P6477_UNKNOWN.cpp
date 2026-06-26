#include <iostream>
#include <vector>
#include <unordered_map>
#include <algorithm>

using namespace std;

// 模数
const int MOD = 1e9 + 7;

int main() {
    int n;
    cin >> n;
    vector<int> A(n);
    for (int i = 0; i < n; i++) {
        cin >> A[i];
    }

    long long result = 0;

    // 滑动窗口
    unordered_map<int, int> freq;
    int left = 0; // 左指针
    int distinct_count = 0; // 不同元素的个数

    for (int right = 0; right < n; right++) {
        // 扩展窗口
        if (freq[A[right]] == 0) {
            distinct_count++;
        }
        freq[A[right]]++;

        // 对所有从左指针开始的子序列，计算平方和
        int currentDistinctSquare = distinct_count * distinct_count;
        result = (result + currentDistinctSquare) % MOD;

        // 现在计算以`left`为起点，`right`为终点的所有子序列的平方和
        for (int i = left; i < right; i++) {
            result = (result + currentDistinctSquare) % MOD;
        }

        // 左指针可以移动
        while (left <= right) {
            // 收缩窗口
            freq[A[left]]--;
            if (freq[A[left]] == 0) {
                distinct_count--;
            }
            left++;
        }
    }

    cout << result << endl;

    return 0;
}

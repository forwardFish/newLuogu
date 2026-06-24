#include <iostream>
#include <unordered_map>
#include <vector>
#define int long long

using namespace std;
inline int read() {
    int x = 0, f = 1;
    char ch = getchar();
    while (ch < '0' || ch > '9') {
        if (ch == '-') f = -1;
        ch = getchar();
    }
    while (ch >= '0' && ch <= '9') {
        x = x * 10 + ch - '0';
        ch = getchar();
    }
    return x * f;
}
// 快写函数
inline void write(int x) {
    if (x < 0) {
        putchar('-');
        x = -x;
    }
    if (x > 9) write(x / 10);
    putchar(x % 10 + '0');
}
pair<int, int> findTwoSum(const vector<int>& nums, int target) {
    unordered_map<int, int> numMap;
    for (int i = 0; i < nums.size(); ++i) {
        int complement = target - nums[i];
        if (numMap.find(complement) != numMap.end()) {
            return {numMap[complement], i};
        }
        numMap[nums[i]] = i;
    }
    return {-1, -1};
}

signed main()
{
    int n, k;
    n=read(),k=read();
    vector<int> nums(n);
    for (int i = 0; i < n; ++i) {
        nums[i]=read();
    }
    pair<int, int> result = findTwoSum(nums, k);
    cout << result.first << " " << result.second << endl;
    return 0;
}

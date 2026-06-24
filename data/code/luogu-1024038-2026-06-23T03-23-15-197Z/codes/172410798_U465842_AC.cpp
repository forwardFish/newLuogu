#include <iostream>
#include <unordered_map>
#include <vector>
#define int long long
using namespace std;

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

signed main() {
    int n, k;
    cin >> n >> k;
    vector<int> nums(n);
    for (int i = 0; i < n; ++i) {
        cin >> nums[i];
    }
    pair<int, int> result = findTwoSum(nums, k);
    cout << result.first << " " << result.second << endl;
    return 0;
}

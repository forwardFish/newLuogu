#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; ++i) {
        cin >> nums[i];
    }
    sort(nums.begin(), nums.end());
    
    int current = nums[0];
    int count = 1;
    for (int i = 1; i < n; ++i) {
        if (nums[i] == current) {
            ++count;
        } else {
            cout << current << " " << count << endl;
            current = nums[i];
            count = 1;
        }
    }
    // 输出最后一个数
    cout << current << " " << count << endl;
    return 0;
}
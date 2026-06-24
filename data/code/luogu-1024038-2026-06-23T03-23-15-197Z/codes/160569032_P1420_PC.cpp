#include <iostream>
#include <vector>
#include <set>
#include <algorithm>

int main() {
    int n;
    std::cin >> n;
    
    std::vector<int> nums(n);
    for (int i = 0; i < n; ++i) {
        std::cin >> nums[i];
    }
    
    // 去重和排序
    std::set<int> uniqueNums(nums.begin(), nums.end());
    std::vector<int> sortedNums(uniqueNums.begin(), uniqueNums.end());
    
    int longestStreak = 0;
    int currentStreak = 1;
    
    for (size_t i = 1; i < sortedNums.size(); ++i) {
        if (sortedNums[i] == sortedNums[i - 1] + 1) {
            ++currentStreak;
        } else {
            longestStreak = std::max(longestStreak, currentStreak);
            currentStreak = 1;
        }
    }
    longestStreak = std::max(longestStreak, currentStreak); // Final check
    
    std::cout << longestStreak << std::endl;
    
    return 0;
}

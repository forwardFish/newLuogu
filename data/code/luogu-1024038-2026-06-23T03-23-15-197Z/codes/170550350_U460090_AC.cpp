#include <iostream>
#include <vector>
#include <set>

using namespace std;

int main() {
    int n, i, h, R;
    cin >> n >> i >> h >> R;

    // 初始化差分数组
    vector<int> diff(n + 1, 0); // 差分数组，多一个位置用于处理边界

    // 使用set来避免重复的关系对
    set<pair<int, int>> relations;

    // 读取关系并更新差分数组
    for (int j = 0; j < R; ++j) {
        int x, y;
        cin >> x >> y;
        if (x > y) swap(x, y); // 确保 x < y
        if (relations.find({x, y}) == relations.end()) {
            relations.insert({x, y});
            // 更新差分数组
            diff[x + 1] -= 1;
            diff[y] += 1;
        }
    }

    // 初始化每个学生的身高为最高学生的身高
    vector<int> height(n + 1, h);

    // 通过差分数组计算每个学生的最大可能身高
    for (int j = 1; j <= n; ++j) {
        height[j] += diff[j];
        diff[j + 1] += diff[j]; // 累加差分数组
    }

    // 输出每个学生的最大可能身高
    for (int j = 1; j <= n; ++j) {
        cout << height[j] << endl;
    }

    return 0;
}

#include<bits/stdc++.h>
using namespace std;
int main()
{
    int n, i, h, R;
    cin >> n >> i >> h >> R;
    // 初始化差分数组
    vector<int> d(n + 1, 0); // 差分数组，多一个位置用于处理边界
    // 使用set来避免重复的关系对
    set<pair<int, int>> r;
    // 读取关系并更新差分数组
    for (int j = 0; j < R; ++j) {
        int x, y;
        cin >> x >> y;
        if (x > y) swap(x, y); // 确保 x < y
        if (r.find({x, y}) == r.end())
		{
            r.insert({x, y});
            // 更新差分数组
            d[x + 1] -= 1;
            d[y] += 1;  
        }
    }
    // 初始化每个学生的身高为最高学生的身高
    vector<int> h(n + 1, h);
    // 通过差分数组计算每个学生的最大可能身高
    for (int j = 1; j <= n; ++j) {
        h[j] += d[j];
        d[j + 1] += d[j]; // 累加差分数组
    }
    // 输出每个学生的最大可能身高
    for (int j = 1; j <= n; ++j) {
        cout << h[j] << endl;
    }
    return 0;
}

#include<bits/stdc++.h>
using namespace std;

const int maxn = 1000001; // 定义最大数组大小

// 判断函数，判断是否满足条件
bool c(int n, int m, int k, vector<int>& a, vector<int>& b)
{
    bool pa[maxn] = {false}; // 用于标记数组a中的元素
    bool pb[maxn] = {false}; // 用于标记数组b中的元素
    
    // 标记数组a中的元素
    for (int num : a)
    {
        pa[num] = true;
    }
    
    // 标记数组b中的元素
    for (int num : b)
    {
        pb[num] = true;
    }
    
    int ma = 0; // 记录只在a中出现的元素数量
    int mb = 0; // 记录只在b中出现的元素数量
    int e = 0;  // 记录同时在a和b中出现的元素数量
    
    // 统计元素分布情况
    for (int i = 1; i <= k; ++i)
    {
        if (pa[i] && pb[i])
        {
            e++;
        }
        else if (pa[i])
        {
            ma++;
        }
        else if (pb[i])
        {
            mb++;
        }
        else
        {
            return false; // 如果存在不在a和b中的元素，直接返回false
        }
    }
    
    // 判断只在a或b中出现的元素数量是否超过k的一半
    if (ma > k / 2 || mb > k / 2)
    {
        return false;
    }
    
    int r = k - (ma + mb); // 计算需要同时在a和b中出现的元素数量
    if (r > e) {
        return false; // 如果需要的数量大于实际数量，返回false
    }
    
    return true; // 满足所有条件，返回true
}

int main() {
    ios::sync_with_stdio(false); // 加速cin和cout
    cin.tie(0);cout.tie();
    
    int T;
    cin >> T; // 输入测试用例数量
    
    while (T--)
    {
        int n, m, k;
        cin >> n >> m >> k; // 输入n, m, k
        
        vector<int> a(n), b(m); // 定义数组a和b
        
        // 输入数组a的元素
        for (int i = 0; i < n; ++i)
        {
            cin >> a[i];
        }
        
        // 输入数组b的元素
        for (int i = 0; i < m; ++i)
        {
            cin >> b[i];
        }
        
        // 判断是否满足条件并输出结果
        if (c(n, m, k, a, b))
        {
            cout << "YES" << endl;
        }
        else
        {
            cout << "NO" << endl;
        }
    }
    
    return 0;
}

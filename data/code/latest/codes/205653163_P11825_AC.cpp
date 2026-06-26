#include <iostream>
#include <string>
#include <algorithm>
#include <unordered_set>
 
using namespace std;
 
// 核心处理函数（支持d<=18的大数运算）
long long process_number(long long num, int d) {
    string s = to_string(num);
    s = string(d - s.length(),  '0') + s; // 自动补前导零 
    
    string asc = s, des = s;
    sort(asc.begin(),  asc.end()); 
    sort(des.rbegin(),  des.rend()); 
    
    // 处理全零异常（题目保证输入合法，此处防御性编程）
    if (asc == des) return 0;
    
    return stoll(des) - stoll(asc);
}
 
// 循环检测函数（时间复杂度O(K) K为循环步数） 
long long find_cycle_entry(long long num, int d) {
    unordered_set<long long> visited;
    const int MAX_STEPS = 1e5; // 根据题目保证设置上限 
    
    for (int step = 0; step < MAX_STEPS; ++step) {
        if (visited.count(num))  return num;
        visited.insert(num); 
        num = process_number(num, d);
    }
    return -1; // 理论上不会触发 
}
 
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr); 
    
    int n, d;
    cin >> n >> d;
    
    while (n--) {
        string s;
        cin >> s;
        long long num = stoll(s);
        cout << find_cycle_entry(num, d) << "\n";
    }
    
    return 0;
}
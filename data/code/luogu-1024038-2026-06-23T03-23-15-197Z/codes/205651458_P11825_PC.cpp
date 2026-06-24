#include <iostream>
#include <vector>
#include <algorithm>
#include <string>
#include <set>
#define int long long 
// 函数用于将数字按降序和升序排列并相减
int processNumber(int num, int d) {
    std::string numStr = std::to_string(num);
    // 补零到 d 位
    while (numStr.length()  < d) {
        numStr = "0" + numStr;
    }

    std::string ascending = numStr;
    std::string descending = numStr;

    // 升序排序
    std::sort(ascending.begin(),  ascending.end()); 
    // 降序排序
    std::sort(descending.rbegin(),  descending.rend()); 

    int ascendingNum = std::stoi(ascending);
    int descendingNum = std::stoi(descending);

    return descendingNum - ascendingNum;
}

// 函数用于找到进入循环时第一个遇到的数字
int findCycleStart(int num, int d) {
    std::set<int> visited;
    while (true) {
        if (visited.find(num)  != visited.end())  {
            return num;
        }
        visited.insert(num); 
        num = processNumber(num, d);
    }
}
signed main() {
    int n, d;
    std::cin >> n >> d;

    std::vector<int> numbers(n);
    for (int i = 0; i < n; ++i) {
        std::cin >> numbers[i];
    }

    for (int num : numbers) {
        std::cout << findCycleStart(num, d) << std::endl;
    }

    return 0;
}
#include <iostream>
#include <string>

int main() {
    std::string s;
    std::cin >> s;
    
    int boyCount = 0;
    int girlCount = 0;
    int n = s.size();
    
    for (int i = 0; i <= n - 3; ) {
        if (i <= n - 3 && s.substr(i, 3) == "boy") {
            boyCount++;
            i += 3; // 移动指针跳过当前单词长度，避免重叠统计
        } else if (i <= n - 4 && s.substr(i, 4) == "girl") {
            girlCount++;
            i += 4; // 移动指针跳过当前单词长度，避免重叠统计
        } else {
            i++;
        }
    }
    
    std::cout << boyCount << std::endl;
    std::cout << girlCount << std::endl;
    
    return 0;
}

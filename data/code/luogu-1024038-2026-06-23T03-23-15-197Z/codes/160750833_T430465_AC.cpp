#include<bits/stdc++.h>
int main() {
    int N;
    std::cin >> N;
    bool isNegative = N < 0;
    N = std::abs(N);
    std::string str = std::to_string(N);
    std::reverse(str.begin(), str.end());
    int reversedNum = std::stoi(str);
    if (isNegative) {
        reversedNum = -reversedNum;
    }
    std::cout << reversedNum << std::endl;
    return 0;
}

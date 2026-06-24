# 校验器（Checker）

校验器用于判断选手输出是否正确。

输入：
- 测试输入文件
- 选手输出文件
- 答案文件

输出：
- AC（Accepted）或 WA（Wrong Answer）

本题只需比较选手输出的整数是否与答案一致（对 `10^9+7` 取模后的结果）。由于题目要求输出取模后的整数，故校验器直接比较两个整数即可。

下面是一个简单的 C++ 校验器实现：

cpp
#include <iostream>
#include <fstream>
#include <string>
using namespace std;

int main(int argc, char* argv[]) {
    ifstream ans(argv[2]);
    ifstream out(argv[3]);
    int ans_val, out_val;
    ans >> ans_val;
    if (!(out >> out_val)) {
        cerr << "选手输出格式错误" << endl;
        return 2; // PE
    }
    if (ans_val == out_val) {
        return 0; // AC
    } else {
        cerr << "答案错误" << endl;
        return 1; // WA
    }
}


在实际评测环境中，通常使用忽略空白符的 `diff` 即可满足需求。
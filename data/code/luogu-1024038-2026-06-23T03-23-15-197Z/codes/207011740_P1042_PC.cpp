#include <iostream>
#include <vector>
#include <string>
using namespace std;

string read_input() {
    string s;
    string line;
    while (getline(cin, line)) {
        for (char c : line) {
            if (c == 'E') return s;
            s.push_back(c);
        }
    }
    return s;
}

vector<pair<int, int>> process(int K, const string &s) {
    vector<pair<int, int>> res;
    int a = 0, b = 0;
    for (char c : s) {
        if (c == 'W') a++;
        else if (c == 'L') b++;
        
        if ((a >= K || b >= K) && abs(a - b) >= 2) {
            res.emplace_back(a, b);
            a = 0;
            b = 0;
        }
    }
    // 处理未结束的局
    if (a > 0 || b > 0) {
        res.emplace_back(a, b);
    }
    return res;
}

int main() {
    string input = read_input();
    auto res11 = process(11, input);
    auto res21 = process(21, input);
    
    // 处理无比赛的情况
    if (res11.empty()) res11.emplace_back(0, 0);
    if (res21.empty()) res21.emplace_back(0, 0);
    
    for (auto &p : res11) {
        cout << p.first << ":" << p.second << endl;
    }
    cout << endl;
    for (auto &p : res21) {
        cout << p.first << ":" << p.second << endl;
    }
    
    return 0;
}
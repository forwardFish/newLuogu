#include <iostream>
#include <vector>
#include <unordered_map>
#include <algorithm>

using namespace std;

int longestBalancedSubstring(const string& s) {
    int n = s.size();
    unordered_map<int, int> first_occurrence;
    first_occurrence[0] = -1;

    int max_length = 0;
    int balance = 0; 

    for (int i = 0; i < n; ++i) {
        if (s[i] == '0') {
            balance--;
        } else {
            balance++;
        }

        if (first_occurrence.find(balance) == first_occurrence.end()) {
            first_occurrence[balance] = i;
        } else {
            max_length = max(max_length, i - first_occurrence[balance]);
        }
    }

    return max_length;
}

int main() {
    string s;
    cin >> s;
    cout << longestBalancedSubstring(s) << endl;
    return 0;
}

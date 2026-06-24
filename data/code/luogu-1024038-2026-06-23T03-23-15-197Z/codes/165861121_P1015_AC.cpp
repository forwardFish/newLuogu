#include <iostream>
#include <algorithm>
#include <string>
#include<bits/stdc++.h>
using namespace std;
bool a(const string& s) {
    return s == string(s.rbegin(), s.rend());
}
string addNumbers(const string& num1, const string& num2, int base) {
    int carry = 0;
    string result;
    int len1 = num1.size(), len2 = num2.size();
    int m = max(len1, len2);
    for (int i = 0; i < m; ++i) {
        int d1 = i < len1 ? (isdigit(num1[len1 - 1 - i]) ? num1[len1 - 1 - i] - '0' : num1[len1 - 1 - i] - 'A' + 10) : 0;
        int d2 = i < len2 ? (isdigit(num2[len2 - 1 - i]) ? num2[len2 - 1 - i] - '0' : num2[len2 - 1 - i] - 'A' + 10) : 0;
        int sum = d1 + d2 + carry;
        carry = sum / base;
        sum %= base;
        result.push_back(sum < 10 ? sum + '0' : sum - 10 + 'A');
    }
    if (carry > 0) result.push_back(carry < 10 ? carry + '0' : carry - 10 + 'A');
    reverse(result.begin(), result.end());
    return result;
}
string convertToBase(int n, int base) {
    if (n == 0) return "0";
    string result;
    while (n > 0) {
        int digit = n % base;
        result.push_back(digit < 10 ? digit + '0' : digit - 10 + 'A');
        n /= base;
    }
    reverse(result.begin(), result.end());
    return result;
}
int main()
{
    int base;
    string number;
    cin >> base >> number;
    for (int step = 1; step <= 30; ++step) {
        if (a(number)) {
            cout << "STEP=" << step - 1 << endl;
            return 0;
        }
        string reversed_number = string(number.rbegin(), number.rend());
        number = addNumbers(number, reversed_number, base);
    }
    cout << "Impossible!" << endl;
    return 0;
}

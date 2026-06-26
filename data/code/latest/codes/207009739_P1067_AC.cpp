#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> coeffs(n + 1);
    for (int i = 0; i <= n; ++i) {
        cin >> coeffs[i];
    }
    
    string result;
    bool first = true;
    
    for (int i = 0; i <= n; ++i) {
        int coeff = coeffs[i];
        int degree = n - i;
        
        if (coeff == 0) continue;
        
        string term;
        // 处理符号
        if (first) {
            if (coeff < 0) {
                term += '-';
            }
            first = false;
        } else {
            if (coeff > 0) {
                term += '+';
            } else {
                term += '-';
            }
        }
        
        int abs_coeff = abs(coeff);
        // 处理系数和次数部分
        if (degree == 0) {
            term += to_string(abs_coeff);
        } else {
            if (abs_coeff != 1) {
                term += to_string(abs_coeff);
            }
            // 处理x部分
            if (degree == 1) {
                term += 'x';
            } else {
                term += "x^" + to_string(degree);
            }
        }
        
        result += term;
    }
    
    cout << result << endl;
    return 0;
}
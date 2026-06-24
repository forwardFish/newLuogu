#include <iostream>
#include <vector>

using namespace std;

// 高精度加法
vector<int> add(vector<int>& num1, vector<int>& num2) {
    vector<int> res;
    int carry = 0;
    int i = num1.size() - 1, j = num2.size() - 1;
    while (i >= 0 || j >= 0 || carry > 0) {
        if (i >= 0) carry += num1[i--];
        if (j >= 0) carry += num2[j--];
        res.insert(res.begin(), carry % 10);
        carry /= 10;
    }
    return res;
}

// 高精度乘法
vector<int> multiply(vector<int>& num, int factor) {
    vector<int> res;
    int carry = 0;
    for (int i = num.size() - 1; i >= 0; --i) {
        carry += num[i] * factor;
        res.insert(res.begin(), carry % 10);
        carry /= 10;
    }
    while (carry > 0) {
        res.insert(res.begin(), carry % 10);
        carry /= 10;
    }
    return res;
}

// 计算阶乘之和
vector<int> factorialSum(int n) {
    vector<int> sum(1, 0);
    vector<int> factorial(1, 1);
    for (int i = 1; i <= n; ++i) {
        factorial = multiply(factorial, i);
        sum = add(sum, factorial);
    }
    return sum;
}

// 输出高精度数
void printHighPrecision(vector<int>& num) {
    for (int digit : num) {
        cout << digit;
    }
    cout << endl;
}

int main() {
    int n;
    cout << "Enter a positive integer n: ";
    cin >> n;
    
    vector<int> result = factorialSum(n);
    
    cout << "The result is: ";
    printHighPrecision(result);
    
    return 0;
}

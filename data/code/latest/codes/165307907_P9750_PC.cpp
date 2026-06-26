#include <iostream>
#include <cmath>
#include <numeric>
#include <string>
#include <algorithm>

using namespace std;

// 函数：计算最大公约数
int gcd(int a, int b) {
    return b == 0 ? abs(a) : gcd(b, a % b);
}

// 函数：简化分数
void simplify(int &num, int &den) {
    if (den < 0) {
        num = -num;
        den = -den;
    }
    int g = gcd(abs(num), abs(den));
    num /= g;
    den /= g;
}

// 函数：将有理数输出为字符串
string rational_to_string(int p, int q) {
    simplify(p, q);
    if (q == 1) return to_string(p);
    else return to_string(p) + "/" + to_string(q);
}

int main() {
    int T, M;
    cin >> T >> M;

    while (T--) {
        int a, b, c;
        cin >> a >> b >> c;

        long long delta = 1LL * b * b - 4LL * a * c;

        if (delta < 0) {
            cout << "NO" << endl;
            continue;
        }

        int x1_num, x1_den, x2_num, x2_den;

        if (delta == 0) {
            x1_num = -b;
            x1_den = 2 * a;
            cout << rational_to_string(x1_num, x1_den) << endl;
        } else {
            long long sqrt_delta = static_cast<long long>(sqrt(delta));
            if (sqrt_delta * sqrt_delta == delta) {  // delta is a perfect square
                x1_num = -b + sqrt_delta;
                x1_den = 2 * a;
                x2_num = -b - sqrt_delta;
                x2_den = 2 * a;

                string x1_str = rational_to_string(x1_num, x1_den);
                string x2_str = rational_to_string(x2_num, x2_den);

                if (x1_num * x2_den >= x2_num * x1_den) {
                    cout << x1_str << endl;
                } else {
                    cout << x2_str << endl;
                }
            } else {
                // x1 = (-b + sqrt(delta)) / (2a)
                int q1_num = -b;
                int q1_den = 2 * a;
                simplify(q1_num, q1_den);

                int q2_num = 1;
                int q2_den = 2 * a;
                simplify(q2_num, q2_den);

                // output q1 + q2*sqrt(delta)
                string q1_str = rational_to_string(q1_num, q1_den);
                string q2_str = rational_to_string(q2_num, q2_den);
                cout << q1_str << (q1_num == 0 ? "" : "+") << (q2_str == "1" ? "" : (q2_str == "1/" ? "" : q2_str)) << "sqrt(" << delta << ")" << endl;
            }
        }
    }

    return 0;
}

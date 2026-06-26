#include <iostream>
#include <cmath>
#include <string>
#include <algorithm>
using namespace std;

// 计算最大公约数
int gcd(int a, int b) {
    return b == 0 ? abs(a) : gcd(b, a % b);
}

// 简化分数
void simplify(int &num, int &den) {
    if (den < 0) {
        num = -num;
        den = -den;
    }
    int g = gcd(abs(num), abs(den));
    num /= g;
    den /= g;
}

// 有理数转换为字符串
string rational_to_string(int num, int den) {
    simplify(num, den);
    if (den == 1) return to_string(num);
    return to_string(num) + "/" + to_string(den);
}

// 输出平方根部分
string sqrt_part_to_string(int num, int den, long long delta) {
    simplify(num, den);
    string q2_str = (num == 1) ? "" : ((num == -1) ? "-" : to_string(num));
    string den_str = (den == 1) ? "" : "/" + to_string(den);
    return q2_str + "sqrt(" + to_string(delta) + ")" + den_str;
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
        long long sqrt_delta = static_cast<long long>(sqrt(delta));

        if (sqrt_delta * sqrt_delta == delta) {
            // Delta is a perfect square
            x1_num = -b + sqrt_delta;
            x1_den = 2 * a;
            x2_num = -b - sqrt_delta;
            x2_den = 2 * a;

            simplify(x1_num, x1_den);
            simplify(x2_num, x2_den);

            if (1LL * x1_num * x2_den > 1LL * x2_num * x1_den) {
                cout << rational_to_string(x1_num, x1_den) << endl;
            } else {
                cout << rational_to_string(x2_num, x2_den) << endl;
            }
        } else {
            // Delta is not a perfect square
            int q1_num = -b;
            int q1_den = 2 * a;
            simplify(q1_num, q1_den);

            int q2_num = 1;
            int q2_den = 2 * a;
            simplify(q2_num, q2_den);

            string result;
            if (q1_num != 0) {
                result += rational_to_string(q1_num, q1_den);
                result += "+";
            }

            result += sqrt_part_to_string(q2_num, q2_den, delta);
            cout << result << endl;
        }
    }

    return 0;
}

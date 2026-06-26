#include <iostream>
#include <cmath>
#include <numeric>
#include <string>
using namespace std;

// Helper function to compute the greatest common divisor (GCD)
int gcd(int a, int b) {
    return b == 0 ? abs(a) : gcd(b, a % b);
}

// Helper function to format rational numbers
string formatRational(int p, int q) {
    if (q == 1) return to_string(p);
    int g = gcd(p, q);
    p /= g;
    q /= g;
    if (q < 0) {
        p = -p;
        q = -q;
    }
    if (q == 1) return to_string(p);
    return to_string(p) + "/" + to_string(q);
}

// Main function to solve quadratic equations and format the results
string solveQuadratic(int a, int b, int c) {
    long long delta = 1LL * b * b - 4LL * a * c;

    if (delta < 0) return "NO";

    int deltaSqrt = sqrt(delta);
    if (1LL * deltaSqrt * deltaSqrt != delta) deltaSqrt = -1;

    // Rational part of the solutions
    int p = -b, q = 2 * a;

    // Simplify the rational part
    int g = gcd(p, q);
    p /= g;
    q /= g;

    if (deltaSqrt != -1) {
        // Delta is a perfect square
        int root1 = (p + deltaSqrt) / q;
        int root2 = (p - deltaSqrt) / q;
        return formatRational(max(root1, root2), 1);
    } else {
        // Delta is not a perfect square
        int q1 = p / q;
        p = p % q;

        string result = "";
        if (q1 != 0) {
            result += formatRational(q1, 1);
            if (p != 0) result += "+";
        }

        if (p != 0) {
            if (p == q) {
                result += "sqrt(" + to_string(delta) + ")";
            } else {
                int g = gcd(p, q);
                p /= g;
                q /= g;
                if (q == 1) {
                    result += to_string(p) + "*sqrt(" + to_string(delta) + ")";
                } else {
                    result += to_string(p) + "*sqrt(" + to_string(delta) + ")/" + to_string(q);
                }
            }
        }

        return result;
    }
}

int main() {
    int T, M;
    cin >> T >> M;
    while (T--) {
        int a, b, c;
        cin >> a >> b >> c;
        cout << solveQuadratic(a, b, c) << endl;
    }
    return 0;
}

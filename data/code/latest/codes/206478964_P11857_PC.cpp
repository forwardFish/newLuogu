#include <bits/stdc++.h>
using namespace std;
int main() {
    int A, B, X, Y;
    cin >> A >> B >> X >> Y;
    int c1_w = A + X;
    int c1_h = max(B, Y);
    int ans1 = 2 * (c1_w + c1_h);
    int c2_w = max(A, X);
    int c2_h = B + Y;
    int ans2=2*(c2_w+c2_h);
    cout << min(ans1, ans2) << endl;
    
    return 0;
}
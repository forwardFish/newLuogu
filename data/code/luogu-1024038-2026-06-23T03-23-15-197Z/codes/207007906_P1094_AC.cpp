#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int w, n;
    cin >> w >> n;
    vector<int> p(n);
    for (int i = 0; i < n; ++i) {
        cin >> p[i];
    }
    sort(p.begin(), p.end());
    
    int left = 0, right = n - 1;
    int ans = 0;
    
    while (left <= right) {
        if (left == right) {
            ans++;
            break;
        }
        if (p[left] + p[right] <= w) {
            ans++;
            left++;
            right--;
        } else {
            ans++;
            right--;
        }
    }
    
    cout << ans << endl;
    return 0;
}
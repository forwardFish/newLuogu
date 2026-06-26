#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int minTimeToCollapse(vector<int>& heights) {
    int n = heights.size();
    int time = 0;
    int left = 0, right = n - 1;
    
    while (left <= right) {
        if (heights[left] <= heights[right]) {
            time += heights[left];
            for (int i = left; i <= right; ++i) {
                heights[i] -= heights[left];
                if (heights[i] == 0) left++;
            }
        } else {
            time += heights[right];
            for (int i = left; i <= right; --right) {
                heights[right] -= heights[right];
                if (heights[right] == 0) right--;
            }
        }
    }
    return time;
}

int main() {
    int T;
    cin >> T;
    
    while (T--) {
        int n;
        cin >> n;
        vector<int> heights(n);
        for (int i = 0; i < n; ++i) {
            cin >> heights[i];
        }
        cout << minTimeToCollapse(heights) << endl;
    }
    
    return 0;
}

#include <iostream>
#include <vector>
using namespace std;
int main() {
    int n, m;
    cin >> n >> m;
    vector<int> a(n);
    for (int i = 0; i < n; ++i)
	{
        cin >> a[i];
    }
    int l=0,r=0;
    int sum = 0;
    int maxBooks = 0;
    while (r<n)
	{
        if (sum + a[r] <= m)
		{
            sum+=a[r];
            r++;
            maxBooks = max(maxBooks,r-l);
        }
		else
		{
            if (l< r)
			{
                sum-=a[l];
                l++;
            }
			else
			{
                l++;
                r++;
            }
        }
    }
    cout << maxBooks << endl;
    return 0;
}

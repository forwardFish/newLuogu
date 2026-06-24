#include<bits/stdc++.h>
using namespace std;
int a[1000005], n, q, cnt=0;
bool cmp(int a, int b)
{
	return a > b;
}
int solve(int x)
{
	int ans = 0, l = 1, r = cnt;
	while(l <= r)
	{
		int mid = (l + r) / 2;
		if(a[mid] < x)r = mid - 1;
		else{
			l = mid + 1;
			ans = mid;
		}
	}	
	return ans;
}
signed main()
{
	cin>>n>>q;
	for(int i = 1;i <= n*n;i++)
	{
		cin>>a[++cnt];
	}
	sort(a + 1, a + cnt + 1, cmp);
	while(q--)
	{
		int x;
		cin >> x;
		cout << min(solve(x), n) << "\n";
	}
	return 0;
}
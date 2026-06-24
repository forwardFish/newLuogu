#include<bits/stdc++.h>
using namespace std;
int main()
{
	int n,q;
	cin>>n>>q;
	int a[n];
	for(int i=0;i<n;i++)
	{
		cin>>a[i];
	}
	const int digit[]={0, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000};
	for (int i=1;i<=q;++i) 
	{
		int x,y;
		cin>>x>>y;
		int cnt = 0;
		for (int j = 1; j <= n; ++j) {
			int var1 = a[j] % digit[x];
			if (var1 == y)
				++cnt;
		}
		cout << cnt << endl;
	}
	return 0;
} 
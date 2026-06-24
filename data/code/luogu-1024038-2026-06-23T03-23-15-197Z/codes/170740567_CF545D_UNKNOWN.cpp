#include<bits/stdc++.h>
using namespace std;
const int N=1e5+5;
int n,a[N];
int main()
{
	cin>>n;
	for(int i=1;i<=n;i++) cin>>a[i];
	sort(a+1,a+n+1);
	int ans=0;
	int tim=0;
	for(int i=1;i<=n;i++)
	{
		if(a[i]>=tim)
		{
			ans++;
			tim+=a[i];
		}
	}
	cout<<ans;
	return 0;
}
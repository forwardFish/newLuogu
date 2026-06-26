#include<bits/stdc++.h>
#define int long long
using namespace std;
const int mod=1e4+7;
const int maxn=2e6+5;
int a[maxn],q[maxn];
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int n,k,ans=0;
	cin>>n>>k;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
	}
	int l=0,r=0;
	for(int i=1;i<=n;i++)
	{
		while(l<r && q[l]+k<=i)
		{
			l++;
		}
		while(l<r && a[q[r-1]]<a[i])
		{
			r--; 
		}
		q[r]=i;
		r++;
		if(i>=k)
		{
			cout<<a[q[l]]<<endl;
		}
	}
	return 0;
}




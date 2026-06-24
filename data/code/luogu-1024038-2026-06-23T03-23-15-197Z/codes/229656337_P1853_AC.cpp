#include<bits/stdc++.h>
#define int long long 
using namespace std;
const int mod=1e6+7;
const int maxn=25;
const int maxm=1e6+5;
int a[maxn],b[maxn],dp[maxm];
signed main()
{
	int s,n,d;
	cin>>s>>n>>d;
	for(int i=1;i<=d;i++)
	{
		cin>>a[i]>>b[i];
		a[i]/=1000;
	}
	for(int i=1;i<=n;i++)
	{
		int t=s/1000;
		for(int j=1;j<=d;j++)
		{
			for(int k=a[j];k<=t;k++)
			{
				if(k>=a[j])
				{
					dp[k]=max(dp[k],dp[k-a[j]]+b[j]);
				}
			}
		}
		s+=dp[t];
		memset(dp,0,sizeof(dp));
		
	}
	cout<<s;
	return 0;
}

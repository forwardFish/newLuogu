#include<bits/stdc++.h>
#define int long long 
using namespace std;
const int maxn=1e3;
int n,m,w[maxn],v[maxn],dp[maxn],a[maxn];
signed main()
{
  	cin>>n>>m;
  	for (int i=1;i<=n;i++) cin>>w[i]>>v[i];
  	for (int i=1;i<=n;i++)
  	{
  		for (int j=m;j>=w[i];j--)
    	{
    		if (dp[j-w[i]]+v[i]>dp[j])
			{
				dp[j]=dp[j-w[i]]+v[i];
			}
			
		}
	}
	bool pd=false;
  	for(int i=1;i<=m;i++)
  	{
  		if(dp[i]>m)
  		{
  			cout<<i;
  			pd=true;
  			break;
		}
	}
	if(pd==false)
	{
		cout<<"no solution";
	}
  	return 0;
}
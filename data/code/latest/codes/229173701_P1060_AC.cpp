#include<bits/stdc++.h>
#define int long long 
using namespace std;
int dp[30005],sj[30005],val[30005];
signed main()
{
    int t,m;
    cin>>t>>m;
    for (int i=0;i<m;++i)
	{
        cin>>sj[i]>>val[i];
        val[i]*=sj[i];
    }
    for (int i=0;i<=m;++i)
	{
        for (int j=t;j>=sj[i];--j)
		{
            dp[j]=max(dp[j],dp[j-sj[i]]+val[i]);
        }
    }
    cout<<dp[t]<<endl;
    return 0;
}






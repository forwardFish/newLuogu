#include<bits/stdc++.h>
using namespace std;
const int maxn=5e3+5;
int a[maxn],dp[maxn];
int main()
{
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i]; 
	}
	int len=1;
    dp[len]=a[1];
    for(int i=2;i<=n;i++)
	{
        if(a[i]>dp[len])
		{
            dp[++len]=a[i];
        }
		else
		{
            int p=lower_bound(dp+1,dp+1+len,a[i])-dp;
            dp[p]=a[i];
        }
    }
    cout<<len<<endl;
	return 0;
}
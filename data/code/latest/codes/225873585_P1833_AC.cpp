#include<bits/stdc++.h>
using namespace std;
int c[100001],a[1000001],t[1000001],te1,te2,ts1,ts2,n,tz;//c[],t[]为题目等于,a[]表示最多看的次数,te1小时1,te2分钟1,ts1小时2,ts2分钟2,tz总时间
int dp[1001];//dp[j]表示消耗了j分钟最多可以有多少美学值
char cc;//符号':'
int main()
{
	cin>>te1>>cc>>te2>>ts1>>cc>>ts2;
	tz=60*(ts1-te1)+ts2-te2;
	cin>>n;
	for(int p=1;p<=n;p++) scanf("%d%d%d",&t[p],&c[p],&a[p]);
	for(int i=1;i<=n;i++)
	{
		if(a[i]==0)
		{
			for(int j=t[i];j<=tz;j++) dp[j]=max(dp[j],dp[j-t[i]]+c[i]);
		}
		else
		{
		    for(int l=1;l<=a[i];l++)
		    for(int j=tz;j>=l*t[i];j--) 
			{
				dp[j]=max(dp[j],dp[j-t[i]]+c[i]);
			}
		}
	}
	cout<<dp[tz];
	return 0;
}
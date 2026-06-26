#include<bits/stdc++.h>
using namespace std;
const int maxn=1e6+5;
int a[maxn];
int sum[maxn];
int dp[maxn];
int main()
{
	int n,k;
	cin>>n>>k;
	for(int i=1;i<=n;i++)
	{
		scanf("%d",&a[i]);
		sum[i]=sum[i-1]+a[i];
	}
	for(int i=1;i<=n;i++)
	{
		bool pd=1;
		memset(dp,0,sizeof(dp));
		for(int j=i;j<=n;j++)
		{
			dp[j]=max(dp[j-1]+a[j],a[j]);
			if(dp[j]>=k && j!=i)
			{
				printf("%d ",j);
				pd=0;
				break;
			}
		}
		if(pd)
		{
			printf("-1 ");
		}
	}
	return 0;

}

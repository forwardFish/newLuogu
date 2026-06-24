#include<bits/stdc++.h> 
using namespace std;
int n,sum[100010],f[200020],ans;
char s[N];
int main()
{
	cin>>n;
	scanf("%s",s+1);
	for (int i=1;i<=n;i++)
	{
		sum[i]=sum[i-1]+(s[i]=='1'?1:-1);
	}
	for (int i=1;i<=n;i++)
	{
		if (f[sum[i]+n])
		{
			ans=max(ans,i-f[sum[i]+n]+1);
		}
		if (!f[sum[i-1]+n])
		{
			f[sum[i-1]+n]=i;
		}
	}
	cout<<ans;
	return 0;
}
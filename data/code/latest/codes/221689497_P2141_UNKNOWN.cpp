#include<bits/stdc++.h>
#define int long long
#pragma GCC optimize(2)
using namespace std;
const int maxn=1e2+5;
int a[maxn];
bool pd[maxn];
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i]; 
	}
	int ans=0;
	 for(int i=1;i<=n;i++)
	 {
	 	for(int j=i+1;j<=n;j++)
	 	{
	 		for(int k=1;k<=n;k++)
	 		{
	 			if(a[i]+a[j]==a[k] && pd[k]==0)
	 			{
	 				ans++;
	 				pd[k]=1;
				 }
			 }
		 }
	 }
	 cout<<ans;
	return 0;
}





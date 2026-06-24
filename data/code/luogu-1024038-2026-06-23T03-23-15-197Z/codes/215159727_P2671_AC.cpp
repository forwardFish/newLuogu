#include<bits/stdc++.h>
#define int long long
using namespace std;
const int mod=1e4+7;
const int maxn=1e5+5;
int s1[maxn][2],s2[maxn][2],a[maxn],b[maxn];
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int n,m;
	cin>>n>>m;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
	 } 
	 for(int i=1;i<=n;i++)
	 {
	 	cin>>b[i];
	 	s1[b[i]][i%2]++;
	 	s2[b[i]][i%2]=(s2[b[i]][i%2]+a[i])%mod;
	 	
	 }
	 int ans=0;
	 for(int i=1;i<=n;i++)
	 {
	 	int aa=b[i];
	 	ans+=i*(s2[aa][i%2]+a[i]*(s1[aa][i%2]-2)%mod)%mod;
	 	ans%=mod;
	 }
	 cout<<ans; 
	return 0;
}




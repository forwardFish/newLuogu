#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=1e5+5;
const int mod=1e9+7;
int cnt_0[maxn],cnt_1[maxn],d[maxn];
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int t;
	cin>>t;
	cnt_0[1]=1;
	cnt_1[2]=1;
	for(int i=3;i<=maxn;i++)
	{
		cnt_0[i]=(cnt_0[i-1]+cnt_0[i-2])%mod;
		cnt_1[i]=(cnt_1[i-1]+cnt_1[i-2])%mod;
		d[i]=(cnt_1[i-2]*cnt_0[i-1]%mod+d[i-1]%mod+d[i-2]%mod)%mod;
	}
	while(t--)
	{
		int n;
		cin>>n;
		cout<<d[n]<<endl;;
	}
	return 0;
}




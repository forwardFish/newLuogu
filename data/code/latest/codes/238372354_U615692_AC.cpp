#include<bits/stdc++.h>

#define int long long
using namespace std;
const int maxn=1e5+5;
int l[maxn];
int r[maxn]; 
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	string s;
	cin>>s;
	int n=s.size();
	for(int i=1;i<=n;i++)
	{
		l[i]=l[i-1]+(s[i-1]=='|'?1:0);
		r[i]=r[i-1]+(s[i-1]=='*'?1:0);
	}
	int ans=0;
	int sum=r[n]; 
	for(int i=0;i<=n;i++)
	{
		if(l[i]==0 && r[i]==sum)
		{
			ans++;
		}
	}
	cout<<ans;
	return 0;
}


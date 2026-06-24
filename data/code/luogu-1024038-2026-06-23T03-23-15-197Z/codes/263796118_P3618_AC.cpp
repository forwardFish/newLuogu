#include<bits/stdc++.h>
#define int long long
#define endl "\n" 
using namespace std;
const int maxn=1e6+5;const int mod=1e9+7;
int bo[maxn*2],ans[maxn];int dp[maxn];
void a(string s)
{
	int n=s.size();
	for(int i=1;i<n;i++)
	{
		int j=bo[i-1];
		while(j>0 && s[i]!=s[j]) j=bo[j-1];
		if(s[i]==s[j]) j++;
		bo[i]=j;
	}
}
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int t;
	cin>>t;
	for(int i=1;i<=t;i++)
	{
		string s1,s2;cin>>s1>>s2;
		string s=s2+'#'+s1;
		int n1=s1.size(),n2=s2.size();
		a(s);
		for(int i=0;i<=n2+n1;i++)
		{
			dp[i]=1;
		}
		for(int i=n2+1;i<n1+n2+1;i++)
		{
			dp[i]=dp[i-1];
			if(bo[i]==n2) dp[i]=(dp[i]+dp[i-n2])%mod;
		}
//		for(int i=0;i<n1+n2+1;i++)
//		{
//			cout<<bo[i]<<" "; 
//		}
//		cout<<endl;
		cout<<"Case #"<<i<<": "<<dp[n1+n2]<<endl;
	}
	
	
	
	
	return 0;
 } 
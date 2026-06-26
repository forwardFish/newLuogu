#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;
const int maxn=1e6+5;
int bo[maxn*2];
void a(string s)
{
	int n=s.size();
	for(int i=1;i<n;i++)
	{
		int j=bo[i];
		while(j>0 && s[i]!=s[j]) j=bo[j];
		if(s[i]==s[j]) j++;
		bo[i+1]=j;
	}
}
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int n;string s;cin>>n>>s;
	a(s);
	int ans=0;
	for(int i=1;i<=n;i++)
	{
		int j=i;
		while(bo[j]) j=bo[j];
		if(bo[i]) bo[i]=j;
		ans+=i-j;
	 } 
	 cout<<ans;
	return 0;
 }

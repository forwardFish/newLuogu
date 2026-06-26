#include<bits/stdc++.h>
#define int long long
using namespace std;
int t[26];
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);cout.tie(0);
	string s;
	cin>>s;
	int n=s.size();
	s=' '+s;
	int cnt=0;
	int minn=INT_MAX;
	for(int i=1;i<=n;i++)
	{
		if(s[i]=='z') continue;
		t[s[i]-'a']++;
	}
	char c;
	for(int i=0;i<26;i++)
	{
		if(t[i]<minn)
		{
			minn=t[i];
			c=char(i+'a');
		}
	}
	int ans=0;
	bool zt=0;
	for(int i=1;i<=n;i++)
	{
		if(s[i]=='z')
		{
			if(!zt) ans++;
		}
		if(s[i]==c)
		{
			if(zt) ans++;
		}
	}
	cout<<ans;
	return 0;
}

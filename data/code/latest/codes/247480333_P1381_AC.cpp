#include<bits/stdc++.h>
//#pragma GCC optimize(2)
#define int long long
using namespace std;
const int maxn=1e5+5; 
map<string,int> t; 
map<string,bool> pd; 
string s[maxn];
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		string ss;
		cin>>ss;
		pd[ss]=1;
	}
	int m;
	cin>>m;
	int l=1,r=1;
	int ans=0;
	for(int i=1;i<=m;i++)
	{
		cin>>s[i];		
	}
	int minn=INT_MAX; 
	for(int i=1;i<=m;i++)
	{
		if(pd[s[i]])
		{
			t[s[i]]++;
		 } 
		 if(t[s[i]]==1)
		 {
		 	ans++;
			minn=i-l+1;
		 }
		while(l<=i)
		{
			if(!pd[s[l]])
			{
				l++;
				continue;
			}
			if(t[s[l]]>=2)
			{
				t[s[l]]--;
				l++;
				continue;
			}
			break;
		}
		minn=min(minn,i-l+1);
	}
	cout<<ans<<endl<<minn;
	return 0;
}


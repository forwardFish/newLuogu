#include<bits/stdc++.h>
#define int long long
using namespace std;
vector<int> t[26];
int cnt[26],w[26];
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);cout.tie(0);
	string s;
	cin>>s;
	int n=s.size();
	 for(int i=0;i<n;i++) t[s[i]-'a'].push_back(i);
	 for(int i=0;i<25;i++) cnt[i]=1;
	 int ans=0;
	 for(int i=0;i<n;i++)
	 {
	 	int c=s[i]-'a';
	 	if(cnt[c]>0)
	 	{
	 		w[c]++;
		 }
		 else
		 {
		 	ans++;
		 	int maxx=-1;
		 	int maxf=-1;
		 	for(int x=0;x<26;x++)
		 	{
		 		if(cnt[x]==0) continue;
		 		int res=t[x].size()-w[x];
		 		if(res<cnt[x])
		 		{
		 			if(maxf<n)
		 			{
		 				maxx=x;
		 				maxf=n;
					 }
				 }
				else
				{
					int f=t[x][w[x]+cnt[x]-1];
					if(f>maxf)
					{
						maxf=f;
						maxx=x;
					}
				}
			 }
			 cnt[maxx]--;
			 cnt[c]++;
			 w[c]++;
		 }
	 }
	 cout<<ans;
	return 0;
}

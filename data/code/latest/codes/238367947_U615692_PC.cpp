#include<bits/stdc++.h>

#define int long long
using namespace std;
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	string s;
	cin>>s;
	int n=s.size();
	int l=-1,r=-1;
	for(int i=n-1;i>=0;i--)
	{
		if(s[i]=='|')
		{
			if(r==-1)
			{
				r=i;
			}
			else
			{
				l=i;
			}
		}
	 } 
	 if(r!=-1)
	 {
	 	for(int i=n-1;i>=r;i--)
	 	{
	 		s[i]='|';
		 }
		 if(l!=-1)
		 {
		 	for(int i=l;i<=r;i++)
		 	{
		 		s[i]='|';
			 }
		  } 
	}
	int ans=0; 
	 for(int i=0;i<n;i++)
	 {
	 	if(s[i]=='?')
	 	{
	 		ans++;
		 }
	  } 
	  cout<<ans+1;
	return 0;
}


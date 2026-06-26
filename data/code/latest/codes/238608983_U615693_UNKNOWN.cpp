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
	set<int> s_1,s_5;
	for(int i=0;i<n;i++)
	{
		if(s[i]=='|') s_1.insert(i+1);
		else s_5.insert(i+1);
	}
	int q;
	cin>>q;
	
	while(q--)
	{
		int x;
		cin>>x;
		if(s_5.find(x)!=s_5.end()) s_5.erase(x);
		if(s_1.find(x)!=s_1.end()) s_1.erase(x);
		int l=0;
		int r=n;
		if(!s_5.empty()) l=*s_5.rbegin();
        if(!s_1.empty()) r=*s_1.begin()-1;
        int m=r-l+1;
        if(m<=0)
		{
            cout<<0<<endl;
            continue;
        }
        int ans=0;
        if(l<=r)
		{
			for(int i=l;i<=r;i++)
			{
				ans+=(i*5+(n-i));
			}
		 } 
        cout<<ans<<endl;		
	 } 
	return 0;
}


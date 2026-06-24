#include<bits/stdc++.h>
#define int long long
using namespace std;
signed main()
{
	int t;
	cin>>t;
	while(t--)
	{
		int n;
		cin>>n;
		string s;
		cin>>s;
		int l=0,r=1; 
		while(r<n && l<n)
		{
			while(s[l]!=s[r]) r++;			
			if(s[l]==s[r])
			{
				cout<<s[l];
				l=r+1,r+=2;
			}
		}
		cout<<endl;
	}
	return 0;
}


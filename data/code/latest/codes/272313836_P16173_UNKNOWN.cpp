#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int k;
	cin>>k;
	int n=(k+24)/25; 
	string ans="a";
	int c=1;int sp=n;
	int sum=k;
	for(int i=1;i<=n;i++)
	{
		for(int x=1;x<=26;x++)
		{
			int d=abs(x-c);
			if(d>sum) continue;
			int nsp=sp-1;
			int nsum=sum-d;
			if(nsp==0)
			{
				if(nsum==0)
				{
					ans.push_back(char('a'+x-1));
					c=x;
                    sp=nsp;
                    sum=nsum;
                    break;
				}
			}
			else
			{
				int maxd=max(x-1,26-x);
				int maxt=maxd+25*(nsp-1);
				if(nsum>=nsp && nsum<=maxt)
				{
					ans.push_back(char('a'+x-1));
					c=x;
					sp=nsp;
					sum=nsum;
					break;
				}
			}
		}
	}
	cout<<ans;
	return 0;
}

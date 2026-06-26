#include<bits/stdc++.h>
using namespace std;
const int mod=1e6+7;
const int maxn=1e4+5;
int d[maxn*100],cnt[maxn];
int main()
{
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		int x;
		cin>>x;
		for(int j=1;j*j<=x;j++)
		{
			
			if(x%j==0)
			{
				d[j]++;cnt[d[j]]=max(cnt[d[j]],j);
				if(j*j!=x)
				{
					int t=x/j;
					d[t]++;
					cnt[d[t]]=max(cnt[d[t]],t);
				}
			}
		}
	}	
	for(int i=1;i<=n;i++)
	{
		cout<<cnt[i]<<endl;
	}
	return 0;
}

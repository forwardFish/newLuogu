#include<bits/stdc++.h>
#define int unsigned long long 
using namespace std;
const int maxn=2e4+5;
const int P=131;
int a[maxn]; 
int h[maxn],p[maxn];
int f(int l,int r)
{
	return h[r]-h[l-1]*p[r-l+1];
}
signed main()
{
	int n,k;
	cin>>n>>k;
	p[0]=1;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
		p[i]=p[i-1]*P;
		h[i]=h[i-1]*P+a[i];
	}
	int ans=0;
	for(int i=1;i<=n;i++)
	{
		while(1)
		{
			int cnt=0;
			for(int j=i;j+ans-1<=n;j++)
			{
				if(f(j,j+ans-1)==f(i,i+ans-1))
				{
					cnt++;
				}
			}
			if(cnt>=k)
			{
				ans++;
			}
			else
			{
				break;
			}
		}
	}
	cout<<ans-1;
	return 0;
}

#include<bits/stdc++.h>
using namespace std;
int t,n,x,k,m;
const int maxn = 200005;
int tong[maxn];						
int main()
{
	cin>>t;
	while(t--)
	{
		k=m=0;
		cin>>n;
		for(int i=1;i<=n;++i)
		{
			cin>>x;
			if(!tong[x]++)
			{
				++k;
			}
		}
		for(int i=1;i<=n;++i)
		{
			m=max(m,tong[i]);	
		}
		if(m==k)
		{
			cout<<(k-1);
		}			
		else if(m>k)
		{
			cout<<k;			
		}
		else
		{
			cout<<m;			
		}
		for(int i=1;i<=n;++i)
		{
			tong[i]=0;
		}	
		cout<<endl;									
	}
	return 0;

}
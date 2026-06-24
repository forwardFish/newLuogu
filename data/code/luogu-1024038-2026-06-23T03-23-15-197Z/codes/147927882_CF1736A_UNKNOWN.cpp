#include<bits/stdc++.h>
using namespace std;
const int N=1e5+5;
long long t,n,a[N],b[N];
int main()
{
	cin>>t;
	while(t--)
	{
		long long a1=0,b1=0,c=0;
		cin>>n;
		for(long long i=1;i<=n;i++)
		{
			cin>>a[i];
			a1+=a[i];
		}
		for(long long i=1;i<=n;i++)
		{
			cin>>b[i];
			b1+=b[i];
			if(a[i]!=b[i])
			{
				c++;
			}
		}
		if(a1==b1)
		{
			if(c)
			{
				cout<<"1"<<endl;
			}
			else
			{
				cout<<"0"<<endl;
			}
			continue;
		}
		cout<<min(c,abs(a1-b1)+1)<<endl;
	}
} 
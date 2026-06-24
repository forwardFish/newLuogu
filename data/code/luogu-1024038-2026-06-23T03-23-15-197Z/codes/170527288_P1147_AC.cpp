#include<bits/stdc++.h>
#define int long long
using namespace std;
const int N=2e6+1;
int a[N];
signed main()
{
	int m;
	cin>>m;
	for(int i=1;i<=N;i++)
	{
		a[i]=a[i-1]+i;
	}
	int l=1,r=2;
	while(l<r)
	{
		if(a[r]-a[l-1]<m)
		{
			r++;
		}
		else if(a[r]-a[l-1]==m && r>l)
		{
			cout<<l<<" "<<r<<endl; 
			r++;
		}
		else if(a[r]-a[l-1]>m)
		{
			l++;
		}
	}
	return 0;
}

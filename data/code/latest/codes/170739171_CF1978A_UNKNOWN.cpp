#include<bits/stdc++.h>
using namespace std;
int t,n,a[105];
bool cmp(int b,int c)
{
	return c<b;
}
int main()
{
	cin>>t;
	while(t--)
	{
		cin>>n;
		for(int i=0;i<n;i++)
		{
			cin>>a[i];
		}
		int k=a[n-1];
		a[n-1]=0;
		sort(a,a+n,cmp);
		cout<<k+a[0]<<endl;
	}
	return 0;
}

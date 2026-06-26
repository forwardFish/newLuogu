#include<bits/stdc++.h>
using namespace std;
int a[101],b[101];
int main()
{
	int t;
	cin>>t;
	while(t--)
	{
		int n;
		cin>>n;
		int bt=0,a1=0,b1=0;
		for(int i=1;i<=n;i++)
		{
			cin>>a[i];
		}
		for(int i=1;i<=n;i++)
		{
			cin>>b[i];
		}
		for(int i=1;i<=n;i++)
		{
			if(a[i]!=b[i]) 
			{
				bt++;
			}
			if(a[i])
			{
				a1++;
			}
			if(b[i])
			{
				b1++;
			}
		}
		cout<<min(bt,abs(a1-b1)+1);
	}
	return 0;
}
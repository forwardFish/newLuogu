#include<bits/stdc++.h>
using namespace std;
int n,m,a[1000005];
int zdh()
{
	int sum=0;
	for(int i=0;i<n;i++)
	{
		if(a[i]<=0)
		{
			continue;
		}
		sum+=a[i];
	}
	return sum;
}
void qj(int k)
{
	for(int i=0;i<n;i++)
	{
		a[i]+=k;
	} 
}
int main()
{
	cin>>n>>m;
	for(int i=0;i<n;i++) cin>>a[i];
	while(m--)
	{
		int opt=0,k=0;
		cin>>opt;
		if(opt==1)
		{
			cin>>k;
			qj(k);
			continue;
		}
		else
		{
			cout<<zdh()<<endl;
			continue;
		}
	} 
	return 0;
}
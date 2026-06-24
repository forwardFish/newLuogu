#include<bits/stdc++.h>
#define ll unsigned long long
using namespace std;
ll a[501]={1};
int main()
{
	int p;
	cin>>p;
	cout<<(int)(p*log10(2))+1<<endl;
	for(int i=p;i>0;i-=60)
	{
		ll l=0;
		for(int i=0;i<500;i++)
		{
			if(p>60)
			{
				a[i]<<=60;
			}
			else
			{
				a[i]<<=p;
			}
			a[i]+=l;
			l=a[i]/10;
			a[i]%=10;
		}
	}
	a[0]-=1;
	for(int i=499;i>=0;i--)
	{
		cout<<a[i];
		if(i%50==0)
		{
			cout<<endl;
		}
	}
	return 0;
}
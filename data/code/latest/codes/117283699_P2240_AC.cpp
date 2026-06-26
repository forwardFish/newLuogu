#include<bits/stdc++.h>
using namespace std;
int n;
double t,b[105],c[105],a[105],ans;
int main()
{
	cin>>n>>t;
	for(int i=1;i<=n;i++)
	{
		cin>>c[i]>>b[i];
		a[i]=b[i]/c[i];
	}
	for(int i=1;i<=n;i++)
	{
		for(int j=1;j<n;j++) 
		{
			if(a[j]<a[j+1])
			{
				swap(a[j],a[j+1]);
				swap(b[j],b[j+1]);
				swap(c[j],c[j+1]);
			}
		}
	}
	for(int i=1;i<=n;i++)
	{
		if(t-c[i]>-0.000001)
		{
			t-=c[i];
			ans+=b[i];
		}
		else
		{
			ans+=t*a[i];
			break;
		}
 	}
 	cout<<fixed<<setprecision(2)<<ans;
 	return 0;
}
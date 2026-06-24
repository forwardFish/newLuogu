#include<bits/stdc++.h>
using namespace std;
int n,x,y;
double d(int xx,int yy)
{
	return sqrt((xx-x)*1.0*(xx-x)*1.0+(yy-y)*1.0*(yy-y)*1.0);
}
int main()
{

	cin>>n>>x>>y;
	int ans=0;
	for(int i=1;i<=n;i++)
	{
		bool t;
		int xi,yi;
		cin>>t>>xi>>yi;
		if(d(xi,yi)>128 && t)
		{
			ans++;
		}
	}
	cout<<ans;
	return 0;
}
#include<bits/stdc++.h>
using namespace std;
int main()
{
	int n,x,map=0;
	double jy=10,t;
	cin>>n;
	for(int i=0;i<n;i++)
	{
		cin>>t>>x;
		jy=min(jy-t,10.0);
		if(jy<=0) 
		{
			break;
		}
		map+=x;
	}
	cout<<floor(log(map+1)/log(2))<<" "<<map+1-pow(2,floor(log(map+1)/log(2)));
	return 0;
}
#include<bits/stdc++.h> 
using namespace std;
int main()
{
	int n;
    cin>>n;
    int a[n],c[n],pj,ans;
	for(int i=0;i<n;i++)
	{
		cin>>a[i];
	}
    for(int i=0;i<n;i++)
	{
		c[i]=c[i-1]+a[i];
	}
    pj=c[n]/n;
    for(int i=0;i<n-1;i++)
	{
		if(pj*i!=c[i])
		{
			ans++;
		}
	} 
    cout<<c[i];
    return 0;
}
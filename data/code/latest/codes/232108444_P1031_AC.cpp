#include<bits/stdc++.h> 
using namespace std;
int main()
{
	int n;
    cin>>n;
    int a[105]={0},c[105]={0},pj,ans=0;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
	}
    for(int i=1;i<=n;i++)
	{
		c[i]=c[i-1]+a[i];
	}
    pj=c[n]/n;
    for(int i=1;i<=n-1;i++)
	{
		if(pj*i!=c[i])
		{
			ans++;
		}
	} 
    cout<<ans;
    return 0;
}
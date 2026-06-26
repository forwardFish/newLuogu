#include<bits/stdc++.h>
using namespace std;
int n,ans=-INT_MAX;
struct node
{
	int x,y;
}a[105];
bool zb[10005];
int main()
{
    cin>>n;
    for (int i=0;i<n;i++)
	{
    	cin>>a[i].x>>a[i].y;
	}
	for (int i=0;i<n;i++)
	{
		int map = 0;
		for (int j = 0; j <= 1000; j++) 
		{
			zb[j] = 0;
		}
		for (int j=0;j<n;j++)
		{
			if(j==i) 
			{
				continue;
			}
			for (int z=a[j].x;z<a[j].y;z++)
			{
				zb[z]=1;
			}
		}
		for (int j=0;j<=1000;j++)
		{
			if (zb[j])
			{
				 map++;
			}
		}
		ans=max(ans,map);
	}
	cout<<ans;
    return 0;
}
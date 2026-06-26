#include <iostream>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <algorithm>
#include <cmath>

using namespace std;
const int maxn=5e4+5;
const int maxm=1e6+5;
int sum[maxm];
struct node
{
	int x,y,i;
}a[maxn];
bool cmp(node x,node y)
{
	return x.x<y.x;
}
int m[maxn],d[maxn];
int main()
{
	int n;
	cin>>n;
	int ma=-1;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i].x>>a[i].y;a[i].i=i;
		int l=a[i].x,r=a[i].y;
		sum[l]++;
		sum[r+1]--;
		ma=max(ma,r);
	}
	for(int i=2;i<=ma;i++)
	{
		sum[i]=sum[i-1]+sum[i];
	}
	int maxx=-1;
	for(int i=1;i<=maxm;i++)
	{
		maxx=max(maxx,sum[i]);
	}
	cout<<maxx<<endl;
	sort(a+1,a+n+1,cmp);
	for(int i=1;i<=n;i++)
	{
		for(int j=1;j<=maxx;j++)
		{
			if(m[j]<a[i].x)
			{
				m[j]=a[i].y;
				d[a[i].i]=j;
				break;
			}
		}
	}
	for(int i=1;i<=n;i++)
	{
		cout<<d[i]<<endl;
	}
	return 0;
 }

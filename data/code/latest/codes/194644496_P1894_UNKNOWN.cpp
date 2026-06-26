#include<bits/stdc++.h>
using namespace std;
const int maxn=5e4+5;
const int maxm=1e6+5;
int sum[maxm];
struct node
{
	int x,y;
}a[maxn];
int main()
{
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i].x>>a[i].y;
		int l=a[i].x,r=a[i].y;
		sum[l]++;
		sum[r+1]--;
	}
	for(int i=2;i<=maxm;i++)
	{
		sum[i]=sum[i-1]+sum[i];
	}
	int maxx=-1;
	for(int i=1;i<=maxm;i++)
	{
		maxx=max(maxx,sum[i]);
	}
	cout<<maxx;
	 
	return 0;
 }

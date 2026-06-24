#include <iostream>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <algorithm>
#include <cmath>
using namespace std;
const int maxn=2.5e5+5;
struct node
{
	int minn,maxx;
}a[maxn];
struct node1
{
	int s,c;
}b[maxn];
bool cmp(node x,node y)
{
	return x.minn<y.minn;
}
bool cmp1(node1 x,node1 y)
{
	return x.s<y.s;
}
int main()
{
	int c,l;
	cin>>c>>l;
	for(int i=1;i<=c;i++)
	{
		cin>>a[i].minn>>a[i].maxx;
	 } 
	 for(int i=1;i<=l;i++)
	 {
	 	cin>>b[i].s>>b[i].c;
	 }
	 sort(a+1,a+c+1,cmp);
	 sort(b+1,b+l+1,cmp1);
	 int ans=0;
	 for(int i=1;i<=c;i++)
	 {
	 	for(int j=1;j<=l;j++)
	 	{
	 		if(b[j].s>=a[i].minn && b[j].s<=a[i].maxx && b[j].c>0)
	 		{
	 			ans++;
	 			b[j].c--;
	 			break;
			 }
		 }
	 }
	 cout<<ans;
	return 0;
 }

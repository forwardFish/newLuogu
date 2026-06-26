#include<bits/stdc++.h>
using namespace std;
int x11,y11,x22,y22,n,minn=4000010;
struct node
{
  int d1,d2,i;
}d[1000010];
bool cmp(node a,node b)
{
  return a.d1<b.d1;
}
int main()
{
  cin>>x11>>y11>>x22>>y22>>n;
  int x[n+5],y[n+5];
  memset(d,0,sizeof(d));
  for(int i=1;i<=n;i++)
  {
  	cin>>x[i]>>y[i];
  	d[i].d1=pow(x[i]-x11,2)+pow(y[i]-y11,2);
  	d[i].i=i;
  }
  sort(d+1,d+n+1,cmp);
  for(int i=n;i>0;i--)
  {
  	int a;
  	a=pow(x[d[i].i]-x22,2)+pow(y[d[i].i]-y22,2);
  	d[i].d2=max(a,d[i+1].d2);
  }
  for(int i=0;i<=n;i++)
  {
  	int a;
  	a=d[i].d1+d[i+1].d2;
  	minn=min(a,minn);
  }
  cout<<minn;
  return 0;
}
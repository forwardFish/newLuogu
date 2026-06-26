#include<bits/stdc++.h>
using namespace std;
const int maxn=1e5+5;
int fa[maxn];
int siz[maxn];
int x[maxn],y[maxn],z[maxn]; 
int get(int x)
{
	if(fa[x] == x) return x;
	return fa[x]=get(fa[x]);
}
void merge(int x,int y)
{
	fa[get(x)]=get(y);
}
double d(int x1,int y1,int z1,int x2,int y2,int z2)
{
	return sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2)+(z1-z2)*(z1-z2));
}
int b1[maxn],b2[maxn];
int main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	int t;
	cin>>t;
	while(t--)
	{
		int n,h,r;
		cin>>n>>h>>r;
		int l1=0,l2=0;
		for(int i=1;i<=n;i++)
		{
			cin>>x[i]>>y[i]>>z[i];
			if(z[i]-r<=0)
			{
				b1[++l1]=i;
			}
			if(z[i]+r>=h)
			{
				b2[++l2]=i;
			}
			fa[i]=i;
		}
		for(int i=1;i<=n;i++)
		{
			for(int j=1;j<i;j++)
			{
				if(d(x[i],y[i],z[i],x[j],y[j],z[j])<=r*2)
				{
					int x=get(i),y=get(j);
					if(x!=y)
					{
						merge(x,y);
					}
				}
			}
		}
		bool pd=0;
		for(int i=1;i<=l1;i++)
		{
			for(int j=1;j<=l2;j++)
			{
				if(get(b1[i])==get(b2[j]))
				{
					pd=1;
					break;
				}
			}
			if(pd) break;
		}
		if(pd)
		{
			cout<<"Yes\n";
		}
		else
		{
			cout<<"No\n";
		}
		
	}
	return 0;
 }

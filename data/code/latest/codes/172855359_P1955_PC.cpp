#include<bits/stdc++.h>
using namespace std; 
const int maxn=1e5+5;
int fa[maxn],n;
struct node
{
	int x,y,opt;
}s[maxn];
int get(int x)
{
	if(fa[x] == x) return x;
	return fa[x]=get(fa[x]);
}
void merge(int x,int y)
{
	fa[get(x)]=get(y);
}
void init()
{
	for(int i=1;i<=n;i++) fa[i]=i;
}
bool cmp(node a,node b)
{
	return a.opt>b.opt;
}
int main()
{
	int t;
	cin>>t;
	while(t--)
	{
		cin>>n;
		for(int i=1;i<=n;i++) fa[i]=i;
		bool flag=false;
		for(int i=1;i<=n;i++)
		{
			cin>>s[i].x>>s[i].y>>s[i].opt;
			sort(s+1,s+n+1,cmp);
			if(s[i].opt==1)
			{
				merge(s[i].x,s[i].y);
			}
			else
			{
				if(get(s[i].x)==get(s[i].y))
				{
					cout<<"NO\n";
					flag=true;
					break;
				}
			}
		}
		if(flag==false)
		{
			cout<<"YES\n";
		}
	}
	return 0;
}
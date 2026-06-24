#include<bits/stdc++.h>
using namespace std; 
const int maxn=1e5+5;
int fa[maxn],n;
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
			int x,y,opt;cin>>x>>y>>opt;
			if(opt==1)
			{
				merge(x,y);
			}
			else
			{
				if(get(x)==get(y))
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
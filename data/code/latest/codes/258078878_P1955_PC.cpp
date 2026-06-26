#include<bits/stdc++.h>
using namespace std; 
const int maxn=1e5+5;
int fa[maxn],n;
int a[maxn*3];
struct node
{
	int x,y,opt;
}s[maxn];
int get(int x)
{
	if(fa[x]==x) return x;
	return fa[x]=get(fa[x]);
}
void merge(int x,int y)
{
	fa[get(x)]=get(y);
}
void init(int x)
{
	for(int i=1;i<=x;i++) fa[i]=i;
}
bool cmp(node a,node b)
{
	return a.opt>b.opt;
}
int main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	int t;
	cin>>t;
	while(t--)
	{
		memset(a,0,sizeof(a));
		memset(fa,0,sizeof(fa));
		cin>>n;
		bool pd=false;
		int l=0;
		for(int i=1;i<=n;i++)
		{
			cin>>s[i].x>>s[i].y>>s[i].opt;
			 a[++l]=s[i].x;
            a[++l]=s[i].y;
		}
		sort(a,a+l);
        int m=unique(a,a+l)-a;
        for(int i=1;i<=n;++i){
           s[i].x=lower_bound(a,a+m,s[i].x)-a;
           s[i].y=lower_bound(a,a+m,s[i].y)-a;   
        } 
        init(m);
		sort(s+1,s+n+1,cmp);
		for(int i=1;i<=n;i++)
		{
			if(s[i].opt==1)
			{
				merge(s[i].x,s[i].y);
			}
			else
			{
				if(get(s[i].x)==get(s[i].y))
				{
					cout<<"NO\n";
					pd=true;
					break;
				}
			}
		}
		if(pd==false)
		{
			cout<<"YES\n";
		}
	}
	return 0;
}
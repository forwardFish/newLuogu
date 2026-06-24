#include<bits/stdc++.h>
using namespace std;
const int maxn=1e4+10;
map<string,string> fa;
int cnt;
string get(string x)
{
	if(fa[x] == x) return x;
	return fa[x]=get(fa[x]);
}
void merge(string x,string y)
{
	string fx=get(x),fy=get(y);
//	if(siz[fy] < siz[fx]) swap(fx,fy);
	if(fx!=fy) 
	{
//		siz[fy]+=siz[fx];
		fa[fx]=fy;
	}
}
int main()
{
	int n,m,k;
	cin>>n>>m;
	for(int i=1;i<=n;i++)
	{
		string name;cin>>name;
		fa[name]=name;
	}
	for(int i=1;i<=m;i++)
	{
		string name1,name2;cin>>name1>>name2;
		merge(name1,name2);
	}
	cin>>k;
	for(int i=1;i<=k;i++)
	{
		string n1,n2;
		cin>>n1>>n2;
		if(get(n1)==get(n2))
		{
			cout<<"Yes\n";
		}
		else 
		{
			cout<<"No\n";
		}
	}
	
 } 
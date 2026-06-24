#include<bits/stdc++.h>
using namespace std;
int n,m;
struct node
{
	int u,v;
}nodes[100005];
bool vis[100005]={true};
bool b[100005]={true};
bool z=false;
int ans=0;
void t()
{
	for(int i=0;i<n;i++)
	{
		vis[i]=true;
		b[i]=true;
	}
	return;
} 
bool pd(int x)
{
	for(int i=0;i<n;i++)
	{
		if(vis[i]==true)
		{
			z=true;
		}
	}
	if(z==false)
	{
		for(int i=0;i<n;i++)
		{
			if(b[i]==true)
			{
				cout<<"Impossible";
				return true;
			}
		}
	}
	else
	{
		if(ans==0)
		{
			cout<<"Impossible";
			return true;
		}
		else
		{
			cout<<ans;
			return true;			
		}
	}
	return false;
}
void sc(int x)
{
	if(x==false) return;
	if(b[x]==true)
	{
		for(int i=0;i<m;i++)
		{
			b[x+1]=false;
			b[x-1]=false;
			ans++;
		}
	}
	if(pd(x)==false)
	{
		sc(x+1);
	}
}
int main()
{
	cin>>n>>m;
	for(int i=0;i<m;i++)
	{
		cin>>nodes[i].u>>nodes[i].v;
	}
	t();
	for(int i=0;i<n;i++) 
	{
		if(pd(i)==true)
		{
			return 0;
		}
		sc(i);
	}
	return 0;
 } 
#include<bits/stdc++.h>
using namespace std;
int n,m,sx,sy,ex,ey;
const int N=2e4+10;
char ans[N];
bool v[N];
struct node{
	int x,y,step;
};queue<node> q;
const int x[]={1,1,-1,1,0,-1,0,-1};
const int y[]={0,1,0,-1,1,1,-1,-1};
bool yj(int x,int y)
{
	if(x<1 || x>n || y<1 || y>m || ans[(x-1)*m+y]=='X')
	{
		return 0;
	}
	else return 1;
}
bool l(int stx,int sty)
{
	for(int i=0;i<8;++i){
		int xx=x[i]+stx;
		int yy=y[i]+sty;
		while(yj(xx,yy))
		{
			if(xx==ex&&yy==ey)
			{
				return 1;
			}
			xx+=x[i];
			yy+=y[i];
		}
	}
	return 0;
}
int main(){
	cin>>n>>m;
	for(int i=1;i<=n;++i)
	{
		for(int j=1;j<=m;++j)
		{
			cin>>ans[(i-1)*m+j];
		}
	}
	while(true)
	{
		cin>>ex>>ey>>sx>>sy;
		if(sx==sy && sy==ex&&ey==ex&&ex==0)
		{
			return 0;
		}
		while(q.size())q.pop();
		memset(v,0,sizeof v);
		q.push({sx,sy,0});
		v[(sx-1)*m+sy]=1;
		bool flag=1;
		while(q.size())
		{
			node now=q.front();
			q.pop();
			if(now.x==ex && now.y==ey || l(now.x,now.y))
			{
				printf("%d\n",now.step);
				flag=0;
				break;
			}
			for(int i=0;i<8;i+=2)
			{
				int xx=now.x+x[i];
				int yy=now.y+y[i];
				if(!yj(xx,yy)||v[(xx-1)*m+yy])
				{
					continue;
				}
				q.push({xx,yy,now.step+1});
				v[(xx-1)*m+yy]=1;
			}
		}
		if(flag)
		{
			cout<<"Poor Harry"<<'\n';
		}
	}
	return 0;
}
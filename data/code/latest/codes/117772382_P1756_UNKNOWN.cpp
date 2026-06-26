#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef long double ld;
const int N=2505;
const ld eps=1e-9;
int n,m,u[N],v[N],cnt;
ld r,mxx=-1e9,mix=1e9,mxy=-1e9,miy=1e9;
ld ans;
struct aa
{
	ld x,y;
	aa operator +(const aa &b)const{return aa{x+b.x,y+b.y};}
	aa operator -(const aa &b)const{return aa{x-b.x,y-b.y};}
	aa operator *(const ld &b)const{return aa{x*b,y*b};}
	ld operator ^(const aa &b)const{return x*b.y-y*b.x;}
	ld operator *(const aa &b)const{return x*b.x+y*b.y;}
	ld dis() {return sqrt(x*x+y*y);}
}dt[N];
int sgn(ld x) {return (x>eps)-(x<-eps);}
struct bb
{
	ld ps;
	int fl;
	bool operator <(const bb &b)const{return sgn(ps-b.ps)? ps<b.ps:fl>b.fl;}
}Ln[N+N];
bool in(aa s,aa t,aa x)
{
	ld lp=((x-s)^(t-s));
	if(sgn(lp)>0) swap(s,t);
	else lp=-lp;
	aa la=t-s,lb=la;
	swap(lb.x,lb.y),lb.x=-lb.x;
	if(sgn((x-s)^lb)>=0&&sgn((x-t)^lb)<=0) return lp/la.dis()<=r;
	return min((x-s).dis(),(x-t).dis())<=r;
}
int main()
{
	freopen("path10.in","r",stdin);
	freopen("path10.out","w",stdout); 
	int i,j;
	for(cin>>n,i=1;i<=n;i++)
		cin>>dt[i].x>>dt[i].y,mxx=max(mxx,dt[i].x),mix=min(mix,dt[i].x),
		mxy=max(mxy,dt[i].y),miy=min(miy,dt[i].y);
	for(cin>>m,i=1;i<=m;i++) cin>>u[i]>>v[i];
	cin>>r,mix-=r,mxx+=r,miy-=r,mxy+=r;
	ld px=(mxx-mix)/10000000.0;
	int Cl=0;
	for(ld X1=mix+px/2,X;X1<mxx;X1+=px)
	{
		cnt=0,X=X1;
		for(i=1;i<=m;i++)
			if(max(dt[u[i]].x,dt[v[i]].x)+r>X&&min(dt[u[i]].x,dt[v[i]].x)-r<X)
			{
				if(fabs(dt[u[i]].x-X)>fabs(dt[v[i]].x-X)) swap(u[i],v[i]);
				if(fabs(dt[u[i]].x-X)<r)
				{
					ld st=dt[u[i]].y,pl=0,pr=mxy-st,mid;
					while(pr-pl>eps)
					{
						mid=(pl+pr)/2;
						if(in(dt[u[i]],dt[v[i]],aa{X,st+mid})) pl=mid;
						else pr=mid;
					}
					Ln[++cnt]=bb{st+(pl+pr)/2,-1},pl=0,pr=st-miy;
					while(pr-pl>eps)
					{
						mid=(pl+pr)/2;
						if(in(dt[u[i]],dt[v[i]],aa{X,st-mid})) pl=mid;
						else pr=mid;
					}
					Ln[++cnt]=bb{st-(pl+pr)/2,1};
				}
				else
				{
					if(dt[u[i]].x>dt[v[i]].x) swap(u[i],v[i]);
					aa lp=dt[v[i]]-dt[u[i]];
					ld la=dt[u[i]].y+lp.y*(X-dt[u[i]].x)/(dt[v[i]].x-dt[u[i]].x),lb=r*lp.dis()/(dt[v[i]].x-dt[u[i]].x);
					Ln[++cnt]=bb{la-lb,1},Ln[++cnt]=bb{la+lb,-1};
				}
			}
		sort(Ln+1,Ln+cnt+1);
		for(i=1,j=0;i<=cnt;i++)
			ans+=(!!j)*(Ln[i].ps-Ln[i-1].ps)*px,j+=Ln[i].fl;
	}
	printf("%.9Lf",ans);
	return 0;
}
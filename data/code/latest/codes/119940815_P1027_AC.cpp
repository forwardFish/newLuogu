#include<cstdio>
#include<cstring>
#include<algorithm>
#include<iostream>
#include<vector>
#include<queue>
#include<cmath>
  
#define rep(i,n) for(int i=0;i<n;i++)
#define clr(x,c) memset(x,c,sizeof(x))
#define Rep(i,l,r) for(int i=l;i<r;i++)
  
using namespace std;
  
const double inf=0x7fffffff;
const int maxn=102;
  
int cost[maxn];
  
struct P {
	int x,y;
	P(int _x,int _y):x(_x),y(_y) {}
	P operator - (P o) { return P(x-o.x,y-o.y); }
};
  
vector<P> p[4];
  
inline double DIST(P o) { return sqrt(o.x*o.x+o.y*o.y); }
  
struct D {
	
	struct Edge {
		int from,to;
		double dist;
		Edge(int f,int t,double d):from(f),to(t),dist(d) {}
	};
	
	struct node {
		int u;
		double d;
		node(int _u,double _d):u(_u),d(_d) {}
		bool operator < (const node &o) const {
			d>o.d;
		}
	};
	
	int n;
	double d[maxn*4];
	vector<int> g[maxn*4];
	vector<Edge> edges;
	
	void init(int _n) {
		n=_n;
		rep(i,n) g[i].clear();
		edges.clear();
	}
	
	void addEdge(int u,int v,double d) {
		edges.push_back( (Edge) {u,v,d} );
		edges.push_back( (Edge) {v,u,d} );
		int m=edges.size();
		g[u].push_back(m-2);
		g[v].push_back(m-1);
	}
	
	void Dijkstra(int s,int t,double &ans) {
		priority_queue<node> q;
		rep(i,n) d[i]=inf;
		d[s]=0;
		q.push( (node) {s,0} );
		while(!q.empty()) {
			node x=q.top(); q.pop();
			rep(i,g[x.u].size()) {
				Edge &e=edges[g[x.u][i]];
				if(e.dist+d[x.u]<d[e.to]) {
					d[e.to]=e.dist+d[x.u];
					q.push( (node) {e.to,d[e.to]} );
				}
			}
		}
		ans=min(min(d[t],d[t+n/4*3]),min(min(d[t+n/4],d[t+n/4*2]),ans));
	}
	
};
  
D dijkstra;
  
inline int dis(P o) { return o.x*o.x+o.y*o.y; }
  
int main()
{
	int n;
	scanf("%d",&n);
	while(n--) {
		int s,t,a,b,x[4],y[4],cost;
		scanf("%d%d%d%d",&s,&t,&a,&b);
		dijkstra.init(s*4);
		--a; --b;
		rep(i,s) {
			rep(j,3) scanf("%d%d",&x[j],&y[j]);
			scanf("%d",&cost);
			rep(j,3) p[j].push_back( (P) {x[j],y[j]} );
			int a=dis(p[0][i]-p[1][i]),b=dis(p[0][i]-p[2][i]),c=dis(p[1][i]-p[2][i]);
			if(a==b+c) { x[3]=p[1][i].x+p[0][i].x-p[2][i].x; y[3]=p[1][i].y+p[0][i].y-p[2][i].y; }
			if(b==a+c) { x[3]=p[0][i].x+p[2][i].x-p[1][i].x; y[3]=p[0][i].y+p[2][i].y-p[1][i].y; }
			if(c==a+b) { x[3]=p[1][i].x+p[2][i].x-p[0][i].x; y[3]=p[1][i].y+p[2][i].y-p[0][i].y; }
			p[3].push_back( (P) {x[3],y[3]} );
			rep(j,4) Rep(k,j+1,4) 
			    dijkstra.addEdge(i+j*s,i+k*s,DIST(p[j][i]-p[k][i])*cost);
		}
		rep(i,s) rep(k,4)
		    Rep(j,i+1,s) rep(l,4)
		    	dijkstra.addEdge(i+k*s,j+l*s,DIST(p[k][i]-p[l][j])*t);
		double ans=inf;
		rep(i,4) dijkstra.Dijkstra(a+i*s,b,ans);
		printf("%.1lf\n",ans);
	}
	return 0;
}
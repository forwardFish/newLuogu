#include<bits/stdc++.h>
typedef std::pair<int, int> pr;
const int N=1054,M=5400,INF=0x7f7f7f7f;
namespace CF{
	#define ad(x) ((x - 1 ^ 1) + 1)
	struct edge {
		int u,v,c,f;
		edge(int u0=0,int v0=0,int c0=0,int f0=0):u(u0),v(v0),c(c0),f(f0){}
	}e[M];
	int V,E,si=1,ti=2,flow,cost;
	int first[N],next[M];
	int dep[N],cur[N],que[2003731];
	char in_que[N],used[N];
	inline void addedge(int u,int v,int c,int f){
		e[++E]=edge(u,v,c,f);next[E]=first[u];first[u]=E;
		e[++E]=edge(v,u,-c);next[E]=first[v];first[v]=E;
	}
	bool bfs(){
		int h=1000000,t=h+1,i,x,y;
		memset(dep,127,(V + 1)<<2);
		que[h]=ti;dep[ti]=0;in_que[ti]=1;
		for (;h<t;) {
			x=que[h++];in_que[x]=0;
			for (i=first[x];i;i=next[i])
				if (dep[y=e[i].v]>dep[x]-e[i].c&&e[ad(i)].f)
					if (dep[y]=dep[x]-e[i].c,!in_que[y])
						in_que[y]=1,(dep[y]>=dep[que[h]]?que[t++]:que[--h])=y;
		}
		return dep[si]<INF;
	}
	int dfs(int x,int lim) {
		int a,c,f=0;
		if (x==ti||!lim) return lim;
		used[x]=1;
		for (int &i=cur[x];i;i=next[i])
			if (dep[e[i].v]==dep[x]-e[i].c&&e[i].f&&!used[e[i].v]) {
				a=std::min(lim-f,e[i].f);
				c=dfs(e[i].v,a);
				e[i].f-=c;e[ad(i)].f+=c;
				if((f+=c)==lim) return f;
			}
		return f;
	}
	void Dinic() {
		int f;
		for(cost=flow=0;bfs();){
			memcpy(cur,first,(V+1)<<2);
			memset(used,0,V+1);
			flow+=f=dfs(si, INF);
			cost+=dep[si]*f;
		}
	}
}
namespace DC {
	int F[N];pr D[N];
	int Discretize(int n) {
		int i,cnt = 0;
		std::sort(D,D+n);
		for(i=0;i<n;++i)
			F[D[i].second]=(i&&D[i].first==D[i-1].first?cnt-1:(D[cnt]=D[i],cnt++));
		return cnt;
	}
}
int n,A,B,T;
int c[N],w[N],x[N],y[N];
int cnt[N];
void work(){
	int i,u,v,initial=0;double ratio;
	scanf("%d%d%d%lf",&n,&A,&B,&ratio);
	for (i=0;i<n;++i) {
		scanf("%d%d%d",c+i,&u,&v),initial+=c[i],w[i]=(int)floor(c[i]*ratio+1e-7);
		DC::D[i*2]=pr(u,i*2),DC::D[i*2+1]=pr(v,i*2+1);
	}
	T=DC::Discretize(n*2);
	memset(cnt,0,T<<2);
	for (i=0;i<n;++i)++cnt[x[i]=DC::F[i*2]],--cnt[y[i]=DC::F[i*2+1]];
	for (i=0;i<T;++i)if((cnt[i]+=i?cnt[i-1]:0)>A+B){puts("impossible");return;}
	CF::V=2+T+n,CF::E=0;
	memset(CF::first, 0,(CF::V+1)<<2);
	for (i=1;i<T;++i)CF::addedge(2+i,3+i,0,A);
	CF::addedge(1,3,0,A),CF::addedge(2+T,2,0,A);
	for (i=0;i<n;++i) {
		CF::addedge(3+x[i],3+T+i,0,1);
		if (c[i]>w[i])CF::addedge(3+T+i,4+x[i],w[i]-c[i],1);
		CF::addedge(3+T+i,3+y[i],-c[i],1);
	}
	CF::Dinic(),printf("%d\n",initial+CF::cost);
}

int main() {
	int T;
	for(scanf("%d",&T);T;--T)work();
}
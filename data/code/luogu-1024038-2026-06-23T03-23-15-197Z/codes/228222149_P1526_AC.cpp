#include <bits/stdc++.h>
using namespace std;

//Start
typedef long long ll;
typedef double db;
#define mp(a,b) make_pair((a),(b))
#define x first
#define y second
#define be(a) (a).begin()
#define en(a) (a).end()
#define sz(a) int((a).size())
#define pb(a) push_back(a)
#define R(i,a,b) for(int i=(a),I=(b);i<I;i++)
#define L(i,a,b) for(int i=(b)-1,I=(a)-1;i>I;i--)
const int iinf=0x3f3f3f3f;
const ll linf=0x3f3f3f3f3f3f3f3f;

/*
注意： i 是箭塔，j 是靶子，s 是区间
*/

//Data
const int N=1e2;
int m,n,k;
pair<int,int> a[N],b[N];
bitset<N> con[N];
#define f(x) ((x)*(x))

//Dfs
bitset<N> e[N],vis;
int nex[N][N+1],mn[N+1],mat[N],ans;
bool match(int s){ // 匈牙利匹配
	R(i,0,n)if(e[s][i]&&!vis[i]){
		vis[i]=true;
		if(!~mat[i]||match(mat[i]))	
			return mat[i]=s,true;
	}
	return false;
}
void dfs(int j,int s){
	if(ans<=s+mn[j]) return; //A*
	if(j==m) return void(ans=s);
	int cmat[N]; copy(mat,mat+n,cmat); // 这里的 cmat 你要是设为全局变量就死了，我在这里死了 2 个小时
	L(J,j+1,m+1){
		R(i,0,n) con[i][j]&&nex[i][j]>=J&&(e[s][i]=true);
		R(i,0,n) vis[i]=false; match(s)?dfs(J,s+1):void();
		R(i,0,n) con[i][j]&&nex[i][j]>=J&&(e[s][i]=false); //莫忘回溯
		copy(cmat,cmat+n,mat);
	}
}

//Main
int main(){
	ios::sync_with_stdio(0);
	cin.tie(0),cout.tie(0);
	cin>>m>>n>>k;
	R(j,0,m) cin>>a[j].x>>a[j].y;
	R(i,0,n) cin>>b[i].x>>b[i].y;
	R(i,0,n)R(j,0,m) con[i][j]=(f(a[j].x-b[i].x)+f(a[j].y-b[i].y)<=f(k));
	R(i,0,n) fill(nex[i],nex[i]+m+1,-1);
	R(i,0,n)L(j,0,m) con[i][j]&&(nex[i][j]=max(j+1,nex[i][j+1]));
	R(j,0,m) mn[j]=iinf;
	L(j,0,m)R(i,0,n) con[i][j]&&(mn[j]=min(mn[j],mn[nex[i][j]]+1));
	fill(mat,mat+n,-1),ans=min(n,m),dfs(0,0);
	// 夹杂点骚操作（正确性不保证，仅用来抢最优解：猜测最终 ans<=mn[0]+5），把 ans 的初始值和 mn[0]+5 取 min
	cout<<ans<<'\n';
	return 0;
}

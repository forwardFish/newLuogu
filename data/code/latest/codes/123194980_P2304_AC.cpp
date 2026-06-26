/*program by mangoyang*/
#include <bits/stdc++.h>
#define inf (0x7f7f7f7f)
#define Max(a, b) ((a) > (b) ? (a) : (b))
#define Min(a, b) ((a) < (b) ? (a) : (b))
typedef long long ll;
using namespace std;
template <class T>
inline void read(T &x){
	int ch = 0, f = 0; x = 0;
	for(; !isdigit(ch); ch = getchar()) if(ch == '-') f = 1;
	for(; isdigit(ch); ch = getchar()) x = x * 10 + ch - 48;
	if(f) x = -x;
}
#define fi first
#define se second
const int N = 1000005, M = 2000005;
vector<int> ed[N], fx[N];
vector<pair<int, int> > v1[N], v2[N], v3[N], v4[N];
int s[N], ax[N], ay[N], fuck[N], n, len;
inline int D(int x){ return lower_bound(s + 1, s + len + 1, x) - s; }
namespace flow{
	queue<int> q;
	int a[M], cap[M], nxt[M], head[N], cur[N], dis[N], S, T, cnt = 1;
	inline void addedge(int x, int y, int z){
		a[++cnt] = y, cap[cnt] = z, nxt[cnt] = head[x], head[x] = cnt;
		a[++cnt] = x, cap[cnt] = 0, nxt[cnt] = head[y], head[y] = cnt;
	}
	inline int bfs(){
		memset(dis, -1, sizeof(dis)), dis[S] = 0, q.push(S);
		for(; !q.empty(); q.pop()){
			int u = q.front();
			for(int p = head[u]; p; p = nxt[p]){
				int v = a[p];
				if(~dis[v] || !cap[p]) continue;
				dis[v] = dis[u] + 1, q.push(v);
			}
		}
		return ~dis[T];
	}
	inline int dfs(int u, int flow){
		if(u == T || !flow) return flow;
		int used = 0;
		for(int &p = cur[u]; p; p = nxt[p]){
			int v = a[p];
			if(dis[v] != dis[u] + 1 || !cap[p]) continue;
			int x = dfs(v, min(flow, cap[p]));
			used += x, flow -= x, cap[p] -= x, cap[p^1] += x;
			if(!flow) break;
		}	
		return used;
	}
	inline void setflow(int x, int y){ S = x, T = y; }
	inline int getflow(){
		int res = 0;
		for(; bfs(); res += dfs(S, inf)) 
			for(int i = 1; i <= n + 4; i++) cur[i] = head[i];
		return res;
	}
}
namespace task2{
	int NS, NT, S, T;
	inline void init(){ 
		NS = n + 1, NT = n + 2, S = n + 3, T = n + 4; 
	}
	inline void add(int x, int y, int a, int b){
		flow::addedge(NS, y, a);
		flow::addedge(x, NT, a);
		flow::addedge(x, y, b - a);
	}
	inline void solve(){
		for(int i = 1; i <= n; i++){
			add(S, i, 0, inf);
			add(i, T, 0, inf);
		}
		flow::setflow(NS, NT);
		flow::getflow();
		flow::addedge(T, S, inf);
		cout << flow::getflow() << endl;
	}
	
}	
namespace task1{
	int f[N], ff[N], st[N], g[N], id[N], gg[N], pr[N], spec[N], ans, top;
	inline void chkmax(int &x, int y){ if(y > x) x = y; }
	inline bool cmp(int x, int y){ 
		return ay[x] == ay[y] ? ax[x] > ax[y] : ay[x] < ay[y]; 
	}
	inline void trans(int x){
		for(int i = 0; i < (int) ed[x].size(); i++)
			if(!spec[ed[x][i]] && f[x] + 1 > f[ed[x][i]])
				f[ed[x][i]] = f[x] + 1, pr[ed[x][i]] = x;
	}
	inline void trans2(int x){
		for(int i = 0; i < (int) fx[x].size(); i++)
			if(!spec[fx[x][i]]) chkmax(ff[fx[x][i]], ff[x] + 1);
	}
	inline void solve(){
		for(int i = 1; i <= n; i++) id[i] = i;
		for(int i = 1; i <= n; i++) f[i] = g[i] = -inf, ff[i] = 1;
		f[n] = ff[n] = 0;
		sort(id + 1, id + n + 1, cmp);
		for(int i = 1, last; i <= n; i = last + 1){
			last = i;
			while(last < n && ay[id[last+1]] == ay[id[i]]) last++;
			for(int j = i; j <= last; j++) spec[id[j]] = 1;
			int Left = -inf, Right = -inf, posL = 0, posR = 0;
			for(int j = i; j <= last; j++){
				if(Left != -inf) g[id[j]] = Left + j - i, gg[id[j]] = posL;
				if(f[id[j]] > Left) Left = f[id[j]], posL = id[j];
			}
			for(int j = last; j >= i; j--){
				if(Right != -inf && Right + last - j > g[id[j]]) 
					g[id[j]] = Right + last - j, gg[id[j]] = posR;
				if(f[id[j]] > Right) Right = f[id[j]], posR = id[j];
			}
			for(int j = i; j <= last; j++){
				if(g[id[j]] > f[id[j]]) f[id[j]] = g[id[j]], fuck[id[j]] = 1;				
				if(f[id[j]] != -inf) trans(id[j]);
			}
			for(int j = i; j <= last; j++) spec[id[j]] = 0;
		}
		for(int i = 1; i <= n; i++) ans = max(ans, f[i]);
		int pos = n;
		for(int i = 1; i <= n; i++) if(f[i] == ans) pos = i;
		while(pos != n){
			if(fuck[pos]){
				int l = lower_bound(v1[D(ay[pos])].begin(), v1[D(ay[pos])].end(), make_pair(ax[pos], pos)) - v1[D(ay[pos])].begin();
				int r = lower_bound(v1[D(ay[pos])].begin(), v1[D(ay[pos])].end(), make_pair(ax[gg[pos]], gg[pos])) - v1[D(ay[pos])].begin();
				if(l < r){
					for(int i = l; i < r; i++) st[++top] = v1[D(ay[pos])][i].se;
					for(int i = (int) v1[D(ay[pos])].size() - 1; i > r; i--) st[++top] = v1[D(ay[pos])][i].se;
				}
				else{
					for(int i = l; i > r; i--) st[++top] = v1[D(ay[pos])][i].se;
					for(int i = 0; i < r; i++) st[++top] = v1[D(ay[pos])][i].se;
				}
				pos = gg[pos], fuck[pos] = 0;
			}
			else st[++top] = pos, pos = pr[pos];
		}
		printf("%d\n", ans);
		for(int i = top; i >= 1; i--) printf("%d ", st[i]);
		puts("");
		reverse(id + 1, id + n + 1);
		for(int i = 1; i <= n; i++) g[i] = -inf;
		for(int i = 1, last; i <= n; i = last + 1){
			last = i;
			while(last < n && ay[id[last+1]] == ay[id[i]]) last++;
			for(int j = i; j <= last; j++) spec[id[j]] = 1;
			int Left = -inf, Right = -inf;
			for(int j = i; j <= last; j++){
				g[id[j]] = Left + last;
				chkmax(Left, ff[id[j]] - j);
			}
			for(int j = last; j >= i; j--){
				g[id[j]] = Max(g[id[j]], Right - i);
				chkmax(Right, ff[id[j]] + j);
			}
			for(int j = i; j <= last; j++){
				ff[id[j]] = Max(ff[id[j]], g[id[j]]);
				if(ff[id[j]] != -inf) trans2(id[j]);
			}
			for(int j = i; j <= last; j++) spec[id[j]] = 0;
		}
		for(int i = 1; i <= n; i++)
			for(int j = 0; j < (int) ed[i].size(); j++){
				int v = ed[i][j];
				if(ay[v] == ay[i] || v == n) continue;
				if(f[i] + ff[v] == ans)
					task2::add(i, v, 1, inf);
			}

	}
}
inline void linkpre(vector<pair<int, int> > &A, pair<int, int> x){
	vector<pair<int, int> >::iterator it;
	it = lower_bound(A.begin(), A.end(), x);
	if(it != A.begin()) --it, ed[x.se].push_back(it->se);
}
inline void linknxt(vector<pair<int, int> > &A, pair<int, int> x){
	vector<pair<int, int> >::iterator it;
	it = upper_bound(A.begin(), A.end(), x);
	if(it != A.end()) ed[x.se].push_back(it->se);
}
int main(){
	read(n), s[++len] = 0, ++n; 
	for(int i = 1; i < n; i++){
		read(ax[i]), read(ay[i]);
		s[++len] = ax[i], s[++len] = ay[i];
		s[++len] = ax[i] + ay[i], s[++len] = ax[i] - ay[i];
	}
	sort(s + 1, s + len + 1);
	len = unique(s + 1, s + len + 1) - s - 1;
	for(int i = 1; i <= n; i++){
		v1[D(ay[i])].push_back(make_pair(ax[i], i));
		v2[D(ax[i])].push_back(make_pair(ay[i], i));
		v3[D(ax[i]-ay[i])].push_back(make_pair(ay[i], i));
		v4[D(ax[i]+ay[i])].push_back(make_pair(ay[i], i));
	}
	for(int i = 1; i <= len; i++){
		sort(v1[i].begin(), v1[i].end());
		sort(v2[i].begin(), v2[i].end());
		sort(v3[i].begin(), v3[i].end());
		sort(v4[i].begin(), v4[i].end());
	}
	for(int i = 1; i <= n; i++){
		linkpre(v1[D(ay[i])], make_pair(ax[i], i));
		linknxt(v1[D(ay[i])], make_pair(ax[i], i));
		linknxt(v2[D(ax[i])], make_pair(ay[i], i));
		linknxt(v3[D(ax[i]-ay[i])], make_pair(ay[i], i));
		linknxt(v4[D(ax[i]+ay[i])], make_pair(ay[i], i));
	}
	for(int i = 1; i <= n; i++)
		for(int j = 0; j < (int) ed[i].size(); j++)
			fx[ed[i][j]].push_back(i);
	task2::init();
	task1::solve();
	task2::solve();
	return 0;
}

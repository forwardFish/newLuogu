#include <bits/stdc++.h>

using namespace std;

#define int long long

#define fir first
#define sec second
#define lep( i, l, r ) for ( int i = ( l ); i <= ( r ); i ++ )
#define rep( i, r, l ) for ( int i = ( r ); i >= ( l ); i -- )
#define gep( i, x ) for ( int i = head[( x )]; i; i = edges[i].next)

char _c; bool _f; template < class T > inline void read ( T &x ) {
	_f = 0, x = 0;
	while ( _c = getchar (), !isdigit (_c) ){
		if ( _c == '-' ) { _f = 1; }
	}
	while ( isdigit (_c) ){
		x = x * 10 + _c - '0', _c = getchar ();
		if (_f) { x = -x; }
	}
}

const int N = 2e6 + 5;
const int INF = 1 << 30;

int n, W, s, t, m;
int a[N], b[N];

int dep[N], st[N];
bool vis[N];

int head[N], tot = 1;

struct Graph { int to, flow, cost, next; } edges[N << 1];
void add ( int u, int v, int flow, int cost ) {
	tot ++;
	edges[tot].to = v;
	edges[tot].flow = flow;
	edges[tot].cost = cost;
	edges[tot].next = head[u];
	head[u] = tot;
}

bool spfa () {
	queue < int > q;
	memset ( dep, 0x3f, sizeof ( dep ) );
	memset ( vis, 0, sizeof ( vis ) );
	dep[s] = 0;
	q.push ( s );
	vis[s] = true;
	while ( !q.empty () ) {
		int x = q.front ();
		q.pop ();
		vis[x] = false;
		gep ( i, x ) {
			if ( dep[x] + edges[i].cost < dep[edges[i].to] && edges[i].flow ) {
				dep[edges[i].to] = dep[x] + edges[i].cost;
				if ( !vis[edges[i].to] ) {
					q.push ( edges[i].to );
					vis[edges[i].to] = true;
				}
			}
		}
	}
	return dep[t] != 0x3f3f3f3f3f3f3f3f;
}

int cost, maxflow;

int dfs ( int x, int flow ) {
	if ( x == t ) {
		vis[t] = true;
		maxflow += flow;
		return flow;
	}
	int tmp = 0, sum = 0;
	vis[x] = true;
	for ( int i = st[x]; i; i = edges[i].next ) {
		st[x] = i;
		if ( ( !vis[edges[i].to] || edges[i].to == t ) && edges[i].flow && dep[edges[i].to] == dep[x] + edges[i].cost ) {
			if ( tmp = dfs ( edges[i].to, min ( flow - sum, edges[i].flow ) ) ) {
				edges[i].flow -= tmp;
				edges[i ^ 1].flow += tmp;
				cost += edges[i].cost * tmp;
				sum += tmp;
			}
			if ( flow == sum ) {
				break;
			}
		}
	}
	if ( !sum ) {
		dep[x] = 0;
	}
	return sum;
}

inline int dinic () {
	while ( spfa () ) {
		memcpy ( st, head, sizeof ( head ) );
	  vis[t] = true;
	  while ( vis[t] ) {
	  	memset ( vis, 0, sizeof ( vis ) );
	    dfs ( s, INF );
		}
	}
}

void build ( int l, int r ) {
	if ( l == r ) { return ; }
	int mid = l + r >> 1;
	build ( l, mid ), build ( mid + 1, r );
	int len = 0;
	lep ( i, l, r ) {	b[++ len] = a[i]; }
	sort ( b + 1, b + 1 + len );
	len = unique ( b + 1, b + 1 + len ) - b - 1;
	lep ( i, 1, len - 1 ) {
		add ( m + i, m + i + 1, INF, b[i + 1] - b[i] ), add ( m + i + 1, m + i, 0, b[i] - b[i + 1] );
		add ( m + i + 1, m + i, INF, b[i + 1] - b[i] ), add ( m + i, m + i + 1, 0, b[i] - b[i + 1] );
	}
	lep ( i, l, r ) {
		int tmp = lower_bound ( b + 1, b + 1 + len, a[i] ) - b;
		if ( i <= mid ) { add ( m + tmp, n + i, 1, 0), add ( n + i, m + tmp, 0, 0 ); }
		else { add ( i, m + tmp, 1, 0), add ( m + tmp, i, 0, 0 ); }
	}
	m += len;
}

signed main () {
	read ( n ), read ( W );
	s = n * 2 + 1, t = n * 2 + 2;
	m = n * 2 + 2;
	lep ( i, 1, n ) {
		read ( a[i] );
		add ( s, i, 1, 0 ), add ( i, s, 0, 0 );
		add ( i, t, 1, W ), add ( t, i, 0, -W );
		add ( n + i, t, 1, 0 ), add ( t, n + i, 0, 0 );
	}
	build ( 1, n );
	dinic ();
	cout << cost;
	return 0;
}

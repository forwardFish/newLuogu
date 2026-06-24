#include <bits/stdc++.h>
using namespace std;
const int N=1e5+10;
int h[N],e[N*2],ne[N*2],idx;
int n,m,q;
int dist[N][2];
bool st[N][2];
void add(int a, int b)
{
	e[idx]=b,ne[idx]=h[a],h[a]=idx++;
}
void bfs()
{
	for (int i=1;i<=n;i++) dist[i][0]=dist[i][1]=2e9;
	dist[1][0]=0;
	queue<int> q;
	q.push(1);
	while (!q.empty())
	{
		int fr=q.front();q.pop();
		for (int i=h[fr];i!=-1;i=ne[i])
		{
			int j=e[i];
			if (dist[j][1]>dist[fr][0]+1)
			{
				dist[j][1]=dist[fr][0]+1;
				if (!st[j][1])
				{
					st[j][1]=true;
					q.push(j);
				}
			}
			if (dist[j][0]>dist[fr][1]+1)
			{
				dist[j][0]=dist[fr][1]+1;
				if (!st[j][0])
				{
					st[j][0]=true;
					q.push(j);
				}
			}
		}
	}
}
int main()
{
	scanf("%d%d%d", &n, &m, &q);
	memset(h,-1,sizeof h);
	while (m--)
	{
		int a, b;
		scanf("%d%d", &a, &b);

		add(a, b); add(b, a);
	}
	bfs();
	if (h[1]==-1) dist[1][0]=2e9;
	while (q--)
	{
		int a, L;
		scanf("%d%d",&a,&L);
		if (L>=dist[a][L%2]) printf("Yes\n");
		else printf("No\n");
	}
	return 0;
}
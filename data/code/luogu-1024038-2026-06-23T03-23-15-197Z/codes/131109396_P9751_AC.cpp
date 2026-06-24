#include <bits/stdc++.h>
using namespace std;
typedef pair<int, int> PII;
const int N=2e6+10; 
int n,m,k,h[N],w[N],e[N],ne[N],idx,dist[N];
bool st[N];
void add(int a, int b, int c)
{
    e[idx]=b,w[idx]=c,ne[idx]=h[a],h[a]=idx++;
}
int get(int x,int y) {
    return(x*n+y);
}
int dijkstra()
{
    memset(dist,0x3f,sizeof dist);
    dist[1]=0;
    priority_queue<PII, vector<PII>, greater<PII>> heap;
    heap.push({0, 1});
    while (heap.size())
	{
        auto t=heap.top();
        heap.pop();
        int ver=t.second,distance=t.first;
        if (st[ver]) continue;
        st[ver]=true;
        for (int i=h[ver];i!=-1;i=ne[i])
		{
            int j=e[i];
            int t=dist[ver]+1;
            if (dist[ver]<w[i]) {
                t+=((w[i]-dist[ver]+k-1)/k)*k;
            }
            if (dist[j]>t) {
                dist[j]=t;
                heap.push({dist[j],j});
            }
        }
    }
    if (dist[n]==0x3f3f3f3f) {
        return -1;
    }
    return dist[n];
}
int main()
{
    idx=0;
    memset(h,-1,sizeof h);
    cin>>n>>m>>k;
    for (int i=1;i<=m;i++) {
        int x,y,z;
        cin>>x>>y>>z;
        for(int j=0;j<k;j++)
		{
            add(get(j,x),get((j+1)%k,y),z);
        }
    }
    cout<<dijkstra();
    return 0;
}
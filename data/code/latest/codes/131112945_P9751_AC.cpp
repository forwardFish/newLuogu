#include <bits/stdc++.h>
using namespace std;
typedef pair<int, int> s;
const int N=2e6+10; 
int n,m,k,h[N],w[N],e[N],v[N],z,f[N];
bool st[N];
void add(int a,int b,int c)
{
    e[z]=b;w[z]=c;v[z]=h[a];h[a]=z++;
}
int get(int x,int y) {
    return(x*n+y);
}
int dijkstra()
{
    memset(f,0x3f,sizeof f);
    f[1]=0;
    priority_queue<s, vector<s>, greater<s>> heap;
    heap.push({0, 1});
    while (heap.size())
	{
        auto t=heap.top();
        heap.pop();
        int ver=t.second,distance=t.first;
        if (st[ver]) continue;
        st[ver]=true;
        for (int i=h[ver];i!=-1;i=v[i])
		{
            int j=e[i];
            int t=f[ver]+1;
            if (f[ver]<w[i]) {
                t+=((w[i]-f[ver]+k-1)/k)*k;
            }
            if (f[j]>t) {
                f[j]=t;
                heap.push({f[j],j});
            }
        }
    }
    if (f[n]==0x3f3f3f3f)
	{
        return -1;
    }
    return f[n];
}
int main()
{
    z=0;
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
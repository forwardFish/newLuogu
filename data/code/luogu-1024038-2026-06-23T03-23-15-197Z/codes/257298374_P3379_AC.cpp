#include<bits/stdc++.h>
using namespace std;

const int MN=5e5+10;
int fa[MN],vis[MN],ans[MN],n,m,s;
vector<int> v[MN];
vector<pair<int,int>> ask[MN];

int find(int x){
    if(fa[x]!=x) fa[x]=find(fa[x]);
    return fa[x];
}

void merge(int x,int y){
    x=find(x);
    y=find(y);
    fa[x]=y;
}

void tarjan(int x){
    vis[x]=true;

    for(int i=0;i<v[x].size();i++){
        int y=v[x][i];

        if(vis[y]) continue;//无向图 防止遍历自己爹

        tarjan(y);
        merge(y,x);
    }

    for(int i=0;i<ask[x].size();i++){
        int y=ask[x][i].first;
        int id=ask[x][i].second;
        if(vis[y]) ans[id]=find(y);
    }
}

int main(){
    ios::sync_with_stdio(false);
    cin.tie(0);
    cout.tie(0);

    for(int i=1;i<MN;i++) fa[i]=i;//初始化并查集
    
    cin>>n>>m>>s;

    for(int i=1;i<n;i++){
        int x,y;
        cin>>x>>y;
        v[x].push_back(y);
        v[y].push_back(x);
    }

    for(int i=1;i<=m;i++){
        int a,b;
        cin>>a>>b;

        if(a==b) ans[i]=a;
        else{
            ask[a].push_back({b,i});
            ask[b].push_back({a,i});
        } 
    }

    tarjan(s);

    for(int i=1;i<=m;i++){
        cout<<ans[i]<<"\n";
    }
    return 0;
}

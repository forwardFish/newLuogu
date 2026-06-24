#include <bits/stdc++.h>
using namespace std;
string a[25];int n,maxx,pd[25],g[25][25];
void dfs(string s,int k){
    maxx=max(maxx,(int)s.size());
    pd[k]++;
    for(int i = 1;i<=n;i++){
        if(g[k][i]&&pd[i]<2){
            dfs(s+a[i].substr(g[k][i]),i);
        }
    }
    pd[k]--;
}
int main(){
    cin>>n;
    for(int i = 1;i<=n;i++) cin>>a[i];
    char s;cin>>s;
    for(int i = 1;i<=n;i++){
        for(int j = 1;j<=n;j++){
            for(int k = 1;k<min(a[i].size(),a[j].size());k++){
                if(a[i].substr(a[i].size()-k,k)==a[j].substr(0,k)){
                    g[i][j]=k;
                    break;
                }
            }
        }
    }
    for(int i = 1;i<=n;i++){
        if(a[i][0]==s){
            dfs(a[i],i);
        }
    }
    cout<<maxx;
}
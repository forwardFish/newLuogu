#include<cstdio>
#include<cstdlib>
const int N=5e3+5,K=1e6+5;
int a[N],vis[K],n;
int main(){
    scanf("%d",&n);
    for(int i=1;i<=n;++i){
        scanf("%d",&a[i]);
    }
    for(int i=1;i<=n;++i){
        for(int j=i+1;j<=n;++j){
            int cur=abs(a[i]-a[j]);
            vis[cur]=1;
        }
    }
    for(int i=n;i<K;++i){
        if(!vis[i]){
            int f=1;
            for(int j=i;j<K;j+=i)if(vis[j]){f=0;break;}
            if(f){
                printf("%d\n",i);
                return 0;
            }
        }
    }
    return 0;
}

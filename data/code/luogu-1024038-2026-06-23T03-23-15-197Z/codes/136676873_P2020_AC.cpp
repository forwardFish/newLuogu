#include<cstdio>
#include<map>
#include<iostream>
#include<cstring>
using namespace std;
map<long long ,int >mp;
typedef long long ll;
const int N=(int ) 1e6+50;
inline ll powmod(ll a,ll b,ll p){
    ll ans=1;
    while(b){
        if(b&1) ans=a*ans%p;
        a=a*a%p;
        b>>=1;
    }return ans;
}
int vis[12*N];
ll n,k,p,phi_k;
ll fib[12*N];
ll step[N];
int cnt,from;
bool circle;
inline ll gcd(ll a,ll b){
    return b==0?a:gcd(b,a%b);
}
inline ll phi(ll x){
    ll ans=1;
    for(ll i=2;i*i<=x;i++)
        if(x%i==0){
            ans*=i-1;
            x/=i;
            while(x%i==0)
                x/=i,ans*=i;
        }
    return ans*(x==1?1:x-1);
}
inline void init(){
    phi_k=phi(k);
    fib[1]=fib[2]=1;
    for(int i=3;i<=6*k;i++){
        fib[i]=(fib[i-1]+fib[i-2])%k;
        if(!vis[fib[i]])
            vis[fib[i]]=i;
    }
    for(ll i=1,j;;){
        mp[i]=++cnt;
        ll t=gcd(i,k);
        if(t>1) break;
        else{
            j=powmod(i,phi_k-1,k);
            if(!vis[j]){
                break;
            }
            else{
                i=i*fib[vis[j]-1]%k;
                step[cnt]=(ll)vis[j];
                if(mp.count(i)){
                    circle=true;
                    from=mp[i];break;
                }
            }
        }
    }
    step[1]-=2;
}
struct Matrix{
    ll a[4][4];
    Matrix(){memset(a,0,sizeof(a));}
    void e(){
        a[1][2]=a[2][1]=a[2][2]=a[3][3]=1;
    }
    void f(){
        a[1][1]=a[2][2]=a[3][3]=1;a[3][2]=-1;
    }
    friend Matrix operator *(Matrix x,Matrix y){
        Matrix c;
        for(int i=1;i<=3;i++)
            for(int j=1;j<=3;j++){
                for(int k=1;k<=3;k++)
                    (c.a[i][j]+=x.a[i][k]*y.a[k][j])%=p;
                (c.a[i][j]+=p)%=p;
            }
        return c;
    }
    friend Matrix operator ^(Matrix x,ll b){
        Matrix ans;
        for(int i=1;i<=3;i++) ans.a[i][i]=1;
        while(b){
            if(b&1) ans=ans*x;
            b>>=1;
            x=x*x;
        }return ans;
    }
    void print(){
        for(int i=1;i<=3;i++){
            for(int j=1;j<=3;j++)printf("%lld ",a[i][j]);puts("");
        }
    }
}a,b;
ll ans;
inline void solve(){
    if(circle){
        n-=2;
        a.e(),b.f();
        Matrix now;
        now.a[1][1]=now.a[1][2]=now.a[1][3]=1;
        int i;
        for(i=1;i<from&&n>=step[i];n-=step[i],i++)
            now=now*(a^step[i])*b;
        if(i<from) { 
            now=now*(a^n);
            ans=now.a[1][2];
            return ;
        }
        else{
            ll all_cic=0;
            for(i=from;i<=cnt;i++)
                all_cic+=step[i];
            ll cic=n/all_cic;
            n-=cic*all_cic;
            Matrix c;
            for(i=1;i<=3;i++)   c.a[i][i]=1;
            for(i=from;i<=cnt;i++)
                c=c*(a^step[i])*b;
            now=now*(c^cic);
            for(i=from;n>=step[i];n-=step[i],i++)
                now=now*(a^step[i])*b;
            now=now*(a^n);
            ans=now.a[1][2];return;
        }
    }
    else{
        
        n-=2;
        a.e(),b.f();
        Matrix now;
        now.a[1][1]=now.a[1][2]=now.a[1][3]=1;
        int i;
        for(i=1;step[i]&&n>=step[i];n-=step[i],i++){
            now=now*(a^step[i])*b;
        }
        now=now*(a^n);ans=now.a[1][2];return ;
    }
}
int main(){
    scanf("%lld%lld%lld",&n,&k,&p);
    if(n==1){
        printf("%lld\n",1%p);
        return 0;
    }
    init();
    solve();
    printf("%lld\n",ans);
}
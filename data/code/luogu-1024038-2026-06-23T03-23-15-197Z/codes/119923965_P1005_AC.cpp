#include<stdio.h> 
#include<string.h>
#include<algorithm> 
#define bll __int128
using namespace std;
bll ans,game[110][110],f[110][110];
int n,m;

inline int read() {
    int s=0,f=1;
    char ch=getchar();
    while(ch<'0' || ch>'9') {
        if(ch=='-') f=-1;
        ch=getchar();
    } 
    while(ch>='0' && ch<='9') s=s*10+ch-'0',ch=getchar();
    return s*f;
} 

void Sol(bll a[]) 
{
    memset(f,0,sizeof(f));
    for(int len=0;len<m;++len) {
        for(int i=1;i+len<=m;++i) {
            f[i][i+len]=max(2*f[i+1][i+len]+2*a[i],2*f[i][i+len-1]+2*a[i+len]); 
        }
    }
    ans+=f[1][m];
}

void print(bll x) {
    if(!x) return ;
    if(x) print(x/10);
    putchar(x%10+'0');
}

int main() 
{
    scanf("%d%d",&n,&m);
    for(int i=1;i<=n;++i) {
        for(int j=1;j<=m;++j) {
            game[i][j]=read();
        }
    }
    for(int i=1;i<=n;++i) Sol(game[i]);
    if(!ans) printf("0");
    else print(ans); 
    return 0;
}
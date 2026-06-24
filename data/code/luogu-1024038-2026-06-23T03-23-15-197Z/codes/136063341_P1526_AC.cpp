#include<bits/stdc++.h>
#define reg register
const int maxn = 105;
int M,N,K,Ans,mark[maxn],Min_cost[maxn],Max_t[maxn][maxn];
bool Used[maxn],like[maxn][maxn];
struct Node{ int x, y; } A[maxn],B[maxn];
bool Pd(Node zd, Node wq){
        int t1 = zd.x-wq.x, t2 = zd.y-wq.y;
        return t1*t1 + t2*t2 <= K*K;
}

bool Find(int x){
        for(reg int i = 1; i <= N; i ++)
                if(like[i][x] && !Used[i]){
                        Used[i] = 1;
                        if(!mark[i] || Find(mark[i])){ mark[i] = x; return 1; }
                }
        return 0;
}

void DFS(int k, int cnt){
    if(cnt + Min_cost[k] >= Ans) return ;
    if(k == M+1){ Ans = std::min(Ans, cnt); return ; }
    int Tmp_1[maxn];
    for(reg int i = k; i <= M; i ++)
	{
        for(reg int j = 1; j <= N; j ++)
		{
            Tmp_1[j] = mark[j];
            if(Max_t[j][k] >= i) like[j][cnt+1] = 1; 
        }
        memset(Used, 0, sizeof Used);
        if(Find(cnt+1)) DFS(i+1, cnt+1);
        for(reg int j = 1; j <= N; j ++)
		{
            mark[j] = Tmp_1[j];
            if(Max_t[j][k] >= i) like[j][cnt+1] = 0;
        }
    }
}
int main(){
    scanf("%d%d%d", &M, &N, &K);
    for(reg int i = 1; i <= M; i ++) scanf("%d%d", &A[i].x, &A[i].y);
    for(reg int i = 1; i <= N; i ++) scanf("%d%d", &B[i].x, &B[i].y);
    for(reg int i = 1; i <= N; i ++)
        for(reg int j = M; j >= 1; j --)
            if(Pd(B[i], A[j])) Max_t[i][j] = std::max(Max_t[i][j+1], j);
    memset(Min_cost, 0x3f, sizeof Min_cost);
    Min_cost[M+1] = 0;
    for(reg int i = M; i >= 1; i --)
        for(reg int j = 1; j <= N; j ++)
                if(Pd(B[j], A[i]))
                    Min_cost[i] = std::min(Min_cost[i], Min_cost[Max_t[j][i] + 1] + 1);
    Ans = N;
    DFS(1, 0);
    printf("%d\n", Ans);
    return 0;
}

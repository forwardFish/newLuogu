#include<cmath>
#include<queue>
#include<cstdio>
#include<vector>
#include<cstring>
#include<iostream>
#include<algorithm>
using namespace std;//此算法有毒，只是为了得点暴力分。 
const int N=20000;
const double eps=1e-10;
const double PI=acos(-1.0);
struct data{//所有的向量以点表示法，节省变量声明。 
    double x,y;
    data(){}
    data(double x,double y):x(x),y(y){}
};
data operator+(data A,data B){//基础点值运算 
    return data(A.x+B.x,A.y+B.y);
}
data operator-(data A,data B){
    return data(A.x-B.x,A.y-B.y);
}
struct Seg{//线段可表示为两端点的连线。 
    data A,B;
    Seg(){}
    Seg(data A,data B):A(A),B(B){}
};
struct Line{//用点值+方向（法度）表示法 
    double a,b,c;
    Line(){}
    Line(data A,data B){a=B.y-A.y;b=A.x-B.x;c=(B.x-A.x)*A.y-(B.y-A.y)*A.x;}
};
struct Cir{//点+半径 
    data c;
    double r;
    Cir(){}
    Cir(data c,double r):c(c),r(r){}
};
int n,tot,cnt,flag,vis[N];
double x,y,a,r,angle,d,dis[N];
data s,t,u,V[N];//V记录相邻特判点。 
Seg S[N];//Edge 
Line A,B;
Cir C[N];//圆 
vector<int>G[N];//to[] 
vector<double>val[N];//val[]
inline int judge(double x){//关键--eps不好卡 
    return fabs(x)<eps?0:(x>0?1:-1);
}
inline double Dot(data A,data B){//点乘 
    return A.x*B.x+A.y*B.y;
}
inline double Cross(data A,data B){//叉乘 
    return A.x*B.y-A.y*B.x;
}
inline double Length(data A){//离原点距离 
    return sqrt(Dot(A,A));
}
inline double Angle(data A,data B){//cos方向 高一上册。。。 
    return acos(Dot(A,B)/(Length(A)*Length(B)));
}
inline double dist(data A,data B){//尽量少用sqrt 
    return sqrt((A.x-B.x)*(A.x-B.x)+(A.y-B.y)*(A.y-B.y));
}
inline bool OnCir(data p,Cir c){//在圆上？ 
    return judge(dist(p,c.c)-c.r)==0;
}
inline data rotate(data A,double rad){//对边旋转。 
    return data(A.x*cos(rad)-A.y*sin(rad),A.x*sin(rad)+A.y*cos(rad));
}
inline bool JX(Seg A,Seg B){//线段判定，是否有障碍阻挡 
    return judge((Cross(A.B-A.A,B.A-A.A))*(Cross(A.B-A.A,B.B-A.A)))<0
         &&judge((Cross(B.B-B.A,A.A-B.A))*(Cross(B.B-B.A,A.B-B.A)))<0;
}
inline data JP(Line A,Line B){//两直线交点 
    return data((B.c*A.b-A.c*B.b)/(A.a*B.b-B.a*A.b),(B.a*A.c-A.a*B.c)/(A.a*B.b-B.a*A.b));
}
inline bool CrCir(Seg A,Cir C){//对圆求切线 
    Line p,q;data u;data t;double d;
    u=A.A-A.B;u=rotate(u,PI/2.0);
    p=Line(A.A,A.B);q=Line(C.c,C.c+u);
    t=JP(p,q);
    if (judge(dist(A.A,t)+dist(A.B,t)-dist(A.A,A.B))!=0)d=min(dist(A.A,C.c),dist(A.B,C.c));
    else d=dist(C.c,t);
    return judge(d-C.r)<0?1:0;
}
inline void SPFA(){//板子 
    queue<int>q;
    memset(vis,0,sizeof(vis));
    memset(dis,0x7f,sizeof(dis));
    vis[1]=1;dis[1]=0.0;q.push(1);
    while(!q.empty()){
        int u=q.front();q.pop();vis[u]=0;
        for(register int i=0;i<G[u].size();i++){
            if(dis[u]+val[u][i]<dis[G[u][i]]){
                dis[G[u][i]]=dis[u]+val[u][i];
                if(!vis[G[u][i]]){
                    vis[G[u][i]]=1;
                    q.push(G[u][i]);
                }
            }
        }
    }
}
inline void INsert(data k,int i){
    angle=fabs(asin(C[i].r/dist(k,C[i].c)));
    u=C[i].c-k;u=rotate(u,angle);A=Line(k,k+u);
    B=Line(C[i].c,C[i].c+rotate(u,PI/2.0));
    V[++cnt]=JP(A,B);
    u=C[i].c-k;u=rotate(u,-angle);A=Line(k,k+u);
    B=Line(C[i].c,C[i].c+rotate(u,PI/2.0));
    V[++cnt]=JP(A,B);
}
inline void Addedge(int x,int y,double d){
    G[x].push_back(y),G[y].push_back(x);
    val[x].push_back(d),val[y].push_back(d);
}
int main(){
    scanf("%lf%lf%lf%lf%lf",&s.x,&s.y,&r,&t.x,&t.y);
    scanf("%d",&n);
    for(register int i=1;i<=n;i++){
        scanf("%lf%lf%lf",&x,&y,&a);//动点转静态延伸 
        S[++tot]=Seg(data(x,y-r),data(x+a,y-r));//四角延伸r，圆缩点。 
        C[tot]=Cir(data(x,y),r);
        S[++tot]=Seg(data(x+a+r,y),data(x+a+r,y+a));
        C[tot]=Cir(data(x+a,y),r);
        S[++tot]=Seg(data(x+a,y+a+r),data(x,y+a+r));
        C[tot]=Cir(data(x+a,y+a),r);
        S[++tot]=Seg(data(x-r,y+a),data(x-r,y));
        C[tot]=Cir(data(x,y+a),r);
    }
    V[++cnt]=s;V[++cnt]=t;
    for(register int i=1;i<=tot;i++){//判定是否有特殊情况 
        if(!OnCir(s,C[i]))INsert(s,i);//出入若在扩展圆内，特判重构。 
        if(!OnCir(t,C[i]))INsert(t,i);
    }
    for(register int i=1;i<=cnt;i++){
        for(register int j=i+1;j<=cnt;j++){
            flag=1;
            for(register int k=1;k<=tot;k++){//切线与公切线 
                if(JX(Seg(V[i],V[j]),S[k])||CrCir(Seg(V[i],V[j]),C[k]))flag=0;
                if(OnCir(V[i],C[k])&&OnCir(V[j],C[k])){
                    d=Angle(V[i]-C[k].c,V[j]-C[k].c)*C[k].r;
                    Addedge(i,j,d);//若有障碍则拆边重构成两条边。 
                }
            }
            if(flag)Addedge(i,j,dist(V[i],V[j]));
        }
    }
    SPFA();
    if(dis[2]==0)
    {
    	cout<<0;
	}
	else
	{
		printf("%.2lf\n",dis[2]);
	}
    return 0;
}
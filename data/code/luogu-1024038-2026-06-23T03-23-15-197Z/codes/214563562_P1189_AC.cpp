#include<cstdio>
using namespace std;
const int MAXN=1010;
bool _map[55][55],vis[MAXN][55][55];
int to[MAXN],pos[4][2]={1,0,0,1,-1,0,0,-1};
int read(){
	int x=0,f=1;
	char c=getchar();
	while(c<'0'||c>'9'){
		if(c=='-') f=-1;
		c=getchar();
	}
	while(c>='0'&&c<='9'){
		x=x*10+c-'0';
		c=getchar();
	}
	return x*f;
}
void dfs(int dep,int x,int y){
	if(vis[dep][x][y]) return;
	vis[dep][x][y]=1;
	if(dep==0) return;
	while(_map[x+=pos[to[dep]][0]][y+=pos[to[dep]][1]]) dfs(dep-1,x,y);
}
int main(){//主函数
	int n=read(),m=read(),sx,sy;
	char c,s[10];
	for(int i=1;i<=n;i++){
		scanf("\n");
		for(int j=1;j<=m;j++){
			c=getchar();
			if(c=='.') _map[i][j]=1;
			if(c=='*') _map[i][j]=1,sx=i,sy=j;
		}
	}
	int k=read();
	for(int i=k;i>0;i--){
		scanf("\n%s",s);
		if(s[0]=='S') to[i]=0;
		if(s[0]=='E') to[i]=1;
		if(s[0]=='N') to[i]=2;
		if(s[0]=='W') to[i]=3;
	}
	dfs(k,sx,sy);
	for(int i=1;i<=n;i++){
		for(int j=1;j<=m;j++) printf("%c",vis[0][i][j]?'*':(_map[i][j]?'.':'X'));
		printf("\n");
	}
	return 0;
}
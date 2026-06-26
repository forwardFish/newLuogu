#include <bits/stdc++.h>
#define FAST ios::sync_with_stdio(0);cin.tie(0);cout.tie(0)
#define TIAO cout << fixed << setprecision(15)
using namespace std;
int n;
int a[50][50];
int p[50][50];
int c[50];
int dis[50][50];
bool in[50][50];
int dp[2049][12][12][12][12];
int U[50];
struct Node{
	int S,lid,L,rid,R;
};
Node lst[2049][12][12][12][12];
int is2[2049][12][12][12][12];
pair<int,int> qaq[12];
void print(Node x){
	if(x.S==1&&x.lid==0&&x.L==0&&x.rid==0&&x.R==0);
	else{
		print(lst[x.S][x.lid][x.L][x.rid][x.R]);
		if(is2[x.S][x.lid][x.L][x.rid][x.R]) cout << is2[x.S][x.lid][x.L][x.rid][x.R] << " ";
		
		if(lst[x.S][x.lid][x.L][x.rid][x.R].L>0&&x.L==0){
			qaq[x.lid] = {-1,dp[x.S][x.lid][x.L][x.rid][x.R]};
		}
		if(x.rid!=lst[x.S][x.lid][x.L][x.rid][x.R].rid){
			qaq[x.rid] = {1,dp[x.S][x.lid][x.L][x.rid][x.R]+1};
		}
	}
}
Node dq[10000010];
int hh,tt;
signed main()
{
	cin >> n;
	for (int i=1;i<=n;i++){
		for (int j=1;;j++){
			cin >> a[i][j];
			if(a[i][j]==0){
				c[i] = j-1;
				break;
			}
		}
	}
	for (int i=1;i<=n;i++){
		for (int j=1;j<=c[i];j++){
			p[i][a[i][j]] = j;
		}
	}
	for (int i=0;i<=n;i++){
		for (int j=0;j<=n;j++){
			int tot = c[j],res = 0;
			for (int t=c[j];t>=1;t--){
				if(a[j][t]==a[i][c[i]-res]) ++res;
			}
			dis[i][j] = res;
			memset(U,0,sizeof(U));
			in[i][j] = 1;
			for (int t=1;t<=c[j];t++) U[a[j][t]]++;
			for (int t=1;t<=c[i];t++) if(U[a[i][t]]==0) in[i][j] = 0;
		}
	}
	memset(dp,0x3f,sizeof(dp));
	hh = tt = 500000;
	dq[hh] = {1,0,0,0,0};
	dp[1][0][0][0][0] = 0;
	while(hh<=tt){
		Node f = dq[hh];
		++hh;
		int cur = dp[f.S][f.lid][f.L][f.rid][f.R];
		bool is = (f.S==1&&f.lid==0&&f.L==0&&f.rid==0&&f.R==0);
		if(f.S==(1<<(n+1))-1&&f.L==0&&f.R==c[f.rid]){
			cout << cur << "\n";
			print(f);
			cout << "\n";
			for (int i=1;i<=n;i++){
				if(qaq[i].first==-1) cout << "<- " << qaq[i].second << "\n";
				else cout << qaq[i].second << " ->\n";
			}
			return 0; 
		}
		if(f.L==0){
			for (int m=0;m<=n;m++){
				if(f.lid==0&&m!=0){
					if(is);
					else continue; 
				}
				if((f.S>>m)%2==0&&in[f.lid][m]||m==0){
					for (int u=0;u<=dis[m][f.lid];u++){
						if(cur<dp[f.S|(1<<m)][m][c[m]-u][f.rid][f.R]){
							dp[f.S|(1<<m)][m][c[m]-u][f.rid][f.R] = cur;
							lst[f.S|(1<<m)][m][c[m]-u][f.rid][f.R] = f;
							is2[f.S|(1<<m)][m][c[m]-u][f.rid][f.R] = 0;
							dq[--hh] = {f.S|(1<<m),m,c[m]-u,f.rid,f.R};
						}
					}
				}
			}
		}
		for (int m=0;m<=n;m++){
			if(f.rid!=0&&m==0) continue;
			if(in[m][f.rid]&&(f.S>>m)%2==0&&dis[f.rid][m]+f.R>=c[f.rid]||f.rid==0){
				int ano = 0;
				if(cur<dp[f.S|(1<<m)][f.lid][f.L][m][ano]){
					dp[f.S|(1<<m)][f.lid][f.L][m][ano] = cur;
					lst[f.S|(1<<m)][f.lid][f.L][m][ano] = f;
					is2[f.S|(1<<m)][f.lid][f.L][m][ano] = 0;
					dq[--hh] = {f.S|(1<<m),f.lid,f.L,m,ano};
				}
			}
		}
		for (int m=1;m<=9;m++){
			if(f.rid==0);
			else if(p[f.rid][m]==0) continue;
			else if(p[f.rid][m]>f.R+1) continue;
			if(f.lid==0);
			else if(p[f.lid][m]==0) continue;
			else if(p[f.lid][m]>f.L) continue;
			if(cur+1<dp[f.S][f.lid][(m==a[f.lid][f.L]? f.L-1:f.L)][f.rid][(m==a[f.rid][f.R+1]? f.R+1:f.R)]){
				dp[f.S][f.lid][(m==a[f.lid][f.L]? f.L-1:f.L)][f.rid][(m==a[f.rid][f.R+1]? f.R+1:f.R)] = cur+1;
				dq[++tt] = {f.S,f.lid,(m==a[f.lid][f.L]? f.L-1:f.L),f.rid,(m==a[f.rid][f.R+1]? f.R+1:f.R)};
				lst[f.S][f.lid][(m==a[f.lid][f.L]? f.L-1:f.L)][f.rid][(m==a[f.rid][f.R+1]? f.R+1:f.R)] = f;
				is2[f.S][f.lid][(m==a[f.lid][f.L]? f.L-1:f.L)][f.rid][(m==a[f.rid][f.R+1]? f.R+1:f.R)] = m;
			}
			if(cur+1<dp[f.S][f.lid][(m==a[f.lid][f.L]&&0? f.L-1:f.L)][f.rid][(m==a[f.rid][f.R+1]? f.R+1:f.R)]){
				dp[f.S][f.lid][(m==a[f.lid][f.L]&&0? f.L-1:f.L)][f.rid][(m==a[f.rid][f.R+1]? f.R+1:f.R)] = cur+1;
				dq[++tt] = {f.S,f.lid,(m==a[f.lid][f.L]&&0? f.L-1:f.L),f.rid,(m==a[f.rid][f.R+1]? f.R+1:f.R)};
				lst[f.S][f.lid][(m==a[f.lid][f.L]&&0? f.L-1:f.L)][f.rid][(m==a[f.rid][f.R+1]? f.R+1:f.R)] = f;
				is2[f.S][f.lid][(m==a[f.lid][f.L]&&0? f.L-1:f.L)][f.rid][(m==a[f.rid][f.R+1]? f.R+1:f.R)] = m;
			}
		}
	}
	cout << -1;
	return 0;
}

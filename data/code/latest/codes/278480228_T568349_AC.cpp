#include<cstdio>
#include<string>
#include<vector>
#include<cassert>
#include<cstring>
#include<iostream>
#include<algorithm>
#define fi first
#define se second
using namespace std;
typedef long long LL;
typedef pair<int,int> PII;
const int N=3e5+9,P=998244353;
int qmi(int a,int b){
	int res=1;
	while(b){
		if(b&1) res=(LL)res*a%P;
		a=(LL)a*a%P;
		b>>=1;
	}
	return res;
}
string str;
char s[N]; int n,m,id[128],g[128][128],deg[128],a[128][128];
int kmp[N][128],nxt[N],f[N];
PII tmp[N][128];
void add(int a,int b){
	g[a][b]++;
	deg[a]++;
}
void gauss(){
	for(int i=1;i<=m;i++){
		int id=i;
		for(int j=i;j<=m;j++) if(a[j][i]) id=j;
		if(id^i) swap(a[id],a[i]);
		if(!a[i][i]) assert(0);
		int inv=qmi(a[i][i],P-2);
		for(int j=i;j<=m+1;j++) a[i][j]=(LL)a[i][j]*inv%P;
		for(int k=1;k<=m;k++) if(k!=i&&a[k][i])
			for(int j=m+1;j>=i;j--) a[k][j]=(a[k][j]-(LL)a[k][i]*a[i][j]%P+P)%P;
	}
}
int main(){
	getline(cin,str);
	for(int i=0,len=str.size();i<len;i++) s[++n]=str[i];
	memset(id,-1,sizeof(id));
	for(int i=1;i<=n;i++) if(!~id[s[i]]) id[s[i]]=m++; m--;
	if(!m) return printf("%d\n",n),0;
	for(int i=1;i<n;i++) add(id[s[i]],id[s[i+1]]); add(id[s[n]],id[s[1]]);
	for(int i=0;i<=m;i++){
		int inv=qmi(deg[i],P-2);
		for(int j=0;j<=m;j++) g[i][j]=(LL)inv*g[i][j]%P;
	}
	for(int i=2,j=0;i<=n;i++){
		while(j&&s[j+1]!=s[i]) j=nxt[j];
		if(s[j+1]==s[i]) j++;
		nxt[i]=j;
	}
	for(int i=0;i<n;i++) for(int c=0;c<=m;c++){
		if(id[s[i+1]]==c) kmp[i][c]=i+1;
		else kmp[i][c]=kmp[nxt[i]][c];
//		printf("kmp %d %d %d\n",i,c,kmp[i][c]);
	}
	for(int i=1;i<=m+1;i++) tmp[1][i]={1,0};
	for(int j=2;j<=n;j++){
		int inv=qmi(g[id[s[j-1]]][id[s[j]]],P-2);
		for(int c=1;c<=m+1;c++) tmp[j][c].fi=(LL)tmp[j-1][c].fi*inv%P,tmp[j][c].se=(LL)tmp[j-1][c].se*inv%P;
		for(int c=0;c<=m;c++) if(c!=id[s[j]]){
			int coef=(LL)(P-g[id[s[j-1]]][c])*inv%P;
			if(!kmp[j-1][c]) tmp[j][c].se=(tmp[j][c].se+coef)%P;
			else{
				int k=kmp[j-1][c];
				for(int c=1;c<=m+1;c++) tmp[j][c].fi=(tmp[j][c].fi+(LL)tmp[k][c].fi*coef)%P,tmp[j][c].se=(tmp[j][c].se+(LL)tmp[k][c].se*coef)%P;
			}
		}
		tmp[j][m+1].se=(tmp[j][m+1].se+(LL)(P-1)*inv)%P;
	}
	for(int i=1;i<=m;i++){
		if(!g[i][0]){
			for(int j=1;j<=m;j++) if(i^j) a[i][j]=(P-g[i][j])%P;
			a[i][i]=(P-g[i][i]+1)%P;
			a[i][m+1]=1;
		}
		else{
			int inv=qmi(g[i][0],P-2);
			for(int j=1;j<=m;j++) if(i^j) a[i][j]=((LL)(P-g[i][j])*inv%P*tmp[n][j].fi+tmp[n][j].se)%P;
			a[i][i]=((LL)(P-g[i][i]+1)*inv%P*tmp[n][i].fi+tmp[n][i].se)%P;
			a[i][m+1]=(P-((LL)(P-1)*inv%P*tmp[n][m+1].fi+tmp[n][m+1].se)%P)%P;
		}
	}
//	for(int i=1;i<=m;i++,puts("")) for(int j=1;j<=m+1;j++) printf("%d ",a[i][j]);
	gauss();
	int c=1;
	while(!g[c][0]) c++;
	int f1=(a[c][m+1]-1+P)%P;
	for(int j=1;j<=m;j++) f1=(f1+(LL)(P-g[c][j])*a[j][m+1])%P;
	f1=(LL)f1*qmi(g[c][0],P-2)%P;
	printf("%d\n",(f1+1)%P);
    return 0;
}

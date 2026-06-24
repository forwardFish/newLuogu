#include<bits/stdc++.h>
using namespace std;
inline int read() {
	int ans=0;
	char last=' ',ch=getchar();
	while(ch>'9'||ch<'0') last=ch,ch=getchar();
	while(ch>='0'&&ch<='9') ans=(ans<<1)+(ans<<3)+ch-'0',ch=getchar();
	if(last=='-') ans=-ans;
	return ans;
}
int P[110][110];
int NT[110];
int dp[101000];
int main() {
	int T,M,N;
	T=read();
	N=read();
	M=read();
	for(int i=1;i<=T;i++) 
		for(int j=1;j<=N;j++) 
			P[i][j]=read();
	int MAxn;
	for(int d=1;d<=T;d++) {
		MAxn=-0xfffffffff;
		dp[0]=M;
		for(int i=1;i<=N;i++) {
			for(int j=P[d][i];j<=M;j++) 
				dp[j]=max(dp[j],dp[j-P[d][i]]-P[d][i]+P[d+1][i]);
		}
		for(int j=0;j<=M;j++) 
			MAxn=max(MAxn,dp[j]);
		M=MAxn;
	}
	printf("%d",M); 
	return 0;
}
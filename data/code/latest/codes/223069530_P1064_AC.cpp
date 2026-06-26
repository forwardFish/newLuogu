#include<bits/stdc++.h>
using namespace std;
int n,m,v1,p1,q1,v[65][3],p[65][3],f[65][32005];
signed main(){
	cin>>n>>m;
	for(int i=1;i<=m;i++){
		cin>>v1>>p1>>q1;
		if(q1){if(v[q1][1])v[q1][2]=v1,p[q1][2]=p1;else v[q1][1]=v1,p[q1][1]=p1;}
		else v[i][0]=v1,p[i][0]=p1;
	}
	for(int i=1;i<=m;i++){
		for(int j=0;j<=n;j++){
            f[i][j]=f[i-1][j];
			if(v[i][0]<=j)f[i][j]=max(f[i][j],f[i-1][j-v[i][0]]+v[i][0]*p[i][0]);
			if(v[i][0]+v[i][1]<=j)f[i][j]=max(f[i][j],f[i-1][j-v[i][0]-v[i][1]]+v[i][0]*p[i][0]+v[i][1]*p[i][1]);
			if(v[i][0]+v[i][2]<=j)f[i][j]=max(f[i][j],f[i-1][j-v[i][0]-v[i][2]]+v[i][0]*p[i][0]+v[i][2]*p[i][2]);
			if(v[i][0]+v[i][1]+v[i][2]<=j)f[i][j]=max(f[i][j],f[i-1][j-v[i][0]-v[i][1]-v[i][2]]+v[i][0]*p[i][0]+v[i][1]*p[i][1]+v[i][2]*p[i][2]);
		}
	}
	cout<<f[m][n];
	return 0;
}
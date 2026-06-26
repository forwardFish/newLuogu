#include<iostream>
using namespace std;
int n,u[8]={0,-1,-1,-1,0,1,1,1},v[8]={1,1,0,-1,-1,-1,0,1};//八个方向
char le[200],chess[101][101];
bool ma[101][101];
bool DFS(int x,int y,char w,int p){
	if(w=='g'){
		ma[x][y]=1;
		return 1;
	}
	int xx=x+u[p],yy=y+v[p];
	if(xx>=1 && yy>=1 && xx<=n && yy<=n && chess[xx][yy]==le[w])
	if(DFS(xx,yy,le[w],p)){
		ma[x][y]=1;
		return 1;
	}
	return 0;
}
int main(){
	le['y']='i';
	le['i']='z';
	le['z']='h';
	le['h']='o';
	le['o']='n';
	le['n']='g';
	cin>>n;
	for(int i=1;i<=n;i++)
	for(int j=1;j<=n;j++)
	cin>>chess[i][j];
	for(int i=1;i<=n;i++)
	for(int j=1;j<=n;j++)
	if(chess[i][j]=='y')
	for(int k=0;k<=7;k++)
	if(DFS(i,j,'y',k)) ma[i][j]=1; 
	for(int i=1;i<=n;i++){
		for(int j=1;j<=n;j++)
		if(ma[i][j]) cout<<chess[i][j];
		else cout<<'*';
		cout<<endl;
	}
	return 0;
}

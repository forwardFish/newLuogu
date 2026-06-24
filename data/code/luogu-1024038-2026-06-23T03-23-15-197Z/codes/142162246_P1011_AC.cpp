#include<bits/stdc++.h>
using namespace std;
int main(){
	int a,n,m,x,map[25],map1[25];
	cin>>a>>n>>m>>x;
	map[2]=1,map[3]=2;
	for(int i=4;i<n;i++)
	{
		map[i]=map[i-1]+map[i-2]-1;
		map1[i]=map1[i-1]+map1[i-2]+1;
	}
	cout<<a*map[x]+(m-a*map[n-1])/map1[n-1]*map1[x];
	return 0;
}
#include<bits/stdc++.h>
using namespace std;
int main(){
	int b,c,d[10005],e[10005],n[10005]={0},a;
	cin>>b>>c;
	for(int i=0;i<c;i++)
	{
		cin>>d[i]>>e[i];
	}
	for(int j=0;j<c;j++)
	{
		for(int z=d[j];z<=e[j];z++)
		{
			n[z]=1;
		}
	}
	a=0;
	for(int i=0;i<=b;i++)
	{
		if(n[i]==0)
		{
			a++;
		}
	}
	cout<<a;
	return 0;
}
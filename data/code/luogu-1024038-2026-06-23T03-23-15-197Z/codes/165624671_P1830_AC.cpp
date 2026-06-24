#include<bits/stdc++.h>
using namespace std;
int a[1005],b[1005],c[1005],d[1005];
int r[1005],c1[1005];
int main(){
	int k,n,m,map=0,hh=0;
	int x,y;
	cin>>n>>m>>x>>y;
	for(int i=1;i<=x;i++)
	{
		cin>>a[i]>>b[i]>>c[i]>>d[i];
	}
	for(int i=1;i<=y;i++)
	{
	    cin>>r[i]>>c1[i];
	    map=0;
	    for(int j=1;j<=x;j++)
		{
	    	if(r[i]>=a[j] && r[i]<=c[j] && c1[i]>=b[j] && c1[i]<=d[j])
	    	{
	    		map++;
	    		hh=j;
			}
		}
		if(map>0)
		{
			cout<<"Y"<<" "<<map<<" "<<hh<<endl;
		}
		else 
		{
			cout<<"N"<<endl;
		}
		map=0;
		hh=0;
	}
	return 0;
}
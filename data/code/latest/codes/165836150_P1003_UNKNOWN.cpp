#include<bits/stdc++.h>
using namespace std;
int v[10005][10005];
int main() {
	memset(v, -1, sizeof(v));
	int n,a,b,c,d;
	cin>>n;
	for(int i=0;i<n;i++)
	{
		cin>>a>>b>>c>>d;
		for(int j=a; j<=a+c;j++) 
		{
			for(int z=b;z<=b+d;z++)
			{
				v[j][z] = i;
			}
		}
	}
	int x,y;
	cin>>x>>y;
	cout<<v[x][y]<<endl;
	return 0;
}
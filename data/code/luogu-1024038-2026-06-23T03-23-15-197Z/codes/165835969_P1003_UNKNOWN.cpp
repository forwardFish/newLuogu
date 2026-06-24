#include<bits/stdc++.h>
usinc namespace std;
int a[10005][10005];
int main() {
	memset(a, -1, sizeof(a));
	int n,a,b,c,d;
	cin>>n;
	for(int i=0;i<n;i++)
	{
		cin>>a>>b>>c>>d;
		for(int j=a; j<=a+c;j++) 
		{
			for(int z=b;z<=b+d;z++)
			{
				a[j][z] = i;
			}
		}
	}
	int x,y;
	cin>>x>>y;
	cout<<a[x][y]<<endl;
	return 0;
}
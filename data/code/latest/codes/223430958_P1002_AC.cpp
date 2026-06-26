#include<bits/stdc++.h>
#define ll long long
using namespace std;
const int f1[] = {0, -2, -1, 1, 2, 2, 1, -1, -2};
const int f2[] = {0, 1, 2, 2, 1, -1, -2, -2, -1};
int b, b1, x, x1;
ll f[40][40];
bool a[40][40];
int main()
{
    cin>>b>>b1>>x>>x1;
    b+=2;b1+=2;x+=2;x1+=2;
    f[2][1]=1;
    a[x][x1]=1;
    for(int i=1;i<=8; i++)
	{
		 a[x+f1[i]][x1+f2[i]]=1;
	}
    for(int i=2;i<=b;i++)
	{
        for(int j=2;j<= b1;j++)
		{
            if(a[i][j]) 
			{
				continue;
			}
            f[i][j]=f[i-1][j]+f[i][j-1];
        }
    }
    cout<<f[b][b1];
    return 0;
}
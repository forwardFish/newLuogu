#include<bits/stdc++.h>
using namespace std;
int n,m,a[10010][110],num[10010][110],key,lo;
int main()
{
	cin>>n>>m;
	for(int i=1;i<=n;i++)
		for(int j=1;j<=m;j++)
		{
			scanf("%d%d",&a[i][j],&num[i][j]);
			if(a[i][j]) a[i][0]++;
		}
	cin>>lo;lo+=1;
	for(int i=1;i<=n;i++)
	{
		key+=num[i][lo];key%=20123;
		int x=(num[i][lo])%a[i][0]+a[i][0];
		lo--;
		while(x)
		{
			lo++;
			if(lo>m) lo=1;
			if(a[i][lo]) x--;
		}
	}
	cout<<key%20123;
	return 0;
}
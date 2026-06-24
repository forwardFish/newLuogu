#include<cstdio>
#include<algorithm>
#include<cstring>
using namespace std;
int A[1001][1001];
int C[1001][1001];
signed main()
{
	freopen("data.in","r",stdin);
	int n,m;
	scanf("%d %d",&n,&m);
	memset(A,50,sizeof A);
	for(int i=1;i<=m;i++)
	{
		int a,b,c;
		scanf("%d %d %d", &a,&b,&c);
		A[a][b]=A[b][a]=c;
		A[i][i]=0;
	}
	int tmp=1;// 看这里！！！！！！！！
	while(tmp--)
	{
		memset(C,127 , sizeof C);

		for(int k=1;k<=n;k++)
		{
			for(int i=1;i<=n;i++)
				for(int j=1;j<=n;j++)
					C[i][j]=min(C[i][j],A[i][k]+A[k][j]);
		}
		memcpy(A,C,sizeof C);	
	}
		for(int i=1;i<=n;i++)
		{
			for(int j=1;j<=n;j++)
				if(A[i][j]<100)
					printf("%d ",A[i][j]);
				else
				{
					printf("X ");
				}
			printf("\n");
		}
}
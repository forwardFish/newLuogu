#include<cstdio>
#include<algorithm>
using namespace std;
int f[1000005],r[1000005],num[1000005][5];
int fa(int x)
{
	if(f[x]==x)
	{
		return f[x];
	}
	int t=f[x];
	f[x]=fa(f[x]);
	r[x]=(r[t]+r[x])%2;
	return f[x];
}
int main()
{
	int n;
	scanf("%d",&n);
	for(int i=1;i<=n;i++)
	{
		f[i]=i;
	}
	for(int i=1;i<=n;i++)
	{
		int a,opt;
		scanf("%d%d",&a,&opt);
		if(fa(i)!=fa(a))
		{
			int tmp=fa(i);
			f[fa(i)]=fa(a);
			r[tmp]=(r[i]+opt+1+r[a])%2;
		}else
		{
			if((r[i]+r[a])%2!=(opt+1)%2)
			{
				printf("No answer");//判断无解
				return 0;
			}
		}	
	}
	for(int i=1;i<=n;i++)
	{
		if(fa(i)==i)
		{
			num[i][0]++;
		}else
		{
			num[fa(i)][r[i]]++;
		}
	}
	int maxans=0,minans=0,tot=1;
	for(int i=1;i<=n;i++)
	{
		if(fa(i)==i)
		{
			tot=tot*2%998244353;//答案数
			maxans+=max(num[i][1],num[i][0]);//累加较大的正确答案
			minans+=min(num[i][1],num[i][0]);//累加较小的正确答案	
		}	
	}
	printf("%d\n%d\n%d\n",tot,maxans,minans);
	return 0;
}
#include<bits/stdc++.h>
#define int long long 
using namespace std;
const int maxk=1e5+5;;
const int B=316;
const int S=50086;
const int maxm=5e3+5;
int ks[maxk];
int pp[maxk+1],pa[maxk+1],pb[maxk+1];
int off[B+2],bp[S];
int ta[maxm],tb[maxm];
int p[maxm],q[maxm];
int out[maxk*2];
int dp[maxk+1],best[S];
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(nullptr);
	int D,T;
	cin>>D>>T;
	int maxx=0;
	for(int i=0;i<T;i++)
	{
		cin>>ks[i];
		maxx=max(maxx,ks[i]);
	}
	off[1]=0;
	for(int i=2;i<=B+1;i++)
	{
		off[i]=off[i-1]+(i-1);
	}
	const int INF=(1LL<<60);
	for(int i=0;i<=maxx;i++) dp[i]=INF;
	for(int i=0;i<S;i++)
	{
		best[i]=INF;
		bp[i]=-1;
	}
	dp[0]=0;
	for(int a=1;a<=B;a++)
	{
		best[off[a]]=0;
		bp[off[a]]=0;
	}
	for(int v=1;v<=maxx;v++)
	{
		int maxx=INF;
		int ba=1,bu=0;
		for(int a=1;a<=B;a++)
		{
			int r=v%a;
			int m=(v-r)/a;
			int idx=off[a]+r;
			int cand=best[idx];
			if(cand>=INF/2)continue;
			int val=a+m+cand;
			if(val<maxx)
			{
				maxx=val;
				ba=a;
				bu=bp[idx];
			}
		}
		dp[v]=maxx;
		int b=(v-bu)/ba;
		pp[v]=bu;
		pa[v]=ba;
		pb[v]=b;
		for(int a=1;a<=B;a++)
		{
			int r=v%a;
			int m=(v-r)/a;
			int idx=off[a]+r;
			int key=dp[v]-m;
			if(key<best[idx])
			{
				best[idx]=key;
				bp[idx]=v;
			}
		}
	}
	for(int tc=0;tc<T;tc++)
	{
		int k=ks[tc];
		int cur=k;
		int len=0;
		while(cur>0&&len<maxm-2)
		{
			ta[len]=pa[cur];
			tb[len]=pb[cur];
			cur=pp[cur];
			len++;
		}
		if(cur>0)
		{
			len=1;
			ta[0]=1;
			tb[0]=k;
		}
		int m=len+1;
		for(int i=1;i<=m;i++)
		{
			p[i]=0;
			q[i]=0;
		}
		for(int t=1;t<=len;t++)
		{
			p[t]=ta[t-1]-1;
			q[t+1]=tb[t-1]-1;
		}
		int outlen=0;
		int x=m+1;
		for(int i=1;i<=m;i++)
		{
			for(int t=0;t<p[i];t++)
			{
				out[outlen++]=x++;
			}
			out[outlen++]=i;
		}
		for(int i=1;i<=m;i++)
		{
			out[outlen++]=i;
			for(int t=0;t<q[i];t++)out[outlen++]=x++;
		}
		cout<<outlen<<"\n";
		for(int i=0;i<outlen;i++)
		{
			if(i)cout<<' ';
			cout<<out[i];
		}
		cout<<"\n";
	}

	return 0;
}

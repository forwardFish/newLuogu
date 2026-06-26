#include<bits/stdc++.h>
using namespace std;
const int maxn=5e3+5;
struct node
{
	int v,w,ne;
}a[maxn];
const int maxm=1e2+5;
int n,p,cnt;
int c[maxm],u[maxm],h[maxm],in[maxm],out[maxm];
bool v[maxm];

int main()
{
	cin>>n>>p;
	for(int i=1;i<=n;i++)
	{
		cin>>c[i]>>u[i];
		if(c[i]>0)
		{
			u[i]=-1;
		}
	}
	for(int i=1;i<=p;i++)
	{
		int s,d,w;
		cin>>s>>d>>w;
		a[++cnt]=(node){d,w,h[s]};
		h[s]=cnt;
		in[d]++;
		out[s]++;
	}
	for(int i=1;i<=n;i++)
	{
		for(int j=1;j<=n;j++)
		{
			if(in[j]==0&&v[j]==0)
			{
				v[j]=1;
				if(u[j]!=-1)c[j]-=u[j];
				for(int k=h[j];k>0;k=a[k].ne)
				{
					if(c[j]>0)
					{
						c[a[k].v]+=c[j]*a[k].w;
					}
					in[a[k].v]--;
				}
				break;
			}
		}
	}
	bool flag=0;
	for(int i=1;i<=n;i++)
	{
		if(out[i]==0&&c[i]>0)flag=1;
	}
	if(flag)
	{
		for(int i=1;i<=n;i++)
		{
			if(out[i]==0&&c[i]>0)
			{
				cout<<i<<" "<<c[i]<<endl;
				
			}
		}
	}
	else
	{
		cout<<"NULL"<<endl;
	}
	return 0;
}

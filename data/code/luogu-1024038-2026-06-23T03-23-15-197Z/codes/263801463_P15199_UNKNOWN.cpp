#include<bits/stdc++.h>
#define int long long 
using namespace std;
const int maxn=1e5+5;
int line[maxn],pos;
int maxx[maxn],minn[maxn];
int x[maxn],y[maxn];
vector<int> g[maxn];
vector<int>mid;
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);cout.tie(0); 
	int n,X,Y;
	cin>>X>>Y;
    cin>>n;
    memset(maxx,-1,sizeof(maxx));
    for(int i=0;i<X;i++) minn[i]=INT_MAX;
    for(int i=1; i<=n; i++)
	{
        cin>>x[i]>>y[i];
        maxx[x[i]]=max(maxx[x[i]],y[i]);
        minn[x[i]]=min(minn[x[i]],y[i]);
    }
    for(int i=0;i<X;i++)
	{
        if(maxx[i]!=-1&&minn[i]!=INT_MAX)
		{
            mid.push_back(maxx[i]);
            mid.push_back(minn[i]);
        }
    }
    sort(mid.begin(),mid.end());
    int len=mid.size();
    pos=mid[(len-1)/2];
    int ans=0;
    for(int i=0;i<X;i++)
	{
        if(maxx[i]!=-1 && minn[i]!=INT_MAX)
		{
            ans+=maxx[i]-minn[i]+abs(maxx[i]-pos)+abs(minn[i]-pos);
        }
    }
    cout<<ans+X-1<<endl;
	return 0;
 } 
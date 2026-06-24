#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;
const int maxn=1e5+5;
unordered_map<int,int> t;
int q()
{
	int maxx=0;
	for(auto i:t)
	{
		maxx=max(maxx,i.first*i.second);
	}
	return maxx;
}
int a[maxn];
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int n,k,ans=0;
	cin>>n>>k;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
	}
	for(int i=1;i<=k;i++)
	{
		t[a[i]]++;
	}
	
	 int sum=q();ans+=sum;
	 for(int i=k+1;i<=n;i++)
	 {
	 	int l=a[i-k];
		int lz=t[l];
		t[l]--;
		if(l*lz==sum) sum=q();
		if(t[l]==0) t.erase(l);
		t[a[i]]++;
		sum=max(sum,a[i]*t[a[i]]);
		ans+=sum;
	 }
	 cout<<ans;
	return 0;
 }

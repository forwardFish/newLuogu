#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;
const int maxn=1e5+5;
struct node{
	int cnt; 
	vector<int> l;
	vector<int> r;
}a[maxn];
struct cmp{
	bool operator()(int i,int j) const
	{
		return a[i].r[a[i].cnt]>a[j].r[a[j].cnt];
	}
};
priority_queue<int,vector<int>,cmp> q;
int aa[maxn];
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int n;
	cin>>n;
	int maxx=-1;
	for(int i=1;i<=n;i++)
	{
		int k,x1,x2;
		cin>>k>>x1>>x2;int sum=0;
		for(int j=1;j<=k;j++)
		{
			cin>>aa[j];sum+=aa[j];
		}
		a[i].cnt=0;
		a[i].l.push_back(x1);
		a[i].r.push_back(x2-sum);
		int c=0;
		for(int j=1;j<=k;j++)
		{
			c+=aa[j];
			a[i].l.push_back(x1+c);
			a[i].r.push_back(x2-sum+c);
		}
		maxx=max(maxx,a[i].l[0]);
		q.push(i);
		
	 } 
	 int ans=0;
	 while(!q.empty())
	 {
	 	int x=q.top();
	 	q.pop();
	 	int cnt=a[x].r[a[x].cnt];
	 	if(cnt>maxx) ans=max(ans,cnt-maxx);
		 if(a[x].cnt>=a[x].r.size()-1)
		 {
		 	break;
		 }
		 a[x].cnt++;
	     maxx=max(maxx,a[x].l[a[x].cnt]);
		 q.push(x); 
	 }
	 cout<<ans;
	return 0;
 }

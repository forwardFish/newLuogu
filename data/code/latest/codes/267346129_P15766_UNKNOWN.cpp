#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;
const int maxn=55;
int a[maxn],s[maxn];
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);cout.tie(0);
	 int n;
	 cin>>n;
	 for(int i=1;i<=n;i++)
	 {
	 	cin>>a[i]>>s[i];
	 }
	 int x,y;cin>>x>>y;
	 int cnt=0;
	 vector<pair<int,int> > q;
	 for(int i=1;i<=n;i++)
	 {
	 	for(int j=i+1;j<=n;j++)
	 	{
	 		if(a[i]==a[j] && s[i]==s[j]) continue; 
	 		if((a[j]-a[i])*(y-s[i])!=(s[j]-s[i])*(x-a[i])) continue;
	 		if(a[i]!=a[j])
	 		{
	 			if((x-a[i])*(a[j]-a[i])>0 && abs(x-a[i])<abs(a[j]-a[i]))
	 			{
	 				q.push_back({i,j});cnt++;
				 }
			 }
			 else
			 {
			 	if(a[i]==x)
			 	{
			 		if((y-s[i])*(s[j]-s[i])>0 && abs(y-s[i])<abs(s[j]-s[i]))
			 		{
			 			q.push_back({i,j});cnt++;
					 }
				 }
			 }
		 }
	  } 
	  cout<<cnt<<endl;
	  for(int i=0;i<cnt;i++)
	  {
	  	cout<<q[i].first<<" "<<q[i].second<<endl;
	  }
	return 0;
}

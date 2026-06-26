#include<bits/stdc++.h>
using namespace std;
#define int long long
#define endl "\n"
const int maxn=1e4+5;
int a[maxn];
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int t;
	cin>>t;
	while(t--)
	{
		int n;
		cin>>n;
		for(int i=1;i<=n;i++)
		{
			cin>>a[i];
		}
		vector<pair<int,int> > ans;
		int cnt=0;
		for(int i=1;i<=n;i++)
		{
			if(i!=a[i])
			{
				for(int j=n;j>=i;j--)
				{
					if(a[i]>a[j])
					{
						ans.push_back({i,j});
						cnt++;
						sort(a+i,a+j+1);
						break;
					}
				}
			}
		}
		int tt=ans.size();
		cout<<cnt<<endl;
		for(int i=0;i<tt;i++)
		{
			cout<<ans[i].first<<" "<<ans[i].second<<endl;
		}
	}
	return 0;
}

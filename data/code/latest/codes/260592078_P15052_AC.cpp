#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=1e3+5;
int a[maxn][maxn];
vector<int> v,p;
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	int n;
	cin>>n;
	int sum1=0,sum2=0;
	for(int i=1;i<=n;i++)
	{
		sum1=0;
		for(int j=1;j<=n-i+1;j++)
		{
			int a;cin>>a;
			sum1+=a;
		}
		if(i==1)
		{
			sum2=sum1;
		}
		else 
		{
			if(i%2==0)
			{
				v.push_back(sum2-sum1);
			}
			else
			{
				p.push_back(sum2-sum1);
			}
			sum2=sum1;
		}
	}
	if(n%2==1) v.push_back(sum1);
	else p.push_back(sum1); 
	sort(v.begin(),v.end());sort(p.begin(),p.end());
	for(int i=0;i<v.size();i++) cout<<v[i]<<" ";
	cout<<'\n';
	for(int i=0;i<p.size();i++) cout<<p[i]<<' ';
	return 0;
}


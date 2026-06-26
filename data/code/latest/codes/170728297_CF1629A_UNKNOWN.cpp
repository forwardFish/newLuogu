#include<bits/stdc++.h>
using namespace std;
int t,n,k;
struct node
{
	int a,b;
}s[1005];
bool cmp(node c,node d)
{
	return c.a<d.a;
}
int main()
{
	cin>>t;
	while(t--)
	{
		cin>>n>>k;
		for(int i=0;i<n;i++) cin>>s[i].a;
		for(int i=0;i<n;i++) cin>>s[i].b;
		sort(s,s+n,cmp);
		for(int i=0;i<n;i++)
		{
			if(k<s[i].a)
			{
				break;
			}
			k+=s[i].b;
		}
		cout<<k<<endl;
		for(int i=0;i<n;i++)
		{
			s[i].a=0;
			s[i].b=0;
		}
		
	}
	return 0;
 } 
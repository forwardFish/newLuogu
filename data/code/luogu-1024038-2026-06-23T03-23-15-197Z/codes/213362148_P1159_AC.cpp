#include<bits/stdc++.h>
using namespace std;
string Sup[101],Sdown[101],ans[101];
int up=0,down=0,now1=0,now2=0;
int n;
int main()
{
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		string s1,s2;
		cin>>s1>>s2;
		if(s2=="UP")
		{
			up++;
			Sup[up]=s1;
		}
		if(s2=="DOWN")
		{
			down++;
			Sdown[down]=s1;
		}
		if(s2=="SAME")
		{
			ans[i]=s1;
		}
	}
	for(int i=1;i<=n;i++)
	{
		if(ans[i]!="") continue;
		else
		{
			if(now1<down)
			{
				now1++;
				ans[i]=Sdown[now1];
			}
			else
			{
				now2++;
				ans[i]=Sup[now2];
			}
		}
	}
	for(int i=1;i<=n;i++)
		cout<<ans[i]<<endl;
	return 0;
}
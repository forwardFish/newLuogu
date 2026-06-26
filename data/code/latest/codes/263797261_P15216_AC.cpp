#include<bits/stdc++.h>
using namespace std;
int main()
{
	int n,m;
	cin>>n>>m;
	int a,b,c;
	cin>>a>>b>>c;
	a--;b--;c--;
	int cnt=0;
	while(a!=0 || b!=0 || c!=0)
	{
		cnt++;
		if(b!=0){b--;cout<<"I";}
		else if(a!=0){a--;cout<<"K";}
		else if(c!=0){c--;cout<<"T";}
		if(cnt%m==0) cout<<endl;
	}
	cout<<"KIT";
	return 0;
 }

#include<bits/stdc++.h>
using namespace std;
int main(){
	int n;
	cin>>n;
	for(int i=0;i<n;i++)
	{
		int a,b,c,d;
		cin>>a>>b>>c>>d;
		if((a<b&&a<c&&b<d&&c<d)||(c<a&&c<d&&a<b&&d<b)||(d<b&&d<c&&c<a&&b<a)||(b<d&&b<a&&d<c&&a<c)) 
		{
			cout<<"YES"<<endl;
		}
		else
		{
			cout<<"NO"<<endl;
		}
	}
	return 0;
}
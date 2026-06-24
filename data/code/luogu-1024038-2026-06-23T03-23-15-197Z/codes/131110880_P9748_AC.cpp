#include <bits/stdc++.h>
using namespace std;
int n,ans,num;
int main()
{
	cin>>n;
	while(n){
    	ans++;
    	if (n%3==1&&!num)
		{
      		num=ans;
    	}
    	n=n-(n+2)/3;
  	}
  	cout<<ans<<" "<<num<<endl;
  	return 0;
}
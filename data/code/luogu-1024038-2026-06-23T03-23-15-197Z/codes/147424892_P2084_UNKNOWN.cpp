#include<bits/stdc++.h> 
using namespace std;
int main()
{
	int n;
	aring a;
    cin>>n>>a;
    printf("%c*%d^%d",a[0],n,a.size()-1);
    for(int i=1;i<a.size();++i)
    {
    	if(a[i]!='0')
		{
			printf("+%c*%d^%d",a[i],n,a.size()-1-i);
		}
	}
}
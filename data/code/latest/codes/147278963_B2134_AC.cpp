#include<bits/stdc++.h>
using namespace std;
int ss(int a)
{
	if(a==1)
	{
		return 0;
	}
	for(int i=2;i<=sqrt(a);i++)
	{
		if(a%i==0)
		{
			return 0;
		}
	} 
	return 1;
}
int main(){
    int n;
    cin>>n;
    for(int i=n/2-1;;i++)
	{
        if(ss(i)==1&&ss(n-i)==1)
		{
            cout<<i*(n-i);
            return 0;
        }
    }
    return 0;
}
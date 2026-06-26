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
int num(int n)
{
    cout<<n<<"=";
    int i;
    for(i=2;i<n;i++)
    {
        if(ss(i)==0&&ss(n-i)==0)
        {
			cout<<i<<"+"<<n-i<<endl;
		}
	}
	return 0;
}
int main()
{
    int n;
    cin>>n;
    for(int i=4;i<=n;i+=2)
    {
        num(i);
    }
    return 0;
}
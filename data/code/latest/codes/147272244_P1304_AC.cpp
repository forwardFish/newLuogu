#include<bits/stdc++.h>
using namespace std;
int a[10001];
int ss(int n)
{
    int i;
    for(i=2;i<n;i++)
    {
        if(n%i==0) return 1;
    }
    return 0;
} 
void num(int n)
{
    cout<<n<<"=";
    for(int i=2;i<n;i++)
    {
        if(ss(i)==0&&ss(n-i)==0)
        {
			cout<<i<<"+"<<n-i<<endl;
		    break;
		}
    }
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
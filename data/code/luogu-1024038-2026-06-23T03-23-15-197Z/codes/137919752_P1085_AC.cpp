#include<bits/stdc++.h>
using namespace std;
int main ()
{
    int a,b,s,max=0,d=0;
    for(int i=1;i<=7;i++)
    {
        cin>>a>>b; 
        s=a+b;   
        if(s>max&&s>8)
		{
			max=s;
			d=i;
		}
    }
    cout<<d;
    return 0;             
}
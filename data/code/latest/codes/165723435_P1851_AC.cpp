
#include<bits/stdc++.h>
using namespace std;
int main()
{
    int s,a=0,b=0,c=0,d=0;
    cin>>s;
    for(int i=s;;i++)
    {
    	a=0,b=0,c=0,d=0;
	    a=i;
	    for(int j=1;j<=sqrt(a);j++)
	    {
		    if(a%j==0) 
			{
				c=c+j+a/j;	    
			}
		}
	    c=c-a;
	    b=c;
	    for(int j=1;j<=sqrt(b);j++)
	    {
		    if(b%j==0) 
			{
				d=d+j+b/j;
			}
	    }
	    d=d-b;
	    if(a==d && a>=s && a!=b)
	    {
	       cout<<a<<" "<<b;
	       return 0;	
	    } 
    }
    return 0;
}
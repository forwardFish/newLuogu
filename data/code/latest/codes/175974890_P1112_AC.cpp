#include<bits/stdc++.h>
using namespace std;
const int maxn=1e7+5;
const int maxm=35;
int k,l,r,l1,r1,a[maxm],b[maxn],len,t;
void pd(int x)
{
    for(int i=1;i<x;i++)
    {
    	for(int j=0;j<x;j++)
    	{
    		if(i!=j)
    		{
        		len=0;
        		t=0;
        		while(t<r)
        		{ 
            		len++;
            		if(len%2==0) 
					{
						a[len]=i;
					}
            		else 
					{
						a[len]=j;
					}
            		t=t*x+a[len];
            		if(t>r)
					{
						break;
					}
            		b[t]++;
        		}
    		} 
		}
	}
}
int main()
{
    cin>>l1>>r1>>l>>r>>k;
    for(int i=l1;i<=r1;i++) 
    {
    	pd(i);
	}
    for(int i=l;i<=r;i++)
    {
    	if(b[i]==k)
    	{
    		cout<<i<<endl;
		}
	}

    return 0;
}
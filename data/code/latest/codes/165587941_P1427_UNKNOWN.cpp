#include<bits/stdc++.h>
using namespace std; 
int a[100],c=0;
int main()
{
    for(int i=0;;i++)
	{
        cin>>a[i];
        if(a[i]==0)
		{
			break; 
		}
        c=i;
    }
    for(int j=c;j>=0;j--)
    {
    	cout<<x[j]<<" ";
	}
    return 0;
}
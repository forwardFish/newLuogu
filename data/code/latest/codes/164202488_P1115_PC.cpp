#include<bits/stdc++.h>
using namespace std;
int main()
{
   int n;
   cin>>n;
   int a[n],b[n],ans=-10005;
   for(int i=0;i<n;i++)
   {
       cin>>a[i];
       if(i==1) 
	   {
	   	    b[i]=a[i];
	   }
       else 
	   {
	   	    b[i]=max(a[i],b[i-1]+a[i]);
	   }
       ans=max(ans,b[i]);
   }
   cout<<ans;
   return 0;
}
#include<iostream>
using namespace std;
int main()
{
	int a[101]={0},b[101]={0},n;
    cin>>n;
    for (int i=0;i<n;i++)
    {
    	cin>>a[i];
	}
    for (int i=0;i<n;i++)
    {
    	for (int j=i;j>=0;j--)
        {
            if (a[j]<a[i])
            {
            	b[i]++;
			}
        }
	} 
    for (int i=0;i<n;i++) 
	{
		cout<<b[i]<<" ";	
	}
    return 0;
}
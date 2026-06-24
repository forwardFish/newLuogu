#include<bits/stdc++.h>
using namespace std;
int n;
int num[10];
int main(){
    cin>>n;
    for(int i=1;i<=n;i++)
	{
        num[i]=i;
        cout<<setw(5)<<num[i];
    }
    cout<<endl;
    while(1)
	{
        if(next_permutation(num+1,num+n+1)==false)
		{
            return 0;
        }
		else
		{
            for(int i=1;i<=n;i++)
			{
                cout<<setw(5)<<num[i];
            }
            cout<<endl;
        }
    }
    return 0;
}
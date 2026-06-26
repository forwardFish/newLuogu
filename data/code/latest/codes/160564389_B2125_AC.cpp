#include<bits/stdc++.h>
using namespace std;
int main(){
    int a;
	cin>>a;
    int max=-1;
	string map;
    for(int i=0;i<a;i ++)
	{
        int b;
		string c;
		cin>>b>>c;
        if(b>max)
		{
			max=b;
			map=c;
		}
    }
    cout<<map;
    return 0;
}
#include<bits/stdc++.h>
using namespace std;
int m,s,t,fla,run;
int main(){
	cin>>m>>s>>t;
	for(int i=1;i<=t;i++)
    {
		
		if(m>=10)m-=10,fla+=60,run+=17;
		else{if(fla>run)run=fla;
			m+=4,run+=17;} 

		if(max(fla,run)>=s){
			printf("Yes\n%d\n",i);return 0;} 
	}
	cout<<"No"<<endl<<max(fla,run)<<endl;
	return 0;
}
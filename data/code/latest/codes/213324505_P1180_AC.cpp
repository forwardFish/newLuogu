#include<bits/stdc++.h>
using namespace std;
int n;
double s,c,each,init,ans,km[55]={0},pr[55]={0};
void dfs(int jyz,double money,double last){
	if(jyz>n){
		if(money<ans) ans=money;
	}
	else{
		if(money>ans) return;
	
		else{
			last-=(km[jyz]-km[jyz-1])/each;
		
			if(last*each<km[jyz+1]-km[jyz]){
				dfs(jyz+1,money+20+pr[jyz]*(c-last),c);	
			}
			else if(last*2<c){
				dfs(jyz+1,money+20+pr[jyz]*(c-last),c);
				dfs(jyz+1,money,last);	
			}
			else dfs(jyz+1,money,last);
		}
	}
}
int main(){
	cin>>s>>c>>each>>init>>n;
	ans=init;
	km[n+1]=s;
	for(int i=1;i<=n;i++){
		cin>>km[i]>>pr[i];
		ans+=pr[i]*c+20;
	}
	dfs(1,init,c);
	printf("%.1lf",ans);
	return 0;
}

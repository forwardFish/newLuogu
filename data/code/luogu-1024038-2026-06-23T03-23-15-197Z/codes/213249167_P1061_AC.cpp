#include<bits/stdc++.h>
using namespace std;
int s,t,w,c;
int a[30],cnt;
inline void output()
{
	for(int i=1;i<=w;i++)
	cout<<(char)('a'+a[i]-1);
	cout<<endl;
}
void dfs(int pos,int step)
{
	if(pos==0)return;
	if(step==6)return;
	if(a[pos]<t&&a[pos]<a[pos+1]-1)
	{
		a[pos]++;
		for(int i=pos+1;i<=w;i++)
		a[i]=a[i-1]+1;
		output();
		dfs(w,step+1);
	}
	else dfs(pos-1,step);
}
int main()
{
	cin>>s>>t>>w;
	fflush(stdin);
	while((c=getchar())!=EOF)
	{
		int temp=c-'a'+1;
		if(temp>=1&&temp<=26)a[++cnt]=temp;
	}
	
	a[w+1]=0x7f;
	dfs(w,1);
	return 0;
}

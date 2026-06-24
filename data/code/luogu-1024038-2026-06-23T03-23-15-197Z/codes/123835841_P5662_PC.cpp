#include<bits/stdc++.h>
using namespace std;
inline int read() {
	int ans=0;
	char last=' ',ch=getchar();
	while(ch>'9'||ch<'0') last=ch,ch=getchar();
	while(ch>='0'&&ch<='9') ans=(ans<<1)+(ans<<3)+ch-'0',ch=getchar();
	if(last=='-') ans=-ans;
	return ans;
}
int a[110][110];
int b[101000];
int main() {
	int s,c,d;
	s=read();
	d=read();
	c=read();
	for(int i=1;i<=s;i++) 
		for(int j=1;j<=d;j++) 
			a[i][j]=read();
	int sum;
	for(int d=1;d<=s;d++) {
		sum=-0xfffffffff;
		b[0]=c;
		for(int i=1;i<=d;i++) {
			for(int j=a[d][i];j<=c;j++) 
				b[j]=max(b[j],b[j-a[d][i]]-a[d][i]+a[d+1][i]);
		}
		for(int j=0;j<=c;j++) 
			sum=max(sum,b[j]);
		c=sum;
	}
	cout<<c; 
	return 0;
}
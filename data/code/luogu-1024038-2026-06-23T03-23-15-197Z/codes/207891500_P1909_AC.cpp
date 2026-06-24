#include<cstdio>
#include<math.h>
int main(){
	double a,b,c,d,e,f,g;
	int x,y,z;
	int o,p,q;
	double h,i,j;
	scanf("%lf\n%lf%lf\n%lf%lf\n%lf%lf",&a,&b,&c,&d,&e,&f,&g);
	o=floor(a/b);
	h=a/b;
	if(o<h) o+=1;
	p=floor(a/d);
	i=a/d;
	if(p<i) p+=1;
	q=floor(a/f);
	j=a/f;
	if(q<j) q+=1;
	
	x=c*o;
	y=e*p;
	z=g*q;
	
	if(x<y&&y<z) printf("%d",x);
	if(x<z&&z<y) printf("%d",x);
	if(y<x&&x<z) printf("%d",y);
	if(y<z&&z<x) printf("%d",y);
	if(z<x&&x<y) printf("%d",z);
	if(z<y&&y<x) printf("%d",z);
	
	return 0;
} 
#include<bits/stdc++.h>
using namespace std;
int n;
struct node
{
	string name;
	int year,mon,day;
	int level;
}n1[105];
bool cmp(node a,node b)
{
	if(a.year != b.year)
	{
		return a.year < b.year;
	}
	else
	{
		if(a.mon != b.mon) 
		{
			return a.mon < b.mon;
		}
		else if(a.day == b.day && a.mon == b.mon) 
		{
			return a.level > b.level;
		}
		else if(a.day != b.day && a.mon == b.mon) 
		{
			return a.day < b.day;
		}
	}
}

int main()
{
	cin>>n;
	for(int i=0;i<n;++i)
	{
		cin>>n1[i].name>>n1[i].year>>n1[i].mon>>n1[i].day;
		n1[i].level = i;
	}
	stable_sort(n1,n1+n,cmp);
	for(int i=0;i<n;++i) 
	{
		cout<<n1[i].name<<endl;
	}
	return 0;
}

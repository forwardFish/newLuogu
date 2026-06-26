#include<bits/stdc++.h>
using namespace std;

struct stu
{
	string name;
	int china;
	int math;
	int engl;
	int sum=china+math+engl;
} ;

int main(){
	int n; double maxs=-1; cin>>n;
	stu s[n],maxss;
	for ( int i=0;i<n;i++ )
	{
		cin>>s[i].name>>s[i].china>>s[i].math>>s[i].engl;
		if ( s[i].sum>maxs )
    {maxss=s[i];maxs=s[i].sum}
    
	}
	cout<<maxss.name<<" "<<maxss.china<<" "<<maxss.math<<" "<<maxss.engl<<endl;

	return 0;
}


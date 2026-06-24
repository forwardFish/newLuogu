#include<bits/stdc++.h>
using namespace std;
vector<double> l;
bool check(vector<double> lengths,int k, double len)
{
    int count = 0;
    for (double l : lengths)
	{
        count+=static_cast<int>(l/len);
    }
    return count >= k;
}
int main() {
	int n,k;
	cin>>n>>k;
	double left = 0.00001;
    double right = 100000.0;
    double mid;
	for(int i=0;i<=100;i++)
	{
		mid=(left+right)/2.0;
		if(check(l,k,mid))
		{
			left=mid;
		 } 
		 else right=mid;
	}
    printf("%0.4lf",left);
	return 0;
} 
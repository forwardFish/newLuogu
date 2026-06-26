#include<bits/stdc++.h>
using namespace std; 
int main()
{
	string s;
   	cin >> s;
    int totalCost = 0;
    for (char c : s)
	{
        int minCost=INT_MAX;
        for (char target = 'A'; target <= 'Z'; ++target)
		{
            int cost=abs(c - target);
            minCost=min(minCost, cost);
        }
        totalCost += minCost;
    }

    cout<<totalCost<<endl;
    return 0;
}

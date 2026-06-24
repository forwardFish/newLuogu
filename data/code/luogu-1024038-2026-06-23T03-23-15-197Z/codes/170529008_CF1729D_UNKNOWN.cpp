#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    int t;
    cin >> t;
    while (t--)
	{
        int n;
        cin >> n;
        vector<int> c(n);
        vector<int> b(n);
        for (int i = 0; i < n; ++i) cin >> c[i];
        for (int i = 0; i < n; ++i) cin >> b[i];
        vector<pair<int, int>> d(n);
        for (int i = 0; i < n; ++i)
		{
            d[i]={b[i]-c[i],i};
        }
        sort(d.rbegin(),d.rend());
        int ans=0;
        vector<bool> u(n, false);
        for (int i=0;i<n;++i)
		{
            if (u[d[i].second]) 
			{
				continue;
			}
            int f1=d[i].second;
            u[f1]=true;
            for (int j=i+1;j<n;++j)
			{
                if (u[d[j].second]) 
				{
					continue;
				}
                int s=d[j].second;
                if (b[f1]+b[s]>=c[f1]+c[s])
				{
                    u[s] = true;
                    ans++;
                    break;
                }
            }
        }
        cout<<ans<<endl;
    }
    return 0;
}

#include<bits/stdc++.h>
using namespace std;
int main() 
{
    int n;
    cin>>n;
    vector<int> nums(n);
    for (int i=0;i<n;++i)
	{
        cin>>nums[i];
    }
    vector<int> lis;
    for (int i=0;i<n;++i) 
    {
        auto it=upper_bound(lis.begin(), lis.end(), nums[i]);
        if (it==lis.end()) 
		{
            lis.push_back(nums[i]);
        }
		else
		{
            *it=nums[i];
        }
    }
    cout<<lis.size()<<endl;
    return 0;
}
//严格lis
//单调栈
//对于能接在后面且不破坏单调栈单调性质的，就接在后面
//如果不能，就在单调栈中二分找到第一个大于等于ai的位置，用ai替换
//最终单调栈的size即lis长度 

/*
对于严格lis 找第一个大于等于的位置替换 
非严格lis 找第一个大于的位置替换 

对于严格的最长下降子序列 找第一个小于等于的位置替换
对于非严格的最长下降子序列 找第一个小于的位置替换 

Dilworth定理
求最长非严格下降子序列
求数组最少能被划分为多少个非严格下降子序列 等于严格最长上升子序列的长度
 	  最少能被划分为多少个严格下降子序列 等于非严格最长上升子序列的长度
 	  最少能被划分为多少个非严格上升子序列 等于严格最长下降子序列的长度
 	  最少能被划分为多少个严格上升子序列 等于非严格最长下降子序列的长度
*/ 

/*
LIS 最长上升子序列 
LCS 最长公共子序列
*/


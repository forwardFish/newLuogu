#include <iostream>
#include <string>
using namespace std;

string getPreOrder(string in, string post) {
    if (post.empty()) return "";
    char root = post.back();
    int pos = in.find(root);
    int leftSize = pos;
    string leftIn = in.substr(0, pos);
    string leftPost = post.substr(0, leftSize);
    string rightIn = in.substr(pos + 1);
    string rightPost = post.substr(leftSize, post.size() - leftSize - 1);
    return root + getPreOrder(leftIn, leftPost) + getPreOrder(rightIn, rightPost);
}

int main() {
    string inOrder, postOrder;
    cin >> inOrder >> postOrder;
    cout << getPreOrder(inOrder, postOrder) << endl;
    return 0;
}
#include <cstdio>
#include <cctype>
#include <cstdlib>
#include <cstring>

struct Block {
    char ch;
    long long count;
};

#define MAX_BLOCKS 100000 
Block blocks[MAX_BLOCKS];
int block_count = 0;

int main() {

    char input[200002];
    fread(input, 1, sizeof(input), stdin);
    
    char* s_prime = strtok(input, "\n\r");
    char* c_str = strtok(NULL, "\n\r");
    long long c = strtoll(c_str, NULL, 10);
    
    int i = 0;
    while (s_prime[i] && block_count < MAX_BLOCKS) {
        if (!isalpha(s_prime[i]) || !isdigit(s_prime[i+1])) return 1;
        
        char ch = s_prime[i++];
        
        long long cnt = 0;
        while (isdigit(s_prime[i]) && i < strlen(s_prime)) {
            cnt = cnt * 10 + (s_prime[i] - '0');
            if (cnt > 1e18) cnt = 1e18; 
            i++;
        }
        
        blocks[block_count++] = {ch, cnt > 0 ? cnt : 1}; 
    }
    
    long long total = 0;
    for (int j = 0; j < block_count; ++j) {
        if (total > LLONG_MAX - blocks[j].count) total = LLONG_MAX;
        else total += blocks[j].count;
    }
    
    long long k = (total == 0) ? 0 : c % total;
    long long current = 0;
    for (int j = 0; j < block_count; ++j) {
        if (k < current + blocks[j].count) {
            printf("%c\n", blocks[j].ch);
            return 0;
        }
        current += blocks[j].count;
    }
    
    return 1; 
}
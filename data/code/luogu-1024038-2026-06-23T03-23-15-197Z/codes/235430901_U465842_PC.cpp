#include <stdio.h>
#include <stdlib.h>

#define HASH_SIZE 100000

typedef struct {
    int key;
    int value;
    int next;
} HashNode;

typedef struct {
    HashNode nodes[HASH_SIZE];
    int head[HASH_SIZE];
    int size;
} HashMap;

void initHashMap(HashMap *map) {
    map->size = 0;
    for (int i = 0; i < HASH_SIZE; ++i) {
        map->head[i] = -1;
    }
}

int hash(int key) {
    return abs(key) % HASH_SIZE;
}

void insertHashMap(HashMap *map, int key, int value) {
    int h = hash(key);
    map->nodes[map->size].key = key;
    map->nodes[map->size].value = value;
    map->nodes[map->size].next = map->head[h];
    map->head[h] = map->size++;
}

int findHashMap(HashMap *map, int key) {
    int h = hash(key);
    for (int i = map->head[h]; i != -1; i = map->nodes[i].next) {
        if (map->nodes[i].key == key) {
            return map->nodes[i].value;
        }
    }
    return -1;
}

void findTwoSum(int *nums, int n, int target, int *result) {
    HashMap map;
    initHashMap(&map);
    for (int i = 0; i < n; ++i) {
        int complement = target - nums[i];
        int index = findHashMap(&map, complement);
        if (index != -1) {
            result[0] = index;
            result[1] = i;
            return;
        }
        insertHashMap(&map, nums[i], i);
    }
    result[0] = -1;
    result[1] = -1;
}

int main() {
    int n, k;
    scanf("%d %d", &n, &k);
    int *nums = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; ++i) {
        scanf("%d", &nums[i]);
    }
    int result[2];
    findTwoSum(nums, n, k, result);
    printf("%d %d\n", result[0], result[1]);
    free(nums);
    return 0;
}

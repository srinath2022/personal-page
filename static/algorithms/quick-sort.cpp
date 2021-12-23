#include <iostream>
using namespace std;

void EXCHANGE(int * A, int i, int j){
	int tmp = A[i];
	A[i] = A[j];
	A[j] = tmp;
}

int PARTITION(int * A, int p, int r){
	int pivot = A[r];
	int i = p-1;
	for(int j=p ; j<r ; j++){
		if(A[j] <= pivot){
			i = i+1;
			EXCHANGE(A, i, j);
		}
	}
	EXCHANGE(A, i+1, r);
	return i+1;	
}

void QUICKSORT(int * A, int p, int r){
	if(p < r){
		int q = PARTITION(A, p, r);
		QUICKSORT(A, p, q-1);
		QUICKSORT(A, q+1, r);
	}
}

void print_array(int A[], int N) {
	for(int i=0; i<N; i++){ cout << A[i] << " ";}
	cout<<endl;
}

int main() {
	int N;
	cin >> N;
	int A[N];
	for(int i=0; i<N ; i++){ cin >> A[i];}

	print_array(A, N);
	QUICKSORT(A, 0, N-1);
	print_array(A, N);
}
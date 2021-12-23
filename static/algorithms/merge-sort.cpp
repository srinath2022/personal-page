#include <iostream>
using namespace std;

void MERGE(int * A, int p, int q, int r) {
	int n1 = q-p+1;
	int n2 = r-q; // not considering q
	int L[n1+1];
	int R[n2+1];

	for(int i=0; i<n1; i++){
		L[i] = A[p+i];
	}
	L[n1] = INT_MAX;

	for(int i=0; i<n2; i++){
		R[i] = A[q+i+1];
	}
	R[n2] = INT_MAX;

	int i = 0;
	int j = 0;
	for(int k=p; k<=r ; k++){
		if(L[i] <= R[j]){
			A[k] = L[i];
			i = i+1;
		}else {
			A[k] = R[j];
			j = j+1;
		}
	}
	return;
}

void MERGE_SORT(int * A, int p, int r) {
	if(p < r){
		int q = (p+r)/2;
		MERGE_SORT(A, p, q);
		MERGE_SORT(A, q+1, r);
		MERGE(A, p, q, r);
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
	MERGE_SORT(A, 0, N-1);
	print_array(A, N);
}
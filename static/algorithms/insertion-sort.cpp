/* insertion sort */
#include <iostream>
using namespace std;

void insertion_sort(int * A, int N){
	if(A == NULL || N <= 1) return;
	for(int j=1; j<N; j++){
		for(int i=j-1; i>=0; i--){
			if(A[i] < A[i+1]) break;
			else{
				int tmp = A[i];
				A[i] = A[i+1];
				A[i+1] = tmp;
			}
		}
	}
}

void print_array(int A[], int N){
	for(int i=0; i<N; i++){ cout << A[i] << " ";}
	cout<<endl;
}

int main(){
	int N;
	cin >> N;
	int A[N];
	for(int i=0; i<N ; i++){ cin >> A[i];}

	print_array(A, N);
	insertion_sort(A, N);
	print_array(A, N);
}
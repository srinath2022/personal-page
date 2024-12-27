# Rough Work

## ML

**Losses**

  - Focal loss
  - Class balanced loss   

### Relevant python libraries

  1. **numpy**
      - *np.array, arr.copy(), arr.dtype, arr.astype(np.float32), np.nan, np.inf, arr.shape, np.ones((2, 3)), np.zeros(4), np.zeros_like(arr), np.ones_like(arr, dtype=np.int32)*
      - *np.arange(a, b), np.linspace(a, b, num=k, dtype=np.float32), np.reshape(arr, (m, n)), arr.flatten(), np.transpose(arr, axes=(1, 2, 0))*
      - *np.exp, np.exp2, np.log, np.log2, np.e, np.pi, np.power(3, arr), np.matmul(arr1, arr2)*
      - *np.random.randint(-3, high=14, size=(2, 2)), np.random.seed(9), np.random.shuffle(matrix), np.random.uniform(), np.random.normal(), np.random.choice(colors)*
      - *np.argmin, np.argmax, np.isnan(arr), np.where(arr!=3), np.where(np_filter, positives, negatives), np.any, np.all, arr.min(), arr.max()*
      - *np.mean(arr), np.var(arr), np.median(arr), np.sum(arr), np.cumsum(arr), np.concatenate([arr1, arr2]), np.save('arr.npy', arr), np.load('file')*
    
  2. **pandas**
     - hh
     - 

## GPUs, VLLM

Know GPU info
  - nvidia-smi (for info about NVDIA GPUs)
  - lshw

- https://docs.vllm.ai/en/v0.5.5/getting_started/quickstart.html
- 

## LLM
PagedAttention
FlashAttention

Tensor parallelism
Pipeline parallelism

LoRA - https://arxiv.org/pdf/2106.09685
- 

Speculative Decoding
 - https://pytorch.org/blog/hitchhikers-guide-speculative-decoding/
 - https://docs.vllm.ai/en/v0.5.5/models/spec_decode.html

Chunked Prefill
- https://docs.vllm.ai/en/v0.5.5/models/performance.html#chunked-prefill
- It helps achieve better GPU utilization by locating compute-bound (prefill) and memory-bound (decode) requests to the same batch. ?? means..

Prefix/Prompt Caching


Quantization
- https://huggingface.co/docs/transformers/en/quantization/overview
- AWQ?
- weight quantization? activation quantization? GPTQ?, bitsandbytes
- FP16, BF16?

## Jargon
**NCCL (NVIDIA Library)**
NCCL (NVIDIA Collective Communications Library) is a library developed by NVIDIA to accelerate multi-GPU and multi-node training in deep learning and other parallel computing applications. It is designed to provide high-performance communication primitives optimized for NVIDIA GPUs, allowing efficient data transfer and synchronization across multiple GPUs.

All-Reduce: Aggregates data across GPUs (e.g., sum, max).   
Broadcast: Distributes data from one GPU to all others.   
Reduce: Aggregates data to a single GPU.   
All-Gather: Gathers data from all GPUs into all GPUs.   
Reduce-Scatter: Combines reduce and scatter operations.   


## Python Libraries
vllm - LLM, SamplingParams
LLMs - AutoModelForCausalLM, 
transformers - AutoTokenizer
bitsandbytes, #Quantization
lm_eval, #Evaluation
pytorch
- Post-training : AutoGPTQ
- Quantization Aware Training QAT : bitsandbytes


# TO-DO
CUDA
- https://blogs.nvidia.com/blog/what-is-cuda-2/
- https://pytorch.org/docs/stable/notes/cuda.html
- 

# Rough Work

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

Speculative Decoding
 - https://pytorch.org/blog/hitchhikers-guide-speculative-decoding/
 - https://docs.vllm.ai/en/v0.5.5/models/spec_decode.html

Chunked Prefill
- https://docs.vllm.ai/en/v0.5.5/models/performance.html#chunked-prefill
- It helps achieve better GPU utilization by locating compute-bound (prefill) and memory-bound (decode) requests to the same batch. ?? means..

Prefix/Prompt Caching


Quantiztion
- AWQ?
- weight quantization? activation quantization?
- FP16, BF16?
- 

## Jargon
NCCL ? - 


## Python Libraries
vllm - LLM, SamplingParams
transformers - AutoTokenizer
bitsandbytes, #Quantization
lm_eval, #Evaluation

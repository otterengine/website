---
title: Memory Management
description: A concise summary of memory management in Otter Engine.
---

## Introduction

Memory management is a very important part of any project, and Otter is no different.
The way memory is handled can make or break the performance and safety of games.
So, it is important to understand how memory is managed in Otter.

## Summary

Memory management in Otter is built on a few fundamental values:

- **Safety**: It would suck if your game keeps crashing because there is a null pointer floating around somewhere. So, pointers in Otter are _guaranteed_ to **never** be null.
- **Performance**: Speedy memory allocation and deallocation is critical,
so Otter provides various different [allocators](#allocators), that are optimized for specific use cases.
- **Abstraction**: Every allocator implements a common interface, so that you can use any allocator in any part of the engine.
- **Explicitness**: All memory allocations are explicit, and all deallocations are explicit too. This makes it easier to prevent memory leaks.

## Allocators

Otter provides a variety of allocators, each with different advantages and disadvantages. Below is a list of the most common ones, each with a short description, in no particular order.

- **Fixed Buffer Allocator** - This allocator uses a fixed-sized buffer to allocate memory, and does not require any deallocations. For small allocations, this can be _extremely_ fast, as there is no reason to reach out to the heap.

- **Page Allocator** - This allocator allocates memory from the operating system's memory page table. Because it requests entire pages for each allocation, no matter the size, it is not suited for regular use. It is mostly just the backend of some other allocators.

- **Arena Allocator** - This allocator wraps another allocator, and allocates memory from it. The arena provides a user friendly interface, by allowing you to allocate as many times as needed, and only needing to free once.

### Work-in-progress allocators

These allocators are not yet functional, but will be soon.

- **C Allocator** - This allocator uses the C standard library to allocate memory. It can be really fast, but is not as portable as other allocators. This is because it requires linking a C library, which is not always possible.

- **General Purpose Allocator** - This allocator is the most common one, and can be used for any number allocations, with different sizes, at relatively good performance.

## Examples

Here are some short code snippets for each of the allocators above. Starting with an example of how to use the generic allocator interface.

### Generic Allocator Interface

```c wrap
otter_allocator_t allocator = /* Get the allocator interface from any of the allocators. */;

/* 
 * There are two types of allocations, single item, and slices.
 * Slices are practically a "fat pointer", a pointer to the first element, and * the total number of elements. Single item pointers just point to a single * * element.
 */

 /* Here, we create the variables we will later be populating. */
int *single_int;
int *another_int;
float *single_float;
double *single_double;
void *raw_allocation;

otter_slice_t int_slice;
otter_slice_t aligned_int_slice;
otter_slice_t raw_byte_slice;

/* Allocators return a result to indicate success or failure. */
otter_result_t result;

/* Now, we can allocate memory! */

/* Here, we allocate a single int. The macro will also ensure that the pointer is naturally aligned. */
result = otter_allocator_create_t(allocator, int, single_int);

/* Checking the result here is omitted for brevity, and will be for the rest of the examples. */

/* We can now use the single_int pointer to do whatever we want! */
*single_int = 42;

/* We still allocate a single int here, but we manually specify the alignment. */
result = otter_allocator_aligned_create_t(allocator, int, 16, single_int);

/* Below is the same thing we did for integers, but with the two different floating point types. The macros that end with `_t` will automatically allocator the right size for you. */

result = otter_allocator_create_t(allocator, float, single_float);
result = otter_allocator_create_t(allocator, double, single_double);

*single_float = 42.0f;
*single_double = 42.0;

/* You can also allocate raw bytes, with explicit size and alignment, this is a bit more dangerous, but can be really useful. */
result = otter_allocator_create(allocator, 1024, 16, &raw_allocation);

/* Next, we allocate a slice. */
result = otter_allocator_alloc_t(allocator, int, 8, &int_slice);

/* We can now use the slice to do whatever we want! */
OTTER_CAST(int *, int_slice.ptr)[0] = 42;

/* We still allocate a slice here, but we manually specify the alignment. */
result = otter_allocator_aligned_alloc_t(allocator, int, 16, 8, &aligned_int_slice);

/* We can now use the slice to do whatever we want! */
OTTER_CAST(int *, aligned_int_slice.ptr)[0] = 42;

/* We can also allocate raw bytes, with explicit element size, count and alignment, this is a bit more dangerous, but can be really useful. */
result = otter_allocator_alloc(allocator, 1, 1024, 16, &raw_byte_slice);

/* Don't forget to clean up all the allocations! `destroy` is used for single items, and `free` is used for slices. */
otter_allocator_destroy_t(allocator, int, single_int);
otter_allocator_aligned_destroy_t(allocator, int, 16, single_int);
otter_allocator_destroy(allocator, 1024, 16, raw_allocation);
otter_allocator_destroy_t(allocator, float, single_float);
otter_allocator_destroy_t(allocator, double, single_double);
otter_allocator_free_t(allocator, int, int_slice);
otter_allocator_aligned_free_t(allocator, int, 16, aligned_int_slice);
otter_allocator_free(allocator, 1, 1024, raw_byte_slice);

/* De-initialize the allocator implementation if needed here. */
```

### Fixed Buffer Allocator

```c wrap
otter_byte_t buffer[1024]; /* We use a fixed buffer of 1024 bytes, this is where all allocations will take place. */
otter_slice_t slice = otter_slice_init(buffer, 1024); /* Create a slice from the buffer. */
otter_fba_t fba;
otter_allocator_t allocator;

/* Initialize the fba. */
otter_fba_reset(&fba);
fba.buffer = buffer;

/* Now, we can get the allocator from the fba to actually perform allocations! */
allocator = otter_fba_allocator(&fba);
```

### Page Allocator

```c wrap
/* Creating a page allocator is really simple, as it does not track any state. */
otter_allocator_t allocator = otter_page_allocator();
```

### Arena Allocator

```c wrap
/* In this example, we use the page allocator as the backing allocator for the arena. */
otter_arena_allocator_t arena = otter_arena_allocator_init(otter_page_allocator());

/* Get the allocator from the arena. */
otter_allocator_t allocator = otter_arena_allocator(&arena);

/* When you are done, free all the memory at once. */
otter_arena_allocator_fini(&arena);
```

## Credits

Without these people/sources, this part of Otter would not have been possible.

- [Zig](https://ziglang.org/), the Zig standard library served as a foundational resource for the initial implementation of the various allocators.
- [Olle](https://github.com/Olle-Lukowski), the maintainer of the engine.

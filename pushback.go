// thoughts so far:
// it is definitely possible to make an application stop crashing, by detecting
// we're over limit and stopping new allocations.
// the
package main

import (
	"bytes"
	"fmt"
	"os"
	"runtime"
	"runtime/debug"
	"strconv"
)

// Not thread safe.
var enabled = true
var targetHeap uint64
var limit = ^uint64(0)
var gcpc = uint64(100)

func checkMem() bool {
	var mem runtime.MemStats
	runtime.ReadMemStats(&mem)
	fmt.Println("HeapAlloc", mem.HeapAlloc, "HeapSys", mem.HeapSys, "NextGC", mem.NextGC)
	if mem.HeapSys > limit || mem.NextGC > limit {
		// fmt.Printf("==> %#v\n", mem)
		pc := 100 * (limit - mem.HeapAlloc) / mem.HeapAlloc
		if pc <= 0 || pc > 100 {
			pc = 1
		}
		fmt.Println("pc:", pc, "gcpc:", gcpc)
		if mem.HeapAlloc > limit/2 {
			debug.SetGCPercent(int(pc))
			if pc < gcpc {
				gcpc = pc
				return false
			}
		}
	} else if gcpc <= 100 {
		gcpc = 100
		fmt.Println("reset pc")
		debug.SetGCPercent(100)
	}
	return true
}

func main() {
	fmt.Println("mem", os.Getenv("MEMLIMIT"))
	if lim := os.Getenv("MEMLIMIT"); lim != "" {
		nlim, err := strconv.Atoi(lim)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Unexpected MEMLIMIT format %q, wanted a number\n", lim)
		} else {
			limit = uint64(nlim)
			fmt.Fprintf(os.Stderr, "memlimit=%d\n", limit)
		}
	}

	buf := new(bytes.Buffer)
	done := 0
	for i := 0; ; i++ {
		if checkMem() {
			buf.Write(bytes.Repeat([]byte("weeeee"), 2048))
			done++
		} else {
			fmt.Println("in pushback")
			buf.Truncate(0)
		}
		fmt.Println(i, done)
	}

	return
}

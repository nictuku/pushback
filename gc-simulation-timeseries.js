var redraw = function() {
    var goGC = Number(document.getElementsByName("goGC")[0].value);
    var limit = Number(document.getElementsByName("limit")[0].value);
    var extra = Number(document.getElementsByName("nonHeap")[0].value);
    var garbageMbps = Number(document.getElementsByName("garbageMbps")[0].value);
    var inUseHeap = Number(document.getElementsByName("inUseHeap")[0].value);
    var elephant = Number(document.getElementsByName("elephant")[0].value);
    var cacheBloat = Number(document.getElementsByName("cacheBloat")[0].value);

    var xLength = 1000;
    var timeXVals = [...Array(xLength).keys()];
    var extraMemoryVals = [...Array(xLength).fill(extra)];
    var inUseHeapMBVals = [...Array(xLength).fill(inUseHeap)];

    var garbageMbpsVals = Array(xLength).fill(garbageMbps);

    var crazyPeriods = [{
        x: 50,
        duration: 150,
        inUseHeapMB: cacheBloat,
    }, {
        x: 350,
        duration: 100,
        garbageMbps: elephant,
    }, {
        x: 700,
        duration: 150,
        garbageMbps: elephant,
        inUseHeapMB: cacheBloat,
    }]

    for (c of crazyPeriods) {
        for (i = c.x; i < c.x + c.duration; i++) {
            if (c.garbageMbps) {
                garbageMbpsVals[i] = c.garbageMbps;
            }
            if (c.inUseHeapMB) {
                inUseHeapMBVals[i] = c.inUseHeapMB;
            }
        }
    }

    // These values are updated during the simulation.
    var memoryUsageVals = Array(xLength).fill(0);
    var memoryUsageNewVals = Array(xLength).fill(0);
    var gcTriggerVal = 1;
    var newGCTriggerVal = 1;


    var gcFunc = function(x) { // rename
        //return goGC/100*x+x+extra;
        var h = inUseHeapMBVals[x];
        return goGC / 100 * h + h;
    }

    var newGcFunc = function(x) { // rename
        var totalUsage = Math.min(memoryUsageNewVals[x] + extraMemoryVals[x], limit);
        var h = inUseHeapMBVals[x];
        var val = (1 - totalUsage / limit) * goGC / 100 * h + h;
        console.log("x, h, total, val, limit", x, h, totalUsage, val, limit);
        return val;

    }

    var memLimit = {
        x: timeXVals,
        y: timeXVals.map(i => limit),
        line: {
            color: "rgb(255,0,0)"
        },
        mode: "lines",
        name: "Container Memory Limit",
        type: "scatter"
    };

    var extraMemory = {
        x: timeXVals,
        y: extraMemoryVals,
        line: {
            color: "yellow",
        },
        mode: "lines",
        name: "Non-heap Memory Usage",
        type: "scatter"
    };

    var memoryUsageFunc = function(x) {
        if (x == 0) {
            prev = 0
        } else {
            prev = memoryUsageVals[x - 1];
        }
        memoryUsageVals[x] = prev + garbageMbpsVals[x];

        if (memoryUsageVals[x] > gcTriggerVal) {
            gcTriggerVal = gcFunc(x);
            console.log("GC!", x, memoryUsageVals[x], gcTriggerVal);
            memoryUsageVals[x] = inUseHeapMBVals[x];
        }
        return memoryUsageVals[x] + extraMemoryVals[x];
    }

    var memoryUsageNewFunc = function(x) {
        if (x == 0) {
            prev = 0
        } else {
            prev = memoryUsageNewVals[x - 1];
        }
        memoryUsageNewVals[x] = prev + garbageMbpsVals[x];
        if (memoryUsageNewVals[x] > newGCTriggerVal) {
            newGCTriggerVal = newGcFunc(x);
            console.log("new GC!", x, memoryUsageNewVals[x], newGCTriggerVal);
            memoryUsageNewVals[x] = inUseHeapMBVals[x];
        }
        return memoryUsageNewVals[x] + extraMemoryVals[x];
    }

    var memoryUsage = {
        x: timeXVals,
        y: timeXVals.map(memoryUsageFunc),
        line: {
            color: "gray"
        },
        mode: "lines",
        name: "OldGC Memory usage",
        type: "scatter"
    };

    var memoryUsageNew = {
        x: timeXVals,
        y: timeXVals.map(memoryUsageNewFunc),
        line: {
            color: "blue"
        },
        mode: "lines",
        name: "NewGC Memory usage",
        type: "scatter"
    };

    var inUseHeapMBVals = {
        x: timeXVals,
        y: inUseHeapMBVals,
        line: {
            color: "brown"
        },
        mode: "lines",
        name: "In Use Heap",
        type: "scatter"
    };


    console.log("memoryUsageNew", memoryUsageNew);

    var data = [
        memoryUsage, memLimit, memoryUsageNew, inUseHeapMBVals, extraMemory,
    ];

    var annotationFunc = function() {
        return crazyPeriods.map(function(p) {
            var text = []
            if (p.garbageMbps) {
                text.push("High garbage gen")
            }
            if (p.inUseHeapMB) {
                text.push("High InUse Mem")
            }
            return {
                x: (p.x + p.duration / 2),
                y: 1000,
                xref: 'x',
                yref: 'y',
                text: text.join('<br>'),
                showarrow: false,
                // arrowhead: 1,
                ax: 0,
                ay: 40,
                bordercolor: "gray",
                borderwidth: 1,
                borderpad: 4
            }
        })
    }
    var layout = {
        paper_bgcolor: "rgb(255,255,255)",
        plot_bgcolor: "rgb(229,229,229)",
        xaxis: {
            gridcolor: "rgb(255,255,255)",
            range: [timeXVals[0], timeXVals[-1]],
            showgrid: true,
            showline: false,
            showticklabels: true,
            tickcolor: "rgb(127,127,127)",
            ticks: "outside",
            zeroline: false,
            title: "Time",
            tick0: 0,
            dtick: 20,
        },
        yaxis: {
            gridcolor: "rgb(255,255,255)",
            range: [0], // , 6000],
            showgrid: true,
            showline: false,
            showticklabels: true,
            tickcolor: "rgb(127,127,127)",
            ticks: "outside",
            zeroline: false,
            title: "Peak Container Memory Usage",
        },
        annotations: annotationFunc(),
    };



    Plotly.newPlot("myDiv", data, layout);
};

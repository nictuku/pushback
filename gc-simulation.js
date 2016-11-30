
var goGC = 50;
var extra = 1;
var limit = 8;

var reachableHeapVals = [...Array(limit-extra+1).keys()];

var upperBoundFunc = function(x) { // rename
	return (1-minMemFunc(x)/limit)*goGC/100*x+x+extra;
}

var minMemFunc = function(x) {
	return (1-(extra+x)/limit)*goGC/100*x+x+extra;
}

var memLimit = {
  x: reachableHeapVals, 
  y: reachableHeapVals.map(i => limit),
  line: {color: "rgb(255,0,0)"}, 
  mode: "lines", 
  name: "Container Memory Limit", 
  type: "scatter"
};

var extraMemory = {
  x: reachableHeapVals, 
  y: reachableHeapVals.map(i => extra),
  line: {color: "rgb(0,0,255)"}, 
  mode: "lines", 
  name: "Non-heap Memory Usage", 
  type: "scatter"
};


var errorBand = {
  x: reachableHeapVals.concat(reachableHeapVals.slice().reverse()),
  y: reachableHeapVals.map(upperBoundFunc).concat(reachableHeapVals.map(minMemFunc).slice().reverse()),
  fill: "tozeroy", 
  fillcolor: "lightgreen", 
  line: {color: "transparent"}, 
  name: "New GC Behavior", 
  showlegend: true, 
  type: "scatter"
};

console.log("woo", errorBand.x);

var gcFunc = function(x) { // rename
	return goGC/100*x+x+extra;
}

var normalGC = {
  x: reachableHeapVals, 
  y: reachableHeapVals.map(gcFunc), 
  line: {color: "rgb(231,107,243)"}, 
  mode: "lines", 
  name: "Current GC behavior", 
  type: "scatter"
};


var minMem = {
  x: reachableHeapVals, 
  y: reachableHeapVals.map(minMemFunc), 
  line: {color: "rgb(0,255,243)"}, 
  mode: "lines", 
  name: "minMem", 
  type: "scatter"
};



var data = [ normalGC, memLimit, errorBand, extraMemory]; // + minMem
var layout = {
  paper_bgcolor: "rgb(255,255,255)", 
  plot_bgcolor: "rgb(229,229,229)", 
  xaxis: {
    gridcolor: "rgb(255,255,255)", 
    range: [reachableHeapVals[0], reachableHeapVals[-1]], 
    showgrid: true, 
    showline: false, 
    showticklabels: true, 
    tickcolor: "rgb(127,127,127)", 
    ticks: "outside", 
    zeroline: false,
	 title: "Heap In Use"
  }, 
  yaxis: {
    gridcolor: "rgb(255,255,255)", 
	 range: [0, 10],
    showgrid: true, 
    showline: false, 
    showticklabels: true, 
    tickcolor: "rgb(127,127,127)", 
    ticks: "outside", 
    zeroline: false,
	 title: "Peak Container Memory Usage",
  }
};

Plotly.newPlot("myDiv", data, layout);

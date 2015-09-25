var drawvitalityscatter = function(data) {
  result = $.parseJSON(data);
  if (result.success) {
  
    var color = d3.scale.quantize()
        .range(["#FF0000", "#FFCF01", "#00B2EF", "#17AF4B"]);

    var size = 400;

    var pack = d3.layout.pack()
        .sort(null)
        .size([size, size])
        .value(function(d) { return d.commit_count * d.commit_count; })
        .padding(5);

    var svg = d3.select("body").append("svg")
        .attr("width", size)
        .attr("height", size);

    var exoplanets = result.data;
    console.log(exoplanets);
    exoplanets.sort(function(a, b) {
      return isFinite(a.distance) || isFinite(b.distance)
          ? a.distance - b.distance
          : 0;
    });

    color.domain(d3.extent(exoplanets, function(d) { return d.commit_count; }));

    svg.selectAll("circle")
        .data(pack.nodes({children: exoplanets}).slice(1))
      .enter().append("circle")
        .attr("r", function(d) { return d.r; })
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .style("fill", function(d) { return color(d.commit_count); })
      .append("title")
        .text(function(d) {
          return d.reponame
              + "\nCommit Count: " + d.commit_count;
        });


    function type(d) {
      d.commit_count = +d.commit_count;
      d.distance = d.distance ? +d.distance : Infinity;
      return d;
    }

    d3.select(self.frameElement).style("height", size + "px");


  } else {
    errorcallback(data)
  }
}

var errorcallback = function(error) {
  // handle the error
  return false;
}
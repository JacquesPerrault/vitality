var drawcommittotals = function(data) {
  result = $.parseJSON(data);
  if (result.success) {
    payload = result.data; 
    var container = document.getElementById('committotals');
    var groups = new vis.DataSet();
    var items = [];
    var start = '07/22/2015'; //payload[0].x.substring(0,10);
    var end   = payload[payload.length - 1].x.substring(0,10);

    groups.add({id: 0, content: "External"})
    groups.add({id: 1, content: "Internal"})

    $.each(payload, function( index, value ) {
      items.push(value);
    });

    var dataset = new vis.DataSet(items);
    var options = {
      style:'bar',
      stack:true,
      legend: false,
      barChart: {width:50, align:'center', sideBySide:true}, // align: left, center, right
      drawPoints: false,
      orientation:'top',
      height:'300px',
      start: start,
      end: end
    };
    var graph2d = new vis.Graph2d(container, items, groups, options);

    populateExternalLegend("legend1", groups, graph2d);
  } else {
    errorcallback(data)
  }
}

var errorcallback = function(error) {
  // handle the error
  return false;
}
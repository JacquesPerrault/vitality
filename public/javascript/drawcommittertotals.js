var drawcommittertotals = function(data) {
  result = $.parseJSON(data);
  if (result.success) {
    payload = result.data; 
    var container = document.getElementById('committertotals');
    var groups = new vis.DataSet();
    var items = [];
    var start = '07/19/2015'; //payload[0].x;
    var end   = payload[payload.length - 1].x;
    
    groups.add({id: 0, content: "External"})
    groups.add({id: 1, content: "Internal"})
    
    $.each(payload, function( index, value ) {
      items.push(value);
    });
    //console.log(items);



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

    var graph2d = new vis.Graph2d(container, dataset, groups, options);

    populateExternalLegend("legend2", groups, graph2d);

  } else {
    errorcallback(data)
  }
}

var errorcallback = function(error) {
  // handle the error
  return false;
}
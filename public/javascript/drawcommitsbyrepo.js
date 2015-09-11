var drawcommitsbyrepo = function(data) {
  result = $.parseJSON(data);
  if (result.success) {
    payload = result.data; 
    var container = document.getElementById('getcommitsbyrepo');
    var groups = new vis.DataSet();
    var items = [];
    var start = '07/22/2015'; //payload[0].x.substring(0,10);
    var end   = payload[payload.length - 1].x.substring(0,10);
    var count = 0;

    $.each(payload, function( index, value ) {
      items.push(value);
      count += value.y; // update the visual counter
      // only add distinct group names
      if (groups.get({filter: function (item) {return (item.content === value.group)}}).length==0)
        groups.add({id: value.group, content: value.group});
    });
    $('#counter3').html('(' + count + ')');

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

    populateExternalLegend("legend3", groups, graph2d);
    
    function onChange (props) {
      var start = Date.parse(props.start);
      var end = Date.parse(props.end);
      var viewitems = dataset.get({
        filter: function (item) {
          return (
            (Date.parse(item.x) >= start) &&
            (Date.parse(item.x) <= end)
          )
        }
      });
      
      count = 0;
      $.each(viewitems, function( index, value ) {
        count += value.y; 
      });
      
      $('#counter3').html('(' + count + ')');
    }

    // add event listener
    graph2d.on('rangechanged', onChange);

  } else {
    errorcallback(data)
  }
}

var errorcallback = function(error) {
  // handle the error
  return false;
}
'use strict';

var socket = io.connect();

$(document).ready(function() {
    $('ul').on('click', 'a.stock', function() {
        socket.emit('remove message', this.id);
    });
});

// Search stock
function search() {
    if ($('#symbolsearch').val() == '') return false;
    $('.load').fadeIn('fast');
    var data = {val: $('#symbolsearch').val()};
    $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: '/search',						
        success: function(data) {
            if (data == 'error') {
                alert('These shares do not exist!');
                $('.load').fadeOut('fast');
                $('#symbolsearch').val('');
            }
            else if (data == '') {
                $('.load').fadeOut('fast');
                $('#symbolsearch').val('');
            }
            else socket.emit('chat message', data);
        }
    });
}
 
// Document ready
socket.on('chat message', function(msg1) {
    var msg = msg1.split(',')[0];
    var str = $('#stockButtons').html();
    new Markit.InteractiveChartApi(msg, 3650);
    str = '<li><p class="btn">' + msg1.split(',')[1] + ' <b>(' + msg + ')</b></p><a class="stock" id="' + msg + '">remove</a></li>' + str;
    $('#stockButtons').html(str);
    $('#symbolsearch').val('');
    $('.load').fadeOut('fast');
});

// New stock
socket.on('message', function(message) {
    var tempStocks = JSON.parse(message);
    $('#stockButtons').html('');
    for (var i = 0; i < tempStocks.data.length; i++) {
        var symb = tempStocks.data[i].split(',')[0];
        new Markit.InteractiveChartApi(symb, 3650);
        var str = $('#stockButtons').html();
        str = '<li><p class="btn">' + tempStocks.data[i].split(',')[1] + ' <b>(' + symb + ')</b></p><a class="stock" id="' + symb + '">remove</a></li>' + str;
        $('#stockButtons').html(str);
        $('#symbolsearch').val('');
    }
});

// Delete stock
socket.on('remove message', function(msg) {
    var arr = $('#stockC').highcharts();
    for (var i = 0; i < arr.series.length; i++)
        if (arr.series[i].name === msg) {
            arr.series[i].remove();
            break;
        }
    for (var j = 0; j < seriesOptions.length; j++)
        if (seriesOptions[j].name === msg) {
            seriesOptions.splice(j, 1);
            break;
        }
    $('#' + msg).parent().remove();
});
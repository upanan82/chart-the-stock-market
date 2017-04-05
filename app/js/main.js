'use strict';

var seriesOptions = [],
    Markit = {};

Markit.InteractiveChartApi = function(symbol, duration) {
    this.symbol = symbol.toUpperCase();
    this.duration = duration;
    this.PlotChart();
};

Markit.InteractiveChartApi.prototype.PlotChart = function() {
    $.ajax({
        context: this,
        type: 'GET',
        url: '/Data?symbol=' + this.symbol,
        success: function(data) {
            this.render(data);
        }
    });
};

Markit.InteractiveChartApi.prototype._fixDate = function(dateIn) {
    var date = new Date(dateIn);
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
};

Markit.InteractiveChartApi.prototype._getOHLC = function(json) {
    var dates = json.Dates || [],
        elements = json.Elements || [],
        arr = [];
    if (elements[0]) {
        for (var i = 0, datLen = dates.length; i < datLen; i++)
            arr.push([
                this._fixDate(dates[i]),
                elements[0].DataSeries['open'].values[i],
                elements[0].DataSeries['high'].values[i],
                elements[0].DataSeries['low'].values[i],
                elements[0].DataSeries['close'].values[i]
            ]);
    }
    return arr;
};

Markit.InteractiveChartApi.prototype.render = function(data) {
    var ohlc = this._getOHLC(data);
    seriesOptions.push({name: this.symbol,data: ohlc, color: getRandomColor()});
    $('#stockC').highcharts('StockChart', {
        rangeSelector: {
            selected: 1
        },
        title: {
            text: 'Chart the Stock Market'
        },
        yAxis: [{
            title: {
                text: 'OHLC Schedule'
            }
        }],
        series: seriesOptions,
        credits: {
            enabled: false
        }
    });
};

function getRandomColor() {
    var letters = '0123456789ABCDEF',
        color = '#';
    for (var i = 0; i < 6; i++)
        color += letters[Math.floor(Math.random() * 16)];
    return color;
}
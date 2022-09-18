var last_t = $("#last_temperature");
var last_h = $("#last_humidity");
var last_d = $("#last_measuring");
var min_t = $("#min_temperature");
var max_t = $("#max_temperature");

var measurings = new Object();
var total = 0;

$.getJSON("data.json", function(data) {
    // loaded the json with last measurings

    measurings = Object.entries(data);
    total = measurings.length;

    var date = new Date(measurings[total - 1][1].d);

    last_d.text(dateFormat(date) + " às " + timeFormat(date));
    last_t.text(measurings[total - 1][1].t.slice(0,4) + '°C');
    last_h.text(measurings[total - 1][1].h.slice(0,4) + '%');

    today();
});

$('.btn').on('click', function(){
    $('.btn').removeClass('btn-primary');
    $('.btn').addClass('btn-outline-secondary');
    $(this).removeClass('btn-outline-secondary');
    $(this).addClass('btn-primary');
});

function today(){
    if(measurings && total > 0){

        // creating a timestamp for the day at 00:00
        var today_t = new Date();
        today_t.setHours(0);
        today_t.setMinutes(0);
        today_t.setSeconds(0);

        plot('Hoje', today_t);

    }
}

function last24Hours(){
    if(measurings && total > 0){

        // creating a timestamp for the last 24 hours
        var today_t = new Date();
        today_t.setDate(today_t.getDate() - 1);

        plot('Ultimas 24 horas', today_t);
    }
}

function last7Days(){
    if(measurings && total > 0){

        // creating a timestamp for the last 24 hours
        var today_t = new Date();
        today_t.setDate(today_t.getDate() - 7);

        plot('Ultimos 7 dias', today_t);
    }
}

function last30Days(){
    if(measurings && total > 0){

        // creating a timestamp for the last 24 hours
        var today_t = new Date();
        today_t.setDate(today_t.getDate() - 30);

        plot('Ultimos 30 dias', today_t);
    }
}

function plot(title, today_t){

    var min = measurings[total - 1][1];
    var max = measurings[total - 1][1];

    var chartData = [["hora", "temperatura"]];

    measurings.forEach(function(item, index, array){
        if(item[1].d >= today_t.getTime()){
            var chartHour = new Date(item[1].d);

            chartData.push([timeFormat(chartHour), parseFloat(item[1].t)]);

            if(parseFloat(item[1].t) < parseFloat(min.t)) min = item[1];
            if(parseFloat(item[1].t) > parseFloat(max.t)) max = item[1];
        }
    });

    if(chartData.length < 2) return false;

    var min_h = new Date(min.d);
    min_t.html('min <span class="badge bg-info text-dark">' + min.t.slice(0,4) + '°C</span> dia ' + dateFormat(min_h) + ' às ' + timeFormat(min_h));
    var max_h = new Date(max.d);
    max_t.html('max <span class="badge bg-warning text-dark">' + max.t.slice(0,4) + '°C</span> dia ' + dateFormat(max_h) + ' às ' + timeFormat(max_h));

    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {

        var data = google.visualization.arrayToDataTable(chartData);

        var options = {
            title: title,
            pointSize: 3,
            legend: {
                position: 'bottom'
            },
            chartArea: {
                left: 50,
                width: '100%'
            }
        };

        var chart = new google.visualization.LineChart(document.getElementById('line_chart'));

        chart.draw(data, options);
    }
}

function dateFormat(date){
    return twoChar(date.getDate()) + "/" + twoChar(date.getMonth() + 1);
}

function timeFormat(date){
    return twoChar(date.getHours()) + ":" + twoChar(date.getMinutes());
}

function twoChar(value){
    value = parseInt(value);
    if(value < 10) return "0" + value;
    return ""+value;
}
var bar = document.getElementsByClassName("btn");

var last_t = document.getElementById("last_temperature");
var last_h = document.getElementById("last_humidity");
var last_d = document.getElementById("last_measuring");
var min_t = document.getElementById("min_temperature");
var max_t = document.getElementById("max_temperature");

var measurings = new Object();
var last;
var start_date;
var end_date;

async function loadData() {
    const response = await fetch("/data.php");
    return await response.json();
}

loadData().then((data) => {
    
    // loaded the json with last measurings
    measurings = Object.entries(data);
    
    last = measurings.slice(-1);
    let date = new Date(last[0][0] * 1000);
    
    last_d.textContent = (dateFormat(date) + " às " + timeFormat(date));
    last_t.textContent = (last[0][1].t.slice(0,4) + '°C');
    last_h.textContent = (last[0][1].h.slice(0,4) + '%');

    today();
    
});


for(let i = 0; i < bar.length; i++){
    bar[i].addEventListener('click', () => {
        for(let j = 0; j < bar.length; j++){
            bar[j].classList.remove('btn-primary');
            bar[j].classList.add('btn-outline-secondary');
        }
        bar[i].classList.remove('btn-outline-secondary');
        bar[i].classList.add('btn-primary');
    });
}


function today(){
    if(measurings && measurings.length > 0){

        // creating a timestamp for the day at 00:00
        start_date = new Date();
        start_date.setHours(0,0,0,0);

        plot('Hoje');

    }
}

function last24Hours(){
    if(measurings && measurings.length > 0){

        // creating a timestamp for the last 24 hours
        start_date = new Date();
        start_date.setDate(start_date.getDate() - 1);

        plot('Ultimas 24 horas');
    }
}

function last7Days(){
    if(measurings && measurings.length > 0){

        // creating a timestamp for the last 24 hours
        start_date = new Date();
        start_date.setDate(start_date.getDate() - 7);

        plot('Ultimos 7 dias');
    }
}

function last30Days(){
    if(measurings && measurings.length > 0){

        // creating a timestamp for the last 24 hours
        start_date = new Date();
        start_date.setDate(start_date.getDate() - 30);

        plot('Ultimos 30 dias');
    }
}

function plot(title){
    

    var min = last[0];
    var max = last[0];

    var chartData = [["hora", "temperatura"]];

    measurings.forEach((item) => {
        if((item[0] * 1000) >= start_date.getTime()){
            let chartHour = new Date(item[0] * 1000);
            
            let hour = ((measurings.length < 76) ? timeFormat(chartHour) : dateFormat(chartHour) + ' ' + timeFormat(chartHour));
            
            chartData.push([hour, parseFloat(item[1].t)]);

            if(parseFloat(item[1].t) < parseFloat(min[1].t)) min = item;
            if(parseFloat(item[1].t) > parseFloat(max[1].t)) max = item;
        }
    });

    if(chartData.length < 2) return false;

    var min_h = new Date(min[0] * 1000);
    min_t.innerHTML = 'min <span class="badge bg-info text-dark">' + min[1].t.slice(0,4) + '°C</span> dia ' + dateFormat(min_h) + ' às ' + timeFormat(min_h);
    var max_h = new Date(max[0] * 1000);
    max_t.innerHTML = 'max <span class="badge bg-warning text-dark">' + max[1].t.slice(0,4) + '°C</span> dia ' + dateFormat(max_h) + ' às ' + timeFormat(max_h);

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
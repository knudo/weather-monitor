var bar = document.getElementsByClassName("btn");

var last_t = document.getElementById("last_temperature");
var last_h = document.getElementById("last_humidity");
var last_d = document.getElementById("last_measuring");
var min_temperature = document.getElementById("min_temperature");
var min_temperature = document.getElementById("min_temperature");
var min_humidity = document.getElementById("min_humidity");
var max_humidity = document.getElementById("max_humidity");

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
    
    last_d.textContent = (dateFormat(date) + " at " + timeFormat(date));
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

        plot('Today');

    }
}

function last24Hours(){
    if(measurings && measurings.length > 0){

        // creating a timestamp for the last 24 hours
        start_date = new Date();
        start_date.setDate(start_date.getDate() - 1);

        plot('Last 24 hours');
    }
}

function last7Days(){
    if(measurings && measurings.length > 0){

        // creating a timestamp for the last 24 hours
        start_date = new Date();
        start_date.setDate(start_date.getDate() - 7);

        plot('Last 7 days');
    }
}

function last30Days(){
    if(measurings && measurings.length > 0){

        // creating a timestamp for the last 24 hours
        start_date = new Date();
        start_date.setDate(start_date.getDate() - 30);

        plot('Last 30 days');
    }
}

function plot(title){
    var min_h = last[0];
    var max_h = last[0];
    var min_t = last[0];
    var max_t = last[0];
    
    google.charts.load('current', {'packages':['corechart']})
    google.charts.setOnLoadCallback(drawChart);
    
    function drawChart() {
        var data = new google.visualization.DataTable();
        var date_formatter = new google.visualization.DateFormat({ pattern: 'dd/MM HH:mm' });
        
        data.addColumn('date', 'time');
        data.addColumn('number', 'temperature');
        data.addColumn('number', 'humidity');

        measurings.forEach((item) => {
            if((item[0] * 1000) >= start_date.getTime()){
                let hour = new Date(item[0] * 1000);

                //let hour = ((measurings.length < 76) ? timeFormat(chartHour) : dateFormat(chartHour) + ' ' + timeFormat(chartHour));

                data.addRow([hour, parseFloat(item[1].t), parseFloat(item[1].h)]);

                //data.push([hour, parseFloat(item[1].t), parseFloat(item[1].h)]);

                if(parseFloat(item[1].t) < parseFloat(min_t[1].t)) min_t = item;
                if(parseFloat(item[1].t) > parseFloat(max_t[1].t)) max_t = item;

                if(parseFloat(item[1].h) < parseFloat(min_h[1].h)) min_h = item;
                if(parseFloat(item[1].h) > parseFloat(max_h[1].h)) max_h = item;
            }
        });
        
        date_formatter.format(data, 0);
        
        let min_t_time = new Date(min_t[0] * 1000);
        min_temperature.innerHTML = 'min <span class="badge bg-info text-dark">' + min_t[1].t.slice(0,4) + '°C</span> on ' + dateFormat(min_t_time) + ' at ' + timeFormat(min_t_time);
        var max_t_time = new Date(max_t[0] * 1000);
        max_temperature.innerHTML = 'max <span class="badge bg-warning text-dark">' + max_t[1].t.slice(0,4) + '°C</span> on ' + dateFormat(max_t_time) + ' at ' + timeFormat(max_t_time);

        let min_h_time = new Date(min_t[0] * 1000);
        min_humidity.innerHTML = 'min <span class="badge bg-info text-dark">' + min_h[1].h.slice(0,4) + '%</span> on ' + dateFormat(min_h_time) + ' at ' + timeFormat(min_h_time);
        var max_h_time = new Date(max_t[0] * 1000);
        max_humidity.innerHTML = 'max <span class="badge bg-warning text-dark">' + max_h[1].h.slice(0,4) + '%</span> on ' + dateFormat(max_h_time) + ' at ' + timeFormat(max_h_time);

        var options = {
            title: 'Temperature and Humidity - ' + title,
            height: 400,
            chartArea: {width: '90%'},
            legend: {position: 'bottom'},
            series: {
                0: {targetAxisIndex: 0},
                1: {targetAxisIndex: 1}
            },
            vAxes: {
                // Adds titles to each axis.
                0: {title: 'Temperature (ºC)'},
                1: {title: 'Humidity (%)'}
            },
            hAxis: {
                format: (data.getNumberOfRows() < 75) ? 'HH:mm' : 'dd/MM'
            },
            vAxis:{
                textPosition: 'out'
            }
        };

        var chart = new google.visualization.LineChart(document.getElementById('gchart'));
        
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
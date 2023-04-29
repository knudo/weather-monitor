<!doctype html>
<html lang="pt-br">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-KK94CHFLLe+nY2dmCWGMq91rCGa5gtU4mk92HdvYe+M/SXH301p5ILy+dN9+nJOZ" crossorigin="anonymous">
        <title>Weather Monitor</title>
        <meta property="og:title" content="Temperatura e Humidade">
        <meta name="twitter:title" content="Temperatura e Humidade">

        <?php
            $data = file_get_contents('last.txt');
            echo "<meta name=\"description\" content=\"{$data}\">
            <meta property=\"og:description\" content=\"{$data}\">
            <meta name=\"twitter:description\" content=\"{$data}\">";
        ?>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/0.2.3/gh-fork-ribbon.min.css" />
    </head>
    <body>
        <a class="github-fork-ribbon" href="https://github.com/knudo/weather-monitor" data-ribbon="Fork me on GitHub" title="Fork me on GitHub">Fork me on GitHub</a>
        <div class="p-3">
            <h5><span class="badge bg-success">last measuring: <span id="last_measuring" class="badge bg-info text-dark"></span></span></h5>
            <h1><span class="badge bg-success">temperature <span class="badge bg-info text-dark" id="last_temperature">--.-°C</span></span></h1>
            <h1><span class="badge bg-success">humidity <span class="badge bg-info text-dark" id="last_humidity">--.-%</span></span></h1>
            
            <div class="btn-group" role="group" aria-label="Basic example">
                <button type="button" class="btn btn-primary py-0 shadow-none" onclick="today()">Today</button>
                <button type="button" class="btn btn-outline-secondary py-0 shadow-none" onclick="last24Hours()">24 hours</button>
                <button type="button" class="btn btn-outline-secondary py-0 shadow-none" onclick="last7Days()">7 days</button>
                <button type="button" class="btn btn-outline-secondary py-0 shadow-none" onclick="last30Days()">30 days</button>
            </div>
            <div id="gchart"></div>
            <h3>Temperature</h3>
            <h3><span class="badge bg-success" id="min_temperature">min --.-°C</span>&nbsp;<span class="badge bg-success" id="max_temperature">max --.-°C</span></h3>
            <h3>Humidity</h3>
            <h3><span class="badge bg-success" id="min_humidity">min --.-%</span>&nbsp;<span class="badge bg-success" id="max_humidity">max --.-%</span></h3>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ENjdO4Dr2bkBIFxQpeoTz1HIcje39Wm4jDKdf19U8gI4ddQ3GYNS7NTKfAdVQSZe" crossorigin="anonymous"></script>
        <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
        <script src="js/main.js"></script>
    </body>
</html>
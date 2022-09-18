<?php
require __DIR__.'/vendor/autoload.php';

use Kreait\Firebase\Factory;

$factory = (new Factory)->withServiceAccount('/opt/weather-monitor/firebase_credentials.json');

$database = $factory->createDatabase();

$esp0 = $database->getReference('esp0')->getSnapshot();

file_put_contents('/var/www/html/weather-monitor/data.json', json_encode($esp0->getValue()));
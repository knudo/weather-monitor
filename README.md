# weather-monitor
A weather monitoring system based on ESP32 with DHT22 and Firebase

## How does it work
Every 20 min the MCU will acquire the local temperature and humidity. It will then send this data to a Firebase database along with a timestamp representing the moment the data has been gathered as a JSON object in the following format:
```json
"1682207859": {
  "h": "89.70",
  "t": "18.90"
}
```
Where `h` stants for humidity and `t` for temperature.

Firebase will store it in an array of JSON objects.

The front-end part of the project will just retrieve the data from Firebase and display it to the viewer. You can see a graphic with the last measurements, varying intervals for the current day, the last 24h, last week and last month.
You can view the working project (the front-end part) [here](https://weather.knu.do).

## Images
Main module with a 5V power supply (a phone charger) and the Esp32-WROOM-32 board in a water/dust tight enclousure.<br>
<img src="/assets/esp32.jpg?raw=true" width="500">

Secondary module with the DHT22 sensor in a drilled box. I have decide using 2 modules so this second one could have holes and wouldnt get hotter for being close to the Esp32 board.<br>
<img src="/assets/dht22.jpg?raw=true" width="500">

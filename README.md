# weather-monitor
A weather monitoring system based on ESP32 with DHT22 and Firebase

## How does it work
Every from time to time (20 minutes in my case) the board will measure the local temperature and humidity. It will then send this data to a Firebase database along with a timestamp representing the moment the data has been gathered as a JSON object.
Example JSON:
```json
"1682207859": {
  "h": "89.70",
  "t": "18.90"
}
```
Where `h` stants for humidity and `t` for temperature.

Firebase will store it in an array of JSON objects.

## Images
Main module with a 5V power supply (a phone charger) and the Esp32-WROOM-32 board in a water/dust tight enclousure.<br>
<img src="/assets/esp32.jpg?raw=true" width="500">

Secondary module with the DHT22 sensor in a drilled box. I have decide using 2 modules so this second one could have holes and wouldnt get hotter for being close to the Esp32 board.<br>
<img src="/assets/dht22.jpg?raw=true" width="500">

#include <FirebaseESP32.h>        // https://github.com/mobizt/Firebase-ESP32
#include <WiFiManager.h>          // https://github.com/tzapu/WiFiManager
#include <DHT.h>                  // adafruit's DHT libraty
#include "time.h"

#define FIREBASE_HOST "https://<your project>.firebaseio.com/"
#define FIREBASE_API_KEY "<your API key>"
#define FIREBASE_DB "<database alias>"

#define DHTPIN 15
#define DHTTYPE DHT22

#define NTP_SERVER "pool.ntp.org" // ntp server to be used
#define GMT_OFFSET_SEC -10800     // GMT offset in seconds (GMT-3 in my case, Sao Paulo timezone)
#define DAYLIGHT_OFFSET_SEC 0     // daylight saving offset if applicable

#define INTERVAL 1200000          // interval between reading temperature and humidity [in miliseconds]

FirebaseData fbData;

uint32_t lastTimeRead = 0;

DHT dht(DHTPIN, DHTTYPE);

void setupWiFi(){
  WiFiManager wm;
  bool res = false;

  // sets as wifi station
  WiFi.mode(WIFI_STA);
  
  while(!res){
    // trying to connect
    Serial.println("connecting to wifi");
    res = wm.autoConnect("weather-monitor");
  }

  Serial.println("");
  Serial.print("connected with ip ");
  Serial.println(WiFi.localIP());
}

void stopWiFi(){
  WiFi.disconnect();
  delay(500);
}

void setupFirebase(){
  Firebase.begin(FIREBASE_HOST, FIREBASE_API_KEY);

  // auto reconnect wifi
  Firebase.reconnectWiFi(true);
}

void stopFirebase(){
  Firebase.end(fbData);
}

String dhtReadTemperature(){
  float samples = 0, sum = 0, sensor = 0;

  Serial.println("temperature");
  
  // tries to read 3 samples and calculates the average temperature
  for(char i = 0;i < 3;i++){
    // collect sample
    sensor = dht.readTemperature();

    // verify if its a valid sample
    if(!isnan(sensor)){
      if(sensor > -20 && sensor < 70){
        Serial.println(String(i) + "=" + String(sensor));
        sum += sensor;
        samples += 1.0;
      }
    }
    delay(10000);
  }

  // no success reading
  if(samples == 0){
    Serial.println("falied reading temperature");
    return "--";
  }
  
  return String(sum / samples);
}

String dhtReadHumidity(){
  float samples = 0, sum = 0, sensor = 0;

  Serial.println("humidity");
  
  // tries to read 3 samples and calculates the average humidity
  for(int i = 0;i < 3;i++){
    // collect sample
    sensor = dht.readHumidity();

    // verify if valid sample
    if(!isnan(sensor)){
      if(sensor >= 0 && sensor <= 100){
        Serial.println(String(i) + "=" + String(sensor));
        sum += sensor;
        samples += 1.0;
      }
    }
    delay(10000);
  }

  // no success reading
  if(samples == 0){
    Serial.println("falied reading humidity");
    return "--";
  }
  
  return String(sum / samples);
}

void pushData(String temperature, String humidity){
  struct tm timeInfo;

  // restarts the unit if it loses wifi connection
  if(!WiFi.isConnected()){
    ESP.restart();
  }
  
  // get local time
  if(!getLocalTime(&timeInfo)){
    Serial.println("failed to obtain time");
    return;
  }

  // get current year, month and day
  char year[5];
  strftime(year, 5, "%Y", &timeInfo);
  char month[3];
  strftime(month, 3, "%m", &timeInfo);
  char day[3];
  strftime(day, 3, "%d", &timeInfo);
  
  FirebaseJson json;
  FirebaseJson jsonTimestamp;
  
  jsonTimestamp.set(".sv", "timestamp");
  json.set("t", temperature);
  json.set("h", humidity);
  json.set("d", jsonTimestamp);

  String path = FIREBASE_DB + String(year) + "/" + String(month) + "/" + String(day) + "/";

  if(Firebase.pushJSON(fbData, path, json)){
    Serial.println("firebase success");
  }else{
    Serial.println(fbData.errorReason());
  }
}

void setup() {
  Serial.begin(115200);

  // starts DHT22
  dht.begin();

  // starts WiFi client
  setupWiFi();

  // setup NTP client
  configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER);
  
  setupFirebase();
}

void loop() {
  unsigned long now = millis();

  if(now - lastTimeRead > INTERVAL){
    
    // read temperature and humidity
    String temp = dhtReadTemperature();
    String hum = dhtReadHumidity();
    
    Serial.print("t: ");
    Serial.print(temp);
    Serial.print(" h: ");
    Serial.println(hum);
    
    // send to firebase
    pushData(temp, hum);

    // stop Firebase
    //stopFirebase();
    
    // close wifi [not using since im not worried with power consumption]
    //stopWiFi();
    
    lastTimeRead = now;
  }
  
}

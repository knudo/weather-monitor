#include <FirebaseESP32.h>        // https://github.com/mobizt/Firebase-ESP32
#include <WiFi.h>
#include <DHT.h>                  // adafruit's DHT libraty
#include "time.h"

#define WIFISSID "ssid"
#define WIFIPWD "password"

#define FIREBASE_HOST "host"
#define FIREBASE_API_KEY "api key"
#define FIREBASE_DB "/path/"

#define DHTPIN 15
#define DHTTYPE DHT22

#define NTP_SERVER "pool.ntp.org" // ntp server to be used
#define GMT_OFFSET_SEC -10800     // GMT offset in seconds (GMT-3 in my case, Sao Paulo timezone)
#define DAYLIGHT_OFFSET_SEC 0     // daylight saving offset if applicable

#define INTERVAL 1200000          // interval between reading temperature and humidity [in miliseconds] 20 minutes in my case

FirebaseData fbData;

uint32_t lastTimeRead = 0;

DHT dht(DHTPIN, DHTTYPE);

void setupWiFi(){
  WiFi.disconnect();
  WiFi.mode(WIFI_STA);

  Serial.println("connecting to wifi");
  WiFi.begin(WIFISSID, WIFIPWD);

  while(WiFi.status() != WL_CONNECTED){
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.print("connected with ip ");
  Serial.println(WiFi.localIP());
}

void stopWiFi(){
  WiFi.disconnect();
  delay(500);
}

void setupTime(){
  configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER);
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
  float q = 0, t = 0, s = 0;

  Serial.print("temp ");
  
  for(int i = 0;i < 3;i++){
    // collect sample
    s = dht.readTemperature();
    Serial.print(String(i) + "=");
    Serial.print(String(s) + " ");

    // verify if valid sample
    if(!isnan(s)){
      if(s > -20 && s < 70){
        t += s;
        q += 1.0;
      }
    }
    delay(10000);
  }
  Serial.println();

  // no success reading
  if(q == 0){
    return "--";
  }
  
  return String(t / q);
}

String dhtReadHumidity(){
  float q = 0, h = 0, s = 0;

  Serial.print("hum ");
  
  for(int i = 0;i < 3;i++){
    // collect sample
    s = dht.readHumidity();
    Serial.print(String(i) + "=");
    Serial.print(String(s) + " ");

    // verify if valid sample
    if(!isnan(s)){
      if(s >= 0 && s <= 100){
        h += s;
        q += 1.0;
      }
    }
    delay(10000);
  }
  Serial.println();

  // no success reading
  if(q == 0){
    return "--";
  }
  
  return String(h / q);
}

void pushData(String temperature, String humidity){
  struct tm timeInfo;
  
  if(!getLocalTime(&timeInfo)){
    Serial.println("Failed to obtain time");
    return;
  }

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

  // sets NTP client
  setupTime();
  
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
    stopFirebase();
    
    // close wifi
    stopWiFi();
    
    lastTimeRead = now;
  }
  
}

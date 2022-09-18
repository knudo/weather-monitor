#include <FirebaseESP32.h>
#include <WiFi.h>
#include <DHT.h>

#define WIFISSID "LULA LIVRE"
#define WIFIPWD "pandinha"
#define FIREBASE_HOST "FIREBASE_HOST"
#define FIREBASE_API_KEY "API_KEY"
#define DHTPIN 15
#define DHTTYPE DHT22
#define INTERVAL 1200000

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
  FirebaseJson json;
  FirebaseJson jsonTimestamp;
  jsonTimestamp.set(".sv", "timestamp");
  json.set("t", temperature);
  json.set("h", humidity);
  json.set("d", jsonTimestamp);

  if(Firebase.pushJSON(fbData, "/esp0/", json)){
    Serial.println("firebase success");
  }else{
    Serial.println(fbData.errorReason());
  }
}

void setup() {
  // start serial
  //Serial.begin(115200);

  // start DHT22
  dht.begin();

  // setup WiFi
  setupWiFi();
  
  // setup Firebase
  setupFirebase();
}

void loop() {
  unsigned long now = millis();

  if(now - lastTimeRead > INTERVAL){
    
    // read temperature and humidity
    String temp = dhtReadTemperature();
    String hum = dhtReadHumidity();
  
    /* FOR TESTING PURPOSES
    Serial.print("t: ");
    Serial.print(temp);
    Serial.print(" h: ");
    Serial.println(hum);
    */
    
    // send to firebase
    pushData(temp, hum);

    // stop Firebase
    //stopFirebase();
    
    // close wifi
    //stopWiFi();
    
    lastTimeRead = now;
  }
  
}

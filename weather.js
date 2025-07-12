// backend/fetchWeather.jsw
import { fetch } from 'wix-fetch';
import wixData from 'wix-data';
import { getSecret } from "wix-secrets-backend";

export async function getWeatherKey() {
    console.log('getting weather key')
    let key = await getSecret('weather_api_key');
    return key;
}



export async function updateDailyWeather() {
  const weather_api_key = await getWeatherKey();
  const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${weather_api_key}&q=30.26020563989437, -97.75125303637932&days=3&aqi=no&alerts=no`);
  const json = await res.json();

  const oldItems = await wixData.query("longCenterWeather").limit(1000).find();
  await Promise.all(oldItems.items.map(item => wixData.remove("longCenterWeather", item._id)));

  await wixData.insert("longCenterWeather", {
    weatherObject: json 
  });
}


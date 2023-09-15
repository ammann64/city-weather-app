let searchFormEl = document.getElementById('search-form');
let cityInputEl = document.getElementById('city-input');
let searchHistoryEl = document.getElementById('search-history');
let forecastEl = document.getElementById('forecast');
const apiKey = 'e188f5a0353881e98e33e40c59aaa471'; 
var cities;
var cityName;
var currentCityIndex = 0;
 if (localStorage.getItem('searchHistory') != null) {
    cities = JSON.parse(localStorage.getItem('searchHistory'));
    for (var c = 0; c < cities.length; c++) {
        DisplaySearchHistory(cities[c]);
    }
    } else {
        cities = [];
    }
searchFormEl.addEventListener('click', function(event) {
    event.preventDefault();
    if (event.target.getAttribute('id') == 'search-btn') {
        cityName = cityInputEl.value;
        currentCity = cityName.trim().toLowerCase();
        GetCoordinates(currentCity);
        console.log(currentCityIndex);
        GetForecast(cities[currentCityIndex]);
    }
});

searchHistoryEl.addEventListener('click', function(event) {
    event.preventDefault();
    if (event.target.getAttribute('class') == 'searched-city-btn') {
        let cityName = event.target.getAttribute('data-city');
        GetCoordinates(cityName);
        for (var i = 0; i < cities.length; i++) {
            if (cityName == cities[i].name) {
                currentCityIndex = i;
            }
        }
        GetForecast(cities[currentCityIndex]);
    }
})

function GetCoordinates(cityName) {
    let coordUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;
    var citySearched = false;
    for (var c = 0; c < cities.length; c++) {
        console.log(cities[c]);
        if (cities[c].name == cityName) {
            citySearched = true;
            currentCityIndex = c;
        }
    }
    if (!citySearched) {
        console.log(coordUrl);
        fetch(coordUrl)
            .then(function(response) {
                if (response.ok) {
                    response.json().then(function(data) {
                        console.log(data);
                            var city = {
                                name: cityName,
                                lat: data[0].lat,
                                lon: data[0].lon
                            }
                            cities.push(city);
                            DisplaySearchHistory(city);
                            localStorage.setItem('searchHistory', JSON.stringify(cities));
                            console.log(cities);
                            currentCityIndex = cities.length - 1;
                            console.log(cities.length);
                            console.log(currentCityIndex);
                    });
                }
                else {
                    alert('Error ' + response.statusText);
                }
            })
            .catch(function(error) {
                alert('Unable to connect to the weather API');
            });
    }
}

function GetForecast(city) {
    let lat = city.lat.toFixed(4);
    let lon = city.lon.toFixed(4);
    console.log(lat);
    console.log(lon);
    let forecastUrl = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
    console.log(forecastUrl);
    fetch(forecastUrl)
        .then(function(response) {
            if (response.ok) {
                response.json().then(function(data) {
                    console.log(data);
                    let forecasts = [];
                    for (var x = 6 ; x < data.list.length; x += 8) {
                        thisDate = FormatDate(data.list[x].dt_txt);
                        thisTemp = data.list[x].main.temp + ' °F';
                        iconCode = data.list[x].weather[0].icon;
                        thisIcon = 'https://openweathermap.org/img/wn/' + iconCode + '.png';
                        thisWind = data.list[x].wind.speed + ' MPH';
                        thisHumi = data.list[x].main.humidity + ' %';
                        thisForecast = ForecastObjectify(thisDate, thisIcon, thisTemp, thisWind, thisHumi);
                        console.log(thisForecast);
                        forecasts.push(thisForecast);
                        console.log(forecasts);
                    }
                    DisplayForecast(forecasts);
                });
            }
            else {
                alert('Error ' + response.statusText);
            }
        })
        .catch(function(error) {
            alert('Unable to connect to the weather API');
        });
}
function ForecastObjectify(thisDate, thisIcon, thisTemp, thisWind, thisHumi) {
    let forecast = {
        date: thisDate,
        icon: thisIcon,
        temp: thisTemp,
        wind: thisWind,
        humi: thisHumi
    };
    return forecast;
}

function FormatDate(date) {
    let dateFormatted = dayjs(date).format('M/D/YYYY');
    return dateFormatted;
}

function DisplayForecast(forecasts) {
    forecastEl.removeAttribute('hidden');
    let forecastDaysEls = document.querySelectorAll('.forecast-day')
    for (f = 0; f < forecasts.length; f++) {
        currentDay = forecastDaysEls[f];
        currentDayId = '#' + currentDay.getAttribute('id');
        let currentDateEl = document.querySelector(currentDayId + '>.forecast-date');
        let weatherIconEl = document.querySelector(currentDayId + '>.weather-icon');
        let forecastTempEl = document.querySelector(currentDayId + '>.forecast-temp');
        let forecastWindEl = document.querySelector(currentDayId + '>.forecast-wind');
        let forecastHumiEl = document.querySelector(currentDayId + '>.forecast-humi');
        currentDateEl.innerHTML = '';
        currentDateEl.textContent = forecasts[f].date;
        console.log(forecasts[f].icon);
        weatherIconEl.setAttribute('src', forecasts[f].icon);
        forecastTempEl.textContent = '';
        forecastTempEl.textContent = forecasts[f].temp;
        forecastWindEl.textContent = '';
        forecastWindEl.textContent = forecasts[f].wind;
        forecastHumiEl.textContent = '';
        forecastHumiEl.textContent = forecasts[f].humi;
    }
}

function DisplaySearchHistory(city) {
    searchedCityEl = document.createElement('button');
    searchedCityEl.textContent = city.name;
    searchedCityEl.setAttribute('class', 'searched-city-btn');
    searchedCityEl.setAttribute('data-city', city.name);
    searchHistoryEl.appendChild(searchedCityEl);
}
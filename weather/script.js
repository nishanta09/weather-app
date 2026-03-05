class WeatherApp {
    constructor() {
          this.apiKeys = {
        weatherstack: '94c0a94aa3c310fd0e331d4de2f602b4',
        openweather: 'YOUR_OPENWEATHER_KEY',
        weatherapi: 'YOUR_WEATHERAPI_KEY'       
    };
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.locationBtn = document.getElementById('locationBtn');
        this.apiSelector = document.getElementById('apiSelector');
        this.loading = document.getElementById('loading');
        this.error = document.getElementById('error');
        this.weatherDisplay = document.getElementById('weatherDisplay');
        
        // Weather display elements
        this.temperature = document.getElementById('temperature');
        this.iconImg = document.getElementById('iconImg');
        this.description = document.getElementById('description');
        this.feelsLike = document.getElementById('feelsLike');
        this.humidity = document.getElementById('humidity');
        this.windSpeed = document.getElementById('windSpeed');
        this.pressure = document.getElementById('pressure');
        this.cityName = document.getElementById('cityName');
        this.country = document.getElementById('country');
    }

    bindEvents() {
        this.searchBtn.addEventListener('click', () => this.searchWeather());
        this.locationBtn.addEventListener('click', () => this.getLocationWeather());
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchWeather();
        });
    }

    async searchWeather() {
        const city = this.cityInput.value.trim();
        if (!city) {
            this.showError('Please enter a city name');
            return;
        }

        await this.fetchWeather(city);
    }

    async getLocationWeather() {
        if (navigator.geolocation) {
            this.showLoading();
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    await this.fetchWeatherByCoords(latitude, longitude);
                },
                (error) => {
                    this.showError('Unable to get your location');
                    this.hideLoading();
                }
            );
        } else {
            this.showError('Geolocation is not supported by your browser');
        }
    }

    async fetchWeather(city) {
        this.showLoading();
        const selectedAPI = this.apiSelector.value;
        
        try {
            let weatherData;
            
            switch(selectedAPI) {
                case 'weatherstack':
                    weatherData = await this.fetchWeatherStack(city);
                    break;
                case 'openweather':
                    weatherData = await this.fetchOpenWeather(city);
                    break;
                case 'weatherapi':
                    weatherData = await this.fetchWeatherAPI(city);
                    break;
            }
            
            if (weatherData) {
                this.displayWeather(weatherData);
            } else {
                this.showError('Failed to fetch weather data');
            }
        } catch (error) {
            this.showError('Error: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async fetchWeatherStack(city) {
        const url = `http://api.weatherstack.com/current?access_key=${this.apiKeys.weatherstack}&query=${city}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success === false) {
                throw new Error(data.error.info);
            }
            
            return {
                temperature: data.current.temperature,
                description: data.current.weather_descriptions[0],
                humidity: data.current.humidity,
                windSpeed: data.current.wind_speed / 3.6, // Convert km/h to m/s
                pressure: data.current.pressure,
                icon: data.current.weather_icons[0],
                location: data.location.name,
                country: data.location.country,
                feelsLike: data.current.feelslike
            };
        } catch (error) {
            console.error('WeatherStack error:', error);
            return null;
        }
    }

    async fetchOpenWeather(city) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKeys.openweather}&units=metric`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.cod !== 200) {
                throw new Error(data.message);
            }
            
            return {
                temperature: data.main.temp,
                description: data.weather[0].description,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                pressure: data.main.pressure,
                icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
                location: data.name,
                country: data.sys.country,
                feelsLike: data.main.feels_like
            };
        } catch (error) {
            console.error('OpenWeather error:', error);
            return null;
        }
    }

    async fetchWeatherAPI(city) {
        const url = `https://api.weatherapi.com/v1/current.json?key=${this.apiKeys.weatherapi}&q=${city}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message);
            }
            
            return {
                temperature: data.current.temp_c,
                description: data.current.condition.text,
                humidity: data.current.humidity,
                windSpeed: data.current.wind_kph / 3.6, // Convert km/h to m/s
                pressure: data.current.pressure_mb,
                icon: data.current.condition.icon,
                location: data.location.name,
                country: data.location.country,
                feelsLike: data.current.feelslike_c
            };
        } catch (error) {
            console.error('WeatherAPI error:', error);
            return null;
        }
    }

    async fetchWeatherByCoords(lat, lon) {
        const selectedAPI = this.apiSelector.value;
        
        try {
            let weatherData;
            
            switch(selectedAPI) {
                case 'weatherstack':
                    weatherData = await this.fetchWeatherStackCoords(lat, lon);
                    break;
                case 'openweather':
                    weatherData = await this.fetchOpenWeatherCoords(lat, lon);
                    break;
                case 'weatherapi':
                    weatherData = await this.fetchWeatherAPICoords(lat, lon);
                    break;
            }
            
            if (weatherData) {
                this.displayWeather(weatherData);
            } else {
                this.showError('Failed to fetch weather data');
            }
        } catch (error) {
            this.showError('Error: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async fetchWeatherStackCoords(lat, lon) {
        const url = `http://api.weatherstack.com/current?access_key=${this.apiKeys.weatherstack}&query=${lat},${lon}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success === false) {
            throw new Error(data.error.info);
        }
        
        return {
            temperature: data.current.temperature,
            description: data.current.weather_descriptions[0],
            humidity: data.current.humidity,
            windSpeed: data.current.wind_speed / 3.6,
            pressure: data.current.pressure,
            icon: data.current.weather_icons[0],
            location: data.location.name,
            country: data.location.country,
            feelsLike: data.current.feelslike
        };
    }

    async fetchOpenWeatherCoords(lat, lon) {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKeys.openweather}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.cod !== 200) {
            throw new Error(data.message);
        }
        
        return {
            temperature: data.main.temp,
            description: data.weather[0].description,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            pressure: data.main.pressure,
            icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
            location: data.name,
            country: data.sys.country,
            feelsLike: data.main.feels_like
        };
    }

    async fetchWeatherAPICoords(lat, lon) {
        const url = `https://api.weatherapi.com/v1/current.json?key=${this.apiKeys.weatherapi}&q=${lat},${lon}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        return {
            temperature: data.current.temp_c,
            description: data.current.condition.text,
            humidity: data.current.humidity,
            windSpeed: data.current.wind_kph / 3.6,
            pressure: data.current.pressure_mb,
            icon: data.current.condition.icon,
            location: data.location.name,
            country: data.location.country,
            feelsLike: data.current.feelslike_c
        };
    }

    displayWeather(data) {
        this.temperature.textContent = `${Math.round(data.temperature)}°C`;
        this.description.textContent = data.description;
        this.humidity.textContent = `${data.humidity}%`;
        this.windSpeed.textContent = `${data.windSpeed.toFixed(1)} m/s`;
        this.pressure.textContent = `${data.pressure} hPa`;
        this.feelsLike.textContent = `${Math.round(data.feelsLike)}°C`;
        this.cityName.textContent = data.location;
        this.country.textContent = data.country;
        
        if (data.icon) {
            this.iconImg.src = data.icon;
            this.iconImg.style.display = 'block';
        }
        
        this.weatherDisplay.style.display = 'block';
        this.error.style.display = 'none';
    }

    showLoading() {
        this.loading.style.display = 'block';
        this.error.style.display = 'none';
        this.weatherDisplay.style.display = 'none';
    }

    hideLoading() {
        this.loading.style.display = 'none';
    }

    showError(message) {
        this.error.textContent = message;
        this.error.style.display = 'block';
        this.weatherDisplay.style.display = 'none';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});

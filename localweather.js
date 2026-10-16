
(function (Scratch) {
  "use strict";

  class LocalWeather {
    constructor() {
      this.temperature = 0;
      this.wind = 0;
      this.clouds = 0;
      this.weatherCode = -1;
      this.status = "Click get local weather";
    }

    getInfo() {
      return {
        id: "localweather",
        name: "Local Weather",
        color1: "#3298db",
        color2: "#2176ae",
        blocks: [
          {
            opcode: "getWeather",
            blockType: Scratch.BlockType.COMMAND,
            text: "get weather for my location"
          },
          {
            opcode: "getTemperature",
            blockType: Scratch.BlockType.REPORTER,
            text: "temperature (°C)"
          },
          {
            opcode: "getWind",
            blockType: Scratch.BlockType.REPORTER,
            text: "wind speed (km/h)"
          },
          {
            opcode: "getClouds",
            blockType: Scratch.BlockType.REPORTER,
            text: "cloud cover (%)"
          },
          {
            opcode: "getCode",
            blockType: Scratch.BlockType.REPORTER,
            text: "weather code"
          },
          {
            opcode: "getStatus",
            blockType: Scratch.BlockType.REPORTER,
            text: "weather status"
          }
        ]
      };
    }

    async getWeather() {
      if (!navigator.geolocation) {
        this.status = "GPS unavailable in extension";
        return;
      }

      this.status = "Getting location...";

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            { timeout: 15000, maximumAge: 300000 }
          );
        });

        const { latitude, longitude } = position.coords;

        const url = new URL(
          "https://api.open-meteo.com/v1/forecast"
        );

        url.search = new URLSearchParams({
          latitude: String(latitude),
          longitude: String(longitude),
          current:
            "temperature_2m,weather_code,wind_speed_10m,cloud_cover",
          temperature_unit: "celsius",
          wind_speed_unit: "kmh",
          timezone: "auto"
        });

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Weather service error");
        }

        const result = await response.json();
        const current = result.current;

        this.temperature = current.temperature_2m;
        this.wind = current.wind_speed_10m;
        this.clouds = current.cloud_cover;
        this.weatherCode = current.weather_code;
        this.status = "Weather loaded";
      } catch (error) {
        this.status =
          error.code === 1
            ? "Location permission denied"
            : "Could not load weather";
      }
    }

    getTemperature() {
      return this.temperature;
    }

    getWind() {
      return this.wind;
    }

    getClouds() {
      return this.clouds;
    }

    getCode() {
      return this.weatherCode;
    }

    getStatus() {
      return this.status;
    }
  }

  Scratch.extensions.register(new LocalWeather());
})(Scratch);

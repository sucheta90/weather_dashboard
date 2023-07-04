const key = "22550d17b8218021ec4876ec01ea0dfe"; // api key
let searchLocation = {}; //
let searchInput = $("#search_input");
let search_form = $("#search_form"); //form to take search input

// function called on submit fetches data to get co-ordinates by direct geo-coding and shows 5 choices that matches the city name. Based on user selection the city name is saved in the local storage for future use.
search_form.on("submit", function (e) {
  let cities = {};
  e.preventDefault();
  $("#options");
  let cityName = searchInput.val(); //check for numaric inputs
  searchInput.val("");
  fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=${5}&appid=${key}`
  )
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      for (let el of data) {
        cities[`${el.name}_${el.lat}_${el.lon}`] = {
          name: el.name,
          lat: el.lat,
          lon: el.lon,
          state: el.state,
          country: el.country,
        };
        let li = $("<li>");
        li.attr("class", "option");
        li.attr("id", `${el.name}_${el.lat}_${el.lon}`);
        li.text(`${el.name}, ${el.state}, ${el.country}`);
        $("#options").append(li);
      }
      $(".option").on("click", function (e) {
        let cityName = $(e.target).text();
        console.log(`clicked on`, e.target);
        console.log(`value`, $(e.target).val());
        $("#options").css("display", "none");
        let element = $(e.target);
        let elObj = cities[element.attr("id")];
        searchLocation[`${elObj.name}_${elObj.state}_${elObj.country}`] = elObj;
        localStorage.setItem("locationData", JSON.stringify(searchLocation));

        let lat = parseFloat(elObj.lat);

        let lon = parseFloat(elObj.lon);
        getWeatherData(lat, lon, key, cityName);

        renderLocationData();
      });
    });
});

//This function extracts the data from local storage and renders the data
function renderLocationData() {
  $("#prev-locations").empty();
  let prevData = JSON.parse(localStorage.getItem("locationData"));
  if (prevData !== null) {
    searchLocation = prevData;
  }
  let prevLocations = $("#prev-locations");
  console.log(`searchLocation`, searchLocation);

  for (let key of Object.keys(searchLocation)) {
    let el = searchLocation[key];
    // console.log(key);
    let li = $("<li>");
    li.text(`${el.name}, ${el.state}, ${el.country}`);
    li.attr("id", `${el.name}_${el.lat}_${el.lon}`);
    prevLocations.append(li);
  }
}

renderLocationData();

function getWeatherData(lat, lon, key, cityName) {
  fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=imperial`
  )
    .then((data) => data.json())
    .then((data) => {
      console.log(data);
      let list = data.list;
      let newData = [];
      for (let i = 0; i <= 40; i += 8) {
        if (i !== 40) {
          newData.push(list[i]);
        } else {
          newData.push(list[40 - 1]);
        }
      }
      renderWeatherData(newData, cityName);
    });
}

function renderWeatherData(data, cityName) {
  console.log(`new data`, data);
  let liElArr = $("#future_data-cards").children();
  // Current location and current weather data
  $("#current_data #main_city-name").text(cityName);
  $("#present_date").text(dayjs.unix(data[0].dt).format("MM/DD/YY"));
  $("#weather_icon").attr(
    "src",
    `https://openweathermap.org/img/wn/${data[0].weather[0].icon}@2x.png`
  );
  $("#main_temp").text(`${data[0].main.temp}`);
  $("#main_wind").text(`${data[0].wind.speed} MPH`);
  $("#main_humidity").text(`${data[0].main.humidity} %`);

  for (let i = 0; i < liElArr.length; i++) {
    let li = liElArr[i];
    let info = data[i + 1];
    $(li).find(".date").text(dayjs.unix(info.dt).format("MM/DD/YY"));
    $(li)
      .find(".icon")
      .attr(
        "src",
        `https://openweathermap.org/img/wn/${info.weather[0].icon}@2x.png`
      );
    $(li).find(".temp").text(info.main.temp);
    $(li).find(".wind").text(info.wind.speed);
    $(li).find(".humidity").text(info.main.humidity);
  }
}

const key = "22550d17b8218021ec4876ec01ea0dfe"; // api key
let searchLocation = {}; //
let searchInput = $("#search_input");
let search_form = $("#search_form"); //form to take search input
let clearBtn = $("#clear-data");

// Clears search history
clearBtn.on("click", function (e) {
  localStorage.clear();
  location.reload("/");
});

// function called on submit fetches data to get co-ordinates by direct geo-coding and shows 5 choices that matches the city name. Based on user selection the city name is saved in the local storage for future use.
search_form.on("submit", function (e) {
  $("#options").css("display", "block");
  let cities = {}; // temp object
  e.preventDefault();
  let cityName = searchInput.val(); //check for numaric inputs
  searchInput.val("");

  fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=${10}&appid=${key}`
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

  for (let key of Object.keys(searchLocation)) {
    let el = searchLocation[key];

    let li = $("<li>");
    li.attr(
      "class",
      " d-flex align-conetnt-center justify-content-between searched"
    );
    li.text(`${el.name}, ${el.state}, ${el.country}`);
    li.attr("id", `${el.name}_${el.lat}_${el.lon}`);
    prevLocations.append(li);
  }
}

// $("aside").on("click", ".delete", function (e) {
//   let el = e.target;
//   let parentId = $(el).parent().attr("id");
//   let newstr = parentId.split("_");
//   let cityName = newstr[0];
//   let lat = parseFloat(newstr[1]);
//   let lon = parseFloat(newstr[2]);
//   let prevData = JSON.parse(localStorage.getItem("locationData"));
//   for (let key of Object.keys(prevData)) {
//     let obj = prevData[key];
//     if (obj.name === cityName && obj.lat === lat && obj.lon === lon) {
//       delete prevData.obj;
//       searchLocation = { ...prevData };
//       localStorage.setItem("locationData", JSON.stringify(searchLocation));
//       renderLocationData();
//     }
//   }
// });

// On click function to call weather api from searched location
$("aside").on("click", ".searched", function (e) {
  $("aside").find(".delete").css("pointer-event", "none");
  let el = e.target;
  let newstr = $(el).attr("id").split("_");
  let cityName = newstr[0];
  let lat = parseFloat(newstr[1]);
  let lon = parseFloat(newstr[2]);
  getWeatherData(lat, lon, key, cityName);
});

//Api call for weather info
function getWeatherData(lat, lon, key, cityName) {
  fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=imperial`
  )
    .then((data) => data.json())
    .then((data) => {
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

// Function renders weather data
function renderWeatherData(data, cityName) {
  let liElArr = $("#future_data-cards").children();
  // Current location and current weather data
  $("#current_data #main_city-name").text(cityName);
  $("#present_date").text(dayjs.unix(data[0].dt).format("MM/DD/YY"));
  $("#weather_icon").attr(
    "src",
    `https://openweathermap.org/img/wn/${data[0].weather[0].icon}@2x.png`
  );
  $("#main_temp").text(`${data[0].main.temp} `);
  $("#main_wind").text(`${data[0].wind.speed}  MPH`);
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
    $(li).find(".temp").text(`${info.main.temp} `);
    $(li).find(".wind").text(`${info.wind.speed} `);
    $(li).find(".humidity").text(`${info.main.humidity} `);
  }
}

renderLocationData(); // this function runs on page load

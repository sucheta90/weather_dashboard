const key = "22550d17b8218021ec4876ec01ea0dfe";
let searchLocation = {};
// Api call
// http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}

// q City name, state code (only for the US) and country code divided by comma. Please use ISO 3166 country codes.
// let longitude;
// let latitude;
let searchInput = $("#search_input");
let search_form = $("#search_form");
// console.log("Hello");

search_form.on("submit", function (e) {
  let cities = {};
  e.preventDefault();
  $("#options");
  let cityName = searchInput.val(); //check for numaric inputs
  searchInput.val("");
  //   let zipCode = typeof searchInput.val() === Number ? searchInput.val() : "";

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
        alert("clicked");
        let element = $(e.target);
        let elObj = cities[element.attr("id")];
        searchLocation[`${elObj.name}, ${elObj.state}, ${elObj.country}`] =
          elObj;
        localStorage.setItem("locationData", JSON.stringify(searchLocation));
        console.log(elObj);
        let lat = parseInt(elObj.lat);
        console.log(lat);
        let lon = parseInt(elObj.lon);
        console.log(lon);
        // fetch(
        //   `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}`
        // )
        //   .then((data) => data.json())
        //   .then((data) => {
        //     console.log(data);
        //   });
      });
    });
});

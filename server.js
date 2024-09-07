"use strict";

const express = require("express");
const morgan = require("morgan");
const http = require("http");
const socketIO = require("socket.io");
const Amadeus = require("amadeus");
const path = require("path");

const app = express();
const server = http.Server(app);
const io = socketIO(server, {
  // cors: {
  //   origin: ["http://localhost:5000", "http://localhost:3000"],
  //   methods: ["GET", "POST"],
  // },
});

const amadeus = new Amadeus({
  clientId: "insert Client ID here",
  clientSecret: "insert Client Secret here",
});

const backend_file = require("./Backend.json");
const intents = backend_file.intents;
const destinations = backend_file.destinations;
const fallback_questions = backend_file.fallback_questions;
const first_message = backend_file.first_message;
const message_after = backend_file.message_after;
var airports = require("airport-codes");

let rephraseCount = 0;
let nextExpectation = "";
let destination_history = [];
let input_date = "";

let originCity,
  destinationCity,
  hotelCity,
  departureDate,
  adults,
  hotelAdults,
  checkInDate,
  checkOutDate;

async function getFlightDetails(
  originCity,
  destinationCity,
  departureDate,
  adults
) {
  console.log(
    "Getting flight details with: ",
    originCity,
    destinationCity,
    departureDate,
    adults
  );
  try {
    const originIATACode = await getIATACode(originCity);
    const destinationIATACode = await getIATACode(destinationCity);

    console.log("IATA Codes: ", originIATACode, destinationIATACode);

    const flightResponse = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: originIATACode,
      destinationLocationCode: destinationIATACode,
      departureDate: departureDate,
      adults: adults,
      max: 3,
    });

    console.log("I found the following 3 flights for you:");

    if (flightResponse.data && flightResponse.data.length > 0) {
      let flightsDetails = flightResponse.data
        .map((flight, index) => {
          let departureDetails = flight.itineraries[0].segments[0].departure;
          let arrivalDetails = flight.itineraries[0].segments[0].arrival;
          let pricingDetails = flight.price;
          let travelerDetails = flight.travelerPricings[0];

          return `
          Flight ${index + 1}:
  
              Departure:
              Airport: ${departureDetails.iataCode}
              Terminal: ${departureDetails.terminal}
              Time: ${departureDetails.at}
  
              Arrival:
              Airport: ${arrivalDetails.iataCode}
              Terminal: ${arrivalDetails.terminal}
              Time: ${arrivalDetails.at}
  
              Number of Stops: ${
                flight.itineraries[0].segments[0].numberOfStops
              }
  
              Pricing:
              Currency: ${pricingDetails.currency}
              Total Price: ${pricingDetails.grandTotal}
  
            Traveler Details:
              Type of Traveler: ${travelerDetails.travelerType}
          `;
        })
        .join("\n");

      flightsDetails += message_after.flight_search;
      return flightsDetails;
    } else {
      return message_after.no_flights_found + message_after.flight_search;
    }
  } catch (error) {
    console.log("Error while getting flight details:", error);
    return message_after.flight_search_error + message_after.flight_search;
  }
}

async function getHotelDetails(
  hotelCity,
  checkInDate,
  checkOutDate,
  hotelAdults
) {
  try {
    const response1 = await amadeus.referenceData.locations.hotels.byCity.get({
      cityCode: hotelCity,
    });

    let hotels = "";
    for (let j = 0; j < 15; j++) {
      // wait for 1 second before sending the next request
      await new Promise((resolve) => setTimeout(resolve, 550));

      console.log(`Searching for offers for ${response1.data[j].name}...`);
      const response2 = await amadeus.shopping.hotelOffersSearch.get({
        hotelIds: response1.data[j].hotelId,
        adults: hotelAdults,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        max : 5
      });

      if (response2.data && response2.data.length > 0) {
        hotels += `\n Hotel Name: ${response1.data[j].name}\n`;
        hotels += `Offers:\n`;
        for (let k = 0; k < response2.data.length; k++) {
          hotels += `    Check-in Date: ${response2.data[k].offers[0].checkInDate}\n`;
          hotels += `    Check-out Date: ${response2.data[k].offers[0].checkOutDate}\n`;
          hotels += `    Room Type: ${response2.data[k].offers[0].room.type}\n`;
          hotels += `    Price: ${response2.data[k].offers[0].price.total} ${response2.data[k].offers[0].price.currency}\n`;
        }
        console.log(`Offers found for ${response1.data[j].name}`);
      } else {
        console.log(`No offers found for ${response1.data[j].name}`);
      }
    }
    if (hotels === "") {
      return message_after.no_hotels_found + message_after.hotel_search;
    } else {
      hotels += message_after.hotel_search;
      return hotels;
    }
  } catch (error) {
    console.error(error);
    return message_after.hotel_search_error + message_after.hotel_search;
  }
}

const fetch = require("node-fetch");

async function getIATACode(cityName) {
  try {
    const response = await amadeus.referenceData.locations.get({
      subType: "AIRPORT",
      keyword: cityName,
      "page[limit]": 1,
    });

    if (response.data && response.data.length > 0) {
      return response.data[0].iataCode;
    } else {
      // Search for city code using the AviationStack API
      const aviationResponse = await fetch(
        `http://api.aviationstack.com/v1/airports?access_key=ACCESSKEY&city=${cityName}`
      );
      const aviationData = await aviationResponse.json();
      if (aviationData.data && aviationData.data.length > 0) {
        return aviationData.data[0].iata;
      }
    }
  } catch {
    return "";
  }
}

function convertDate(date) {
  let day = "";
  let month = "";
  let year = "";
  let converted_date = "";

  if (date.getDate() >= 10) {
    day = date.getDate();
  } else {
    day = "0" + date.getDate();
  }
  if (date.getMonth() >= 9) {
    month = date.getMonth() + 1;
  } else {
    month = "0" + (date.getMonth() + 1);
  }
  year = date.getFullYear();
  converted_date = year + "-" + month + "-" + day;
  return converted_date;
}

function isDateValid(date, input_date) {
  let today_date = new Date();
  if (date.length < 8 || isNaN(input_date) || input_date < today_date) {
    return false;
  } else {
    return true;
  }
}

function getDestination() {
  let score = ["", 0];
  let scores = [];
  let max_score = ["", -1];
  for (let destination in destinations) {
    score[0] = destinations[destination].destination_name;
    score[1] = 0;
    for (
      let destination_counter = 0;
      destination_counter < destination_history.length;
      destination_counter++
    ) {
      let property = destination_history[destination_counter][0];
      let user_choice = destination_history[destination_counter][1];
      let property_weight = destination_history[destination_counter][2];
      if (destinations[destination][property].includes(user_choice)) {
        score[1] += property_weight;
      }
    }
    scores.push(score.slice(0));
  }

  for (let score_counter = 0; score_counter < scores.length; score_counter++) {
    if (scores[score_counter][1] > max_score[1]) {
      max_score[0] = scores[score_counter][0];
      max_score[1] = scores[score_counter][1];
    }
  }
  nextExpectation = "";
  destination_history = [];
  let perfect_destination = max_score[0];
  return (
    message_after.destination_result +
    perfect_destination +
    message_after.destination
  );
}

function getResponse(message) {
  return new Promise(async (resolve) => {
    if (
      nextExpectation == "originCity" ||
      nextExpectation == "destinationCity" ||
      nextExpectation == "departureDate" ||
      nextExpectation == "adults" ||
      nextExpectation == "hotelCity" ||
      nextExpectation == "checkInDate" ||
      nextExpectation == "checkOutDate" ||
      nextExpectation == "hotelAdults"
    ) {
      const result = await handleExpectation(message);
      resolve(result);
    } else {
      // keyword spotting
      const words = message.toLowerCase().split(" ");
      for (let word of words) {
        for (let intent_num = 0; intent_num < intents.length; intent_num++) {
          if (intents[intent_num]["keywords"].includes(word)) {
            if (
              intents[intent_num]["is_independent"] === true &&
              nextExpectation === ""
            ) {
              nextExpectation = intents[intent_num]["next_expectation"];
              resolve(
                intents[intent_num]["answers"][
                  Math.floor(
                    Math.random() * intents[intent_num]["answers"].length
                  )
                ]
              );
            } else {
              // find response to the questions which can't be called immediately (suggest destination questions)
              for (
                let intent_counter = 0;
                intent_counter < intents.length;
                intent_counter++
              ) {
                if (intents[intent_counter]["intent_name"] == nextExpectation) {
                  if (intents[intent_counter]["keywords"].includes(word)) {
                    nextExpectation =
                      intents[intent_counter]["next_expectation"];
                    let intent = intents[intent_counter]["intent_name"];
                    let user_answer = [];
                    user_answer[0] = intent;
                    user_answer[1] = word;
                    user_answer[2] = intents[intent_counter]["question_weight"];
                    destination_history.push(user_answer);
                    if (nextExpectation === "find_destination") {
                      resolve(getDestination());
                    } else {
                      resolve(intents[intent_counter]["answers"][0]);
                    }
                  }
                }
              }
            }
          }
        }
      }
      resolve(fallback_questions.general);
    }
  });
}

async function handleExpectation(message) {
  let response = "";
  switch (nextExpectation) {
    case "originCity":
      originCity = await getIATACode(message);
      if (originCity === undefined || originCity === "" || originCity.length != 3 ) {
        nextExpectation = "originCity";
        response = fallback_questions.originCity;
      } else {
        nextExpectation = "destinationCity";
        let CorrectedOriginCityName = await airports.findWhere({ iata: originCity }).get("name");
        response = `So we'll depart from ${CorrectedOriginCityName} airport. What's your destination?`;
      }
      break;

    case "destinationCity":
      destinationCity = await getIATACode(message);
      if (destinationCity === undefined || destinationCity === "" || destinationCity.length != 3 || destinationCity === originCity){
        nextExpectation = "destinationCity";
        response = fallback_questions.destinationCity;
      } else {
        let CorrectedOriginCityName = await airports
          .findWhere({ iata: originCity })
          .get("name");
        let CorrectedDestinationCityName = await airports
          .findWhere({ iata: destinationCity })
          .get("name");
        nextExpectation = "departureDate";
        response = `Perfect, flying from ${CorrectedOriginCityName} to ${CorrectedDestinationCityName}. When is your departure date (YYYY-MM-DD)?`;
      }
      break;

    case "departureDate":
      input_date = new Date(message);
      if (isDateValid(message, input_date) === false) {
        response = fallback_questions.departureDate;
        nextExpectation = "departureDate";
      } else {
        departureDate = convertDate(input_date);
        response = `Got it, your departure date is ${departureDate}. Finally, how many adults will be flying?`;
        nextExpectation = "adults";
      }
      break;

    case "adults":
      adults = parseInt(message);
      if (isNaN(adults) || adults <= 0 || adults > 8) {
        response = fallback_questions.adults;
        nextExpectation = "adults";
      } else {
        response = await getFlightDetails(
          originCity,
          destinationCity,
          departureDate,
          adults
        );
        originCity = "";
        destinationCity = "";
        departureDate = "";
        adults = 0;
        nextExpectation = "";
      }
      break;

    // Enter cases for hotelCity, checkInDate, checkOutDate and hotelAdults here
    case "hotelCity":
      hotelCity = await getIATACode(message);
      if (hotelCity === undefined || hotelCity === "" || hotelCity.length != 3) {
        nextExpectation = "hotelCity";
        response = fallback_questions.hotelCity;
      } else {
        nextExpectation = "checkInDate";
        let CorrectedCityName = airports
          .findWhere({ iata: hotelCity })
          .get("city");
        response = `I will look for a hotel near ${CorrectedCityName}. What's your check-in date (YYYY-MM-DD)?`;
      }
      break;
    case "checkInDate":
      input_date = new Date(message);
      if (isDateValid(message, input_date) === false) {
        response = fallback_questions.checkInDate;
        nextExpectation = "checkInDate";
      } else {
        checkInDate = convertDate(input_date);
        response = `Got it, your check-in date is ${checkInDate}. What's your check-out date (YYYY-MM-DD)?`;
        nextExpectation = "checkOutDate";
      }
      break;
    case "checkOutDate":
      input_date = new Date(message);
      if (isDateValid(message, input_date) === false) {
        response = fallback_questions.checkOutDate;
        nextExpectation = "checkOutDate";
      } else {
        let check_in_date = new Date(checkInDate);
        if (input_date <= check_in_date) {
          response = fallback_questions.checkOutDate;
          nextExpectation = "checkOutDate";
        } else {
          checkOutDate = convertDate(input_date);
          response = `Got it, your check-out date is ${checkOutDate}. Finally, how many adults will be staying?`;
          nextExpectation = "hotelAdults";
        }
      }
      break;

    case "hotelAdults":
      hotelAdults = parseInt(message);
      if (isNaN(hotelAdults) || hotelAdults <= 0 || hotelAdults > 8) {
        response = fallback_questions.adults;
        nextExpectation = "hotelAdults"; // re-prompt for adults if the input was not a valid number
      } else {
        response = await getHotelDetails(
          hotelCity,
          checkInDate,
          checkOutDate,
          hotelAdults
        );
        hotelCity = "";
        checkInDate = "";
        checkOutDate = "";
        hotelAdults = 0;
        nextExpectation = ""; // reset the expectation as the flow is finished
      }
      break;

    default:
      response = fallback_questions.default;
      nextExpectation = "";
  }
  return response;
}

// checks if there should be a soft/hard fallback
async function checkForFallback(user_message) {
  let response = await getResponse(user_message);
  if (Object.values(fallback_questions).includes(response)) {
    if (rephraseCount < 3) {
      // soft fallback
      rephraseCount = rephraseCount + 1;
      return response;
    } else {
      // hard fallback
      response = first_message;
      rephraseCount = 0;
      nextExpectation = "";
      return response;
    }
  } else {
    rephraseCount = 0;
    return response;
  }
}

io.on("connection", function (socket) {
  socket.on("client-message", async (data) => {
    let a = JSON.parse(data);
    // console.log("Received message from client: ", a.message);
    let response = await checkForFallback(a.message); //  check if there is a fallback
    // console.log(response);
    socket.emit("server-response", response);
  });
});
const port = process.env.PORT || 5000;
server.listen(port, function () {
  console.log("Server started on port ${port}");
});

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "build")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

return server;

// class Flight {
//   var id;
//   var name;
//   var time;
// }

// hour ranges for all 24 hours
var hour_filters = [{'start':'00:00:00','end':'00:59:59'},
                    {'start':'01:00:00','end':'01:59:59'},
                    {'start':'02:00:00','end':'02:59:59'},
                    {'start':'03:00:00','end':'03:59:59'},
                    {'start':'04:00:00','end':'04:59:59'},
                    {'start':'05:00:00','end':'05:59:59'},
                    {'start':'06:00:00','end':'06:59:59'},
                    {'start':'07:00:00','end':'07:59:59'},
                    {'start':'08:00:00','end':'08:59:59'},
                    {'start':'09:00:00','end':'09:59:59'},
                    {'start':'10:00:00','end':'10:59:59'},
                    {'start':'11:00:00','end':'11:59:59'},
                    {'start':'12:00:00','end':'12:59:59'},
                    {'start':'13:00:00','end':'13:59:59'},
                    {'start':'14:00:00','end':'14:59:59'},
                    {'start':'15:00:00','end':'15:59:59'},
                    {'start':'16:00:00','end':'16:59:59'},
                    {'start':'17:00:00','end':'17:59:59'},
                    {'start':'18:00:00','end':'18:59:59'},
                    {'start':'19:00:00','end':'19:59:59'},
                    {'start':'20:00:00','end':'20:59:59'},
                    {'start':'21:00:00','end':'21:59:59'},
                    {'start':'22:00:00','end':'22:59:59'},
                    {'start':'23:00:00','end':'23:59:59'}];

// Airline name displayed at the top of the char
var displayed_airline_name = '';

/*
  This function calculates flight data, and draws the graph.
*/
function update_flights_info(searched_airline_id = '') {
  var num_flights_by_hour = get_flights_by_hour(searched_airline_id)
  const total_flights = num_flights_by_hour.reduce((partial_sum, current_value) => partial_sum + current_value, 0);

  displayed_airline_name = searched_airline_id == '' ? 'All Airlines' : displayed_airline_name;
  document.getElementById('flight_count').textContent = `${total_flights} Flights ${displayed_airline_name}`;

  //call function to calculate coordinates
  var coordinates = calculate_coordinates(num_flights_by_hour);
  draw_poly_line(coordinates.join(" "));
}

/*
  Get number of flights for each hours
  The return value is an array of length 24, where each element is the
  number of flights in that hour
*/
function get_flights_by_hour(searched_airline_id = '') {
  var flights_data;
  if(searched_airline_id == '') {
    // no search term, use all flights
    flights_data = flights_jan_01_2008;
  } else {
    // filter the flights that match the search term
    flights_data = flights_jan_01_2008.filter(function(flight){
      return searched_airline_id == flight.airline;
    });
  }

  var num_flights_by_hour = [];
  for(var hour_index = 0; hour_index < hour_filters.length; hour_index++){
    num_flights_in_current_hour = flights_data.filter(function(flight) {
      return is_flight_in_given_hour(flight, hour_index);
    })

    num_flights_by_hour.push(num_flights_in_current_hour.length);
  }
  return num_flights_by_hour;
}

// Checks if the flight falls in the given hour index[0-23]
function is_flight_in_given_hour(flight, hour_index) {
  var hour_start = Date.parse('01/01/2008 '+ hour_filters[hour_index].start);
  var hour_end = Date.parse('01/01/2008 '+ hour_filters[hour_index].end);
  var flight_time = Date.parse('01/01/2008 ' + flight.time);

  return hour_start <= flight_time && flight_time <= hour_end;
}

function calculate_coordinates(flights_data, width=480, height=150){
  var max = Math.max(...flights_data);
  var min = Math.min(...flights_data);

  var num_x_pixels_for_hour = width / flights_data.length
  var num_y_pixels_for_point = (max - min) / height

  return flights_data.map( function( value, i ) {
       // Offset by ( num_x_pixels_for_hour / 2 ) to center the point in each hour
       var x = ( num_x_pixels_for_hour * i ) + ( num_x_pixels_for_hour / 2 )

       var y = height - ((value - min)/num_y_pixels_for_point);
       return [x,y]
   })
}

// func to draw polygon points
function draw_poly_line(coordinates){
  var svg = document.getElementById('flights_chart');
  // delete all polygon points
  var poly_elements = document.getElementsByTagName('polygon'), index;
  for (index = poly_elements.length - 1; index >= 0; index--) {
    poly_elements[index].parentNode.removeChild(poly_elements[index]);
  }

  var polygon = document.createElementNS("http://www.w3.org/2000/svg","polygon");
   polygon.setAttribute("points", coordinates);
   polygon.setAttribute("stroke", "#0074d9");
   polygon.setAttribute('fill', "none");
   svg.appendChild(polygon);
}

// keypress event on input text filter
document.getElementById('airline_name').onkeypress = function(event){
 if(event.keyCode == 13 || event.which == 13){
   get_filtered_airlines(event);
  }
}

function get_filtered_airlines(event){
  var filter_query = event.target.value;

  if(filter_query == '') {
    update_flights_info();
  }
  else {
    let selected_airline_index;
    var all_airline_names = Object.values(airlines);
    for(let i=0; i<all_airline_names.length; i++){
     if(all_airline_names[i].toLowerCase().includes(filter_query.toLowerCase())){
       selected_airline_index = i;
       displayed_airline_name = all_airline_names[i];
       break;
      }
    }
    //get keys of airlines object
    var airline_ids = Object.keys(airlines);
    // get code of airline object
    var selected_airline_id = airline_ids[selected_airline_index];
    update_flights_info(selected_airline_id);
  }
}

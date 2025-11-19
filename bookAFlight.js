import wixBookings from 'wix-bookings';
import wixData from 'wix-data';
import wixMembers from 'wix-members';
import wixLocationFrontend from 'wix-location-frontend';
import wixBookingsFrontend from 'wix-bookings-frontend';
import wixWindowFrontend from "wix-window-frontend";



let deviceType = wixWindowFrontend.formFactor;
const today = new Date();
console.log("today:", today)
const firstDayOfTodaysMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let initialVisit = true;

const selectedDateColor = "white";
const selectedDateBgColor = "#ffb71bff";
const normalDateColor = "black";
const normalDateBgColor = "lightgray";
const disabledDateColor = "darkgray";
const disabledDateBgColor = "lightgray";
const openDateColor = "#ffb71bff";
const openDateBgColor = "white";
const waitlistDateColor = "black";
const waitlistDateBgColor = "white";
const greenDotColor = "#ffb71bff";
const redDotColor = "#de5021";
const goldenRodColor = "#ffb71bff";

let calDayButtons = [$w('#sun1'), $w('#mon1'), $w('#tue1'), $w('#wed1'), $w('#thu1'), $w('#fri1'), $w('#sat1'),
    $w('#sun2'), $w('#mon2'), $w('#tue2'), $w('#wed2'), $w('#thu2'), $w('#fri2'), $w('#sat2'),
    $w('#sun3'), $w('#mon3'), $w('#tue3'), $w('#wed3'), $w('#thu3'), $w('#fri3'), $w('#sat3'),
    $w('#sun4'), $w('#mon4'), $w('#tue4'), $w('#wed4'), $w('#thu4'), $w('#fri4'), $w('#sat4'),
    $w('#sun5'), $w('#mon5'), $w('#tue5'), $w('#wed5'), $w('#thu5'), $w('#fri5'), $w('#sat5'),
    $w('#sun6'), $w('#mon6'), $w('#tue6'), $w('#wed6'), $w('#thu6'), $w('#fri6'), $w('#sat6')
];

let redWeatherDots = [
  $w('#redWeather0'), $w('#redWeather1'), $w('#redWeather2'), $w('#redWeather3'),
  $w('#redWeather4'), $w('#redWeather5'), $w('#redWeather6'), $w('#redWeather7'),
  $w('#redWeather8'), $w('#redWeather9'), $w('#redWeather10'), $w('#redWeather11'),
  $w('#redWeather12'), $w('#redWeather13'), $w('#redWeather14'), $w('#redWeather15'),
  $w('#redWeather16'), $w('#redWeather17'), $w('#redWeather18'), $w('#redWeather19'),
  $w('#redWeather20'), $w('#redWeather21'), $w('#redWeather22'), $w('#redWeather23'),
  $w('#redWeather24'), $w('#redWeather25'), $w('#redWeather26'), $w('#redWeather27'),
  $w('#redWeather28'), $w('#redWeather29'), $w('#redWeather30'), $w('#redWeather31'),
  $w('#redWeather32'), $w('#redWeather33'), $w('#redWeather34'), $w('#redWeather35'),
  $w('#redWeather36'), $w('#redWeather37'), $w('#redWeather38'), $w('#redWeather39'),
  $w('#redWeather40'), $w('#redWeather41')
];


let yellowWeatherDots = [
  $w('#yellowWeather0'), $w('#yellowWeather1'), $w('#yellowWeather2'), $w('#yellowWeather3'),
  $w('#yellowWeather4'), $w('#yellowWeather5'), $w('#yellowWeather6'), $w('#yellowWeather7'),
  $w('#yellowWeather8'), $w('#yellowWeather9'), $w('#yellowWeather10'), $w('#yellowWeather11'),
  $w('#yellowWeather12'), $w('#yellowWeather13'), $w('#yellowWeather14'), $w('#yellowWeather15'),
  $w('#yellowWeather16'), $w('#yellowWeather17'), $w('#yellowWeather18'), $w('#yellowWeather19'),
  $w('#yellowWeather20'), $w('#yellowWeather21'), $w('#yellowWeather22'), $w('#yellowWeather23'),
  $w('#yellowWeather24'), $w('#yellowWeather25'), $w('#yellowWeather26'), $w('#yellowWeather27'),
  $w('#yellowWeather28'), $w('#yellowWeather29'), $w('#yellowWeather30'), $w('#yellowWeather31'),
  $w('#yellowWeather32'), $w('#yellowWeather33'), $w('#yellowWeather34'), $w('#yellowWeather35'),
  $w('#yellowWeather36'), $w('#yellowWeather37'), $w('#yellowWeather38'), $w('#yellowWeather39'),
  $w('#yellowWeather40'), $w('#yellowWeather41')
];


let greenWeatherDots = [
  $w('#greenWeather0'), $w('#greenWeather1'), $w('#greenWeather2'), $w('#greenWeather3'),
  $w('#greenWeather4'), $w('#greenWeather5'), $w('#greenWeather6'), $w('#greenWeather7'),
  $w('#greenWeather8'), $w('#greenWeather9'), $w('#greenWeather10'), $w('#greenWeather11'),
  $w('#greenWeather12'), $w('#greenWeather13'), $w('#greenWeather14'), $w('#greenWeather15'),
  $w('#greenWeather16'), $w('#greenWeather17'), $w('#greenWeather18'), $w('#greenWeather19'),
  $w('#greenWeather20'), $w('#greenWeather21'), $w('#greenWeather22'), $w('#greenWeather23'),
  $w('#greenWeather24'), $w('#greenWeather25'), $w('#greenWeather26'), $w('#greenWeather27'),
  $w('#greenWeather28'), $w('#greenWeather29'), $w('#greenWeather30'), $w('#greenWeather31'),
  $w('#greenWeather32'), $w('#greenWeather33'), $w('#greenWeather34'), $w('#greenWeather35'),
  $w('#greenWeather36'), $w('#greenWeather37'), $w('#greenWeather38'), $w('#greenWeather39'),
  $w('#greenWeather40'), $w('#greenWeather41')
];


let calButtonDates = [];
let member = null;
let services = [];
let selectableSlots = [];
let availableSlotsIn365Days = [];
let selectedSlot;
let selectedService;
let selectedDate = today;
let totalPrice = 0;
let mediaPackage = 0;
let couponCode = "";
let weatherForecast;

let USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

export function hideWeatherDots (){
    for(let dot of redWeatherDots){
        dot.hide();
    }
    for(let dot of yellowWeatherDots){
        dot.hide();
    }
    for(let dot of greenWeatherDots){
        dot.hide();
    }
    return;
}

export async function getFormattedWeather() {
  const result = await wixData.query("longCenterWeather")
    .limit(1)
    .find();
    if (result.items.length === 0) {
        console.log("No Weather data found!")
    return;
  }
  const data = result.items[0].weatherObject.forecast.forecastday;
    return data;
}

export function getSlotWeather (slotDate) {
    let dateTime = formatDateToWeatherDate(slotDate);
    console.log("Slot DateTime:", dateTime);
    let [date, time] = dateTime.split(" ");
    let [hour, min] = time.split(":")
    //rounding down to the nearest hour if slot is not on the hour.
    if(min != "00"){
        time = hour +":00";
    }
    console.log("finding slot weather for", `${date} ${time}`)
    let dayForecast = weatherForecast.find((obj)=> obj.date == date);
    console.log("DayForecast:", dayForecast);
    if(dayForecast){
    console.log("found forecast for day", dayForecast);
    let hourForecast = dayForecast.hour.find((obj)=> obj.time == `${date} ${time}`);
    let weatherSpecs = {
        condition: hourForecast.condition.text,
        chanceOfRain: hourForecast.chance_of_rain,
        wind_mph: hourForecast.wind_mph,
        gust_mph: hourForecast.gust_mph,
        icon: hourForecast.condition.icon
    }
    return weatherSpecs;
    }
    //if no forecast due to outside of weather forecast range:
    console.log("No weather found for slot");
    return null;
}

export function formatDateToWeatherDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}




$w.onReady(async function () {
    hideWeatherDots();
    weatherForecast = await getFormattedWeather();
    console.log("Forecast:", weatherForecast);
    //hiding yearMonth element to use the text element instead to solve the problem of the dropdown arrow
    $w('#yearMonth').hide();
    let yearMonthValues = [];

    for (let i = -12; i <= 12; i++) {
        const date = addMonth(firstDayOfTodaysMonth, i);
        yearMonthValues.push({
            label: date.toLocaleDateString("en-US", { year: 'numeric', month: 'long' }),
            value: date.getFullYear().toString() + "-" + Number(date.getMonth() + 1).toString() + "-" + date.getDate().toString()
        });

    }

    $w('#yearMonth').options = yearMonthValues;

    let opts = [];
    const addr = {
        label: "All bookable locations",
        value: "ALL"
    };
    //opts.push(addr);

    //hardcoding Austin as an option so it always appears, even when no availabilty exists
    const austin = {
        label: "Austin, TX - The Long Center",
        value: "Austin, TX"
    }
    const activeLocationsLabel = {
            label: "--- Active Locations ---",
            value: "__"
        };

    opts.push(activeLocationsLabel,austin);

    

    member = await getCurrentMember();

    const _services = await wixData.query("Bookings/Services").find({ suppressAuth: true })
    services = _services.items;
    

    const options = {
        startDateTime: new Date(),
        endDateTime: addDays(new Date(), 365)
    };

    for (const service of services) {

        let serviceID = service._id;
        const availability = await wixBookings.getServiceAvailability(serviceID, options);
        
        const availableSlots = availability.slots;
        for (const slot of availableSlots) {
            availableSlotsIn365Days.push(slot);
            let addrArray = slot.location.businessLocation.address.formatted.split(" ")
            
            let city = addrArray[4];
            let subdivision = addrArray[5];
            
            
            const addr = {
                label: city === 'Austin,' ? "Austin, TX - The Long Center" : city + " " +
                    subdivision,
                value: city + " " +
                    subdivision
            };


            if (!opts.find((item) => (item.label === addr.label))) {
                opts.push(addr);

            }

        }

    }

    const results = await wixData.query("futureLocations")
        .eq("future", true)
        .ascending("title")
        .find();

    if (results.length > 0) {
        const addr = {
            label: "--- Join Waitlist ---",
            value: "__F"
        };
        opts.push(addr);

    }
    for (const item of results.items) {
        const addr = {
            label: item.title,
            value: "F_" + item.title
        };

        opts.push(addr);

    }
    

    availableSlotsIn365Days.sort(function (a, b) {
        return a.startDateTime.getTime() - b.startDateTime.getTime();
    });
    

    $w('#locationDropdown').options = opts;
    $w('#filterSection').show();

    $w('#locationDropdown').value = "Austin, TX";
    $w('#locationDropdown').label = "Select a location:"
    $w('#numberOfFlightsDropdown').value = "1";
    refreshCalendar("Austin, TX", 1, null);
    //$w('#repeater').hide();
    //$w('#boxWaitlist').hide();
    //$w('#txtAvailSessions').html = "<h6 style='text-align:left;'>Available sessions: <br><br><br>  « Select your date</h6>";
    //$w('#filterSection').scrollTo();

});

export function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function getSunday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day; // adjust when day is sunday
    return new Date(d.setDate(diff));
}

function addMonth(date, month) {
    let result = new Date(date);
    result.setMonth(result.getMonth() + month);
    return result;
}

function isPast(date) {
    let now = new Date();
    now.setHours(0, 0, 0, 0);
    return date < now;
}

function isSameDay(date1, date2) {
    let d1 = new Date(date1);
    let d2 = new Date(date2);
    return (d1.getFullYear() == d2.getFullYear() &&
        d1.getMonth() == d2.getMonth() &&
        d1.getDate() == d2.getDate());

}

function isBetweenDates(date, dateStart, dateEnd) {
    if (isSameDay(dateStart, dateEnd)) return isSameDay(date, dateStart);
    return dateStart <= date && dateEnd >= date;
}

export async function getCurrentMember(options) {
    return await wixMembers.currentMember.getMember(options)
        .then((member) => {
            return member;
        })
        .catch((error) => {
            return null;
        })
}

function indexOfObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return i;
        }
    }

    return -1;
}

export function createCTDateFromYMD(dateString) {
  // Parse string as year, month, day
  let [year, month, day] = dateString.split('-').map(Number);

  // Central Time is UTC-6 in standard time, UTC-5 during DST
  // Get current offset from UTC for Central Time on that date
  let approxDate = new Date(Date.UTC(year, month - 1, day));
  let ctOffset = getCentralTimeOffset(approxDate); // in minutes

  // Subtract CT offset from UTC to simulate CT-local midnight
  return new Date(Date.UTC(year, month - 1, day, 0, -ctOffset));
}

export function getCentralTimeOffset(date) {
  // "America/Chicago" observes daylight savings
  return -1 * new Date(date.toLocaleString("en-US", { timeZone: "America/Chicago" })).getTimezoneOffset();
}

function getStdDevForDay(day) {
  const lookup = {
    1: 2,
    2: 3,
    3: 4,
    4: 5,
    5: 5.5,
    6: 6,
    7: 6.5
  };
  return lookup[day] || 6.5;
}

export function normalCDF(x, mean, std) {
  return 0.5 * (1 + erf((x - mean) / (std * Math.sqrt(2))));
}

export function erf(x) {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1 / (1 + p * x);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

export function classifyWind(meanWind, meanGust, forecastDay) {
  const std = getStdDevForDay(forecastDay);

  const windThreshold = 15; // knots
  const gustThreshold = 20; // knots

  const probWind = 1 - normalCDF(windThreshold, meanWind, std);
  const probGust = 1 - normalCDF(gustThreshold, meanGust, std);

  const worstProb = Math.max(probWind, probGust); // Be conservative

  if (worstProb < 0.3) return "Good";
  if (worstProb < 0.7) return "Marginal";
  return "Bad";
}

export function getAverageGusts (hours){
    let total = 0;
    for (let hour of hours){
        total += hour.gust_mph;
    }
    return total / hours.length;
}

export function updateWeatherDots(calendarArray) {
  let targetDate = createCTDateFromYMD(weatherForecast[0].date);
  let index = calendarArray.findIndex(date =>
    date.getUTCFullYear() === targetDate.getUTCFullYear() &&
    date.getUTCMonth() === targetDate.getUTCMonth() &&
    date.getUTCDate() === targetDate.getUTCDate()
  );
  console.log('Index of date', index);
  console.log("date should be:", calendarArray[index]);

  for (let i = 0; i < weatherForecast.length; i++) {
    let meanWind = weatherForecast[i].day.maxwind_mph;
    let meanGust = getAverageGusts(weatherForecast[i].hour)
    let dailyChanceOfRain = weatherForecast[i].day.daily_chance_of_rain;
    if(i === 0){
        //don't use probability calculations if today
        if(meanWind < 15 && dailyChanceOfRain < .30 && meanGust < 20){
            //set first day to green;
            console.log("setting first day to green", meanWind, meanGust, dailyChanceOfRain, "index:", index)
            $w(`#greenWeather${index}`).show();
        }else if(meanWind <= 15 && meanGust <= 20 && dailyChanceOfRain > .30 && dailyChanceOfRain < .70){
            //set first day to yellow
            console.log("setting first day to yellow", meanWind, meanGust, dailyChanceOfRain, "index:", index)
            $w(`#yellowWeather${index}`).show();
        }else{
            //set first day to red
            console.log("setting first day to red", meanWind, meanGust, dailyChanceOfRain, "index:", index)
            $w(`#redWeather${index}`).show();
        }
        
    }else{
        let windCondition = classifyWind(meanWind, meanGust, i);
        if(windCondition === "Good" && dailyChanceOfRain < .3){
            //set to green;
            console.log("setting day to green", windCondition, dailyChanceOfRain, "index:", index)
            $w(`#greenWeather${index}`).show();

        }
        else if(windCondition === "Marginal" || (dailyChanceOfRain > .3 && dailyChanceOfRain < .7)){
            //set to yellow;
            console.log("setting day to yellow", windCondition, dailyChanceOfRain, "index:", index)
            $w(`#yellowWeather${index}`).show();
        }
        else {
            //set to red;
            console.log("setting day to red", windCondition, dailyChanceOfRain, "index:", index)
            $w(`#redWeather${index}`).show();
        }
    }
    index++
  }
  return;
}



function refreshCalendar(location, partySize, selectedDate) {
    // Collect list of bookable dates at filtered location in a year
    let bookableDates = [];
    let waitlistedDates = [];

    const city = location.toString().split(",")[0].trim();
    const subdivision = location == "ALL" ? "" : location.toString().split(",")[1].trim();
    
    availableSlotsIn365Days.forEach(slot => {
        let addrArray = slot.location.businessLocation.address.formatted.split(" ")
        let slot_city = addrArray[4];
        let slot_subdivision = addrArray[5];

        if (location == "ALL" || (slot_city == city.concat(",") &&
                slot_subdivision == subdivision)) {
            if (slot.remainingSpots >= partySize) {
                
                bookableDates.push(slot.startDateTime);
            } else {
                waitlistedDates.push(slot.startDateTime);
            }
        }
    });

    bookableDates.sort(function (a, b) {
        return a - b;
    });

    if (selectedDate == null && initialVisit) {
        //if at least one available slot exists, select first available as default:
        if(availableSlotsIn365Days[0]){
            selectedDate = availableSlotsIn365Days[0].startDateTime;
        } 
        //if no available slots exist, default to today
        else{
            selectedDate = today
        }

    }

    let firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    let sDate = new Date(getSunday(firstDay));

    const firstDayOfMonthOfSelectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    let yearmonthValue = firstDayOfMonthOfSelectedDate.getFullYear().toString() + "-" +
        Number(firstDayOfMonthOfSelectedDate.getMonth() + 1).toString() + "-" +
        firstDayOfMonthOfSelectedDate.getDate().toString();
        $w('#yearMonth').value = yearmonthValue;
        let [year, month] = yearmonthValue.split("-");
        let monthValue = Number(month);
        const months = {
            1: "January",
            2: "February",
            3: "March", 
            4: "April",
            5: "May",
            6: "June",
            7: "July",
            8: "August",
            9: "September",
            10: "October",
            11: "November",
            12: "December"
        };
        let formattedYearMonth = `${months[monthValue]} ${year}`
        //testing text instead of dropdown for yearMonth value:
        $w('#text360').text = formattedYearMonth;
        
    calButtonDates = [];

    calDayButtons.forEach((item, index) => {

        let dayDate = addDays(sDate, index);
        calButtonDates.push(dayDate);
        item.label = dayDate.toLocaleDateString("en-US", { day: 'numeric' });

        if (dayDate.getMonth() == selectedDate.getMonth() && !isPast(dayDate)) {
            if (isSameDay(dayDate, selectedDate)) {
                item.style.backgroundColor = selectedDateBgColor;
                item.style.color = selectedDateColor;
            } else {
                item.style.backgroundColor = normalDateBgColor;
                item.style.color = normalDateColor;

                waitlistedDates.forEach(bDate => {
                    if (isSameDay(bDate, dayDate)) {
                        item.style.backgroundColor = waitlistDateBgColor;
                        item.style.color = waitlistDateColor;

                    }
                });

                bookableDates.forEach(bDate => {
                    if (isSameDay(bDate, dayDate)) {
                        item.style.backgroundColor = openDateBgColor;
                        item.style.color = openDateColor;

                    }
                });

            }

        } else {
            item.style.backgroundColor = disabledDateBgColor;
            item.style.color = disabledDateColor;
        }

    });
    //updateWeatherDots(calButtonDates)
    refreshSlots(location, partySize, selectedDate, selectedDate);
}

function refreshSlots(location, numberOfFlights, startDate, endDate) {
    selectableSlots = [];
    //hardcoding a solution to depict Austin, TX when Florence, TX. A more preferred solution would be to update the location of the service itself. 
    const locationText = (location)=>{
        if(location === "Florence, TX"){
            return "Austin, TX"
        }else{
            return location;
        }
    }

    if (location == undefined || numberOfFlights == undefined || startDate == undefined || endDate == undefined) {
        $w('#repeater').data = selectableSlots;
        $w('#slotSection').hide();
        return;
    }
    
    

    let loc = location == "ALL" ? "" : "in <strong>" + locationText(location) + "</strong>";
    let time;

    if (isSameDay(startDate, endDate)) {
        let selectedDateObject = new Date(startDate);
        let selectedDate = selectedDateObject.toLocaleDateString("en-US", { month: 'long', day: '2-digit', weekday: 'long' })
        time = "on <strong>" + selectedDate + "</strong>";
        console.log("TIME:", time)
    } else {
        let selectedSDateObject = new Date(startDate);
        let selectedSDate = selectedSDateObject.toLocaleDateString("en-US", { month: 'long', day: '2-digit', weekday: 'long' })
        let selectedEDateObject = new Date(endDate);
        let selectedEDate = selectedEDateObject.toLocaleDateString("en-US", { month: 'long', day: '2-digit', weekday: 'long' })
        time = "between <strong>" + selectedSDate + "</strong> and <strong>" + selectedEDate + "</strong>";
    }

    const city = location.toString().split(",")[0].trim();
    const subdivision = location == "ALL" ? "" : location.toString().split(",")[1].trim();
    availableSlotsIn365Days.forEach(slot => {
        let addrArray = slot.location.businessLocation.address.formatted.split(" ")
        let slot_city = addrArray[4];
        let slot_subdivision = addrArray[5];

        if ((location == "ALL" || (slot_city == city.concat(",") &&
                slot_subdivision == subdivision)) &&
            isBetweenDates(slot.startDateTime, startDate, endDate)) {
                let slotWeather = getSlotWeather(slot.startDateTime);
                if(slotWeather){
                    slot.slotWeather = slotWeather;
                }
            selectableSlots.push(slot);
        }
    });
    if(selectableSlots.length > 0){
        console.log("selectable slots", selectableSlots)
    $w('#txtAvailSessions').show();
    $w('#txtAvailSessions').html = "<h6 style='text-align:left;'>Select your time " + loc + " " + time + " for <strong>" + numberOfFlights.toString() + " flight(s)</strong>!</h6>";
    $w('#text302').hide();
    }else if(selectableSlots.length === 0){
        $w('#txtAvailSessions').hide();
        $w('#text302').show();
    }
    

    if (selectableSlots == null || selectableSlots.length == 0) {
        $w('#boxWaitlist').show();
        $w('#repeater').hide();
    } else {

        $w('#boxWaitlist').hide();
        $w('#repeater').show();
    }

    $w('#repeater').data = [];
    $w('#repeater').data = selectableSlots;
    $w('#slotSection').show();
    
    if(deviceType === "Mobile" && selectableSlots.length > 0 && !initialVisit){
        $w('#mobileBox1').scrollTo();
    }
    if(initialVisit){
        initialVisit = false;
    }
}

/**
*	Adds an event handler that runs when an input element's value
 is changed.
	[Read more](https://www.wix.com/corvid/reference/$w.ValueMixin.html#onChange)
*	 @param {$w.Event} event
*/
export function locationDropdown_change(event) {

    if ($w('#locationDropdown').value.startsWith("__")) {
        let si = $w('#locationDropdown').selectedIndex;
        $w('#locationDropdown').selectedIndex = si + 1;
    }

    if ($w('#locationDropdown').value.startsWith("F_")) {
        wixLocationFrontend.to("/joinwaitlist?city=" + $w('#locationDropdown').value.split("_")[1]);
    } else {

        refreshCalendar($w('#locationDropdown').value, Number($w('#numberOfFlightsDropdown').value), null);
    }

}

/**
*	Adds an event handler that runs when an input element's value
 is changed.
	[Read more](https://www.wix.com/corvid/reference/$w.ValueMixin.html#onChange)
*	 @param {$w.Event} event
*/
export function numberOfFlightsDropdown_change(event) {

    const numberOfFlights = Number($w('#numberOfFlightsDropdown').value);
    if (numberOfFlights == null) {

        // } else if (numberOfFlights == 0) {
        //     $w('#dateSection').hide();
    } else {
        refreshCalendar($w('#locationDropdown').value, Number($w('#numberOfFlightsDropdown').value), null);
    }

}

/**
*	Sets the function that runs when a new repeated item is created.
	[Read more](https://www.wix.com/corvid/reference/$w.Repeater.html#onItemReady)
*	 @param {$w.$w} $item
*/
export function repeater_itemReady($item, itemData, index) {

let selectedDateObject = new Date(itemData.startDateTime);

let selectedDate = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  month: "long",
  day: "2-digit",
  weekday: "long"
}).format(selectedDateObject);

let selectedTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  hour: "2-digit",
  minute: "2-digit"
}).format(selectedDateObject);

    const service = services.find(s => s._id === itemData.serviceId);

    $item('#txtTime').text = selectedTime;
    $item('#txtService').text = service.serviceName;
    $item('#txtAvail').text = "Available spots: " + itemData.remainingSpots;
    if (itemData.remainingSpots >= Number($w('#numberOfFlightsDropdown').value)) {

        $item('#flagBox').style.backgroundColor = greenDotColor;
        $item('#priceBox').style.backgroundColor = goldenRodColor;
        $item('#txtPrice').text = service.priceSummary == null ? "" : service.priceSummary + " per flight";
        $item('#selectButton').label = "Select Time";

        $item('#selectButton').onClick(event => {
            $w('#filterSection').collapse();
            $w('#slotSection').collapse();
            selectedSlot = itemData;
            selectedService = service;
            if (member != null) {
                $w('#txtFirstName').value = member.contactDetails.firstName;
                $w('#txtLastName').value = member.contactDetails.lastName;
                $w('#txtEmail').value = member.contactDetails.emails.length > 0 ? member.contactDetails.emails[0] : "";
                $w('#txtPhoneNo').value = member.contactDetails.phones.length > 0 ? member.contactDetails.phones[0] : "";
            }
            $w('#txtSelectedDate').text = selectedDate + " @ " + selectedTime;
            $w('#txtSelectedLocation').text = itemData.location.businessLocation.address.formatted;
            $w('#txtSelectedService').text = service.serviceName;

            $w('#txtSelectedDate2').text = selectedDate + " @ " + selectedTime;
            $w('#txtSelectedLocation2').text = itemData.location.businessLocation.address.formatted;
            $w('#txtSelectedService2').text = service.serviceName;

            totalPrice = recalcPrice(selectedService);
            $w('#selectedSlotSection').show();
            $w('#selectedSlotSection').expand();
            //$w('#selectedSlotSection').scrollTo();
            $w('#bookingWizard').changeState("checkout");

        });

    } else {
        $item('#flagBox').style.backgroundColor = redDotColor;
        $item('#priceBox').style.backgroundColor = "darkGray";
        $item('#txtPrice').text = itemData.remainingSpots == 0 ? "Sold out" : "Not enough spots!";
        $item('#selectButton').label = "Join Waitlist";

        $item('#selectButton').onClick(event => {

            $w('#filterSection').collapse();
            $w('#slotSection').collapse();
            selectedSlot = itemData;
            selectedService = service;

            $w('#selectedSlotSection').show();
            $w('#selectedSlotSection').expand();
            //$w('#selectedSlotSection').scrollTo();
            $w('#bookingWizard').changeState("serviceWaitlist");

        });

    }

}

/**
*	Adds an event handler that runs when the element is clicked.
	[Read more](https://www.wix.com/corvid/reference/$w.ClickableMixin.html#onClick)
*	 @param {$w.MouseEvent} event
*/
export function btnBack_click(event) {
    // This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
    // Add your code for this event here: 
    $w('#selectedSlotSection').collapse();

    $w('#filterSection').expand();
    $w('#slotSection').expand();
    $w('#filterSection').scrollTo();
}

/**
*	Adds an event handler that runs when the element is clicked.
	[Read more](https://www.wix.com/corvid/reference/$w.ClickableMixin.html#onClick)
*	 @param {$w.MouseEvent} event
*/
export function btnRestart_click(event) {
    // This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
    // Add your code for this event here: 
    $w('#selectedSlotSection').collapse();
    $w('#filterSection').expand();
    $w('#filterSection').expand();
    $w('#slotSection').expand();
    $w('#filterSection').scrollTo();

}

/**
*	Adds an event handler that runs when the element is clicked.
	[Read more](https://www.wix.com/corvid/reference/$w.ClickableMixin.html#onClick)
*	 @param {$w.MouseEvent} event
*/
export function btnCheckout_click(event) {
    totalPrice = recalcPrice(selectedService);
    // This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
    // Add your code for this event here: 

    if (!validateCheckout()) return;

    /*let bookingInfo = {
        // selected slot object  
        slot: selectedSlot,
        // price : totalPrice,
        // form filed values collected above
        formFields: [{
            
                "_id": "0a2a05d6-bb4d-47d5-baaa-25cf765a07e1",
                "value": $w('#txtEmail').value,
            },
            {
                "_id": "55ba94d3-02ea-45a3-948f-9d10ba548028",
                "value": $w('#txtPhoneNo').value,
            },
            {
                "_id": "b36635be-b25d-4c7b-a488-c9897ccf42e0",
                "value": $w('#txtFirstName').value,
            },
            {
                "_id": "59e61b91-e59f-4583-abc5-b46f38eecd35",
                "value": $w('#chkWeight').checked ? "true" : "false"
            },
            {
                "_id": "52d84471-b44e-47de-af7d-55071ec612f1",
                "value": $w('#chkWaiver').checked ? "true" : "false"
            },
            {
                "_id": "53da08f4-512e-4b82-a169-2ff4289b2049",
                "value": "0"
            }
        ],
        numberOfSpots: Number($w('#numberOfFlightsDropdown').value)
    }; */

    let bookingInfo = {
        // selected slot object  
        slot: selectedSlot,
        // price : totalPrice,
        // form filed values collected above
        formFields: [{
                "_id": "0a2a05d6-bb4d-47d5-baaa-25cf765a07e1",
                "value": $w('#txtEmail').value,
            },
            {
                "_id": "55ba94d3-02ea-45a3-948f-9d10ba548028",
                "value": $w('#txtPhoneNo').value,
            },
            {
                "_id": "b36635be-b25d-4c7b-a488-c9897ccf42e0",
                "value": $w('#txtFirstName').value + " " + $w('#txtLastName').value,
            },
            {
                "_id": "59e61b91-e59f-4583-abc5-b46f38eecd35",
                "value": $w('#chkWeight').checked ? "true" : "false"
            },
            {
                "_id": "52d84471-b44e-47de-af7d-55071ec612f1",
                "value": $w('#chkWaiver').checked ? "true" : "false"
            },
            {
                "_id": "53da08f4-512e-4b82-a169-2ff4289b2049",
                "value": "0"
            },
            {
                "_id": "844e4f9d-f613-4b9a-954f-7f824cbe2491",
                "value": $w("#checkbox1").checked ? "true" : "false"
            }
        ],
        numberOfSpots: Number($w('#numberOfFlightsDropdown').value)
    };

    let options = {
        paymentType: 'wixPay_Online',
        couponCode: $w('#txtCoupon').value.trim()
    };

    // booking checkout  
    wixBookingsFrontend.checkoutBooking(bookingInfo, options)
        .then((result) => {
            if (result.status === "Confirmed") {
                $w('#bookingWizard').changeState("thankyou");
                //$w('#bookingWizard').scrollTo();

            } else {
                $w('#txtError').text = `Error message: ${result.status} Booking ID: ${result.bookingId}`;
                $w('#bookingWizard').changeState("error");
                //$w('#bookingWizard').scrollTo();
            }

        }).catch((err)=>{
            console.log("Error checking out booking", err)})

}

function validateCheckout() {
    let valid = true;

    if (!$w('#txtFirstName').valid) {
        $w('#txtFirstName').updateValidityIndication();

        valid = false;
    }

    if (!$w('#txtLastName').valid) {
        $w('#txtLastName').updateValidityIndication();
        valid = false;
    }

    if (!$w('#txtEmail').valid) {
        $w('#txtEmail').updateValidityIndication();
        valid = false;
    }

    if (!$w('#txtPhoneNo').valid) {
        $w('#txtPhoneNo').updateValidityIndication();
        valid = false;
    }

    if (!$w('#chkWeight').valid) {
        $w('#chkWeight').updateValidityIndication;
        $w('#chkWeight').updateValidityIndication();
        valid = false;
    }

    if (!$w('#chkWaiver').valid) {
        $w('#chkWaiver').updateValidityIndication;
        $w('#chkWaiver').updateValidityIndication();
        valid = false;
    }

    if(!$w("#checkbox1").valid){
        $w("#checkbox1").updateValidityIndication();
        valid = false;
    }

    return valid;

}


export function txtMedia_change(event) {
    // This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
    // Add your code for this event here: 
    const participants = 0;
    if (isNaN(participants) || participants == 0) {
        mediaPackage = 0;
    } else {
        mediaPackage = participants;
    }
    totalPrice = recalcPrice(selectedService);
}

function recalcPrice(service) {

    let basePrice = 0;
    let addonPrice = 0;
    let totalPrice = 0;
    let couponPrice = 0;
    const participants = Number($w('#numberOfFlightsDropdown').value);
    const mediaParticipants = 0;
    basePrice = service.priceAmount * participants;
    addonPrice = 79.00 * mediaParticipants;

    totalPrice = basePrice + addonPrice + couponPrice;
    $w('#txtBaseParticipants').text = "X " + $w('#numberOfFlightsDropdown').value + " participants:";
    $w('#txtBaseParticipants2').text = $w('#txtBaseParticipants').text;
    $w('#txtBasePrice').text = USDollar.format(basePrice);
    $w('#txtBasePrice2').text = $w('#txtBasePrice').text;

    if (addonPrice == 0) {

        $w('#txtMediaParticipants2').text = "X 0 participants:"

        $w('#txtMediaPrice2').text = USDollar.format(addonPrice);

        $w('#txtMediaRow2').hide();

        $w('#txtMediaParticipants2').hide();

        $w('#txtMediaPrice2').hide();
    } else {

        $w('#txtMediaRow2').text = "Media Package";

        $w('#txtMediaParticipants2').text = "X 0 participants:"

        $w('#txtMediaPrice2').text = USDollar.format(addonPrice);

        $w('#txtMediaRow2').show();

        $w('#txtMediaParticipants2').show();

        $w('#txtMediaPrice2').show();

    }
    $w('#txtCouponDeduction').text = "";
    $w('#txtCouponDeduction2').text = "";
    $w('#txtCouponDeduction').hide();
    $w('#txtCouponDeduction2').hide();
    $w('#txtCoupon2').text = "Redeemed coupon:";
    $w('#txtCoupon2').hide();
    if ($w('#txtCoupon').value != "") {
        wixData.query("Marketing/Coupons")
            .eq("code", $w('#txtCoupon').value.trim())
            .limit(1)
            .find()
            .then(coupon => {
                couponPrice = 0;
                if (coupon.totalCount > 0 && !coupon.items[0].expired && coupon.items[0].active && (coupon.items[0].numberOfUsages == 0 || coupon.items[0].numberOfUsages == null)) {
                    couponPrice = -coupon.items[0].moneyOffAmount;
                    totalPrice = basePrice + addonPrice + couponPrice;
                    $w('#txtCouponDeduction').text = USDollar.format(couponPrice);
                    $w('#txtCouponDeduction2').text = USDollar.format(couponPrice);
                    $w('#txtCoupon2').text = "Redeemed coupon:";
                    $w('#txtCoupon2').show();
                    $w('#txtCouponDeduction').show();
                }
                $w('#txtTotal').text = USDollar.format(totalPrice);
                $w('#txtTotal2').text = USDollar.format(totalPrice);
                return totalPrice;

            });

    } else {
        $w('#txtTotal2').text = USDollar.format(totalPrice);
        $w('#txtTotal').text = USDollar.format(totalPrice);
        return totalPrice;
    }

}

/**
*	Adds an event handler that runs when the element is clicked.
	[Read more](https://www.wix.com/corvid/reference/$w.ClickableMixin.html#onClick)
*	 @param {$w.MouseEvent} event
*/
export function txtMedia_click(event) {
    const participants = 0;
    if (isNaN(participants) || participants == 0) {
        mediaPackage = 0;
    } else {
        mediaPackage = participants;
    }
    totalPrice = recalcPrice(selectedService);
}

/**
*	Adds an event handler that runs when the element is clicked.
	[Read more](https://www.wix.com/corvid/reference/$w.ClickableMixin.html#onClick)
*	 @param {$w.MouseEvent} event
*/
export function dayClick(event) {
    console.log(event.target);
    selectedDate = calButtonDates[indexOfObject(event.target, calDayButtons)];
    console.log('selected date: ', selectedDate)
    refreshCalendar($w('#locationDropdown').value, Number($w('#numberOfFlightsDropdown').value), selectedDate);

}

/**
*	Adds an event handler that runs when the element is clicked.
	[Read more](https://www.wix.com/corvid/reference/$w.ClickableMixin.html#onClick)
*	 @param {$w.MouseEvent} event
*/
export function nextMonth_click(event) {
    // This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
    // Add your code for this event here: 
    selectedDate = addMonth(selectedDate, 1);
    refreshCalendar($w('#locationDropdown').value, Number($w('#numberOfFlightsDropdown').value), selectedDate);
}

/**
*	Adds an event handler that runs when the element is clicked.
	[Read more](https://www.wix.com/corvid/reference/$w.ClickableMixin.html#onClick)
*	 @param {$w.MouseEvent} event
*/
export function prevMonth_click(event) {
    // This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
    // Add your code for this event here: 
    selectedDate = addMonth(selectedDate, -1);
    refreshCalendar($w('#locationDropdown').value, Number($w('#numberOfFlightsDropdown').value), selectedDate);

}

/**
*	Adds an event handler that runs when an input element's value
 is changed.
	[Read more](https://www.wix.com/corvid/reference/$w.ValueMixin.html#onChange)
*	 @param {$w.Event} event
*/
export function txtCoupon_change(event) {

}

/**
*	Adds an event handler that runs when the element loses focus.
	[Read more](https://www.wix.com/corvid/reference/$w.FocusMixin.html#onBlur)
*	 @param {$w.Event} event
*/
export function txtCoupon_blur(event) {
    // This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
    // Add your code for this event here: 
    // This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
    // Add your code for this event here: 
    totalPrice = recalcPrice(selectedService);

}

function isSameMonth(d1, d2) {
    const da1 = new Date(d1);
    const da2 = new Date(d2);
    return da1.getFullYear() == da2.getFullYear() && da1.getMonth() == da2.getMonth();
}

/**
*	Adds an event handler that runs when an input element's value
 is changed.
	[Read more](https://www.wix.com/corvid/reference/$w.ValueMixin.html#onChange)
*	 @param {$w.Event} event
*/
export function yearMonth_change(event) {
    // This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
    // Add your code for this event here: 
    if ($w('#yearMonth').value == null) return;

    let calDate = new Date(Date.parse($w('#yearMonth').value));
    if (isSameMonth(calDate, selectedDate)) return;

    const day = selectedDate == null ? 1 : selectedDate.getDate();

    selectedDate = new Date(Date.parse(calDate.getFullYear().toString() + "-" + Number(calDate.getMonth() + 1).toString() + "-" + day.toString()));

    refreshCalendar($w('#locationDropdown').value, $w('#numberOfFlightsDropdown').value, selectedDate);

}

$w("#bookingWizard").onChange((event) => {
  wixWindowFrontend.scrollTo(1, 1);
});
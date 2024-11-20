import wixBookings from 'wix-bookings';
import wixData from 'wix-data';
import wixMembers from 'wix-members';
import wixLocationFrontend from 'wix-location-frontend';
import wixBookingsFrontend from 'wix-bookings-frontend';

const today = new Date();
const firstDayOfTodaysMonth = new Date(today.getFullYear(), today.getMonth(), 1);

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

let USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

$w.onReady(async function () {

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

    opts.push(addr);

    member = await getCurrentMember();

    const _services = await wixData.query("Bookings/Services").find({ suppressAuth: true })
    services = _services.items;
    console.log(services)

    const options = {
        startDateTime: new Date(),
        endDateTime: addDays(new Date(), 365)
    };

    for (const service of services) {

        let serviceID = service._id;
        const availability = await wixBookings.getServiceAvailability(serviceID, options);
        console.log("AVAILABILITY:", availability)
        const availableSlots = availability.slots;
        for (const slot of availableSlots) {
            availableSlotsIn365Days.push(slot);
            let addrArray = slot.location.businessLocation.address.formatted.split(" ")
            let city = addrArray[4];
            let subdivision = addrArray[5];
            
            const addr = {
                label: city === 'Florence,' ? "Austin, TX" : city + " " +
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
            label: "--- FUTURE LOCATIONS ---",
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
    console.log('OPTS:', opts)

    availableSlotsIn365Days.sort(function (a, b) {
        return a.startDateTime.getTime() - b.startDateTime.getTime();
    });

    $w('#locationDropdown').options = opts;
    $w('#filterSection').show();

    $w('#locationDropdown').value = "ALL";
    $w('#numberOfFlightsDropdown').value = "1";
    refreshCalendar("ALL", 1, null);
    //$w('#repeater').hide();
    //$w('#boxWaitlist').hide();
    //$w('#txtAvailSessions').html = "<h6 style='text-align:left;'>Available sessions: <br><br><br>  « Select your date</h6>";
    $w('#filterSection').scrollTo();

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

    if (selectedDate == null) {
        selectedDate = bookableDates.length == 0 ? today : bookableDates[0];
    }

    let firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    let sDate = new Date(getSunday(firstDay));

    const firstDayOfMonthOfSelectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    $w('#yearMonth').value = firstDayOfMonthOfSelectedDate.getFullYear().toString() + "-" +
        Number(firstDayOfMonthOfSelectedDate.getMonth() + 1).toString() + "-" +
        firstDayOfMonthOfSelectedDate.getDate().toString();
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
    refreshSlots(location, partySize, selectedDate, selectedDate);
}

function refreshSlots(location, numberOfFlights, startDate, endDate) {
    selectableSlots = [];

    if (location == undefined || numberOfFlights == undefined || startDate == undefined || endDate == undefined) {
        $w('#repeater').data = selectableSlots;
        $w('#slotSection').hide();
        return;
    }

    let loc = location == "ALL" ? "" : "in <strong>" + location + "</strong>";
    let time;

    if (isSameDay(startDate, endDate)) {
        let selectedDateObject = new Date(startDate);
        let selectedDate = selectedDateObject.toLocaleDateString("en-US", { month: 'long', day: '2-digit', weekday: 'long' })
        time = "on <strong>" + selectedDate + "</strong>";

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
            selectableSlots.push(slot);
        }
    });

    $w('#txtAvailSessions').html = "<h6 style='text-align:left;'>Select your time " + loc + " " + time + " for <strong>" + numberOfFlights.toString() + " flight(s)</strong>!</h6>";

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
    let selectedDate = selectedDateObject.toLocaleDateString("en-US", { month: 'long', day: '2-digit', weekday: 'long' })
    let selectedTime = selectedDateObject.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

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
            $w('#selectedSlotSection').scrollTo();
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
            $w('#selectedSlotSection').scrollTo();
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
            console.log(options);
            if (result.status === "Confirmed") {
                $w('#bookingWizard').changeState("thankyou");
                $w('#bookingWizard').scrollTo();

            } else {
                $w('#txtError').text = `Error message: ${result.status} Booking ID: ${result.bookingId}`;
                $w('#bookingWizard').changeState("error");
                $w('#bookingWizard').scrollTo();
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

    selectedDate = calButtonDates[indexOfObject(event.target, calDayButtons)];
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
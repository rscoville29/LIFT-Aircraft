import wixMembers from 'wix-members';
import wixData from 'wix-data';
import { getBookings, getWaivers, getNotes, getBooking, getCompanion, saveCompanion, getContact, getContactByEmail, getSessionOfBooking } from "backend/backend.jsw"

let booking = null;
let contact = null;

export async function addPilotsToVideoDataset(allPilots) {
    const {emails, firstNames, lastNames} = allPilots;
    for(let i = 0; i < emails.length; i++){
        let pilot = {
            pilotEmail: emails[i],
            firstName: firstNames[i],
            lastName: lastNames[i]
        }
    await wixData.insert("FlightVideos", pilot).then(info=>{console.log("Added Pilot Video:", info)})
    .catch((err)=>{console.log(err)});
    }
    
}

$w.onReady(function () {

    $w('#dayTable').rows = [];
    $w('#dayTable').columns = [{
            "id": "id",
            "dataPath": "id",
            "label": "Id",
            "width": 1,
            "visible": false,
            "type": "string",
            "linkPath": "id"

        },
        {
            "id": "title",
            "dataPath": "title",
            "label": "Title",
            "visible": true,
            "type": "richText",
            "linkPath": "title",
        },
        {
            "id": "name",
            "dataPath": "name",
            "label": "Name",
            "width": 1,
            "visible": false,
            "type": "string",
            "linkPath": "name"

        },
        {
            "id": "datetime",
            "dataPath": "datetime",
            "label": "Datetime",
            "width": 1,
            "visible": false,
            "type": "string",
            "linkPath": "datetime"

        },
        {
            "id": "date",
            "dataPath": "date",
            "label": "Date",
            "width": 1,
            "visible": false,
            "type": "date",
            "linkPath": "date"

        },
        {
            "id": "location",
            "dataPath": "location",
            "label": "Location",
            "width": 1,
            "visible": false,
            "type": "string",
            "linkPath": "location"
        },
        {
            "id": "service",
            "dataPath": "service",
            "label": "Service",
            "width": 1,
            "visible": false,
            "type": "string",
            "linkPath": "service"
        },
        {
            "id": "totalParticipants",
            "dataPath": "totalParticipants",
            "label": "TotalParticipants",
            "width": 1,
            "visible": false,
            "type": "integer",
            "linkPath": "totalParticipants"
        }
    ];

    setCalendarToDate($w('#datePicker').value);

});

export function setCalendarToDate(date) {

    $w('#selectedSessionSection').collapse();
    $w('#bookingDataSection').collapse();
    $w('#outcomeSection').collapse();
    $w('#dayTable').rows = [];
    let dateFrom = new Date($w('#datePicker').value);
    let dateTo = new Date($w('#datePicker').value);
    dateTo.setDate(dateTo.getDate() + 1);

    let bookings = getBookings(dateFrom, dateTo)
        .then(function (result) {
            let rows = [];
            $w('#searchingText').text = result._items.length == 0 ? "No bookings found for that day!" : "Select booking to check in:";
            $w('#searchingText').show;

            result._items.forEach(element => {
                let ssn = getSessionOfBooking(element._id)
                    .then(function (session) {

                        let time = new Date(session.start.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                        let firstName = element.formInfo.contactDetails.firstName;
                        let lastName = element.formInfo.contactDetails.lastName;
                        if (element.totalParticipants != 1) lastName = lastName.concat(" (+" + (element.totalParticipants - 1).toString() + ")");
                        rows.push({
                            "id": element._id,
                            "title": "<p6 style ='font-weight:bold'>" + firstName + " " + lastName + "</p6><br>" +
                                "<p6 style ='font-size:small'>" + element.bookedEntity.title + "</p6><br>" +
                                "<p6 style ='font-size:small'>" + time + " @ " + element.bookedEntity.location.businessLocation.name + "</p6><br>",
                            "name": firstName + " " + lastName,
                            "datetime": new Date(session.start.timestamp).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
                            "date": new Date(session.start.timestamp),
                            "location": element.bookedEntity.location.businessLocation.name,
                            "service": element.bookedEntity.title,
                            "totalParticipants": element.totalParticipants
                        });
                        $w('#dayTable').rows = rows;

                    });

            });

        })
        .catch(function (error) {
            console.log(error);
        });
}

function getSunday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day; // adjust when day is sunday
    return new Date(d.setDate(diff));
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
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

/**
*	Adds an event handler that runs when a table row is selected.
	[Read more](https://www.wix.com/corvid/reference/$w.Table.html#onRowSelect)
*	 @param {$w.TableRowEvent} event
*/
export function dayTable_rowSelect(event) {

    $w('#selectedSessionSection').collapse();
    $w('#bookingDataSection').collapse();
    $w('#selectedSession').text = event.rowData.name;
    $w('#selectedTimeAndLocation').text = event.rowData.datetime + " @ " + event.rowData.location;

    $w('#selectedSessionSection').expand();
    $w('#selectedSessionSection').scrollTo();

    getBooking(event.rowData.id)
        .then(result => {
            booking = result;
            refreshBookingInputTable(booking);
            $w('#bookingDataSection').expand();
        });

}

export async function refreshBookingInputTable(book) {

    let partySize = book.totalParticipants;

    $w('#group2').collapse();
    $w('#group3').collapse();
    $w('#group4').collapse();
    $w('#notesText').value = "";

    let emails = await getCompanion(book._id);
    let waivers = await getWaivers(book._id);
    let notes = await getNotes(book._id);
    
    if(notes != undefined) $w('#notesText').value = notes;

    for (let i = 2; i < 5; i++) {
        $w('#firstName' + i.toString()).value = "";
        $w('#lastName' + i.toString()).value = "";
        $w('#gender' + i.toString()).value = "undisclosed";
        $w('#waiver' + i.toString()).checked = false;
        $w('#email' + i.toString()).value = "";
        $w('#weight' + i.toString()).value = "";

        if (partySize > i - 1) {
            $w('#group' + i.toString()).expand();
            if (emails !== undefined && emails.length > i - 1) {
                getContactByEmail(emails[i - 1]).then(result => {
                    $w('#firstName' + i.toString()).value = result.info.name.first;
                    $w('#lastName' + i.toString()).value = result.info.name.last;
                    $w('#gender' + i.toString()).value = (result.info.extendedFields["custom.gender"] === undefined) ? "undisclosed" : result.info.extendedFields["custom.gender"];
                    $w('#waiver' + i.toString()).checked = (waivers == undefined) ? false : waivers[i - 1];
                    $w('#email' + i.toString()).value = result.primaryInfo.email;
                    $w('#weight' + i.toString()).value = (result.info.extendedFields["custom.lastknownwt"] === undefined) ? "" : result.info.extendedFields["custom.lastknownwt"];
                });
            }
        }
    }

    $w('#group1').expand();

    getContact(book.formInfo.contactDetails.contactId)
        .then(result => {
            contact = result;
            $w('#firstName1').value = contact.info.name.first;
            $w('#lastName1').value = contact.info.name.last;
            $w('#gender1').value = (contact.info.extendedFields["custom.gender"] === undefined) ? "undisclosed" : contact.info.extendedFields["custom.gender"];
            $w('#email1').value = contact.primaryInfo.email;
            $w('#waiver1').checked = (waivers == undefined) ? false : waivers[0];
            $w('#weight1').value = (contact.info.extendedFields["custom.lastknownwt"] === undefined) ? "" : contact.info.extendedFields["custom.lastknownwt"];
        });

}

export async function getCurrentMember(options) {
    return await wixMembers.currentMember.getMember(options)
        .then((member) => {
            const memberId = member._id;
            const fullName = `${member.contactDetails.firstName} ${member.contactDetails.lastName}`;
            return member;
        })
        .catch((error) => {
            console.error(error);
        })
}

/**
*	Adds an event handler that runs when an input element's value
 is changed.
	[Read more](https://www.wix.com/corvid/reference/$w.ValueMixin.html#onChange)
*	 @param {$w.Event} event
*/
export function datePicker_change(event) {
    $w('#searchingText').text = "Searching for bookings...";
    $w('#searchingText').show();
    setCalendarToDate($w('#datePicker').value);
}

/**
*	Adds an event handler that runs when the element is clicked.
	[Read more](https://www.wix.com/corvid/reference/$w.ClickableMixin.html#onClick)
*	 @param {$w.MouseEvent} event
*/
export async function saveNowButton_click(event) {
    let emails = [];
    let firstNames = [];
    let lastNames = [];
    let genders = [];
    let weights = [];
    let waivers = [];
    let notes = $w('#notesText').value;

    for (let i = 1; i < 5; i++) {
        if ($w('#email' + i.toString()).value.length > 0) {
            firstNames.push($w('#firstName' + i.toString()).value);
            lastNames.push($w('#lastName' + i.toString()).value);
            genders.push($w('#gender' + i.toString()).value);
            emails.push($w('#email' + i.toString()).value);
            weights.push($w('#weight' + i.toString()).value);
            waivers.push($w('#waiver' + i.toString()).checked);
        }
    }
    //adding the checked in pilots to flight videos for simple association and uploading
        let pilots = {
            emails,
            firstNames,
            lastNames
        }
        //this function will loop through the arrays and create a video template to easily track who needs a video
        //and upload the video. When they log in later, the videos will automatically filter to their own video.
        await addPilotsToVideoDataset(pilots);

    saveCompanion(booking._id, 0, notes, firstNames, lastNames, genders, emails, weights, waivers)
        .then(result => {
            $w('#resultText').text = result;
            $w('#outcomeSection').expand();
            $w('#outcomeSection').show();
            let fadeOptions = {
                    "duration":   1000,
                    "delay":      3000
                };
            $w('#outcomeSection').hide("fade",fadeOptions);
            console.log(result);
        });

}

/**
*	Adds an event handler that runs when the element is clicked.
	[Read more](https://www.wix.com/corvid/reference/$w.ClickableMixin.html#onClick)
*	 @param {$w.MouseEvent} event
*/
export async function checkinButton_click(event) {
    let emails = [];
    let firstNames = [];
    let lastNames = [];
    let genders = [];
    let weights = [];
    let waivers = [];
    let notes = $w('#notesText').value;

    for (let i = 1; i < 5; i++) {
        if ($w('#email' + i.toString()).value.length > 0) {
            firstNames.push($w('#firstName' + i.toString()).value);
            lastNames.push($w('#lastName' + i.toString()).value);
            genders.push($w('#gender' + i.toString()).value);
            emails.push($w('#email' + i.toString()).value);
            weights.push($w('#weight' + i.toString()).value);
            waivers.push($w('#waiver' + i.toString()).checked);
        }
    }

        //adding the checked in pilots to flight videos for simple association and uploading
        let pilots = {
            emails,
            firstNames,
            lastNames
        }
        //this function will loop through the arrays and create a video template to easily track who needs a video
        //and upload the video. When they log in later, the videos will automatically filter to their own video.
        await addPilotsToVideoDataset(pilots);

    saveCompanion(booking._id, emails.length, notes, firstNames, lastNames, genders, emails, weights, waivers)
        .then(result => {

            $w('#resultText').text = result;
            $w('#outcomeSection').expand();
            $w('#outcomeSection').show();
            let fadeOptions = {
                    "duration":   1000,
                    "delay":      3000
                };
            $w('#outcomeSection').hide("fade",fadeOptions);

        });

}

//testing that the input for email is actually an email address
export function validateEmail(email) {
    if(!email){
        return false;
    }else{
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
    }

}

export function validate(event) {

    let valid = true;
    for (let i = 1; i < 5; i++) {
        let email = $w('#email' + i.toString()).value
        let isEmailValid = validateEmail(email);

        if (!$w('#group' + i.toString()).hidden) {

            if (!isEmailValid || !$w('#waiver' + i.toString()).checked) valid = false;
        }
    }
    if (valid) $w('#checkinButton').show();
    else $w('#checkinButton').hide();

}


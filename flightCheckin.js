import wixMembers from 'wix-members';
import wixData from 'wix-data';
import { getBookings, getWaivers, getNotes, getBooking, getCompanion, saveCompanion, 
getContact, getContactByEmail, getSessionOfBooking,} from "backend/backend.jsw"
import { myCreateMemberFunction, myQueryMembersFunction} from "backend/webmethods.web"
import { authentication } from "wix-members-frontend";



let booking = null;
let contact = null;
let pilots = {};
let location;

export async function sendNewMemberEmail(newMember){
    await authentication.sendSetPasswordEmail(newMember.loginEmail)
             .then((status)=>{if(status){console.log("Email Sent!")}})
             .catch((err)=>{console.log(err)});
}


export async function checkAndMakeMembers(pilots) {
    try {
        console.log("executing checkAndMakeMembers");
        for (let pilot of Object.values(pilots)) {
            //check to see if the pilot is a member first.
            let options = {
                search: {
                    expression: pilot.pilotEmail
                },
                fields: ["loginEmail"]
            }
            let member = await myQueryMembersFunction(options);
            if(member._items.length > 0){
                console.log("IS member:", member)
                pilot.id = member._items[0]._id;
            }else{
        let newMemberData = {
        member: {
            loginEmail: pilot.pilotEmail,
            lastName: pilot.firstName,
            firstName: pilot.lastName,
            privacyStatus: "PUBLIC"
        }
    };
    console.log("Double Checking new member data:", newMemberData);
    console.log("Is not member, making new member")
         await myCreateMemberFunction(newMemberData).then((newMember)=>{
             console.log("new Member Created:", newMember);
             pilot.id = newMember._id;
             sendNewMemberEmail(newMember);
             })
         .catch((err)=>{console.log(err)});
            }
        }
        console.log("Pilots after loop:", pilots)
        return;
    } catch (error) {
        console.error("Error in makeCheckinPilotsMembers:", error);
        throw error;  // Re-throw the error to ensure it's properly logged and handled.
    }
}


export async function addPilotsToVideoDataset(pilots) {
    for (let pilot of Object.values(pilots)) {
        await wixData.insert("FlightVideos", {
            firstName: pilot.firstName,
            lastName: pilot.lastName,
            pilotEmail: pilot.pilotEmail,
            location
        }).then(info => {
            console.log("Added Pilot Video:", info);
        }).catch((err) => {
            console.log(err);
        });
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
    $w("#waiver1").onChange((event)=>{
        let isChecked = $w("#waiver1").checked;
        console.log("IS CHECKED?", isChecked);
        if(isChecked){
            pilots["pilot1"].waiver = true;
        }else{
            pilots["pilot1"].waiver = false;
        }
        console.log(pilots);
        shouldShowCheckinButton();
    });
    $w("#waiver2").onChange((event)=>{
         let isChecked = $w("#waiver2").checked;
        console.log("IS CHECKED?", isChecked);
        if(isChecked){
            pilots["pilot2"].waiver = true;
        }else{
            pilots["pilot2"].waiver = false;
        }
        console.log(pilots);
        shouldShowCheckinButton();
    });
    $w("#waiver3").onChange((event)=>{
         let isChecked = $w("#waiver3").checked;
        console.log("IS CHECKED?", isChecked);
        if(isChecked){
            pilots["pilot3"].waiver = true;
        }else{
            pilots["pilot3"].waiver = false;
        }
        console.log(pilots);
        shouldShowCheckinButton();
    });
    $w("#waiver4").onChange((event)=>{
         let isChecked = $w("#waiver4").checked;
        console.log("IS CHECKED?", isChecked);
        if(isChecked){
            pilots["pilot4"].waiver = true;
        }else{
            pilots["pilot4"].waiver = false;
        }
        console.log(pilots);
        shouldShowCheckinButton();
    });

    $w('#email2').onChange((event)=>{
        let currentEmail = $w("#email2").value;
        console.log("CURRENT EMAIL:", currentEmail);
        if(validateEmail(currentEmail)){
            pilots["pilot2"].pilotEmail = currentEmail;
        }else{
            pilots["pilot2"].pilotEmail = null;
        }
        console.log(pilots);
        shouldShowCheckinButton();
    });
    $w('#email3').onChange((event)=>{
         let currentEmail = $w("#email3").value;
         console.log("CURRENT EMAIL:", currentEmail);
        if(validateEmail(currentEmail)){
            pilots["pilot3"].pilotEmail = currentEmail;
        }else{
            pilots["pilot3"].pilotEmail = null;
        }
        console.log(pilots);
        shouldShowCheckinButton();
    });
    $w('#email4').onChange((event)=>{
         let currentEmail = $w("#email4").value;
         console.log("CURRENT EMAIL:", currentEmail);
        if(validateEmail(currentEmail)){
            pilots["pilot4"].pilotEmail = currentEmail;
        }else{
            pilots["pilot4"].pilotEmail = null;
        }
        console.log(pilots);
        shouldShowCheckinButton();
    });

    $w("#firstName1").onChange((event)=>{
        let currentName = $w("#firstName1").value;
            pilots["pilot1"].firstName = currentName;
            shouldShowCheckinButton();

    })

       $w("#firstName2").onChange((event)=>{
        let currentName = $w("#firstName2").value;
            pilots["pilot2"].firstName = currentName;
            shouldShowCheckinButton();
    })

      $w("#firstName3").onChange((event)=>{
        let currentName = $w("#firstName3").value;
            pilots["pilot3"].firstName = currentName;
            shouldShowCheckinButton();
    })

          $w("#firstName4").onChange((event)=>{
        let currentName = $w("#firstName4").value;
            pilots["pilot4"].firstName = currentName;
            shouldShowCheckinButton();
    })

    $w("#lastName1").onChange((event)=>{
        let currentName = $w("#lastName1").value;
            pilots["pilot1"].lastName = currentName;
            shouldShowCheckinButton();
    })

        $w("#lastName2").onChange((event)=>{
        let currentName = $w("#lastName2").value;
            pilots["pilot2"].lastName = currentName;
            shouldShowCheckinButton();
    })

        $w("#lastName3").onChange((event)=>{
        let currentName = $w("#lastName3").value;
            pilots["pilot3"].lastName = currentName;
            shouldShowCheckinButton();
    })

        $w("#lastName4").onChange((event)=>{
        let currentName = $w("#lastName4").value;
            pilots["pilot4"].lastName = currentName;
            shouldShowCheckinButton();
    })

    $w("#weight1").onChange((event)=>{
        let currentWeight = $w('#weight1').value;
        pilots["pilot1"].weight = currentWeight;
        shouldShowCheckinButton();
    });

        $w("#weight2").onChange((event)=>{
        let currentWeight = $w('#weight2').value;
        pilots["pilot2"].weight = currentWeight;
        shouldShowCheckinButton();
    });

        $w("#weight3").onChange((event)=>{
        let currentWeight = $w('#weight3').value;
        pilots["pilot3"].weight = currentWeight;
        shouldShowCheckinButton();
    });

        $w("#weight4").onChange((event)=>{
        let currentWeight = $w('#weight4').value;
        pilots["pilot4"].weight = currentWeight;
        shouldShowCheckinButton();
    });


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
            console.log("BOOKING:", booking)
            location = booking.bookedEntity.location.businessLocation.name;
            console.log("LOCATION:", location)
            refreshBookingInputTable(booking);
            $w('#bookingDataSection').expand();
        });

}

export async function refreshBookingInputTable(book) {

    let partySize = book.totalParticipants;
    for(let i = 1; i <= partySize; i++){
        pilots[`pilot${i}`] = {firstName: null, lastName: null, pilotEmail: null, waiver: false, weight: null}
    }
    console.log("PILOTS", pilots);

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
            pilots["pilot1"] = {firstName: contact.info.name.first, lastName: contact.info.name.last, pilotEmail: contact.primaryInfo.email, waiver: false, weight: contact.info.extendedFields["custom.lastknownwt"]};
        });
        console.log("PILOTS:", pilots)
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
    console.log("executing ONCLICK")
    checkAndMakeMembers(pilots);
    //attempting to make a new member and returning early for testing purposes:
    //makeCheckinPilotsMembers(pilots);
    return;
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
        await checkAndMakeMembers(pilots);

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

export function shouldShowCheckinButton(){
 let allValid = true;
for (let pilot in pilots) {
        let pilotInfo = pilots[pilot];
        for (let key in pilotInfo) {
                if (!pilotInfo[key]) { 
                    allValid = false;
                    break; 
                }     
        }
        if (!allValid) {
            break; // Exit the outer loop early if a false value is found
        }
}
console.log("ALL VALID?", allValid);
if(allValid){
    $w('#checkinButton').show();
}else if(!allValid){
    $w('#checkinButton').hide();
}
}
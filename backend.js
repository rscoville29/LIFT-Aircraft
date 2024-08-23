/*********
 .jsw file
 *********

 Backend .jsw files contain functions that run on the server side but can be called from page code and frontend files.
 Use backend functions to keep code private and hidden from a user's browser. More info:

 https://support.wix.com/en/article/velo-web-modules-calling-backend-code-from-the-frontend

**********/

/*** Call the sample multiply function below by copying the following into your page code:

 import { multiply } from 'backend/multiplication';

 $w.onReady(function () {
     multiply(4, 5).then(product => {
         console.log(product);
     })
     .catch(error => {
         console.log(error);
     });
 });

***/

import sessions from "wix-bookings-backend";
import wixCrmBackend from 'wix-crm-backend';
import wixData from 'wix-data';
import wixFetch from 'wix-fetch';

import { mediaManager } from 'wix-media-backend';

export async function getDownloadUrl(videoUrl) {
    try {
        // Ensure videoUrl is in an array format
        let downloadUrl = await mediaManager.downloadFiles([videoUrl]);
        return downloadUrl;
    } catch (error) {
        console.error("Failed to retrieve download URL:", error);
        throw new Error("Unable to get download URL");
    }
}


export function getSessionOfBooking(bookingId) {
    return sessions.bookings.queryBookings()
        .eq("_id", bookingId)
        .limit(10)
        .find({ suppressAuth: true })
        .then(queryResult => {
            return sessions.sessions.getSession(queryResult.items[0].bookedEntity.singleSession.sessionId);
        });
}







export async function getService(serviceId) {

    return wixData.query("Bookings/Services")
        .eq("_id", serviceId)
        .limit(1)
        .find({ suppressAuth: true })
        .then((results) => {
            return results.items[0];
        });
}
export function getBookings(start, end) {
    return sessions.bookings.queryBookings()
        .ge("startTime", new Date(start))
        .lt("startTime", new Date(end))
        .eq("status", "CONFIRMED")

        .limit(100)
        .find({ suppressAuth: true });
}

export function getBooking(bookingId) {
    return sessions.bookings.queryBookings()
        .eq("_id", bookingId)
        .limit(1)
        .find({ suppressAuth: true })
        .then(queryResult => {
            return queryResult.items[0];
        });
}

export function getContact(contactId) {
    return wixCrmBackend.contacts.getContact(contactId)
        .then(queryResult => {
            return queryResult;
        });
}

export function getContactByEmail(email) {
    return wixCrmBackend.contacts.queryContacts()
        .eq("primaryInfo.email", email)
        .limit(1)
        .find({ suppressAuth: true })
        .then(queryResult => {
            return queryResult.length == 0 ? undefined : queryResult.items[0];
        });
}

export function getCompanionDataId(bookingId) {

    return wixData.query("bookingCompanion")
        .eq("title", bookingId)
        .find()
        .then(result => {
            return result.totalCount > 0 ? result.items[0]._id : undefined;
        });

}

export function getCompanion(bookingId) {

    return wixData.query("bookingCompanion")
        .eq("title", bookingId)
        .find()
        .then(result => {
            return result.totalCount > 0 ? result.items[0].companionContacts : undefined;
        });

}

export function getWaivers(bookingId) {

    return wixData.query("bookingCompanion")
        .eq("title", bookingId)
        .find()
        .then(result => {
            return result.totalCount > 0 ? result.items[0].waivers : undefined;
        });

}

export function getNotes(bookingId) {

    return wixData.query("bookingCompanion")
        .eq("title", bookingId)
        .find()
        .then(result => {
            return result.totalCount > 0 ? result.items[0].notes : undefined;
        });

}

export async function updateBookingInLiftOps(bookingId, checkin, firstNames, lastNames, emails, weights) {
    const booking = await getBooking(bookingId);

    const session = await getSessionOfBooking(bookingId);

    const service = await getService(session.scheduleOwnerId);

    const messageBody = {
        bookingId: booking._id,
        checkin: checkin,
        startDateTime: session.start.timestamp,
        missionProfile: "Beginner Flight Session",
        location: booking.bookedEntity.location.businessLocation.name.toUpperCase(),
        firstNames: firstNames,
        lastNames: lastNames,
        emails: emails,
        weights: weights
    }

    booking.formInfo.additionalFields.push
    const fetchOptions = {
        method: 'post',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(messageBody)
    };
    return wixFetch.fetch("https://liftaircraft.j.layershift.co.uk/dispatch/bookingupdate", fetchOptions)
        .then(httpResponse => { return httpResponse });

}

export async function saveCompanion(bookingId, checkin, notes, firstNames, lastNames, genders, emails, weights, waivers) {

    let companionData = {};
    const companiondataId = await getCompanionDataId(bookingId);
    if (companiondataId == undefined) {
        companionData = {
            title: bookingId,
            companionContacts: [],
            waivers: [],
            notes: notes
        };
    } else {
        companionData = {
            _id: companiondataId,
            title: bookingId,
            companionContacts: [],
            waivers: [],
            notes: notes
        };
    }

    for (let i = 0; i < emails.length; i++) {
        let contact = await getContactByEmail(emails[i]);
        const contactInfo = {
            name: {
                first: firstNames[i],
                last: lastNames[i]
            },
            emails: [{
                tag: "HOME",
                email: emails[i],
                primary: true
            }],
            extendedFields: {
                "custom.gender": genders[i],
                "custom.lastknownwt": weights[i]
            }
        };

        const options = {
            allowDuplicates: false,
            suppressAuth: true
        };

        companionData.companionContacts.push(emails[i]);
        companionData.waivers.push(waivers[i]);

        if (contact === undefined) {

            await wixCrmBackend.contacts.createContact(contactInfo, options)
                .catch(reason => {
                    return "ERROR: could not create new contact!";
                });
        } else {
            const identifiers = {
                contactId: contact._id,
                revision: contact.revision
            };
            await wixCrmBackend.contacts.updateContact(identifiers, contactInfo, options)
                .catch(reason => {
                    return "ERROR: could not update contact!";
                });
        }

    }


    await wixData.save("bookingCompanion", companionData)
        .catch(reason => {
            return "ERROR: could not save booking data!";
        });




    let httpResponse = await updateBookingInLiftOps(bookingId, checkin, firstNames, lastNames, emails, weights);


    if (checkin == 0) {

        const attendanceInfo = {
            attended: false,
            numberOfAttendees: checkin
        };

        await sessions.bookings.setAttendance(bookingId, attendanceInfo)
            .catch(reason => {
                return "ERROR: could not check in attendees!";
            });

        return httpResponse.ok ? "SUCCESS. Booking data updated. " : httpResponse.statusText;

    }

    const attendanceInfo = {
        attended: true,
        numberOfAttendees: checkin
    };

    await sessions.bookings.setAttendance(bookingId, attendanceInfo)
        .catch(reason => {
            return "ERROR: could not check in attendees!";
        });

    return "SUCCESS. Customers checked in.";
}

export function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

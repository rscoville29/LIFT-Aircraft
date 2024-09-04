import { ok, notFound, serverError } from 'wix-http-functions';
import sessions from "wix-bookings-backend";


export function get_bookings(request) {
    let options = {
        "headers": {
            "Content-Type": "application/json"
        }
    };

    let startDate = new Date("2022-01-01");
    let endDate = new Date("2100-12-31");
    if (request.query) {
        startDate = new Date(request.query.start);
        endDate = new Date(request.query.end);
    }

    return sessions.bookings.queryBookings()
        .ge("startTime", startDate)
        .lt("endTime", endDate)
        .limit(100)
        .find({ suppressAuth: true })
        .then((results) => {
            if (results.items.length > 0) {
                options.body = {
                    "items": results.items
                }
                return ok(options);
            } else {
                return notFound();
            }
        })
        .catch((error) => {
            console.error(error);
        });

}
import wixData from 'wix-data';
import wixUsers from 'wix-users';
import wixLocation from 'wix-location';

async function getUserEmail(user) {
    let email = await user.getEmail();
    return email;
}

$w.onReady(async function () {
    let user = wixUsers.currentUser;
    if (user.loggedIn) {
        let email = await getUserEmail(user);
        console.log("USER", user, "EMAIL", email);

        wixData.query("FlightVideos")
            .eq("pilotEmail", email)
            .find()
            .then((results) => {
                console.log("Query Results:", results.items);
                if (results.items.length > 0) {
                    $w("#listRepeater").data = results.items;
                } else {
                    console.log("No videos found for this user.");
                }
            })
            .catch((err) => {
                console.error("Failed to retrieve videos:", err);
            });
    } else {
        console.log("User not logged in");
    }

    // Ensure the repeater and its items are properly loaded before setting up event handlers
    $w("#listRepeater").onItemReady(($item, itemData) => {
        $item("#button57").onClick((event) => {
            console.log("Button Clicked:", event);
            let videoUrl = itemData.video; // Use the correct field name 'video'
            console.log("URL:", videoUrl);
            if (videoUrl) {
                wixLocation.to(videoUrl); // Navigates to the URL, which should trigger a download if properly configured
            } else {
                console.error("No video URL found for this item.");
            }
        });
    });
});

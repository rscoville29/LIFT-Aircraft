import wixData from 'wix-data';
import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import { getDownloadUrl } from 'backend/backend';


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
            .then(async (results) => {
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

    $w("#listRepeater").onItemReady(async ($item, itemData) => {
        $item("#button57").onClick(async (event) => {
            console.log("Button Clicked:", event);
            let videoUrl = itemData.video;
            console.log("Raw URL:", videoUrl);

            if (videoUrl) {
                try {
                    let downloadUrl = await getDownloadUrl(videoUrl);
                    console.log("Download URL:", downloadUrl);
                    if (downloadUrl) {
                        wixLocation.to(downloadUrl);
                    } else {
                        console.error("No download URL found for this item.");
                    }
                } catch (error) {
                    console.error("Failed to retrieve download URL:", error);
                }
            } else {
                console.error("No video URL found for this item.");
            }
        });
    });
});

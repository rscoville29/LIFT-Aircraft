// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction
import wixData from 'wix-data';
import wixUsers from 'wix-users';

async function getUserEmail(user){
	let email = await user.getEmail().then(email => {return email});
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
				console.log("results", results)
                if (results.items.length > 0) {
					$w("#listRepeater").data = results.items;
                }
            })
            .catch((err) => {
                console.error("Failed to retrieve member data:", err);
            });
    } else {
        console.log("User not logged in");
    }

});

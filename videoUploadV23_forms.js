import wixData from 'wix-data';
import wixWindow from 'wix-window';

function showAlert(message) {
    wixWindow.openLightbox("AlertLightbox", { message });
}

function submitForm(event) {
    try {
        console.log(event);

        // Extract form data
        const videoObject = event.file_upload_385c[0];
        const {url} = videoObject;
        const fullUrl = "https://video.wixstatic.com/video" + url;
        console.log('url');
        const email = event.email_003c;
        const firstName = event.first_name_4feb;
        const lastName = event.last_name_04e2;
        const location = event.location;

        // Query to find existing member by email
        wixData.query('Members/FullData')
            .eq('loginEmail', email)
            .find()
            .then(results => {
                if (results.items.length > 0) {
                    // Member exists
                    const member = results.items[0];
                    const memberId = member._id;
                    console.log("Member Id:", memberId);

                    // Save video details with existing member reference
                    return wixData.insert('FlightVideosFromForms', {
                        firstName:firstName,
                        lastName:lastName,
                        email:email,
                        location:location,
                        url:fullUrl
                    });
                } else {
                    return wixData.insert('FlightVideosFromForms', {
                        firstName:firstName,
                        lastName:lastName,
                        email:email,
                        location:location,
                        url:fullUrl
                    });
                }
            })
            .then(() => {
                console.log('Video saved successfully.');
            })
            .catch(error => {
                console.log(error);
                showAlert("Error: " + error.message);
            });

    } catch (error) {
        console.log(error);
        showAlert("Error: " + error.message);
    }
}

   
$w.onReady(function () {
	const videoForm = $w('#371Ee199389C4A93849Ee35B8A15B7Ca1');
	videoForm.onSubmit(submitForm);

	// Write your Javascript code here using the Velo framework API

	// Print hello world:
	// console.log("Hello world!");

	// Call functions on page elements, e.g.:
	// $w("#button1").label = "Click me!";

	// Click "Run", or Preview your site, to execute your code

});



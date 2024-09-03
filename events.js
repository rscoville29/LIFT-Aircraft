/*****************
 backend/events.js
 *****************

 'backend/events.js' is a reserved Velo file that enables you to handle backend events.

 Many of the Velo backend modules, like 'wix-stores-backend' or 'wix-media-backend', include events that are triggered when 
 specific actions occur on your site. You can write code that runs when these actions occur.

 For example, you can write code that sends a custom email to a customer when they pay for a store order.

 Example: Use the function below to capture the event of a file being uploaded to the Media Manager:

   export function wixMediaManager_onFileUploaded(event) {
       console.log('The file "' + event.fileInfo.fileName + '" was uploaded to the Media Manager');
   }

 ---
 More about Velo Backend Events: 
 https://support.wix.com/en/article/velo-backend-events

*******************/
import wixData from 'wix-data';
import { fetch } from 'wix-fetch';
import { getSecret } from "wix-secrets-backend";

export async function generateDocumentFromTemplate(data) {
    const secret = await getSecret('Docupilot_Encoded_API_KEY');
    const url = 'https://api.docupilot.app/documents/create/c7e93cdd/d3b22bc2'; 
    const token = secret;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`  // Include the Docupilot API key
            },
            body: JSON.stringify(data)  // Send the data object directly
        });

        if (!response.ok) {
            // Handle HTTP errors
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();  // Use .text() if the response is text
        console.log(result);
        return result;
    } catch (error) {
        console.error('Error:', error);
        // Optional: re-throw the error to handle it in the calling function
        throw error;
    }
}


export async function wixForms_onSubmissionCreated(event) {
  console.log("EVENT",event)
  const formId = event.entity.formId
  

  if(formId === 'f825540c-54df-4701-8144-5f136d369d9b' || formId === '1a2debd2-7b0f-4ac0-bfa4-50edce03b08c'){
	  const firstName = event.entity.submissions.first_name_0190
	  const lastName = event.entity.submissions.last_name_f840
	  const email = event.entity.submissions.email_7e01;
	  const birthday = event.entity.submissions.birthday_1cd3
	  const age = event.entity.submissions.age
	  const phone = event.entity.submissions.phone_536a
	  const address = event.entity.submissions.address_e585
	  const gender = event.entity.submissions.gender
	  const weight = event.entity.submissions.weight
	  const emergencyName = event.entity.submissions.emergency_contact_name
	  const emergencyPhone = event.entity.submissions.emergency_contact_phone_1
	  const signatureImage = event.entity.submissions.signature_4e29[0].url;
	  const printedName = event.entity.submissions.pilots_printed_name;
	  const date = event.entity.submissions.todays_date

//These are the correct variable names in the template: I also tried logging them to verify the variables have values (they do)
	  const data = {
	firstName,
    lastName,
    email,
    phone,
    address,
    gender,
    weight,
    birthday,
    age,
    emergencyName,
    emergencyPhone,
	signatureImage,
    printedName,
	date
	  }

	  console.log("DATA:", JSON.stringify(data));


    	//check to see if a record exists already. If one does, remove it.
	//this ensures that only one record per user exists at a time, even if multiple
	//waivers actually exist in the forms submissions
  let results = await wixData.query("PilotReleaseForms").eq("email", email).find();
	if(results.totalCount > 0){
		let formId = results.items[0]._id
		await wixData.remove("PilotReleaseForms", formId).then((res)=>{console.log("deleted old waiver record")})
		.catch((err)=>{console.log(err)})
	}
	//create
	await wixData.insert("PilotReleaseForms", {
		email: email
	}).then((res)=>{console.log("Submission complete", res)})
	.catch((err)=>{console.log(err)});


generateDocumentFromTemplate(data);

  }

}


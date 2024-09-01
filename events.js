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

export async function wixForms_onSubmissionCreated(event) {
  console.log("EVENT",event)
  const formId = event.entity.formId
  const email = event.entity.submissions.email_7e01;

  if(formId === 'f825540c-54df-4701-8144-5f136d369d9b'){
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
  }
}


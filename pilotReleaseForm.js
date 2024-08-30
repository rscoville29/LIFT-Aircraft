// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction
import {getCurrentMemberInfo} from 'backend/webmethods.web'
import wixData from 'wix-data';


export async function addSubmissionRecord(email, id){
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
		email: email,
		pilotId: id,
		hasSubmitted: true
	}).then((res)=>{console.log("Submission complete", res)})
	.catch((err)=>{console.log(err)});
}



$w.onReady(async function () {

let values;
let memberid = null;

const currentMember = await getCurrentMemberInfo();
if(currentMember.member._id){
	console.log("member is logged in:", currentMember);
	memberid = currentMember.member._id;
}


$w("#371Ee199389C4A93849Ee35B8A15B7Ca1").onFieldValueChange(()=>{
	values = $w("#371Ee199389C4A93849Ee35B8A15B7Ca1").getFieldValues()
	console.log("form values:",values);
});


$w("#371Ee199389C4A93849Ee35B8A15B7Ca1").onSubmitSuccess(()=>{
	const {email_7e01} = values;
	addSubmissionRecord(email_7e01, memberid)
})

});
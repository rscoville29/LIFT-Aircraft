/***************
 backend/data.js
 ***************

 'backend/data.js' is a reserved Velo file that enables you to create data hooks.

 A data hook is an event handler (function) that runs code before or after interactions with your site's database collections. 
 For example, you may want to intercept an item before it is added to your collection to tweak the data or to perform a final validation.

 Syntax for functions:

  export function [collection name]_[action](item, context){}

 Example: 

  export function myCollection_beforeInsert(item, context){}

 ---
 More about Data Hooks: 
 https://support.wix.com/en/article/velo-about-data-hooks

 Using Data Hooks: 
 https://support.wix.com/en/article/velo-using-data-hooks

 API Reference: 
 https://www.wix.com/velo/reference/wix-data/hooks

***************/

// Import wixData and wixCRM from wix-data and wix-crm modules

import { fetch } from 'wix-fetch';
import { getSecret } from "wix-secrets-backend";
import wixData from 'wix-data';
import {emailMemberOnVideoUpload} from './webmethods.web'

 export async function getMemberIdByEmail(email){
 try {
    const result = await wixData.query('Members/PrivateMembersData')
      .eq('loginEmail', email) 
      .find();

    if (result.items.length > 0) {
      const member = result.items[0]; 
      return member._id; 
    } else {
      return null; 
    }
  } catch (error) {
    console.error('Error retrieving member ID:', error);
    return null;
  }
 }  

export async function generateDocumentFromTemplate(data) {
    console.log("attempting docupilot deilvery", data)
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

export async function deletePreviousReleaseForm(email) {
    console.log("Attempting to delete previous waiver form for", email);
    try {
        // Query for the existing form
        const res = await wixData.query("PilotReleaseForms")
            .eq("email", email)
            .find();

        if (res.totalCount > 0) {
            let formId = res.items[0]._id;

            // Delete the found form
            const deleteRes = await wixData.remove("PilotReleaseForms", formId);
            console.log("Deleted old waiver record:", deleteRes);
        } else {
            console.log("No previous release form found");
        }
    } catch (error) {
        console.error("Error deleting previous waiver form:", error);
    }
}


/*
commenting out the beforeInsert because there is an issue on Wix's backend. Their Hooks are not executing properly.
Will report issue to Wix. Date: 03/09/2025

export function PilotReleaseForms_beforeInsert(item, context) {
    console.log("Before Insert", item)
    const {email} = item;
    deletePreviousReleaseForm(email)
 
}
*/



export async function PilotReleaseForms_afterInsert(item, context) {
  console.log("After Insert:", item, context)
  
  const imageUrl = item.signature;
  console.log("IMageURL:", imageUrl);
      

   const data = {
	firstName: item.firstName,
    lastName: item.lastName,
    email: item.email,
    phone: item.phone,
    address: item.address,
    gender: item.gender,
    weight: item.weight,
    birthday: item.birthday,
    age: item.age,
    emergencyName: item.emergencyName,
    emergencyPhone: item.emergencyPhone,
	signatureImage: imageUrl,
    printedName: item.printedName,
	date: item.date
	  }

	  console.log("DATA:", JSON.stringify(data));
      generateDocumentFromTemplate(data);


}

export async function FlightVideos_afterUpdate(item, context) {
    console.log("Flight Video collection updated!", item)
    if(item.video){
        console.log("Video Exists")
        console.log("item email:", item.pilotEmail)
        const memberId = await getMemberIdByEmail(item.pilotEmail)
        if(memberId){
            console.log("found member id", memberId)
        await emailMemberOnVideoUpload(memberId, item.firstName);
        }
        
    }
}

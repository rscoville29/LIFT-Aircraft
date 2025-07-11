/************
.web.js file
************

Backend '.web.js' files contain functions that run on the server side and can be called from page code.

Learn more at https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/backend-code/web-modules/calling-backend-code-from-the-frontend

****/

/**** Call the sample multiply function below by pasting the following into your page code:

import { multiply } from 'backend/new-module.web';

$w.onReady(async function () {
   console.log(await multiply(4,5));
});

****/

import { Permissions, webMethod } from "wix-web-module";
import { elevate } from "wix-auth";
import { members } from "wix-members.v2";
import { triggeredEmails } from "wix-crm-backend";

export const emailMemberOnVideoUpload = webMethod(Permissions.Anyone, (id, name) => {
  console.log("Attempting to Email Member On Video Upload..")
  const emailId = "UMfkkiB";
  const memberId = id;
  const options = {
    variables: {
      name
    },
  };

  return triggeredEmails
    .emailMember(emailId, memberId, options)
    .then(() => {
      console.log("Email sent to Member!");
    })
    .catch((error) => {
      console.error("Error Sending Email to Member!", error);
    });
});

export const multiply = webMethod(
  Permissions.Anyone, 
  (factor1, factor2) => { 
    return factor1 * factor2 
  }
);

const elevatedCreateMember = elevate(members.createMember);

export const myCreateMemberFunction = webMethod(
  Permissions.Anyone,
  async (member) => {
    try { console.log("Attempting to create a member")
      const newMember = await elevatedCreateMember(member);
      console.log("Created new member:", newMember);

      return newMember;
    } catch (error) {
      console.error("Error Creating Member!", error);
      // Handle the error
    }
  },
);

export const myQueryMembersFunction = webMethod(
  Permissions.Anyone,
  async (options) => {
    try {
      const siteMembers = await members.queryMembers(options).find();
      console.log("Retrieved members:", siteMembers);

      return siteMembers;
    } catch (error) {
      console.error(error);
      // Handle the error
    }
  },
);

export const getCurrentMemberInfo = webMethod(
  Permissions.Anyone,
  async () => {
    try {
      const member = await members.getCurrentMember();
      console.log("Retrieved currently logged in member:", member);
      if(member){
        return member;
      }
      
    } catch (error) {
      console.error(error);
      // Handle the error
    }
  },
);

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
    try { console.log("trying to create a member")
      const newMember = await elevatedCreateMember(member);
      console.log("Created new member:", newMember);

      return newMember;
    } catch (error) {
      console.error(error);
      // Handle the error
    }
  },
);

export async function makeCheckinPilotsMembers(pilots) {
    try {
        console.log("executing makeCheckinPilotsMembers");
    const memberId = await elevate(() => members.createMember({}))();
    console.log("New Member ID:", memberId);
        // Hardcoding a pilot with some info just to get the functionality working
        //let pilot = { firstName: "Pilot", lastName: "Testing", loginEmail: "pilot@email.com" };

        // Use elevate to create the member with elevated permissions
        //const result = await elevate(() => members.createMember(pilot))();
        //console.log("Created Pilot:", result);

        // Returning for now to test the hardcoded above
        //return result;

        // Assuming the rest of the code is for processing multiple pilots
        return memberId;
        for (let pilot of Object.values(pilots)) {
            let pilotToMakeMember = {
                firstName: pilot.firstName,
                lastName: pilot.lastName,
                loginEmail: pilot.email
            };
            await elevate(() => members.createMember(pilotToMakeMember))();
        }
    } catch (error) {
        console.error("Error in makeCheckinPilotsMembers:", error);
        throw error;  // Re-throw the error to ensure it's properly logged and handled.
    }
}

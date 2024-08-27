// Import wixData and wixCRM from wix-data and wix-crm modules
import wixData from 'wix-data';
import wixCRM from 'wix-crm';


export function FlightVideos_afterUpdate(item, context) {
    // Check if the update operation is to the "Video" column and has a value
    if (item.Video) {
        // Construct the email message
        const recipientEmail = item.Email;
        const subject = "Hexa Flight Video Uploaded!";
        const body = `
           Hey ${item.firstName},

            Your flight video has been uploaded! Login or sign-up to https://www.liftaircraft.com to see your video!

            Best regards,
            The LIFT Aircraft Team
        `;

        // Send the email
        wixCRM.emailContact(recipientEmail, subject, body)
            .then(() => {
                console.log(`Email sent to ${recipientEmail} regarding new video upload.`);
            })
            .catch((error) => {
                console.error(`Failed to send email to ${recipientEmail}:`, error);
            });
    }
    
    // Returning the item allows the update operation to complete
    return item;
}

// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction

$w.onReady(async function () {

    let values;
    
    
    $w("#371Ee199389C4A93849Ee35B8A15B7Ca1").onFieldValueChange(()=>{
        values = $w("#371Ee199389C4A93849Ee35B8A15B7Ca1").getFieldValues()
    });
    
    $w("#371Ee199389C4A93849Ee35B8A15B7Ca1").onSubmitSuccess(()=>{
        const {email_7e01} = values;
        console.log("Email_7e01:", email_7e01);
    })
    
    });
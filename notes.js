let calDayButtons = [$w('#sun1'), $w('#mon1'), $w('#tue1'), $w('#wed1'), $w('#thu1'), $w('#fri1'), $w('#sat1'),
    $w('#sun2'), $w('#mon2'), $w('#tue2'), $w('#wed2'), $w('#thu2'), $w('#fri2'), $w('#sat2'),
    $w('#sun3'), $w('#mon3'), $w('#tue3'), $w('#wed3'), $w('#thu3'), $w('#fri3'), $w('#sat3'),
    $w('#sun4'), $w('#mon4'), $w('#tue4'), $w('#wed4'), $w('#thu4'), $w('#fri4'), $w('#sat4'),
    $w('#sun5'), $w('#mon5'), $w('#tue5'), $w('#wed5'), $w('#thu5'), $w('#fri5'), $w('#sat5'),
    $w('#sun6'), $w('#mon6'), $w('#tue6'), $w('#wed6'), $w('#thu6'), $w('#fri6'), $w('#sat6')
];

let calButtonDates = [];

export function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function getSunday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day; // adjust when day is sunday
    return new Date(d.setDate(diff));
}

let firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);

let sDate = new Date(getSunday(firstDay));

    calDayButtons.forEach((item, index) => {

        let dayDate = addDays(sDate, index);
        calButtonDates.push(dayDate);
        item.label = dayDate.toLocaleDateString("en-US", { day: 'numeric' });

    });

    export function dayClick(event) {
    console.log(event.target);
    selectedDate = calButtonDates[indexOfObject(event.target, calDayButtons)];
    console.log('selected date: ', selectedDate)

}
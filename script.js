// ==UserScript==
// @name        tempo -> rocketchat status
// @namespace   Violentmonkey Scripts
// @match       https://rocket.example.com/*
// @grant       none
// @version     2.0
// @author      Grzegorz Grzojda Walewski
// @description 23.08.2023, 17:29:56
// ==/UserScript==

/** Config
 *
 * rocketChatUrl
 *  Just url of your work chat (needed for status update) ex. "https://rocket.example.com"
 *
 * tempoBearerToken
 *  To generate one for yourself use steps from: "Creating a New Token" at https://t.ly/u1Tu3
 *
 * tempoUserId
 *  The easiest way to get it is to click Your profile picture in right top corner when on Tempo page -> Profile after redirect You should see Your userId in url "jira/people/YourUserId"
 *
 * dailyWorkTime
 *  Work time per day in hours (probably 8)
 *
 * updateEach
 *  How often do You want this script to update Your status in minutes
 *
 * */
const rocketChatUrl = 'https://rocket.example.com';
const tempoBearerToken = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const tempoUserId = 'YYYYYYYYYYYYYYYYYYYYYYY';
const dailyWorkTime = 8;
const updateEach = 30;

// What status should be set at each codition busy/away/online/offline
const afterWorkStatus = 'busy';
const onWeekendStatus = 'offline';
const beforeWorkStatus = 'away';
const atWorkStatus = 'online';

// You can set your custom messages
const beforeWorkMessage = "💻 ?? 🏁 ??";
const onWeekendMessage = null; // if null, "🏁  $finishTime$ 💻 Monday" will be used

/**
 * END OF CONFIGURATION
 **/

class CookieManager {
    static getCookie(cookieName) {
        let name = cookieName + "=";
        let ca = document.cookie.split(';');

        for (let i = 0; i < ca.length; i++) {
            let c = ca[i].trim();
            if ((c.indexOf(name)) === 0) {
                return c.substring(name.length);
            }
        }

        return null;
    }
}

function updateStatus() {
    var todayDate = new Date();
    var today = todayDate.getFullYear() + '-' + ('0' + (todayDate.getMonth() + 1)).slice(-2) + '-' + ('0' + todayDate.getDate()).slice(-2);
    var finishTime = "";

    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + tempoBearerToken);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch("https://api.tempo.io/4/worklogs/user/" + tempoUserId + "?limit=1&from=" + today + "&to=" + today, requestOptions)
        .then(response => response.text())
        .then(result => {
            var workLog = JSON.parse(result).results[0];
            var message = "";
            var status = "";
            if (workLog != undefined) {
                var startTime = workLog.startTime;
                var [hour, minutes] = startTime.split(':');
                var finishHour = Number(hour) + 8;
                startTime = hour + ":" + minutes;
                finishTime = finishHour + ":" + minutes;
                var workEndTime = new Date();
                workEndTime.setHours(finishHour, minutes);

                if (new Date() >= workEndTime)
                {
                    if (isTodayFriday()) {
                      message = (onWeekendMessage === null) ? "🏁 " + finishTime + " 💻 Monday" : onWeekendMessage;
                      status = onWeekendStatus;
                    } else {
                      message = "🏁 " + finishTime + " 💻 Tomorrow";
                      status = afterWorkStatus;
                    }
                } else {
                    status = atWorkStatus;
                    message = "💻 " + startTime + " 🏁" + finishTime;
                }
            } else {
                message = beforeWorkMessage;
                status = beforeWorkStatus;
            }

            return [status, message];
        })
        .then(status => {
            return (function () {
                var myHeaders = new Headers();
                myHeaders.append("X-Auth-Token", CookieManager.getCookie('rc_token'));
                myHeaders.append("X-User-Id", CookieManager.getCookie('rc_uid'));
                myHeaders.append("Content-type", "application/json");

                var raw = JSON.stringify({
                    "message": status[1],
                    "status": status[0]
                });

                var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: raw,
                    redirect: 'follow'
                };

                return fetch(rocketChatUrl + "/api/v1/users.setStatus", requestOptions)
                    .then(response => response.text())
                    .then(result => console.log(result))
                    .catch(error => console.log('error', error));
            })();
        })
        .catch(error => console.log('error', error));
}

function isTodayFriday() {
  const today = new Date();
  return today.getDay() === 5;
}

updateStatus();
var interval = setInterval(updateStatus, updateEach * 60000);

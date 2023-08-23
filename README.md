# tempoToRocketChatStatus
Set rocketChat status to Your working hours.

## How to use

1. Install ViolentMonkey (or any alternative) for your browser:
https://violentmonkey.github.io/
2. "Install script" at your rocketChat website: https://violentmonkey.github.io/guide/creating-a-userscript/#create-a-userscript-for-the-active-tab
    - be sure to change `@match` to Your actual chat url(with `/*` at the end) - other way it wont load
3. Config - You have to configure few things directly in the script ;)
    - rocketChatUrl
        - Just url of your work chat (needed for status update) ex. "https://rocket.example.com"
    - tempoBearerToken
        - To generate one for yourself use steps from: "Creating a New Token" at https://t.ly/u1Tu3
    - tempoUserId
        - The easiest way to get it is to click Your profile picture in right top corner when on Tempo page -> Profile after redirect You should see Your userId in url "jira/people/YourUserId"
    - dailyWorkTime
        - Work time per day in hours (probably 8)
    - updateEach
        - How often do You want this script to update Your status in minutes
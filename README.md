## alexa-headless-start
A one-click script to run alexa-avs-sample-app headlessly.
As the Alexa sample app has 3 different scripts that are needed to run in a particular order and in particular timings, using it to turn a Raspberry Pi (for example) into a headless/monitorless Alexa device is pretty clumsy.
Unlike other solution I've found online to make it headless, this script doesn't use sleep commands to time the different alexa-avs-sample-app scripts, and makes sure the entire process is up as fast as possible (instead of ~6 minutes, just under a minute and a half on my Raspberry Pi Zero W).

In the near future I might add an installer to run Alexa on boot.

## Prerequisites
This scripts assumes you are running a linux based machine (tested only on Raspbian Stretch) and have alexa-avs-sample-app already installed and able to run.

## Install
1. Clone the repository using:
```
git clone https://github.com/itayavra/alexa-headless-start.git
```

2. Make sure the path to your alexa-avs-sample-app folder is correct inside **alexa-headless-start.js**

3. Run with:
```
cd alexa-headless-start
npm install
npm start
```
4. Enjoy

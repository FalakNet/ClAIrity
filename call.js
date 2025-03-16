import notificationapi from "notificationapi-node-server-sdk";
// const notificationapi = require('notificationapi-node-server-sdk').default

notificationapi.init(
  "ku5ceq9ek2hptce6rbktxv4o62", // clientId
  "mjn4in0fwuubbt4vtq1gpur0ey2ifmobs5wnr7utgqjook8e6jy1eedsh3", // clientSecret
  {
    baseURL: "https://api.eu.notificationapi.com",
  }
);

notificationapi.send({
  notificationId: "suicide_warning",
  user: {
    id: "ar1vuog@gmail.com",
    email: "ar1vuog@gmail.com",
    number: "+971547545175", // Replace with your phone number, use format [+][country code][area code][local number]
  },
  mergeTags: {
    comment:
      "Ahmed is expressing suicidal ideation and is in immediate danger. Urgent police response is required.",
  },
});

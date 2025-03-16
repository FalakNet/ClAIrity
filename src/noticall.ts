import notificationapi from 'notificationapi-node-server-sdk';

notificationapi.init(
  'ku5ceq9ek2hptce6rbktxv4o62', // clientId
  'mjn4in0fwuubbt4vtq1gpur0ey2ifmobs5wnr7utgqjook8e6jy1eedsh3', // clientSecret
  {
    baseURL: 'https://api.eu.notificationapi.com'
  }
);

interface User {
  id: string;
  email: string;
  number: string;
}

interface NotificationPayload {
  notificationId: string;
  user: User;
  mergeTags: {
    comment: string;
  };
}

import { AxiosResponse } from 'axios';

export const sendNotification = (policeMessage: string): Promise<AxiosResponse<unknown>> => {
  const payload: NotificationPayload = {
    notificationId: 'suicide_warning',
    user: {
      id: "ar1vuog@gmail.com",
      email: "ar1vuog@gmail.com",
      number: "+971547545175" // Replace with your phone number, use format [+][country code][area code][local number]
    },
    mergeTags: {
      comment: "Ahmed is in imminent danger and risk of suicide. Requesting urgent police intervention."
    }
  };

  return notificationapi.send(payload);
};
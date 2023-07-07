import React, { useEffect, useState } from "react";
 import { styled } from "styled-components";

import * as PushAPI from "@pushprotocol/restapi";
import { useAccount, useNetwork } from "wagmi";
import { ENV } from "@pushprotocol/restapi/src/lib/constants";
import { EmbedSDK } from "@pushprotocol/uiembed";
import { NotificationItem, chainNameType, SubscribedModal } from '@pushprotocol/uiweb';

const NotificationListContainer = styled.div`
  margin: 20px;
  padding: 20px;
  width: 100%;

  @media (max-width: 600px) {
    margin: 0;
    padding: 0;
  }
`;

const Section = styled.section`
  border: 2px solid #ccc;
  padding: 25px;
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  background-color: '#000'};

  & .headerText {
    color: '#fff';
    font-size: 2rem;
  }
`;

const Notifications = () => {

  const { address } = useAccount();
  const { chain, chains } = useNetwork();

  useEffect(() => {
    readNotifications();
    loadEmbeed();
  }, [])

  const [notifs, setNotifs] = useState<PushAPI.ParsedResponseType[]>();

  const readNotifications = async () => {
    try {
      console.log('readNotifications');
      if(!address) return;
      const feeds = await PushAPI.user.getFeeds({
        user: address,
        limit: 10,
        env: ENV.PROD
      });
      setNotifs(feeds);
      console.log(feeds);
    } catch (err) {
      console.log(err);
    }
  }

  const loadEmbeed = async () => {
    try {
      if(address && chain?.id) {
        EmbedSDK.init({
          chainId: chain?.id,
          headerText: 'Workshop push protocol', // optional
          targetID: 'sdk-trigger-id', // mandatory
          appName: 'hackerApp', // mandatory
          user: address, // mandatory
          viewOptions: {
              type: 'sidebar', // optional [default: 'sidebar', 'modal']
              showUnreadIndicator: true, // optional
              unreadIndicatorColor: '#cc1919',
              unreadIndicatorPosition: 'top-right',
          },
          theme: 'light',
          onOpen: () => {
            console.log('-> client dApp onOpen callback');
          },
          onClose: () => {
            console.log('-> client dApp onClose callback');
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Section>
      <button id="sdk-trigger-id" style={{width:'80%'}}>Show Embeed</button>
      <b className="headerText">Notifications</b>
      <NotificationListContainer>
        <>
            {notifs && notifs.map((oneNotification, i) => {
                const { 
                cta,
                title,
                message,
                app,
                icon,
                image,
                url,
                blockchain,
                secret,
                notification
                } = oneNotification;

                return (
                  <NotificationItem
                    key={`notif-${i}`}
                    notificationTitle={secret ? notification['title'] : title}
                    notificationBody={secret ? notification['body'] : message}
                    cta={cta}
                    app={app}
                    icon={icon}
                    image={image}
                    url={url}
                    theme={'dark'}
                    chainName={blockchain as chainNameType}
                  />
                );
            })}          
          </>
      </NotificationListContainer>
    </Section>
  );
};

export default Notifications;

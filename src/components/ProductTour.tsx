import { useNavigate } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

import { useClientContext } from '@/context/ClientContext';
import { useUserStore } from '@/utils/useUserStore';
import { userApi } from '@/api/userApi';
import { useCreateClient } from '@/hooks/useClients';

const waitForElement = (selector: string, timeout = 5000): Promise<Element | null> => {
  return new Promise((resolve) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const foundEl = document.querySelector(selector);
      if (foundEl) {
        observer.disconnect();
        resolve(foundEl);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
};

export function useProductTour() {
  const navigate = useNavigate();
  const { clients } = useClientContext();
  const clientsRef = useRef(clients);
  const { user, setUser } = useUserStore();
  const createClient = useCreateClient();

  useEffect(() => {
    clientsRef.current = clients;
  }, [clients]);

  const handleQuickTourComplete = async () => {
    if (user && user.hasSeenQuickTour !== true) {
      try {
        setUser({ ...user, hasSeenQuickTour: true });
        await userApi.updateProfile({ hasSeenQuickTour: true });
      } catch (error) {
        console.error('Failed to update Quick Tour state', error);
      }
    }
  };

  const startTour = () => {
    // Ensure the sidebar groups we need are open before the tour begins
    window.dispatchEvent(new CustomEvent("openSidebarGroup", { detail: { group: 'Analytics' } }));

    const tourDriver = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      onDestroyed: () => {
        handleQuickTourComplete();
      },
      steps: [
        {
          element: '#tour-sidebar-clients',
          popover: {
            title: 'Clients',
            description: 'Start by going to the Clients page to manage all your organizations.',
            side: 'right',
            align: 'start',
            onNextClick: () => {
              navigate('/clients');
              setTimeout(() => {
                tourDriver.moveNext();
              }, 500); // give it time to render
            }
          }
        },
        {
          element: '#tour-create-client',
          popover: {
            title: 'Create a Client',
            description: 'Click here to add a new client to your workspace.',
            side: 'bottom',
            align: 'start',
            onNextClick: async () => {
              const currentClients = clientsRef.current;
              if (currentClients && currentClients.length > 0) {
                navigate(`/clients/${currentClients[0].id}?tab=data-sources`);
                await waitForElement('#tour-connect-platform-primary, #tour-connect-platform, #tour-select-client-for-integration');
                setTimeout(() => {
                  tourDriver.moveNext();
                }, 100);
              } else {
                try {
                  const newClient = await createClient.mutateAsync({ name: 'My Workspace' });
                  navigate(`/clients/${newClient.id}?tab=data-sources`);
                  await waitForElement('#tour-connect-platform-primary, #tour-connect-platform, #tour-select-client-for-integration');
                  setTimeout(() => {
                    tourDriver.moveNext();
                  }, 100);
                } catch (error) {
                  navigate('/integrations');
                  await waitForElement('#tour-connect-platform-primary, #tour-connect-platform');
                  setTimeout(() => {
                    tourDriver.moveNext();
                  }, 100);
                }
              }
            }
          }
        },
        {
          element: '#tour-connect-platform-primary, #tour-connect-platform, #tour-select-client-for-integration',
          popover: {
            title: 'Connect Platform',
            description: 'Connect various platforms like Google Ads or Meta Business for your client.',
            side: 'bottom',
            align: 'start',
            onPrevClick: () => {
              navigate('/clients');
              setTimeout(() => { tourDriver.movePrevious(); }, 500);
            },
            onNextClick: () => {
              const currentClients = clientsRef.current;
              if (currentClients && currentClients.length > 0) {
                navigate(`/clients/${currentClients[0].id}?tab=overview`);
              }
              setTimeout(() => { tourDriver.moveNext(); }, 500);
            }
          }
        },
        {
          element: '#tour-tab-overview',
          popover: {
            title: 'Overview',
            description: 'Get a bird\'s-eye view of your client\'s performance metrics.',
            side: 'bottom',
            align: 'start',
            onPrevClick: () => {
              if (clientsRef.current && clientsRef.current.length > 0) {
                navigate(`/clients/${clientsRef.current[0].id}?tab=data-sources`);
              }
              setTimeout(() => { tourDriver.movePrevious(); }, 500);
            },
            onNextClick: () => {
              const currentClients = clientsRef.current;
              if (currentClients && currentClients.length > 0) {
                navigate(`/clients/${currentClients[0].id}?tab=reports`);
              }
              setTimeout(() => { tourDriver.moveNext(); }, 500);
            }
          }
        },
        {
          element: '#tour-tab-reports',
          popover: {
            title: 'Reports',
            description: 'Create and view detailed reports for this specific client.',
            side: 'bottom',
            align: 'start',
            onPrevClick: () => {
              const currentClients = clientsRef.current;
              if (currentClients && currentClients.length > 0) {
                navigate(`/clients/${currentClients[0].id}?tab=overview`);
              }
              setTimeout(() => { tourDriver.movePrevious(); }, 500);
            },
            onNextClick: () => {
              const currentClients = clientsRef.current;
              if (currentClients && currentClients.length > 0) {
                navigate(`/clients/${currentClients[0].id}?tab=schedules`);
              }
              setTimeout(() => { tourDriver.moveNext(); }, 500);
            }
          }
        },
        {
          element: '#tour-tab-schedules',
          popover: {
            title: 'Schedules',
            description: 'Set up automated, recurring report deliveries from here.',
            side: 'bottom',
            align: 'start',
            onPrevClick: () => {
              const currentClients = clientsRef.current;
              if (currentClients && currentClients.length > 0) {
                navigate(`/clients/${currentClients[0].id}?tab=reports`);
              }
              setTimeout(() => { tourDriver.movePrevious(); }, 500);
            },
            onNextClick: () => {
              const currentClients = clientsRef.current;
              if (currentClients && currentClients.length > 0) {
                navigate(`/clients/${currentClients[0].id}?tab=ai-studio`);
              }
              setTimeout(() => { tourDriver.moveNext(); }, 500);
            }
          }
        },
        {
          element: '#tour-tab-ai-studio',
          popover: {
            title: 'AI Studio',
            description: 'Use advanced AI tools specifically tailored for your client\'s data.',
            side: 'bottom',
            align: 'start',
            onPrevClick: () => {
              const currentClients = clientsRef.current;
              if (currentClients && currentClients.length > 0) {
                navigate(`/clients/${currentClients[0].id}?tab=schedules`);
              }
              setTimeout(() => { tourDriver.movePrevious(); }, 500);
            },
            onNextClick: () => {
              const currentClients = clientsRef.current;
              if (currentClients && currentClients.length > 0) {
                navigate(`/clients/${currentClients[0].id}?tab=team-access`);
              }
              setTimeout(() => { tourDriver.moveNext(); }, 500);
            }
          }
        },
        {
          element: '#tour-tab-team-access',
          popover: {
            title: 'Team Access',
            description: 'Manage who on your team has access to this client\'s dashboard.',
            side: 'bottom',
            align: 'start',
            onPrevClick: () => {
              const currentClients = clientsRef.current;
              if (currentClients && currentClients.length > 0) {
                navigate(`/clients/${currentClients[0].id}?tab=ai-studio`);
              }
              setTimeout(() => { tourDriver.movePrevious(); }, 500);
            },
            onNextClick: () => {
              navigate('/alerts');
              setTimeout(() => { tourDriver.moveNext(); }, 500);
            }
          }
        },
        {
          element: '#tour-sidebar-alerts',
          popover: {
            title: 'Alerts',
            description: 'Monitor automated alerts across all your clients and metrics.',
            side: 'right',
            align: 'start',
            onPrevClick: () => {
              const currentClients = clientsRef.current;
              if (currentClients && currentClients.length > 0) {
                navigate(`/clients/${currentClients[0].id}?tab=team-access`);
              } else {
                navigate('/clients');
              }
              setTimeout(() => { tourDriver.movePrevious(); }, 500);
            },
            onNextClick: async () => {
              navigate('/account-setup');
              await waitForElement('#tour-sidebar-settings');
              setTimeout(() => { tourDriver.moveNext(); }, 100);
            }
          }
        },
        {
          element: '#tour-sidebar-settings',
          onHighlightStarted: () => {
            window.dispatchEvent(new CustomEvent("openSidebarGroup", { detail: { group: 'Settings' } }));
          },
          popover: {
            title: 'Settings',
            description: 'Finally, head to the Settings page.',
            side: 'right',
            align: 'start',
            onPrevClick: () => {
              navigate('/alerts');
              setTimeout(() => { tourDriver.movePrevious(); }, 500);
            },
            onNextClick: () => {
              navigate('/account-setup?tab=ai-settings');
              setTimeout(() => { tourDriver.moveNext(); }, 500);
            }
          }
        },
        {
          element: '#tour-ai-providers',
          popover: {
            title: 'AI Configuration',
            description: 'Select your preferred AI provider and enter your API key to enable AI features across the platform.',
            side: 'top',
            align: 'start',
            onPrevClick: () => {
              navigate('/account-setup');
              setTimeout(() => { tourDriver.movePrevious(); }, 500);
            }
          }
        }
      ]
    });

    tourDriver.drive();
  };

  return { startTour };
}

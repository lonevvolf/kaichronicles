import { Workbox } from "workbox-window";

export const pwa = {
    promptForUpdate() : boolean {
        return confirm("A new version of the application is available.  Update now?");
    },
    registerServiceWorker : () => {
        if ("serviceWorker" in window.navigator) {
            try {         
                const wb = new Workbox("/sw.js");

                const showSkipWaitingPrompt = async (event) => {
                    // Assuming the user accepted the update, set up a listener
                    // that will reload the page as soon as the previously waiting
                    // service worker has taken control.
                    wb.addEventListener('controlling', () => {
                      // At this point, reloading will ensure that the current
                      // tab is loaded under the control of the new service worker.
                      // Depending on your web app, you may want to auto-save or
                      // persist transient state before triggering the reload.
                      window.location.reload();
                    });
              
                    // When `event.wasWaitingBeforeRegister` is true, a previously
                    // updated service worker is still waiting.
                    // You may want to customize the UI prompt accordingly.
              
                    // This code assumes your app has a promptForUpdate() method,
                    // which returns true if the user wants to update.
                    // Implementing this is app-specific; some examples are:
                    // https://open-ui.org/components/alert.research or
                    // https://open-ui.org/components/toast.research
                    if (pwa.promptForUpdate()) {
                      wb.messageSkipWaiting();
                    }
                  };
              
                  // Add an event listener to detect when the registered
                  // service worker has installed but is waiting to activate.
                  wb.addEventListener('waiting', (event) => {
                    showSkipWaitingPrompt(event);
                  });

                // wb.addEventListener("waiting", event => {
                //     if (confirm("Update now?")) {
                //         wb.addEventListener("controlling", event => {
                //             window.location.reload();
                //         });
                                    
                //         // Send a message telling the service worker to skip waiting.
                //         // This will trigger the `controlling` event handler above.
                //         wb.messageSkipWaiting();
                //     }
                // });
                  
                wb.register();
                // const registration = await window.navigator.serviceWorker.register("/sw.js", {
                // scope: "/",
                // });
                // if (registration.installing) {
                // console.log("Service worker installing");
                // } else if (registration.waiting) {
                // console.log("Service worker installed");
                // } else if (registration.active) {
                // console.log("Service worker active");
                // }
            } catch (error) {
                console.error(`Registration failed with ${error}`);
            }
        }
    }
}
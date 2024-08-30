import { Workbox } from "workbox-window";

export class pwa {
    public static isOnline = true;
    private static wb: Workbox = null;

    private static promptForUpdate() : void {
        toastr.info("A new version of the app is available. Click here to update.",
                    "App Update Available",
                    {
                      timeOut: 0,
                      extendedTimeOut: 0,
                      onclick : () => 
                      { 
                        pwa.messageSkipWaiting();
                      },
                    });
    }

    public static messageSkipWaiting() {
      this.wb.messageSkipWaiting();
    }

    public static showConnectivityStatus() : void {
        window.addEventListener("online", () => {
          toastr.info("Your Internet connection was restored.");
          pwa.isOnline = true;
        });
      
        window.addEventListener("offline", () => {
          toastr.warning("Your Internet connection was lost.");
          pwa.isOnline = false;
        });
    }

    public static registerServiceWorker() {
        if ("serviceWorker" in window.navigator) {
            try {         
                this.wb = new Workbox("../sw.js");

                const showSkipWaitingPrompt = async (event) => {
                    // Assuming the user accepted the update, set up a listener
                    // that will reload the page as soon as the previously waiting
                    // service worker has taken control.
                    this.wb.addEventListener('controlling', () => {
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
                    this.promptForUpdate(); 
                  };
              
                  // Add an event listener to detect when the registered
                  // service worker has installed but is waiting to activate.
                  this.wb.addEventListener('waiting', (event) => {
                    showSkipWaitingPrompt(event);
                  });

                  window.addEventListener('load', () => {
                    this.showConnectivityStatus();
                  });
                  
                this.wb.register();
                
            } catch (error) {
                console.error(`Registration failed with ${error}`);
            }
        }
    }
}
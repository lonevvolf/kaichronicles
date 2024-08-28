import { Workbox } from "workbox-window";

export class pwa {
    private static offlineToast: JQuery<HTMLElement> = null;

    private static promptForUpdate() : boolean {
        return confirm("A new version of the application is available.  Update now?");
    }

    public static showConnectivityStatus() : void {
        window.addEventListener("online", () => {
          toastr.info("Your Internet connection was restored.");
          toastr.clear(this.offlineToast);
        });
      
        window.addEventListener("offline", () => {
          toastr.warning("Your Internet connection was lost.");
          this.offlineToast = toastr.error("You're currently offline.", null, {timeOut: 0});
        });
    }

    public static registerServiceWorker() {
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
                    if (this.promptForUpdate()) {
                      wb.messageSkipWaiting();
                    }
                  };
              
                  // Add an event listener to detect when the registered
                  // service worker has installed but is waiting to activate.
                  wb.addEventListener('waiting', (event) => {
                    showSkipWaitingPrompt(event);
                  });

                  window.addEventListener('load', () => {
                    this.showConnectivityStatus();
                  });
                  
                wb.register();
                
            } catch (error) {
                console.error(`Registration failed with ${error}`);
            }
        }
    }
}
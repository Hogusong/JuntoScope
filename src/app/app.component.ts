import { Component } from "@angular/core";
import { Platform } from "ionic-angular";
import { StatusBar } from "@ionic-native/status-bar";
import { ScreenOrientation } from "@ionic-native/screen-orientation";
import { SplashScreen } from "@ionic-native/splash-screen";
import { AuthFacade } from "../features/authentication/store/auth.facade";
import { Deeplinks } from "@ionic-native/deeplinks";
import { DashboardPage } from "../features/dashboard/pages/dashboard/dashboard.component";
import { ConnectionFacade } from "../features/connections/store/connection.facade";
import { SafariViewController } from "@ionic-native/safari-view-controller";
// import { LoadingService } from "../shared/loading.service";

@Component({
  templateUrl: "app.html"
})
export class JuntoScopeComponent {
  rootPage: any = "LoginPage";

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    screenOrientation: ScreenOrientation,
    authFacade: AuthFacade,
    deeplinks: Deeplinks,
    connectionFacade: ConnectionFacade,
    safariViewController: SafariViewController
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      screenOrientation
        .lock(screenOrientation.ORIENTATIONS.PORTRAIT)
        .catch(error => console.log(error));

      authFacade.checkAuth();

      //Jedi:  The matching route foer the deeplink might not be matching the url that's returned exactly.
      // I think we can remove this to match anything.  Let's test on iOS with nothing specified
      deeplinks.route({}).subscribe(
        match => {
          // match.$route - the route we matched, which is the matched entry from the arguments to route()
          // match.$args - the args passed in the link
          // match.$link - the full link data
          console.log("Successfully matched route", JSON.stringify(match));
          console.log("full data - ", JSON.stringify(match.$link));
          console.log("args - ", match.$args);
          console.log("route - ", match.$route);

          const code = match.$args.code;
          const connection = {
            token: code,
            type: "teamwork"
          };

          // if(match && platform.is('ios')) {
          //   safariViewController.hide(); // this causes the unauthorized error ...
          // }

          console.log(
            "connectionFacade.addConnection(connection); connection details - ",
            JSON.stringify(connection)
          );
          connectionFacade.addConnection(connection);
        },
        nomatch => {
          // nomatch.$link - the full link data
          console.error("Got a deeplink that didn't match", nomatch);
        }
      );
    });
  }
}

import SwiftUI

// Search bar
// Settings item
//  Server location
//  PSK
// List of passwords/folders
//  Page switches can use the same view (but with back-button)
//
// Password dialog (popup based on server response)
// After one entry, any item can be pressed to reveal text or copy to clipboard


// swiftlint:disable type_name
@main struct nassApp: App {

  var body: some Scene {
    WindowGroup {
      NavigationView {
        ZStack {
            // The Gradient background needs to be placed inside the ZStack to appear beneath
            // the scene (which we give a transparent background)
            BKG_GRADIENT_LINEAR
                .edgesIgnoringSafeArea(.vertical) // Fill entire screen
            ContentView()
            // https://stackoverflow.com/a/57518324/9033629
            .navigationBarTitle("")
            .navigationBarHidden(true)
        }
      }
      //  https://stackoverflow.com/a/64752414/9033629
      .navigationViewStyle(StackNavigationViewStyle())
    }
  }
}

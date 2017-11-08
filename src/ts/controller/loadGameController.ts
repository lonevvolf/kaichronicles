/// <reference path="../external.ts" />

/**
 * Load stored game controller
 */
class loadGameController {
    
    /**  
     * The load game page 
     */
    public static index() {
        template.setNavTitle( translations.text('kaiChronicles'), '#mainMenu', true);
        template.showStatistics(false);
        views.loadView('loadGame.html').then(function() {
                
            if( !cordovaApp.isRunningApp() ) {
                // Web page environment:
                loadGameView.hideFilesList();
                loadGameView.bindFileUploaderEvents();
            }
            else {
                // Cordova app files list
                loadGameView.hideFileUpload();
                loadGameController.listGameFiles();
            }

        });
    }

    /**
     * Fill the Cordova app saved games list
     */
    private static listGameFiles() {
        loadGameView.clearFilesList();

        // Get files on the root directory of the persistent storage
        cordovaFS.requestFileSystemAsync()
        .then(function( fileSystem /* : FileSystem */ ) {
            return cordovaFS.getRootFilesAsync( fileSystem );
        })
        .then( function(entries : Array<any> ) {

            // Get file names (entries is Array<Entry>)
            let fileNames : Array<string> = [];
            for(let entry of entries) {
                // There can be directories here (ex. downloaded books)
                if( entry.isFile )
                    fileNames.push( entry.name );
            }

            // The list may be unsorted:
            fileNames.sort();
            loadGameView.addFilesToList( fileNames );
            loadGameView.bindListEvents();
        })
        .fail(function( error : any ) {
            // TODO: Test this
            let msg = 'Error retrieving saved games list';
            if( error )
                msg += ': ' + error.toString();
            alert( error );
        });
    }

    /** 
     * Called when the selected file changes (only web)
     * @param fileToUpload The selected file
     */
    public static fileUploaderChanged(fileToUpload : Blob) {
        try {
            var reader = new FileReader();
            reader.onload = function (e) {
                loadGameController.loadGame( (<any>e.target).result );
            };
            reader.readAsText(fileToUpload);
        }
        catch(e) {
            console.log(e);
            loadGameView.showError( e.toString() );
        }
    }

    /**
     * Called when a file is selected (Android only)
     */
    public static fileListClicked(fileName : string) {
        cordovaFS.loadFile( fileName , function(fileContent) {
            loadGameController.loadGame( fileContent );
        });
    }

    /**
     * Load saved game and start to play it
     * @param jsonState The saved game file content
     */
    private static loadGame(jsonState : string) {
        try {
            state.loadSaveGameJson( jsonState );
            routing.redirect('setup');
        }
        catch(e) {
            console.log(e);
            if( cordovaApp.isRunningApp() )
                alert(e.toString());
            else
                loadGameView.showError( e.toString() );
        }
    }

    /**
     * Delete a saved game (Android only)
     * @param fileName The file name to delete
     */
    public static deleteFile(fileName : string) {
        cordovaFS.deleteFile(fileName, function() {
            loadGameView.removeFilenameFromList( fileName );
        });
    }

    /**
     * Export saved games to Downloads file (Android only)
     */
    public static exportSavedGames() {
        
    }

    /** Return page */
    public static getBackController() { return 'mainMenu'; }
    
};
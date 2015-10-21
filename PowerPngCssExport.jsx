#target photoshop

/*
Power PNG CSS Export
1) Merges all visible layers
2) Allows user to select output transparent PNG file name
3) Visible layers are merged and exported as transparent PNG
4) Pop-up window displays associated CSS markup for item that you can copy & paste into your CSS file!
5) All actions in Photoshop history are erased (no need to worry about stepping back)

Photoshop Directions
1) Only show layers you want merged & exported
2) Run File->Scripts->Power PNG Export

*/

// Function to launch the "Layer > Rasterize > with style"
// Produced with the JavaScript listener
function rasterizeLayerStyle()
{
    var idrasterizeLayer = stringIDToTypeID( "rasterizeLayer" );
    var desc5 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
    var ref4 = new ActionReference();
    var idLyr = charIDToTypeID( "Lyr " );
    var idOrdn = charIDToTypeID( "Ordn" );
    var idTrgt = charIDToTypeID( "Trgt" );
    ref4.putEnumerated( idLyr, idOrdn, idTrgt );
    desc5.putReference( idnull, ref4 );
    var idWhat = charIDToTypeID( "What" );
    var idrasterizeItem = stringIDToTypeID( "rasterizeItem" );
    var idlayerStyle = stringIDToTypeID( "layerStyle" );
    desc5.putEnumerated( idWhat, idrasterizeItem, idlayerStyle );
    executeAction( idrasterizeLayer, desc5, DialogModes.ALL );
};

// Get current document and current layer
var docRef = app.activeDocument;
var activeLay = docRef.mergeVisibleLayers();
var curHistoryStates = docRef.historyStates.length;

var newLayer = docRef.activeLayer;
newLayer.rasterize(RasterizeType.ENTIRELAYER);
docRef.activeLayer = newLayer;
rasterizeLayerStyle();

// Copy the content of the layer in the clipboard
newLayer.copy();

//Get the dimensions of the content of the layer
var tempWidth = newLayer.bounds[2] - newLayer.bounds[0];
var tempHeight = newLayer.bounds[3] - newLayer.bounds[1];

var tempX = newLayer.bounds[0];
var tempY = newLayer.bounds[1];


var fileName = File.saveDialog("Please select a file to save the results");
var stringFileName = String(fileName);
var searchIndex = stringFileName.lastIndexOf("/");
var imageName = stringFileName.substr(searchIndex+1);
var cssIndex = imageName.indexOf(".");
var cssName = imageName.substr(0, cssIndex);

var cssText = "CSS Information" + "\n" + "#" + cssName + "\n{" + "\n\t" + "left:" + tempX + ";\n\t" + "top:" + tempY + ";\n\t" + "width:" + tempWidth + ";\n\t" + "height:" + tempHeight + ";\n\t" + "background-image: url(" + imageName + ");\n}";
var formattedCssText = cssText.split(' px').join('px');
alert(formattedCssText);

//Create a new document with the correct dimensions and a transparent background
var myNewDoc = app.documents.add(tempWidth,tempHeight,72,"exportedLayer", NewDocumentMode.RGB,DocumentFill.TRANSPARENT);

//Add an empty layer and paste the content of the clipboard inside
var targetLayer = myNewDoc.artLayers.add();
myNewDoc.paste();

//Set the opacity
targetLayer.opacity = newLayer.opacity;

//Options to export to PNG files
var options = new ExportOptionsSaveForWeb();
	options.format = SaveDocumentType.PNG;
    options.PNG8 = false;
    options.transparency = true;
	options.optimized = true;
    
// Export Save for Web in the current folder
myNewDoc.exportDocument(File(fileName),ExportType.SAVEFORWEB, options);

// Close the temp document without saving the changes
myNewDoc.close (SaveOptions.DONOTSAVECHANGES);

// Remove the temp layer
newLayer.remove();

docRef.activeHistoryState = docRef.historyStates[0]; 
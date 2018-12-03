#target photoshop

/*
Power PNG CSS Export
By Kurt Suchomel

Automates the process of exporting seperate image layers or groups of images as PNGs.
1) select layers
2) select all or part of image
3) copy merge
4) create new document with dimensions same as copied image
5) paste new image
6) export image as transparent PNG

PLUS! 
CSS markup is created for item!
...makes sure only valid file names are used
...converts underlined file names to camel case for div image id name
...and copies CSS markup text to clipboard to paste into CSS file!

Directions
1) Open your PSD file
2) Only show layers you want merged & exported
3) Optional: use selection tool to crop or expand selection area
4) Select the Photoshop file menu: File->Scripts->Power PNG Export

*/

// Get current document and current layer to rollback after export
var docRef = app.activeDocument;
var curHistoryStates = docRef.historyStates.length;

// funky way (possibly only way) to check if selection is set
function hasSelection(doc)
{
    if(doc == undefined) doc = activeDocument;
    var res = false;
    var as = docRef.activeHistoryState;
    doc.selection.deselect();
    if (as != doc.activeHistoryState)
    {
        res = true;
        doc.activeHistoryState = as;
    }
    return res;
}

try
{
   docRef.mergeVisibleLayers();
}
catch(err)
{
    // sometimes only 1 visible layer...not easy way to get number of layers selected
    // alert("Error merging visible layers!")
}

var newLayer = docRef.activeLayer;
docRef.activeLayer = newLayer;

// get x and y of image to compare if part of it is selected
var tempX = newLayer.bounds[0];
var tempY = newLayer.bounds[1];

// if selection is choosen then copy merged, else disregard and continue to use newLayer
if(hasSelection(docRef)) 
{   
    if( docRef.selection.bounds[0] > tempX)
    {
        tempX = docRef.selection.bounds[0];
    }
    if( docRef.selection.bounds[1] > tempY)
    {
        tempY = docRef.selection.bounds[1];
    }
    docRef.selection.copy(true);
    docRef.paste(true);
    docRef.selection.deselect();
    newLayer = docRef.activeLayer;
}

newLayer.copy();

// Get the dimensions of the content of the layer
var tempWidth = newLayer.bounds[2] - newLayer.bounds[0];
var tempHeight = newLayer.bounds[3] - newLayer.bounds[1];

var fileName = File.saveDialog("Please select a file to save the results");
var stringFileName = String(fileName);
var searchIndex = stringFileName.lastIndexOf("/");
var imageName = stringFileName.substr(searchIndex+1);
var cssIndex = imageName.indexOf(".");
var cssName = imageName.substr(0, cssIndex);

var invalidFileNameChars = /[^A-Za-z0-9_.]/; // any chars except alpha numerics, "_", "."

// check for valid image file name: no additional special characters!
if (cssName.match(invalidFileNameChars))
{
  alert("Error! Invalid image file name. Use only alpha characters and underlines for file names.");
}
else
{
    // if "_" are used, then convert cssName to camel case
    var finalCssName = cssName;
    var indexOfMatch = cssName.indexOf( "_" );
    while (indexOfMatch != -1)
    {
        // Replace the current instance.
        var upperChar = finalCssName.substr(indexOfMatch+1, 1);
        upperChar = upperChar.toUpperCase();

        finalCssName = finalCssName.substr(0, indexOfMatch) + upperChar + finalCssName.substr(indexOfMatch+upperChar.length+1);
        
        // Get the index of any next matching substring.
        indexOfMatch = finalCssName.indexOf( "_" );
    }

    // display CSS markup
    var cssText = "#" + finalCssName + " {\n\t" + "left:" + tempX + ";\n\t" + "top:" + tempY + ";\n\t" + "width:" + tempWidth + ";\n\t" + "height:" + tempHeight + ";\n\t" + "background-image:url(" + imageName + ");\n}";
    var formattedCssText = cssText.split(' px').join('px');

    // copy CSS to clipboard
    var sh = app.system("osascript -e 'set the clipboard to \"" + formattedCssText + "\"'"); 

    // show just in case you need to copy only a line or two...needs to come after system copy to clipboard
    //alert(formattedCssText);

    // Create a new document with the correct dimensions and a transparent background
    var myNewDoc = app.documents.add(tempWidth,tempHeight,72,"exportedLayer", NewDocumentMode.RGB,DocumentFill.TRANSPARENT);

    // Add an empty layer and paste the content of the clipboard inside
    var targetLayer = myNewDoc.artLayers.add();
    myNewDoc.paste();

    // Set the opacity
    targetLayer.opacity = newLayer.opacity;

    // Options to export to PNG files
    var options = new ExportOptionsSaveForWeb();
    	options.format = SaveDocumentType.PNG;
        options.PNG8 = false;
        options.transparency = true;
    	options.optimized = true;
        
    // Export Save for Web in the current folder
    try
    {
        myNewDoc.exportDocument(File(fileName),ExportType.SAVEFORWEB, options);
    }
    catch(err)
    {
        // alert("Aborted export...")
    }

    // Close the temp document without saving the changes
    myNewDoc.close (SaveOptions.DONOTSAVECHANGES);

    // Remove the temp layer
    newLayer.remove();
}

// go back to original state of PSD
docRef.activeHistoryState = docRef.historyStates[curHistoryStates-1]; 
// ==UserScript==
// @name Minimal Tetris Friends
// @namespace minimaltetrisfriends
// @description Reduces lag as much as possible
// @include http://*tetrisfriends.com/games/Ultra/game.php*
// @include http://*tetrisfriends.com/games/Sprint/game.php*
// @include http://*tetrisfriends.com/games/Live/game.php*
// @include http://*tetrisfriends.com/data/games/Ultra/OWGameUltra.swf
// @grant none
// @run-at document-start
// @version 4.2.4
// @author morningpee
// ==/UserScript==

window.stop();

function buildFlashVarsParamString()
{
    var flashVars = new Object();
    flashVars.apiUrl = "http://api.tetrisfriends.com/api";
    flashVars.startParam = "clickToPlay";

    var request = new XMLHttpRequest();
    var SYNCHRONOUS_REQUEST=false;
    request.open('GET', 'http://www.tetrisfriends.com/users/ajax/profile_my_tetris_style.php', SYNCHRONOUS_REQUEST);
    request.send(null);

    if (request.status === 200) {
        flashVars = Object.assign( flashVars, eval( request.responseText.match(/flashVars = {[\s\S]*timestamp.*}/)[0] ) );
        delete flashVars.viewerId;
    }

    flashVarsParamString = Object.keys( flashVars ).map(k => k + '=' + flashVars[k] ).join('&');
    return flashVarsParamString;
}

function talkAboutThatContentFlashSize()
{
    contentFlashSize.T_WIDTH_SCALE_INDEX = 2;
    contentFlashSize.T_HEIGHT_SCALE_INDEX = 3;

    contentFlashSize.T_WIDTH_INDEX = 8;
    contentFlashSize.T_HEIGHT_INDEX = 9;

    contentFlashSize.scaleFactor = 2;
    contentFlashSize.translateConstant = -100 / contentFlashSize.scaleFactor / 2;

    contentFlashSize.originalWidth = contentFlash.TGetProperty('/', contentFlashSize.T_WIDTH_INDEX);
    contentFlashSize.originalHeight = contentFlash.TGetProperty('/', contentFlashSize.T_HEIGHT_INDEX);

    contentFlashSize.minimalWidth = contentFlashSize.originalWidth / contentFlashSize.scaleFactor;
    contentFlashSize.minimalHeight = contentFlashSize.originalHeight / contentFlashSize.scaleFactor;

    contentFlash.TSetProperty("/", contentFlashSize.T_HEIGHT_SCALE_INDEX, 100 / contentFlashSize.scaleFactor);
    contentFlash.TSetProperty("/", contentFlashSize.T_WIDTH_SCALE_INDEX, 100 / contentFlashSize.scaleFactor);

    contentFlash.style.width = contentFlashSize.originalWidth + "px";
    contentFlash.style.height = contentFlashSize.originalHeight + "px";
}

function transformContentFlash()
{
    contentFlash.style.visibility = "initial";
    var windowAspectRatio = innerHeight / innerWidth;

    var contentFlashAspectRatio = contentFlashSize.originalHeight / contentFlashSize.originalWidth;

    var scaleFactorX;
    var scaleFactorY;

    if(  contentFlashAspectRatio > windowAspectRatio )
    {
        updatedWidth = Math.round( innerHeight / contentFlashAspectRatio );
        updatedHeight = innerHeight;
    }
    else
    {
        updatedWidth = innerWidth;
        updatedHeight = Math.round( innerWidth * contentFlashAspectRatio );
    }

    scaleFactorX = updatedWidth / contentFlashSize.minimalWidth;
    scaleFactorY = updatedHeight / contentFlashSize.minimalHeight;

    /*we need to use translate3d instead of translate for 3d acceleration*/
    contentFlash.style.transform = "scale( " + scaleFactorX + " ) translate3d( " + contentFlashSize.translateConstant + "% , " + contentFlashSize.translateConstant + "% , 0px)";
}

function buildContentFlash(sourceDocument, flashVarsParamString)
{
    var contentFlash = sourceDocument.createElement("embed");
    contentFlash.setAttribute("id", "contentFlash");
    contentFlash.setAttribute("allowscriptaccess", "always");
    contentFlash.setAttribute("name", "plugin");
    contentFlash.setAttribute("type", "application/x-shockwave-flash");
    contentFlash.setAttribute("wmode", "opaque");
    contentFlash.setAttribute("flashvars", flashVarsParamString);

        contentFlash.style.visibility = "hidden";

    return contentFlash;
}

function runOnContentFlashLoaded()
{
    var percentLoaded = "0";
    try{
        percentLoaded = contentFlash.PercentLoaded();

        /* this line will fail if it isn't loaded */
        contentFlash.TGetProperty('/', 0);
    }
    catch(e){
        percentLoaded = "0";
    }

    if( percentLoaded != "100" )
       return setTimeout( runOnContentFlashLoaded, 300 );
    try
        {
    contentFlashSize = new Object();
    talkAboutThatContentFlashSize();
    transformContentFlash();
            }catch(err){alert(err);}
}

function mtfInit()
{
    thingWrong = 0;
    contentFlash.LoadMovie(0, "http://tetrisow-a.akamaihd.net/data5_0_0_3/games/Ultra/OWGameUltra.swf");
    runOnContentFlashLoaded();
}



/* html5 */
document.doctype&&
    document.replaceChild( document.implementation.createDocumentType('html', "", ""), document.doctype );

mtfWrapper = document.createElement("html");
mtfWrapper.appendChild( document.createElement("head") );
mtfBody = mtfWrapper.appendChild( document.createElement("body") )
    .appendChild(
       mtfFrame = document.createElement("iframe")
    );
mtfBody.appendChild( document.createElement('style') ).innerHTML = '* { margin: 0; } iframe { border: 0; width: 100vw; height: 100vh; }';

mtfDocument = document.implementation.createHTMLDocument("Minimal Tetris Friends");

mtfDocument.head.innerHTML = '<meta name="viewport" content="height=100, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />';

mtfDocument.head.appendChild( document.createElement('script') ).innerHTML = mtfInit.toString() + talkAboutThatContentFlashSize.toString() + transformContentFlash.toString() + runOnContentFlashLoaded.toString();
mtfDocument.body.appendChild( document.createElement('style') ).innerHTML = ':root{ image-rendering: optimizespeed; } @viewport { zoom: 1; min-zoom: 1; max-zoom: 1; user-zoom: fixed; } * { margin: 0; padding: 0; outline: none; box-sizing: border-box; } body { background: url(http://tetrisow-a.akamaihd.net/data5_0_0_1/images/bg.jpg) repeat-x; margin: 0; display: block; overflow: hidden; } embed { position: absolute; top: 50vh; left: 50vw; transform-style: preserve-3d; transform-origin: top left; }';

mtfDocument.body.appendChild( buildContentFlash( mtfDocument, buildFlashVarsParamString() ) );
mtfDocument.body.setAttribute("onload", "mtfInit()");

mtfFrame.src = "data:text/html," + mtfDocument.documentElement.outerHTML;
addEventListener("resize", function(){ frames[0].transformContentFlash.call( frames[0], frames[0].contentFlash ) } );
document.replaceChild( mtfWrapper, document.documentElement );

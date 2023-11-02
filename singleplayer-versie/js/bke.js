/***************************************************
 *  Boter-Kaas-Eieren
 *  ------------------------------------------------
 *  Versie:     2021
 **************************************************/

// ------------------
// GLOBALE VARIABELEN
// ------------------
let current_player = 1;     
let beurt_num;                  // Nummer van de speler die aan de beurt is
let beurt_img;                  // Afbeelding van de speler die aan de beurt is
let score_speler1;              // Hier houden we de score van speler 1 bij, getal
let score_speler2;              // Hier houden we de score van speler 2 bij, getal
let ronde;                      // Welke ronde is het, een getal

let timerID;                    // ID van de interval
let elapsedTimeInSeconds;       // Tijd in seconden

let score_speler1_info;         // Het element waarin we de score laten zien van speler 1
let score_speler2_info;         // Het element waarin we de score laten zien van speler 2
let timer_info;                 // Ronde tijd
let ronde_info;                 // Het element in mijn html waarin ik aangeef welke
                                // ronde we spelen.
let cellen;                     // Alle cellen van het speelveld
let button;                     // Game Button


// ----------
// CONSTANTEN
// ----------
const _PLAYER1 = 1;             // Constante, waarde gaat nooit veranderen. Speler 1
const _PLAYER2 = 2;             // Constante, waarde gaat nooit veranderen. Speler 2
const _EMPTY = 0;               // Constante, waarde gaat nooit veranderen. Leeg
const _DRAW = 0;                // Constante, waarde gaat nooit veranderen. Gelijk spel
const _CONTINUE_GAME = -1;      // Constante, waarde gaat nooit veranderen. Doorgaan met spelen

//               _EMPTY = 0        _PLAYER1 = 1      _PLAYER2 = 2
const _IMAGES = [ 'img/empty.jpg', 'img/cross.png', 'img/circle.png' ];


// --------------
// PROGRAMMA CODE
//---------------

/*********************************************************************************
 * Functie:     onLoad
 * -------------------------------------------------------------------------------
 * Dit is de functie die aan het begin gelijk wordt uitgevoerd.
 * We zorgen in deze functie voor het volgende:
 * - Elementen uit de HTML ophalen en beschikbaar stellen in JavaScript (caching)
 * - Click events toevoegen aan cellen en de button
 ********************************************************************************/
window.onload = function() 
{
    // Alle elementen binnen halen in JavaScript
    cellen = document.querySelectorAll('.game-board img');
    button = document.querySelector('.game-button');
    beurt_num = document.querySelector('.player-info__number');
    beurt_img = document.querySelector('.player-info__identifier img');
    ronde_info = document.querySelector('.round-info__number');
    score_speler1_info = document.querySelector('#player1-score');
    score_speler2_info = document.querySelector('#player2-score');
    timer_info = document.querySelector('.timer');

    timerID = null;             // We zetten deze op NULL, want er is nog geen timer gestart
    elapsedTimeInSeconds = 0;   // We zetten deze op 0, want er zijn nog speelseconden verlopen
    score_speler1 = 0;          // Bij start van het spel hebben spelers nog geen score
    score_speler2 = 0;
    ronde = 0;                  // We zetten deze op 0, want er is nog geen ronde gespeeld

    // Click events afvangen van de button
    button.onclick = buttonClick;
};

/***********************************************************
 * Functie:     roundsTimer
 * ---------------------------------------------------------
 * Deze functie laat de verlopen speeltijd per ronde zien.
 **********************************************************/
function roundsTimer() 
{
    var elapsedTimeInMinutes = 0;

    elapsedTimeInSeconds++;

    if(elapsedTimeInSeconds >= 60) {
        elapsedTimeInMinutes = parseInt(elapsedTimeInSeconds / 60);
        timer_info.innerHTML = '' + elapsedTimeInMinutes + ' min. ' +
                               parseInt((elapsedTimeInSeconds % 60)) + ' sec.';
    } else {
        timer_info.innerHTML = '' + elapsedTimeInSeconds + ' sec.';
    }
}

/***********************************************************
 * Functie:     setRoundsTimer
 * ---------------------------------------------------------
 * Deze functie start de speelronde timer. Als er al een
 * timer is gezet dan wordt deze eerst gedeactiveerd.
 **********************************************************/

function setRoundsTimer() 
{
    if(timerID != null) {
        unsetRoundsTimer();
    }
        
    timerID = setInterval( roundsTimer, 1000 );
}

/**********************************************************
 * Functie:     unsetRoundsTimer
 * --------------------------------------------------------
 * Deactiveert een gestarte timer.
 * 
 * Aangezien er een aantal stappen moeten worden ondernomen
 * om een timer te deactiveren hebben we deze stappen in
 * een eigen functie gezet.
 *********************************************************/
function unsetRoundsTimer() 
{
    if(timerID != null) {
        clearInterval(timerID);
        timerID = null;
        elapsedTimeInSeconds = 0;
    }
}
/********************************************************************
 * Functie:     buttonClick
 * ------------------------------------------------------------------
 * @param       event       Bevat alle info van het event
 * 
 * Dit is de functie die alle clicks op de button gaat afhandelen.
 * 
 * Het spel of een ronde wordt geïnitialiseerd. Dit betekent dat alle
 * voorbereidingen worden getroffen, zoals variabelen resetten o.a.,
 * om een ronde te kunnen starten of een ronde te kunnen resetten.
 *******************************************************************/
function buttonClick(event) 
{
    // Is de tekst op de button gelijk aan 'Start spel'?
    if(event.target.innerHTML == 'Start spel') {
        /*  Ja, dus gaan we het spel starten en ondernemen de nodige
         *  stappen, zoals:
         *      - Ronde nummer verhogen
         *      - Ronde nummer tonen op het scherm
         *      - click events toevoegen aan de cellen
         *      - Tekst veranderen op de button
         *      - Ronde timer starten
         */
        ronde++;
        ronde_info.innerHTML = ronde;
        for(var kolom = 0; kolom < cellen.length; kolom++) {
            cellen[kolom].onclick = celClick;
        }
        event.target.innerHTML = 'Reset spel';
        timer_info.innerHTML = '0 sec.';
        setRoundsTimer();
    } else {
        /*  Nee, dan gaan we het spel resetten door de volgende
         *  stappen uit te voeren:
         *      - Timer stoppen
         *      - Laatste timer info tonen op het scherm
         *      - Speelveld leeg maken (overal weer empty.jpg in plaatsen) en
         *        Deactiveren van de click event handlers op de cellen
         *      - Start spel op de button plaatsen
         */
        unsetRoundsTimer();
        timer_info.innerHTML = 'Vorige ronde tijd: ' + timer_info.innerHTML;
        for(var kolom = 0; kolom < cellen.length; kolom++) {
            cellen[kolom].src = _IMAGES[_EMPTY];
            cellen[kolom].onclick = null;
        }
        
        event.target.innerHTML = 'Start spel';
    }
}


/*******************************************************************************
 * Functie:     celClick
 * -----------------------------------------------------------------------------
 * @param       event       Bevat alle info van het event
 * 
 * Dit is de functie die alle clicks op de cellen gaat afhandelen. In feite is
 * dit de functie waar het spel wordt gespeeld en iedere click van een speler
 * dus wordt afgehandeld door de juiste/passende acties uit te voeren.
 * 
 * De functie is een event handler en daardoor krijgt de functie als
 * parameter een object mee van het systeem waarin alle informatie staat over
 * de event. Zoals o.a.:
 *      - Waarop geklikt is
 * Hierdoor kunnen we via dit object ook bij het element waarop geklikt is en
 * deze dus aanpassen.
 ******************************************************************************/
function celClick(event) 
{
    // Is speler 1 aan de beurt?
    if(current_player == 1) {
        // JA

        // Dan checken we nu of de cel is bezet door een van de twee spelers
        // zo ja, dan is deze niet leeg en gaan we niks doen.
        if(event.target.src.indexOf(_IMAGES[_PLAYER1]) >= 0 || event.target.src.indexOf(_IMAGES[_PLAYER2]) >= 0)
            return;

        // Als de cel leeg is kunnen we de afbeelding van deze speler in de cel tonen
        event.target.src = _IMAGES[current_player];
        // We switchen nu naar de volgende speler, namelijk speler 2
        current_player = 2;

        // We laten op het scherm zien welke speler nu aan de beurt is
        beurt_num.innerHTML = current_player;
        beurt_img.src = _IMAGES[current_player];
    } else {
        // NEE: Als speler 1 niet aan de beurt is dan is blijkbaar speler 2 aan de beurt

        // Ook nu checken we weer of de cel waarop geklikt is ook leeg is, zo niet dan doen we niks
        if(event.target.src.indexOf(_IMAGES[_PLAYER1]) >= 0 || event.target.src.indexOf(_IMAGES[_PLAYER2]) >= 0)
            return;

        // Cel is blijkbaar leeg en kan dus gevuld worden met de afbeelding van speler 2
        event.target.src = _IMAGES[current_player];
        // We switchen weer naar speler 1
        current_player = 1;

        // En we laten zien welke speler nu aan de beurt is.
        beurt_num.innerHTML = current_player;
        beurt_img.src = _IMAGES[current_player];
    }

    // Na iedere actie van een speler controleren we of er iemand gewonnen heeft
    // of dat we een gelijk spel hebben. Speler heeft dan namelijk geen zin meer
    switch(checkWinner()) {
        case _PLAYER1:
            // Speler 1 heeft gewonnen en dus speler 1 krijgt 2 punten
            score_speler1 += 2;
            score_speler1_info.innerHTML = score_speler1;
            button.click();         // We simuleren een click op de button om het spel te resetten
            dialog(_PLAYER1);
            break;

        case _PLAYER2:
            // Speler 2 heeft gewonnen en dus speler 2 krijgt 2 punten
            score_speler2 += 2;
            score_speler2_info.innerHTML = score_speler2;
            button.click();         // We simuleren een click op de button om het spel te resetten
            dialog(_PLAYER2);
            break;

        case _DRAW:
            // Gelijk spel, beide spelers krijgen een punt
            score_speler1 += 1;
            score_speler2 += 1;
            score_speler1_info.innerHTML = score_speler1;
            score_speler2_info.innerHTML = score_speler2;
            button.click();         // We simuleren een click op de button om het spel te resetten
            dialog(_DRAW);
            break;
    }
}

/**********************************************************************************
 * Functie:     isCelOccupiedBy
 * --------------------------------------------------------------------------------
 * @param       celnum      Nummer van de te controleren cel (0 t/m 8)
 * @param       playernum   Nummer van de speler
 * 
 * Dit is een helper functie die controleert of een cel bezet is door een bepaalde
 * speler.
 *********************************************************************************/
function isCelOccupiedBy(celnum, playernum) 
{
    if(celnum >= 0 && celnum <= 8 && (playernum == 1 || playernum == 2)) {
        return (cellen[celnum].src.indexOf(_IMAGES[playernum]) >= 0);
    }

    return false;
}

/*********************************************************************************
 * Functie:     checkWinner
 * -------------------------------------------------------------------------------
 * @returns     spelernummer of gelijkspel
 * 
 * Deze functie controleert of een van de twee spelers gewonnen heeft. Is dat niet
 * zo dan wordt gecontroleerd of er een gelijk spel is.
 * In deze gevallen is de ronde namelijk afgelopen.
 ********************************************************************************/
function checkWinner() 
{
    // We controleren eerst of speler 1 gewonnen heeft
    if( (isCelOccupiedBy(0,_PLAYER1) && isCelOccupiedBy(1, _PLAYER1) && isCelOccupiedBy(2, _PLAYER1)) ||        // Rij 1
        (isCelOccupiedBy(3,_PLAYER1) && isCelOccupiedBy(4, _PLAYER1) && isCelOccupiedBy(5, _PLAYER1)) ||        // Rij 2
        (isCelOccupiedBy(6,_PLAYER1) && isCelOccupiedBy(7, _PLAYER1) && isCelOccupiedBy(8, _PLAYER1)) ||        // Rij 3

        (isCelOccupiedBy(0,_PLAYER1) && isCelOccupiedBy(3, _PLAYER1) && isCelOccupiedBy(6, _PLAYER1)) ||        // Kolom 1
        (isCelOccupiedBy(1,_PLAYER1) && isCelOccupiedBy(4, _PLAYER1) && isCelOccupiedBy(7, _PLAYER1)) ||        // Kolom 2
        (isCelOccupiedBy(2,_PLAYER1) && isCelOccupiedBy(5, _PLAYER1) && isCelOccupiedBy(8, _PLAYER1)) ||        // Kolom 3

        (isCelOccupiedBy(0,_PLAYER1) && isCelOccupiedBy(4, _PLAYER1) && isCelOccupiedBy(8, _PLAYER1)) ||        // Diagonaal 1
        (isCelOccupiedBy(2,_PLAYER1) && isCelOccupiedBy(4, _PLAYER1) && isCelOccupiedBy(6, _PLAYER1)) ) {       // Diagonaal 2
        return _PLAYER1; // Hiermee vertellen we aan celclick dat speler 1 heeft gewonnen
    } else if( (isCelOccupiedBy(0,_PLAYER2) && isCelOccupiedBy(1, _PLAYER2) && isCelOccupiedBy(2, _PLAYER2)) || // Rij 1
        (isCelOccupiedBy(3,_PLAYER2) && isCelOccupiedBy(4, _PLAYER2) && isCelOccupiedBy(5, _PLAYER2)) ||        // Rij 2
        (isCelOccupiedBy(6,_PLAYER2) && isCelOccupiedBy(7, _PLAYER2) && isCelOccupiedBy(8, _PLAYER2)) ||        // Rij 3

        (isCelOccupiedBy(0,_PLAYER2) && isCelOccupiedBy(3, _PLAYER2) && isCelOccupiedBy(6, _PLAYER2)) ||        // Kolom 1
        (isCelOccupiedBy(1,_PLAYER2) && isCelOccupiedBy(4, _PLAYER2) && isCelOccupiedBy(7, _PLAYER2)) ||        // Kolom 2
        (isCelOccupiedBy(2,_PLAYER2) && isCelOccupiedBy(5, _PLAYER2) && isCelOccupiedBy(8, _PLAYER2)) ||        // Kolom 3

        (isCelOccupiedBy(0,_PLAYER2) && isCelOccupiedBy(4, _PLAYER2) && isCelOccupiedBy(8, _PLAYER2)) ||        // Diagonaal 1
        (isCelOccupiedBy(2,_PLAYER2) && isCelOccupiedBy(4, _PLAYER2) && isCelOccupiedBy(6, _PLAYER2)) ) {       // Diagonaal 2
        // Hiermee vertellen we aan celclick dat speler 2 heeft gewonnen
        return _PLAYER2;
    } else {
        /*
            Hier doen we iets als nog niemand heeft gewonnen
            Als er geen winnaar is kunnen we twee nieuwe situaties hebben:
            a)  Alle velden zijn al gevuld, dan hebben we een gelijk spel
            b)  Nog niet alle velden zijn gevuld, dan kan het spel gewoon doorgaan
         */
        if(countEmptyCells() == 0)      // We tellen het aantal lege cellen, als dit 0 is dan hebben we een gelijk spel
            return _DRAW;
        else
            return _CONTINUE_GAME;      // Nog niet alle cellen zijn bezet, dus kunnen we doorgaan met spelen
    }
}

/********************************************************************************
 * Functie:     countEmptyCells
 * ------------------------------------------------------------------------------
 * Helper function om in de checkWinner function te tellen of er nog
 * lege cellen zijn in het speelveld.
 *******************************************************************************/
function countEmptyCells() 
{
    var countedEmptyCells = 0;

    for(var celnum = 0; celnum < cellen.length; celnum++) {
        if(cellen[celnum].src.indexOf(_IMAGES[_EMPTY]) >= 0)
            countedEmptyCells++;
    }

    return countedEmptyCells;
}

/******************************************************************************
 * Functie:     dialog
 * ----------------------------------------------------------------------------
 * @param       state        > 0 is winnaar, 0 is gelijkspel
 * 
 * Functie die een dialoogvenster toont.
 * Dit venster wordt getoond wanneer er een winnaar is of er een gelijkspel is.
 *****************************************************************************/
function dialog(state)
{
    if(state === 0) {
        // Gelijkspel
        document.querySelector('.dialog > h2').innerHTML = 'Gelijkspel';
        document.querySelector('.dialog > h3').innerHTML = '';
        document.querySelector('.dialog > img').src = 'img/draw200x200.png';
    } else {
        document.querySelector('.dialog > h2').innerHTML = 'Winnaar';
        document.querySelector('.dialog > h3').innerHTML = 'Speler ' + state;
        document.querySelector('.dialog > img').src = _IMAGES[state];
    }
    document.querySelector('.dialog > button').addEventListener('click', dialogButtonClick);
    document.querySelector('.dialog-container').classList.remove('hide');
}

/*****************************************************************************
 * Functie:     dialogButtonClick
 * ---------------------------------------------------------------------------
 * Click event handler voor het dialoogvenster
 ****************************************************************************/
function dialogButtonClick(event)
{
    document.querySelector('.dialog > button').removeEventListener('click', dialogButtonClick);
    document.querySelector('.dialog-container').classList.add('hide');
}
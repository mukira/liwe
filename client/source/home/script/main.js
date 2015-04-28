/* global Konami, konamiCB, Vivus */
'use strict';

// Init Konami
var myKonami = new Konami(konamiCB);

// Start the SVG
var mordor;
mordor = new Vivus('g-easy-users', {duration: 80, type: 'oneByOne', selfDestroy: true});
mordor = new Vivus('g-easy-devs',  {duration: 80, type: 'oneByOne', selfDestroy: true});
mordor = new Vivus('g-contribute', {duration: 60, selfDestroy: true});
mordor = new Vivus('g-credits',    {type: 'scenario', selfDestroy: true});

// Google Analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-62259688-2', 'auto');
ga('send', 'pageview');
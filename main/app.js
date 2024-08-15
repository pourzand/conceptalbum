// const { HfInference } = require("@huggingface/inference");
// const { HuggingFaceInference } = require("@huggingface/inference");
// Ignore above for now
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
// run "npm install @langchain/google-genai"


const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const port = 8888;

// const client_id = 'ea4ceeed7ac442f0a692fae6b60e70d4'; // Your client id
// const client_secret = '69329331d2f847cc9e52216291bd1e76'; // Your secret
// mine
const client_id = '0dd435f3ccc940f4a8311a13c458b279'; // Your client id
const client_secret = '2f43b3f46b4f4966b2dacd067a58cffe'; // Your secret
const redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

let top_artists = {};
const top_artist_names = new Set();
const num_pairs = 5;
const num_artists = 50;
let access_token = '';

var leastPopularArtistId1 = '';
var leastPopularity1 = Infinity;
var leastPopularArtistId2 = '';
var leastPopularity2 = Infinity;

const MAX_CACHE_SIZE = 500;
var similarArtistsCache = new Map();
var songCache = new Map();

const apiCallCounter = {
  total: 0,
  similarArtists: 0,
  getAlbums: 0,
  getSongs: 0,
  getTopArtists: 0,
};


var sample_data = [
  {
    "pair": [
      "AG Club",
      "Jean Dawson"
    ],
    "genres": [
      "indie hip hop"
    ],
    "AG Club": [
      "eva",
      "Barry",
      "CAJH DAY*",
      "ROWDYRUFFBOYZ",
      "KUROSAWA",
      "BRO DIE",
      "that's right daddy",
      "4 THE BRODIES",
      "The Iron Giant",
      "Sabine",
      "Adam Sandler",
      "Kevin",
      "Caterpillars Are Just Hungry",
      "Mr. Nobody",
      "Long Division",
      "Tattoo",
      "Don't Ask, Don't Tell",
      "Mr. Put It On",
      "Bodega Bandit",
      "TRU RELIGION",
      "Impostor Syndrome",
      "MARY",
      "Candice",
      "HAIRCUT",
      "WAR CRIMES",
      "I KNOW",
      "Youtube2MP3",
      "NBA Youngboy",
      "Youngboy Interlude",
      "ALTA BATES",
      "QUESO",
      "GUAYAKI",
      "Memphis, Pt. 2",
      "JABBAR'S HOUSE",
      "Ugudbru",
      "A Bitch Curious",
      "A MSG FROM MGMT...",
      "Truth",
      "ZANE LOWE ALIEN ABDUCTION",
      "COLUMBIA",
      "Noho",
      "HOT PINK",
      "Dusk/ Dawn",
      "Memphis",
      "Snæks",
      "BabyBoy's Interlude",
      "Hngover",
      "Preach",
      "Paprika",
      "Fight!!!",
      "Last Year",
      "ROOM IS ON FIRE - SPED UP",
      "ROOM IS ON FIRE",
      "How To Cry",
      "talk 2 em",
      "aorta",
      "flippin shit",
      "Popeye",
      "Memphis, P2. 2",
      "Holy Shit",
      "Brass",
      "Ache",
      "You",
      "Ay, G",
      "Mach5",
      "Take Me Back",
      "Typuuu",
      "In My Mind",
      "Cereal",
      "Midnight",
      "Scam Likely",
      "Moncler",
      "Fatboy",
      "Honey",
      "Ode to Soulja Girl"
    ],
    "Jean Dawson": [
      "*",
      "THREE HEADS*",
      "GLORY*",
      "KIDS EAT PILLS*",
      "POSITIVE ONE NEGATIVE ONE*",
      "BAD FRUIT*",
      "0-HEROES*",
      "SCREW FACE*",
      "PORN ACTING*",
      "BLACK MICHAEL JACKSON*",
      "HUH*",
      "SICK OF IT*",
      "PIRATE RADIO*",
      "Devilish",
      "Triple Double",
      "Shiner",
      "Dummy",
      "Bruiseboy",
      "Pegasus",
      "Poster Child",
      "06 Burst",
      "Starface*",
      "Policia",
      "Clear Bones",
      "Power Freaks",
      "Pyrotechnics",
      "Flirting*",
      "Napster",
      "Ssick Girl Online",
      "Blame by Me",
      "90's Green Screen",
      "Zero%",
      "Pity Party",
      "Mala Mariposa",
      "Bull Fighter",
      "Antiwarp",
      "Swamp",
      "fIT chECK fREEsTYle",
      "New Age Crisis",
      "Divino Desmadre",
      "Taste Like Metal",
      "NO SZNS",
      "NO SCOPE",
      "X-RAY",
      "VEXED",
      "PORN ACTING*[FLIP] - Spotify Singles",
      "Window Shopper - Spotify Singles",
      "youth+",
      "delusional world champion",
      "MENTHOL*",
      "GHOST*",
      "Ooga Booga",
      "Blame By Me",
      "Glacier Gallery",
      "NOSEDIVE",
      "Late Night Lovin'",
      "CHOICE COWBOY",
      "Burn My Tongue"
    ]
  },
  {
    "pair": [
      "Alex G",
      "Car Seat Headrest"
    ],
    "genres": [
      "pov: indie",
      "slacker rock"
    ],
    "Alex G": [
      "Opening Theme from The Pink Opaque",
      "Election Night",
      "High School Hallway",
      "Ice Cream Transformation",
      "Suburban Drift",
      "Marco Polo",
      "Love Theme from The Pink Opaque",
      "Saturday Night in Maddy’s Basement",
      "Blue Glow",
      "TV Burn",
      "Downed Power Line",
      "The Double Lunch",
      "The Final Episode",
      "Buried Alive",
      "Planetarium",
      "No One Will Find Us There",
      "Money Machine",
      "Box Cutter",
      "The Fun Center",
      "After All",
      "Runner",
      "Mission",
      "S.D.O.S",
      "No Bitterness",
      "Ain't It Easy",
      "Cross the Sea",
      "Blessing",
      "Early Morning Waiting",
      "Immunity",
      "Headroom Piano",
      "Miracles",
      "Forgive",
      "Main Theme - from \"We're All Going to the World's Fair\" Soundtrack",
      "Stitch",
      "Casey's Walk",
      "You Are In Trouble",
      "JLB's Drawing",
      "You Can't Stop Me",
      "Typing Game",
      "Inside the Video",
      "Face Dream",
      "Morning",
      "JLB's Story",
      "End Song - from \"We're All Going to the World's Fair\" Soundtrack",
      "Walk Away",
      "Hope",
      "Southern Sky",
      "Gretel",
      "Taking",
      "Near",
      "Project 2",
      "Bad Man",
      "Sugar",
      "In My Arms",
      "Cow",
      "Crime",
      "SugarHouse - Live",
      "Poison Root",
      "Proud",
      "County",
      "Bobby",
      "Witch",
      "Horse",
      "Brick",
      "Sportstar",
      "Judge",
      "Rocket",
      "Powerful Man",
      "Alina",
      "Big Fish",
      "Guilty",
      "Intro",
      "Bug",
      "Thorns",
      "Kicker",
      "Salt",
      "Look Out",
      "Brite Boy",
      "In Love",
      "Walk",
      "Mud",
      "Ready",
      "Station",
      "Snot",
      "After Ur Gone",
      "Serpent Is Lord",
      "Harvey",
      "Rejoyce",
      "Black Hair",
      "Skipper",
      "Axesteel",
      "Sorry",
      "Promise",
      "Icehead",
      "Hollow",
      "Tripper",
      "Boy",
      "Soaker",
      "Waiting for You",
      "Memory",
      "Forever",
      "Animals",
      "String",
      "Advice",
      "People",
      "Whale",
      "Trick",
      "Kute",
      "So",
      "Mary",
      "Change",
      "Clouds",
      "Adam",
      "Sarah",
      "16 Mirrors",
      "Water",
      "Come Back",
      "Fighting",
      "Wicked Boy",
      "Candy",
      "Mis",
      "Master",
      "New",
      "Know Now",
      "Rules",
      "Message",
      "Sandy - Bonus Track",
      "Good - Bonus Track",
      "Remember",
      "The Same",
      "TV",
      "Gnaw",
      "Trash",
      "House",
      "Crab",
      "Go Away",
      "Let It Go",
      "Things to Do",
      "Time/Space",
      "Cross Country",
      "Race",
      "Sportstar - Porches Remix",
      "Treehouse",
      "Cards",
      "Sum Secret",
      "Babylon",
      "Too Long Here",
      "Waiting For You"
    ],
    "Car Seat Headrest": [
      "Crows - Live at Brooklyn Steel",
      "Weightlifters - Live at Brooklyn Steel",
      "Fill In The Blank - Live at Brooklyn Steel",
      "Hymn - Live at Brooklyn Steel",
      "Hollywood - Live at Brooklyn Steel",
      "Bodys - Live at Brooklyn Steel",
      "Something Soon - Live at Brooklyn Steel",
      "1937 State Park - Live at Brooklyn Steel",
      "Sober to Death - Live at Brooklyn Steel",
      "Drunk Drivers/Killer Whales - Live at Brooklyn Steel",
      "It's My Child- Live at Brooklyn Steel",
      "Beach Life-In-Death - Live at Brooklyn Steel",
      "Deadlines - Live at Brooklyn Steel",
      "Weightlifters",
      "Can't Cool Me Down",
      "Deadlines",
      "Hollywood",
      "Hymn - Remix",
      "Martin",
      "What's With You Lately",
      "Life Worth Missing",
      "There Must Be More Than Blood",
      "Famous",
      "Cosmic Hero - Live at the Tramshed, Cardiff, Wales",
      "Fill In The Blank - Live at the Newport Music Hall, Columbus, OH",
      "Drugs With Friends - Live at La Lune des Pirates, Amiens, France",
      "Bodys - Live at La Lune des Pirates, Amiens, France",
      "Cute Thing - Live at O2 Forum Kentish Town, London, England",
      "Drunk Drivers/Killer Whales - Live at O2 Forum Kentish Town, London, England",
      "Destroyed By Hippie Powers - Live at the Crystal Ballroom, Portland, OR",
      "Ivy - Live at the Capitol Theater, Olympia, WA",
      "Beach Life-In-Death - Live at Crossroads KC, Kansas City, MO",
      "My Boy - Twin Fantasy",
      "Beach Life-In-Death",
      "Stop Smoking",
      "Sober to Death",
      "Nervous Young Inhumans",
      "Bodys",
      "Cute Thing",
      "High to Death",
      "Famous Prophets",
      "Twin Fantasy",
      "Fill In The Blank",
      "Vincent",
      "Destroyed By Hippie Powers",
      "Drugs With Friends",
      "Not What I Needed",
      "Drunk Drivers/Killer Whales",
      "1937 State Park",
      "Unforgiving Girl",
      "Cosmic Hero",
      "The Ballad of the Costa Concordia",
      "Connect the Dots",
      "Joe Goes to School",
      "Sunburned Shirts",
      "The Drum",
      "Something Soon",
      "No Passion",
      "Times to Die",
      "psst, teenagers, take off your clo",
      "Strangers",
      "Maud Gone",
      "Los Barrachos",
      "Bad Role Models, Old Idols Exhumed",
      "Oh! Starving",
      "The Ending of Dramamine",
      "Beast Monster Thing",
      "Kimochi Warui",
      "I-94 W",
      "You're in Love with Me",
      "America",
      "I Want You to Know That I'm Awake/i Hope That You're Asleep",
      "Is This Dust Really from the Titanic?",
      "Hey, Space Cadet",
      "Romantic Theory",
      "Misheard Lyrics",
      "Times To Die",
      "Overexposed",
      "Los Borrachos",
      "Souls",
      "Sleeping With Strangers",
      "Anchorite",
      "Boxing Day",
      "We Can't Afford",
      "Don't Remind Me",
      "Homes",
      "Afterglow",
      "Jerks",
      "Broken Birds",
      "The Gun Song - No Trigger Version",
      "Goodbye Love",
      "I Can Play the Piano",
      "Crows - Rest in Bigger Pieces Mix",
      "I Wanna Sweat",
      "Burning Man",
      "Dreams Fall Hard",
      "Plane Crash Blues",
      "Big Jacket",
      "Death at the Movies",
      "Jus' Tired",
      "Some Strange Angel",
      "Knife in the Coffee",
      "the drum",
      "happy news for sadness",
      "sunburned shirts",
      "stoop kid",
      "something soon",
      "no passion",
      "father, flesh in rags",
      "strangers",
      "lawns",
      "p.o.w.",
      "open-mouthed boy",
      "We Looked Like Giants",
      "Martin - Superorganism Remix",
      "Martin - 1 Trait Danger Remix",
      "Weightlifters - Scuba Remix",
      "Deadlines - yeule Remix",
      "Life Worth Missing - Dntel Remix",
      "Golden Years",
      "Substitute",
      "March of the Pigs",
      "Running Up That Hill",
      "Hollywood - Alternate Acoustic",
      "Hollywood - Radio Version",
      "Nervous Young Inhumans - Single Edit",
      "War Is Coming",
      "Unforgiving Girl- Single Version",
      "Drunk Drivers/Killer Whales - Single Version",
      "Intro - Live from Spotify House SXSW '16",
      "The Ending of Dramamine - Live from Spotify House SXSW '16",
      "Instrumental Reprise - Live from Spotify House SXSW '16",
      "Times to Die - Live from Spotify House SXSW '16",
      "Vincent - Live from Spotify House SXSW '16",
      "America - Live from Spotify House SXSW '16",
      "It's Only Sex",
      "Reuse The Cels",
      "I Hate Living",
      "Devil Moon",
      "Culture"
    ]
  },
  {
    "pair": [
      "Travis Scott",
      "Future"
    ],
    "genres": [
      "rap"
    ],
    "Travis Scott": [
      "HYAENA",
      "THANK GOD",
      "MODERN JAM",
      "MY EYES",
      "GOD'S COUNTRY",
      "SIRENS",
      "MELTDOWN",
      "FE!N",
      "DELRESTO",
      "I KNOW ?",
      "TOPIA TWINS",
      "CIRCUS MAXIMUS",
      "PARASAIL",
      "SKITZO",
      "LOST FOREVER",
      "LOOOVE",
      "K-POP",
      "TELEKINESIS",
      "TIL FURTHER NOTICE",
      "HIGHEST IN THE ROOM- REMIX",
      "OUT WEST",
      "WHAT TO DO?",
      "GATTI",
      "STARGAZING",
      "CAROUSEL",
      "SICKO MODE",
      "R.I.P. SCREW",
      "STOP TRYING TO BE GOD",
      "NO BYSTANDERS",
      "SKELETONS",
      "WAKE UP",
      "5% TINT",
      "NC-17",
      "ASTROTHUNDER",
      "YOSEMITE",
      "CAN'T SAY",
      "WHO? WHAT!",
      "BUTTERFLY EFFECT",
      "HOUSTONFORNICATION",
      "COFFEE BEAN",
      "Modern Slavery",
      "Black & Chinese",
      "Eye 2 Eye",
      "Motorcycle Patches",
      "Huncho Jack",
      "Saint",
      "Go",
      "Dubai Shit",
      "Saint Laurent Mask",
      "Moon Rock",
      "How U Feel",
      "Where U From",
      "Best Man",
      "the ends",
      "way back",
      "coordinate",
      "through the late night",
      "beibs in the trap",
      "sdp interlude",
      "sweet sweet",
      "outside",
      "goosebumps",
      "first take",
      "pick up the phone",
      "lose",
      "guidance",
      "wonderful",
      "Pornography",
      "Oh My Dis Side",
      "3500",
      "Wasted",
      "90210",
      "Pray 4 Love",
      "Nightcrawler",
      "Piss On Your Grave",
      "Antidote",
      "Impossible",
      "Maria I'm Drunk",
      "Flying High",
      "I Can Tell",
      "Apple Pie",
      "Ok Alright",
      "Never Catch Me",
      "Active",
      "Parking Lot",
      "FE!N - CHASE B REMIX",
      "née-nah",
      "Water - Remix",
      "MELTDOWN- Instrumental",
      "K-POP - Chopped & Screwed",
      "K-POP - Instrumental",
      "K-POP - Sped Up",
      "Ring Ring",
      "Ring Ring- Extended Version",
      "Embarrassed",
      "KRZY TRAIN",
      "Down In Atlanta",
      "Hold That Heat",
      "ESCAPE PLAN",
      "MAFIA",
      "Flocky Flocky",
      "durag activity",
      "Goosebumps - Remix",
      "FRANCHISE- REMIX",
      "FRANCHISE",
      "The Plan - From the Motion Picture \"TENET\"",
      "Wash Us In The Blood",
      "TKN",
      "THE SCOTTS",
      "Antisocial- MK Remix",
      "Hot[feat. Gunna and Travis Scott]",
      "HIGHEST IN THE ROOM",
      "Antisocial",
      "The London",
      "SICKO MODE - Skrillex Remix",
      "Watch",
      "Dark Knight Dummo",
      "Know No Better",
      "Fish N Grits",
      "Go Off",
      "Whole Lotta Lovin' - With You Remix",
      "Whole Lotta Lovin' - Grandtheft Remix",
      "Whole Lotta Lovin' - Grandtheft Radio Edit Remix",
      "Whole Lotta Lovin' - LeMarquis Remix",
      "Whole Lotta Lovin' - Le Boeuf Remix",
      "Whole Lotta Lovin' - Djemba Djemba Remix"
    ],
    "Future": [
      "We Still Don't Trust You",
      "Drink N Dance",
      "Out Of My Hands",
      "Jealous",
      "This Sunday",
      "Luv Bad Bitches",
      "Amazing",
      "All to Myself",
      "Nights Like This",
      "Came to the Party",
      "Right 4 You",
      "Mile High Memories",
      "Overload",
      "Gracious",
      "Beat It",
      "Always Be My Fault",
      "One Big Family",
      "Red Leather",
      "#1",
      "Nobody Knows My Struggle",
      "All My Life",
      "Crossed Out",
      "Crazy Clientele",
      "Show of Hands",
      "Streets Made Me A King",
      "We Don't Trust You",
      "Young Metro",
      "Ice Attack",
      "Type Shit",
      "Claustrophobic",
      "Like That",
      "Slimed In",
      "Magic Don Juan",
      "Cinderella",
      "Runnin Outta Time",
      "Fried",
      "Ain't No Love",
      "Everyday Hustle",
      "GTA",
      "Seen it All",
      "WTFYM",
      "Where My Twin @ - Bonus",
      "Annihilate - Spider-Man: Across the Spider-Verse",
      "Am I Dreaming",
      "All The Way Live - Spider-Man: Across the Spider-Verse",
      "Hummingbird",
      "Calling - Spider-Man: Across the Spider-Verse",
      "Link Up - Spider-Verse Remix",
      "Self Love - Spider-Man: Across the Spider-Verse",
      "Home",
      "Nonviolent Communication",
      "Nas Morales",
      "Annihilate - Spider-Man: Across the Spider-Verse - Instrumental",
      "Am I Dreaming - Instrumental",
      "All The Way Live - Spider-Man: Across the Spider-Verse - Instrumental",
      "Hummingbird - Instrumental",
      "Calling - Spider-Man: Across the Spider-Verse - Instrumental",
      "Self Love - Spider-Man: Across the Spider-Verse - Instrumental",
      "Home - Instrumental",
      "Nonviolent Communication - Instrumental",
      "Nas Morales - Instrumental",
      "Annihilate",
      "All The Way Live",
      "Calling",
      "Link Up- Spider-Verse Remix",
      "Self Love",
      "On Time- ChoppedNotSlopped",
      "Superhero[with Future & Chris Brown] - ChoppedNotSlopped",
      "Raindrops[with Travis Scott] - ChoppedNotSlopped",
      "Umbrella- ChoppedNotSlopped",
      "All The Money- Bonus - ChoppedNotSlopped",
      "Around Me- ChoppedNotSlopped",
      "Metro Spider- ChoppedNotSlopped",
      "I Can't Save You[with Future & feat. Don Toliver] - ChoppedNotSlopped",
      "Walk Em Down[with 21 Savage & feat. Mustafa] - ChoppedNotSlopped",
      "Too Many Nights- ChoppedNotSlopped",
      "Trance- ChoppedNotSlopped",
      "Feel The Fiyaaaah- ChoppedNotSlopped",
      "Niagara Falls[with Travis Scott & 21 Savage] - ChoppedNotSlopped",
      "Lock On Me- ChoppedNotSlopped",
      "Creepin'- ChoppedNotSlopped",
      "On Time",
      "Superhero[with Future & Chris Brown]",
      "Too Many Nights",
      "Raindrops[with Travis Scott]",
      "Umbrella",
      "Trance",
      "Around Me",
      "Metro Spider",
      "I Can't Save You[with Future & feat. Don Toliver]",
      "Creepin'",
      "Niagara Falls[with Travis Scott & 21 Savage]",
      "Walk Em Down[with 21 Savage & feat. Mustafa]",
      "Lock On Me",
      "Feel The Fiyaaaah",
      "All The Money[Bonus]",
      "On Time - Instrumental",
      "Superhero- Instrumental",
      "Too Many Nights - Instrumental",
      "Raindrops- Instrumental",
      "Umbrella - Instrumental",
      "Trance - Instrumental",
      "Around Me - Instrumental",
      "Metro Spider - Instrumental",
      "I Can't Save You- Instrumental",
      "Creepin' - Instrumental",
      "Niagara Falls- Instrumental",
      "Walk Em Down- Instrumental",
      "Lock On Me - Instrumental",
      "Feel The Fiyaaaah - Instrumental",
      "All The Money - Instrumental - Bonus",
      "Purple Savage Mode II Intro [ChopNotSlop Remix]",
      "Many Men [ChopNotSlop Remix]",
      "Runnin [ChopNotSlop Remix]",
      "My Dawg [ChopNotSlop Remix]",
      "Snitches & Rats [ChopNotSlop Remix]",
      "Glock In My Lap [ChopNotSlop Remix]",
      "Slidin [ChopNotSlop Remix]",
      "Brand New Draco [ChopNotSlop Remix]",
      "No Opp Left Behind [ChopNotSlop Remix]",
      "Steppin On Niggas [ChopNotSlop Remix]",
      "Mr. Right Now [ChopNotSlop Remix]",
      "Rich Nigga Shit [ChopNotSlop Remix]",
      "RIP Luv [ChopNotSlop Remix]",
      "Said N Done [ChopNotSlop Remix]",
      "Intro",
      "Runnin",
      "Glock In My Lap",
      "Mr. Right Now",
      "Rich Nigga Shit",
      "Slidin",
      "Many Men",
      "Snitches & Rats",
      "My Dawg",
      "Steppin On Niggas",
      "Brand New Draco",
      "No Opp Left Behind",
      "RIP Luv",
      "Said N Done",
      "10AM/Save The World",
      "Overdue",
      "Don't Come Out The House",
      "Dreamcatcher",
      "Space Cadet",
      "10 Freaky Girls",
      "Up To Something",
      "Only 1",
      "Lesbian",
      "Borrowed Love",
      "Only You",
      "No More",
      "No Complaints",
      "10AM/Save The World - Instrumental",
      "Overdue - Instrumental",
      "Don't Come Out The House - Instrumental",
      "Dreamcatcher - Instrumental",
      "Space Cadet - Instrumental",
      "10 Freaky Girls - Instrumental",
      "Up To Something - Instrumental",
      "Only 1- Instrumental",
      "Lesbian - Instrumental",
      "Borrowed Love - Instrumental",
      "Only You - Instrumental",
      "No More - Instrumental",
      "Go Legend",
      "Big Bidness",
      "Who's Stopping Me",
      "Pull Up N Wreck",
      "So Good",
      "Savage Time",
      "Even The Odds",
      "In Tune",
      "Reason",
      "No Hearts, No Love",
      "Ghostface Killers",
      "Rap Saved Me",
      "Ric Flair Drip",
      "My Choppa Hate Niggas",
      "Nightmare",
      "Mad Stalkers",
      "Disrespectful",
      "Run Up the Racks",
      "Still Serving",
      "Darth Vader",
      "Perfect Timing",
      "I Don't Care",
      "Hit",
      "A$AP Ferg",
      "Held Me Down",
      "Minute",
      "Did You See NAV?",
      "Bring It Back",
      "Both Sides",
      "Call Me",
      "You Know",
      "Rich",
      "Need Some",
      "I Am",
      "NAVUZIMETRO#PT2",
      "No Advance",
      "No Heart",
      "X",
      "Savage Mode",
      "Bad Guy",
      "Real Nigga",
      "Mad High",
      "Feel It",
      "Ocean Drive",
      "Future Speaks",
      "All I Need",
      "Disloyal",
      "You a Drug",
      "Metro Boomin Interlude",
      "Some More",
      "Mink on the Floor",
      "Mo",
      "Fresh for the Love",
      "April Fools",
      "Up and Down",
      "No Sleep",
      "Can't See 'Em",
      "Serious",
      "Fuck the Rap Game",
      "Money Do",
      "Chanel Vintage",
      "pop ur shit",
      "née-nah",
      "just like me",
      "dangerous",
      "Creepin'- Remix",
      "Blue Pill",
      "PURPLE RAIN",
      "Car Sick",
      "John Wayne",
      "pop ur shit - slowed down",
      "dangerous - slowed down",
      "née-nah - slowed down",
      "just like me - slowed down",
      "Mile High",
      "Tell Them",
      "All For Me",
      "pop ur shit - nightcore version",
      "dangerous - nightcore version",
      "née-nah - nightcore version",
      "just like me - nightcore version",
      "pop ur shit - sped up",
      "dangerous - sped up",
      "née-nah - sped up",
      "just like me - sped up",
      "Go Viral"
    ]
  },
  {
    "pair": [
      "Kanye West",
      "Kendrick Lamar"
    ],
    "genres": [
      "hip hop",
      "rap"
    ],
    "Kanye West": [
      "SLIDE",
      "TIME MOVING SLOW",
      "FIELD TRIP",
      "FRIED",
      "ISABELLA",
      "PROMOTION",
      "HUSBAND",
      "LIFESTYLE",
      "FOREVER",
      "BOMB",
      "RIVER",
      "530",
      "DEAD",
      "FOREVER ROLLING",
      "SKY CITY",
      "MY SOUL",
      "STARS",
      "KEYS TO MY LIFE",
      "PAID",
      "TALKING",
      "BACK TO ME",
      "HOODRAT",
      "DO IT",
      "PAPERWORK",
      "BURN",
      "FUK SUMN",
      "VULTURES",
      "CARNIVAL",
      "BEG FORGIVENESS",
      "PROBLEMATIC",
      "KING",
      "Donda Chant",
      "Hurricane",
      "Moon",
      "Life Of The Party",
      "Off The Grid",
      "Jail",
      "Praise God",
      "Come to Life",
      "Believe What I Say",
      "No Child Left Behind",
      "Up From The Ashes",
      "Remote Control pt 2",
      "God Breathed",
      "Lord I Need You",
      "24",
      "Junya",
      "Never Abandon Your Family",
      "Donda",
      "Keep My Spirit Alive",
      "Jesus Lord pt 2",
      "Heaven and Hell",
      "Remote Control",
      "Tell The Vision",
      "Jonah",
      "Pure Souls",
      "Ok Ok",
      "New Again",
      "Jesus Lord",
      "Ok Ok pt 2",
      "Junya pt 2",
      "Jail pt 2",
      "Keep My Spirit Alive pt 2",
      "Every Hour",
      "Selah",
      "Follow God",
      "Closed On Sunday",
      "On God",
      "Everything We Need",
      "Water",
      "God Is",
      "Hands On",
      "Use This Gospel",
      "Jesus Is Lord",
      "I Thought About Killing You",
      "Yikes",
      "All Mine",
      "Wouldn't Leave",
      "No Mistakes",
      "Ghost Town",
      "Violent Crimes",
      "Ultralight Beam",
      "Father Stretch My Hands Pt. 1",
      "Pt. 2",
      "Famous",
      "Feedback",
      "Low Lights",
      "Highlights",
      "Freestyle 4",
      "I Love Kanye",
      "Waves",
      "FML",
      "Real Friends",
      "Wolves",
      "Frank's Track",
      "Siiiiiiiiilver Surffffeeeeer Intermission",
      "30 Hours",
      "No More Parties In LA",
      "Facts",
      "Fade",
      "Saint Pablo",
      "On Sight",
      "Black Skinhead",
      "I Am A God",
      "New Slaves",
      "Hold My Liquor",
      "I'm In It",
      "Blood On The Leaves",
      "Guilt Trip",
      "Send It Up",
      "Bound 2",
      "No Church In The Wild",
      "Lift Off",
      "Ni**as In Paris",
      "Otis",
      "Gotta Have It",
      "New Day",
      "That's My Bitch",
      "Welcome To The Jungle",
      "Who Gon Stop Me",
      "Murder To Excellence",
      "Made In America",
      "Why I Love You",
      "Illest Motherf***** Alive",
      "H•A•M",
      "Primetime",
      "The Joy",
      "Dark Fantasy",
      "Gorgeous",
      "POWER",
      "All Of The Lights",
      "Monster",
      "So Appalled",
      "Devil In A New Dress",
      "Runaway",
      "Hell Of A Life",
      "Blame Game",
      "Lost In The World",
      "Who Will Survive In America",
      "Say You Will",
      "Welcome To Heartbreak",
      "Heartless",
      "Amazing",
      "Love Lockdown",
      "Paranoid",
      "RoboCop",
      "Street Lights",
      "Bad News",
      "See You In My Nightmares",
      "Coldest Winter",
      "Pinocchio Story",
      "Good Morning",
      "Champion",
      "Stronger",
      "I Wonder",
      "Good Life",
      "Can't Tell Me Nothing",
      "Barry Bonds",
      "Drunk and Hot Girls",
      "Flashing Lights",
      "Everything I Am",
      "The Glory",
      "Homecoming",
      "Big Brother",
      "Good Night",
      "Wake Up Mr. West",
      "Heard 'Em Say",
      "Touch The Sky",
      "Gold Digger",
      "Skit #1",
      "Drive Slow",
      "My Way Home",
      "Crack Music",
      "Roses",
      "Bring Me Down",
      "Addiction",
      "Skit #2",
      "Diamonds From Sierra Leone - Remix",
      "We Major",
      "Skit #3",
      "Hey Mama",
      "Celebration",
      "Skit #4",
      "Gone",
      "Diamonds From Sierra Leone - Bonus Track",
      "Late",
      "Intro",
      "We Don't Care",
      "Graduation Day",
      "All Falls Down",
      "I'll Fly Away",
      "Spaceship",
      "Jesus Walks",
      "Never Let Me Down",
      "Get Em High",
      "Workout Plan",
      "The New Workout Plan",
      "Slow Jamz",
      "Breathe In Breathe Out",
      "School Spirit Skit 1",
      "School Spirit",
      "School Spirit Skit 2",
      "Lil Jimmy Skit",
      "Two Words",
      "Through The Wire",
      "Family Business",
      "Last Call",
      "No Apologies",
      "Gimme A Second 2",
      "No Face",
      "CARNIVAL - HOOLIGANS VERSION",
      "CARNIVAL - INSTRUMENTAL",
      "CARNIVAL- ACAPELLA",
      "VULTURES - Havoc Version",
      "Where They At",
      "Stand United",
      "Hot Shit",
      "Hot Shit- Instrumental",
      "Eazy",
      "True Love",
      "City of Gods",
      "Wash Us In The Blood",
      "I Love It",
      "XTCY",
      "Lift Yourself",
      "Ye vs. the People",
      "All Day",
      "FourFiveSeconds",
      "Only One",
      "New God Flow",
      "Mercy",
      "Cold",
      "Christmas In Harlem",
      "Stronger - A-Trak Remix",
      "Stronger - Andrew Dawson Remix"
    ],
    "Kendrick Lamar": [
      "United In Grief",
      "N95",
      "Worldwide Steppers",
      "Die Hard",
      "Father Time",
      "Rich - Interlude",
      "Rich Spirit",
      "We Cry Together",
      "Purple Hearts",
      "Count Me Out",
      "Crown",
      "Silent Hill",
      "Savior - Interlude",
      "Savior",
      "Auntie Diaries",
      "Mr. Morale",
      "Mother I Sober",
      "Mirror",
      "The Heart Part 5",
      "Black Panther",
      "All The Stars",
      "King's Dead",
      "Big Shot",
      "Pray For Me",
      "DUCKWORTH.",
      "GOD.",
      "FEAR.",
      "XXX. FEAT. U2.",
      "LOVE. FEAT. ZACARI.",
      "LUST.",
      "HUMBLE.",
      "PRIDE.",
      "LOYALTY. FEAT. RIHANNA.",
      "FEEL.",
      "ELEMENT.",
      "YAH.",
      "DNA.",
      "BLOOD.",
      "untitled 01 | 08.19.2014.",
      "untitled 02 | 06.23.2014.",
      "untitled 03 | 05.28.2013.",
      "untitled 04 | 08.14.2014.",
      "untitled 05 | 09.21.2014.",
      "untitled 06 | 06.30.2014.",
      "untitled 07 | 2014 - 2016",
      "untitled 08 | 09.06.2014.",
      "Wesley's Theory",
      "For Free? - Interlude",
      "King Kunta",
      "Institutionalized",
      "These Walls",
      "u",
      "Alright",
      "For Sale? - Interlude",
      "Momma",
      "Hood Politics",
      "How Much A Dollar Cost",
      "Complexion",
      "The Blacker The Berry",
      "You Ain't Gotta Lie",
      "i",
      "Mortal Man",
      "Sherane a.k.a Master Splinter’s Daughter",
      "Bitch, Don’t Kill My Vibe",
      "Backseat Freestyle",
      "The Art of Peer Pressure",
      "Money Trees",
      "Poetic Justice",
      "good kid",
      "m.A.A.d city",
      "Swimming Pools- Extended Version",
      "Sing About Me, I'm Dying Of Thirst",
      "Real",
      "Compton",
      "The Recipe - Bonus Track",
      "Black Boy Fly - Bonus Track",
      "Now Or Never - Bonus Track",
      "The Recipe- Bonus Track",
      "Bitch, Don’t Kill My Vibe - Remix",
      "F*ck Your Ethnicity",
      "Hol' Up",
      "A.D.H.D",
      "No Make-Up",
      "Tammy's Song",
      "Chapter Six",
      "Ronald Reagan Era",
      "Poe Mans Dreams",
      "Chapter Ten",
      "Keisha's Song",
      "Rigamortus",
      "Kush & Corinthians",
      "Blow My High",
      "Ab-Souls Outro",
      "HiiiPower",
      "Growing Apart",
      "Ignorance Is Bliss",
      "P&P 1.5",
      "Alien Girl",
      "Opposites Attract",
      "Michael Jordan",
      "R.O.T.C",
      "Barbed Wire",
      "Average Joe",
      "H.O.C",
      "Cut You Off",
      "She Needs Me",
      "Not Like Us",
      "meet the grahams",
      "euphoria",
      "The Hillbillies",
      "family ties",
      "The Mantra - From \"Creed II: The Album\"",
      "HUMBLE. - SKRILLEX REMIX",
      "untitled 07 | levitate",
      "Swimming Pools- Black Hippy Remix",
      "County Building Blues",
      "Two Presidents",
      "Swimming Pools",
      "Push Thru",
      "Push Thru - Instrumental",
      "My People",
      "She Needs Me [Remix]",
      "Like That",
      "Sidewalks",
      "Doves In The Wind",
      "F**kin' Problems",
      "1Train",
      "Bad Blood",
      "The Greatest",
      "Mask Off- Remix",
      "Forbidden Fruit",
      "God Is Fair, Sexy Nasty",
      "Stay Ready",
      "Autumn Leaves",
      "Collard Greens",
      "Freedom",
      "Hair Down",
      "Mona Lisa"
    ]
  },
  {
    "pair": [
      "Travis Scott",
      "Playboi Carti"
    ],
    "genres": [
      "rap"
    ],
    "Travis Scott": [
      "HYAENA",
      "THANK GOD",
      "MODERN JAM",
      "MY EYES",
      "GOD'S COUNTRY",
      "SIRENS",
      "MELTDOWN",
      "FE!N",
      "DELRESTO",
      "I KNOW ?",
      "TOPIA TWINS",
      "CIRCUS MAXIMUS",
      "PARASAIL",
      "SKITZO",
      "LOST FOREVER",
      "LOOOVE",
      "K-POP",
      "TELEKINESIS",
      "TIL FURTHER NOTICE",
      "HIGHEST IN THE ROOM- REMIX",
      "OUT WEST",
      "WHAT TO DO?",
      "GATTI",
      "STARGAZING",
      "CAROUSEL",
      "SICKO MODE",
      "R.I.P. SCREW",
      "STOP TRYING TO BE GOD",
      "NO BYSTANDERS",
      "SKELETONS",
      "WAKE UP",
      "5% TINT",
      "NC-17",
      "ASTROTHUNDER",
      "YOSEMITE",
      "CAN'T SAY",
      "WHO? WHAT!",
      "BUTTERFLY EFFECT",
      "HOUSTONFORNICATION",
      "COFFEE BEAN",
      "Modern Slavery",
      "Black & Chinese",
      "Eye 2 Eye",
      "Motorcycle Patches",
      "Huncho Jack",
      "Saint",
      "Go",
      "Dubai Shit",
      "Saint Laurent Mask",
      "Moon Rock",
      "How U Feel",
      "Where U From",
      "Best Man",
      "the ends",
      "way back",
      "coordinate",
      "through the late night",
      "beibs in the trap",
      "sdp interlude",
      "sweet sweet",
      "outside",
      "goosebumps",
      "first take",
      "pick up the phone",
      "lose",
      "guidance",
      "wonderful",
      "Pornography",
      "Oh My Dis Side",
      "3500",
      "Wasted",
      "90210",
      "Pray 4 Love",
      "Nightcrawler",
      "Piss On Your Grave",
      "Antidote",
      "Impossible",
      "Maria I'm Drunk",
      "Flying High",
      "I Can Tell",
      "Apple Pie",
      "Ok Alright",
      "Never Catch Me",
      "Active",
      "Parking Lot",
      "FE!N - CHASE B REMIX",
      "née-nah",
      "Water - Remix",
      "MELTDOWN- Instrumental",
      "K-POP - Chopped & Screwed",
      "K-POP - Instrumental",
      "K-POP - Sped Up",
      "Ring Ring",
      "Ring Ring- Extended Version",
      "Embarrassed",
      "KRZY TRAIN",
      "Down In Atlanta",
      "Hold That Heat",
      "ESCAPE PLAN",
      "MAFIA",
      "Flocky Flocky",
      "durag activity",
      "Goosebumps - Remix",
      "FRANCHISE- REMIX",
      "FRANCHISE",
      "The Plan - From the Motion Picture \"TENET\"",
      "Wash Us In The Blood",
      "TKN",
      "THE SCOTTS",
      "Antisocial- MK Remix",
      "Hot[feat. Gunna and Travis Scott]",
      "HIGHEST IN THE ROOM",
      "Antisocial",
      "The London",
      "SICKO MODE - Skrillex Remix",
      "Watch",
      "Dark Knight Dummo",
      "Know No Better",
      "Fish N Grits",
      "Go Off",
      "Whole Lotta Lovin' - With You Remix",
      "Whole Lotta Lovin' - Grandtheft Remix",
      "Whole Lotta Lovin' - Grandtheft Radio Edit Remix",
      "Whole Lotta Lovin' - LeMarquis Remix",
      "Whole Lotta Lovin' - Le Boeuf Remix",
      "Whole Lotta Lovin' - Djemba Djemba Remix"
    ],
    "Playboi Carti": [
      "Rockstar Made",
      "Go2DaMoon",
      "Stop Breathing",
      "Beno!",
      "JumpOutTheHouse",
      "M3tamorphosis",
      "Slay3r",
      "No Sl33p",
      "New Tank",
      "Teen X",
      "Meh",
      "Vamp Anthem",
      "New N3on",
      "Control",
      "Punk Monk",
      "On That Time",
      "King Vamp",
      "Place",
      "Sky",
      "Over",
      "ILoveUIHateU",
      "Die4Guy",
      "Not PLaying",
      "F33l Lik3 Dyin",
      "Long Time - Intro",
      "R.I.P.",
      "Lean 4 Real",
      "Old Money",
      "Love Hurts",
      "Shoota",
      "Right Now",
      "Poke It Out",
      "Home",
      "Fell In Luv",
      "Foreign",
      "Pull Up",
      "Mileage",
      "FlatBed Freestyle",
      "No Time",
      "Middle Of The Summer",
      "Choppa Won't Miss",
      "R.I.P. Fredo- Notice Me",
      "Top",
      "Location",
      "Magnolia",
      "Lookin",
      "wokeuplikethis*",
      "Let It Go",
      "Half & Half",
      "New Choppa",
      "Other Shit",
      "NO. 9",
      "dothatshit!",
      "Lame Niggaz",
      "Yah Mean",
      "Flex",
      "Kelly K",
      "Had 2",
      "FIELD TRIP",
      "I LUV IT",
      "Unlock It",
      "Miss The Rage",
      "@ MEH",
      "Paid In Full",
      "Crumbs",
      "Broke Boi",
      "FE!N",
      "Type Shit",
      "Pain 1993",
      "Popular- From The Idol Vol. 1",
      "Baguettes in the Face",
      "Flex Up",
      "100 Racks",
      "Of Course We Ghetto Flowers",
      "Popular",
      "Same Yung Nigga",
      "Mad Man",
      "Mattress REMIX",
      "Get Dripped",
      "Switching Lanes",
      "Beam",
      "Perry Aye",
      "Blowin' Minds",
      "Walk On Water",
      "Get The Bag",
      "Frat Rules",
      "FYBR",
      "RAF",
      "Minute",
      "Summer Bummer",
      "Beef",
      "London Town",
      "Telephone Calls",
      "Saucin' - Remix",
      "Ain't Doin That",
      "Uh Uh",
      "Check",
      "YSL",
      "CARNIVAL",
      "CARNIVAL- ACAPELLA",
      "Pump Fake",
      "WHAT",
      "iknowuknow",
      "Bankroll",
      "Spike Lee",
      "Come Here!"
    ]
  }
];



function getRandomItems(arr, numItems) {
  return arr.sort(() => 0.5 - Math.random()).slice(0, numItems);
}

async function callLLM(prompt) {
  // Hardcoded for now, future use dotenv
  var geminiApiKey = "AIzaSyB4N79Wwr8QfI6FKSeeGkPwhCqZoPmJwqg";
  const llm = new ChatGoogleGenerativeAI({
    apiKey: geminiApiKey,
    // model: "gemini-1.5-pro", # Initial responses were based on PRO
    model: "gemini-1.5-flash",
    temperature: 0,
    maxRetries: 2,
  });
  const result = await llm.invoke([
    [
      "system",
      prompt,
    ]
  ]);
  
  //console.log(result["content"]);
  //console.log("done?");
  return result["content"];
}

// Function to fetch similar artists with caching and prioritize by popularity
async function fetchSimilarArtists(artistId, popularity) {
  if (similarArtistsCache.has(artistId)) {
    console.log("----------cache used for similar artist----------");
    return similarArtistsCache.get(artistId).artists;
  }

  apiCallCounter.total += 1;
  apiCallCounter.similarArtists += 1;

  return new Promise((resolve, reject) => {
    const url = `https://api.spotify.com/v1/artists/${artistId}/related-artists`;
    request.get({
      url: url,
      headers: {
        'Authorization': 'Bearer ' + access_token,
        'Content-Type': 'application/json'
      },
      json: true
    }, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      if (body && body.artists) {
        // Check if cache is full and evict least popular artist if needed
        if (popularity < leastPopularArtistId1) {
          leastPopularArtistId1 = artistId;
          leastPopularity1 = popularity;
        }
        if (similarArtistsCache.size >= MAX_CACHE_SIZE) {
          similarArtistsCache.delete(leastPopularArtistId);
        }

        // Add to cache
        similarArtistsCache.set(artistId, { artists: body.artists, popularity });
        console.log("cached " + artistId + " similar artists");
        resolve(body.artists);
      } else {
        resolve([]);
      }
    });
  });
}

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = function(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

function findArtistPairs(data) {
  const artistPairs = [];
  data.items.forEach(artist => {
    artist.similar_artists.forEach(similarArtist => {
      const commonGenres = artist.genres.filter(genre => similarArtist.genres.includes(genre));
      if (commonGenres.length > 0) {
        artistPairs.push({ pair: [artist.name, similarArtist.name], genres: commonGenres, ids: [artist.id, similarArtist.id], popularity: [artist.popularity, artist.popularity] });
      }
    });
  });
  return artistPairs;
}

// Function to get a random element from an array
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Function to find valid pairs without repeats like "Future and Kanye" and "Kanye and Future"
function findValidPairs(pairData, artistNames) {
  const validPairs = new Set();
  const checkedPairs = new Set();

  while (validPairs.size < num_pairs && pairData.length > 0) {
    const randomPairData = getRandomElement(pairData);
    const [artist1, artist2] = randomPairData.pair;

    // Sort the pair to ensure "Future and Kanye" and "Kanye and Future" are treated the same
    const sortedPair = [artist1, artist2].sort();
    const pairKey = sortedPair.join('-');

    if (artistNames.has(artist1) && artistNames.has(artist2) && !checkedPairs.has(pairKey)) {
      validPairs.add(randomPairData);
      checkedPairs.add(pairKey);
    }

    // Remove the selected pair from the pair data to avoid repetition
    pairData = pairData.filter(pair => pair !== randomPairData);
  }

  return Array.from(validPairs);
}

// Function to fetch artist's albums
async function fetchAlbums(artistId) {
  apiCallCounter.total += 1;
  apiCallCounter.getAlbums += 1;
  return new Promise((resolve, reject) => {
    const url = `https://api.spotify.com/v1/artists/${artistId}/albums?limit=10&include_group=album`;
    request.get({
      url: url,
      headers: {
        'Authorization': 'Bearer ' + access_token,
        'Content-Type': 'application/json'
      },
      json: true
    }, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      resolve(body.items || []);
    });
  });
}

// Function to fetch tracks from an album and filter them based on the artist's presence
async function fetchTracks(albumId, artistId) {
  apiCallCounter.total += 1;
  apiCallCounter.getSongs += 1;
  return new Promise((resolve, reject) => {
    const url = `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=35`;
    request.get({
      url: url,
      headers: {
        'Authorization': 'Bearer ' + access_token,
        'Content-Type': 'application/json'
      },
      json: true
    }, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      const filteredTracks = (body.items || []).filter(track => track.artists.some(artist => artist.id === artistId));
      resolve(filteredTracks);
    });
  });
}

// Function to remove featured artists from track names
function removeFeaturedArtists(trackName) {
  return trackName.replace(/ *\([^)]*\) */g, "");
}

// Function to get the artist ID by name
async function fetchArtistId(artistName) {
  apiCallCounter.total += 1;
  apiCallCounter.getTopArtists += 1;
  return new Promise((resolve, reject) => {
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`;
    request.get({
      url: url,
      headers: {
        'Authorization': 'Bearer ' + access_token,
        'Content-Type': 'application/json'
      },
      json: true
    }, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      if (body.artists.items.length > 0) {
        resolve(body.artists.items[0].id);
      } else {
        reject(new Error(`Artist not found: ${artistName}`));
      }
    });
  });
}

// Main function to get all song names for a given artist
async function getAllSongs(artistId, popularity) {
  if (songCache.has(artistId)) {
    console.log("----------cache used for songs----------");
    return songCache.get(artistId).songs;
  }

  try {
    const albums = await fetchAlbums(artistId);
    const allTracksSet = new Set();
    console.log("ALBUMS: " + albums);

    for (const album of albums) {
      const tracks = await fetchTracks(album.id, artistId);
      for (const track of tracks) {
        const cleanedTrackName = removeFeaturedArtists(track.name);
        allTracksSet.add(cleanedTrackName);
      }
    }

    //Song Cache 
    if (popularity < leastPopularArtistId2) {
      leastPopularArtistId2 = artistId;
      leastPopularity2 = popularity;
    }
    if (songCache.size >= MAX_CACHE_SIZE) {
      songCache.delete(leastPopularArtistId2);
    }
    songCache.set(artistId, { songs: Array.from(allTracksSet), popularity });
    console.log("cached " + artistId + " songs");

    return Array.from(allTracksSet); // Convert Set to Array to ensure uniqueness
  } catch (error) {
    console.error('Error fetching songs:', error);
    return [];
  }
}

// Main function to process pair data and add song names
async function processPairs(pairData) {
  for (let i = 0; i < pairData.length; i++) {
    var pair = pairData[i];
    console.log("pair: " + pair);
    for (let i = 0; i < 2; i++) {
      var artistName = pair.pair[i];
      console.log("artist name: " + artistName);
      var artistId = pair.ids[i];
      console.log("artist id: " + artistId);
      var songs = await getAllSongs(pair.ids[i], pair.popularity[i]);
      pair[artistName] = songs;
      console.log("got songs!");

    }
  }

  console.log('Finished processing pairs.'); // Debug statement

  return pairData;
}

const stateKey = 'spotify_auth_state';

const app = express();

// Support parsing of application/json type post data
app.use(bodyParser.json());

// Support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser());

app.get('/login', function(req, res) {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  // Your application requests authorization
  const scope = 'user-read-private user-read-email user-top-read';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

// TODO: In Development
// app.get('/results', (req, res) => {
//   res.sendFile(__dirname + '/public/results.html');
// });

app.get('/artists', async function(req, res) {
  try {

    // uncomment if not using sample data
    const pairs = findValidPairs(findArtistPairs(top_artists), top_artist_names);
    console.log('Found pairs:', pairs); // Debug statement
    
    const processedPairs = await processPairs(pairs);
    console.log('Processed pairs:', processedPairs); // Debug statement 

    //Logging API Usage Information
    console.log(`Total Spotify API calls: ${apiCallCounter.total}`);
    console.log(`Calls for similar artists: ${apiCallCounter.similarArtists}`);
    console.log(`Calls for getting albums: ${apiCallCounter.getAlbums}`);
    console.log(`Calls for getting songs: ${apiCallCounter.getSongs}`);
    console.log(`Calls for getting top artists: ${apiCallCounter.getTopArtists}`);

    //Uncomment the line below to use sample data rather than calling Spotify API for data 
    //processedPairs = sample_data;

    const promises = [];
    for (let i = 0; i < 3; i++) {
      //let pairObject = sample_data[i]; // TODO: FIX LATER
      let pairObject = processedPairs[i]; // TODO: FIX LATER
      console.log('pairObject: ' + pairObject);

      let pairObjKeys = Object.keys(pairObject);
      console.log('pairObjectKeys: ' + pairObjKeys);

      var pairString = pairObject['pair']
      var genreString = pairObject['genres']
      var artistOne = pairString[0];
      var artistTwo = pairString[1];
      // var artistOneSongs = getRandomItems(pairObject[artistOne],10);
      // var artistTwoSongs = getRandomItems(pairObject[artistTwo],10);
      artistOneSongs = pairObject[artistOne];
      artistTwoSongs = pairObject[artistTwo];
      console.log("pair string " + pairString);
      console.log("genre string " + genreString);
      console.log("artist one " + artistOneSongs); // Debug
      
      //var prompt = "You are a music industry executive. Your job is when provided information based on two musical artists, you are to create an appealing conceptual album between those two artists. This album is to take inspiration from the bodies of work of these two artists and seamlessly blend them into one cohesive project. You are to tastefully pick and place appropiate and exciting features in this hypothetical project. In addition you will be supplied extensive data on the titles of each of these artists existing song titles are inspiration on how to name the songs on this concept album. The two artists are "+ artistOne + " and " + artistTwo +" The genre of these two artists are " + genreString + ". Furthermore, here are some of names of "+ artistOne+"'s existing songs: "+artistOneSongs +". Here are also some of names of "+ artistTwo+"'s existing songs: "+artistTwoSongs+". Use these song titles are inspiration for titling the songs on the project. Using all of this information please produce this conceptual albu. You response should only include a title for this project and a numbered list of the songs and their features if any. features are only listed if they are artists that are NOT the two main collaborators. In addition the number of songs should never exceed 24 at most, however you can decide the number of songs less than this at your own discretion. Try to avoid to copying and reusing existing song names as the song names of this conceptual album. Format response should include the Title of the project, each song with a name and its possible feature(s) if applicable along with a brief description of the track and its atmosphere and vibe. each song is followed by a new line character. There should be nothing else included in your response besides these things. ";
      var prompt = "When provided information based on two musical artists, you are to create an appealing conceptual album between those two artists. This album is to take inspiration from the bodies of work of these two artists and seamlessly blend them into one cohesive project. You are to tastefully pick and place appropiate and exciting features in this hypothetical project. In addition you will be supplied extensive data on the titles of each of these artists existing song titles are inspiration on how to name the songs on this concept album. The two artists are "+ artistOne + " and " + artistTwo +" The genre of these two artists are " + genreString + ". Furthermore, here are some of names of "+ artistOne+ "'s existing songs: "+artistOneSongs +". Here are also some of names of "+ artistTwo+"'s existing songs: "+artistTwoSongs+". Use these song titles are inspiration for titling the songs on the project. Using all of this information please produce this conceptual albu. You response should only include a title for this project and a numbered list of the songs and their features if any. features are only listed if they are artists that are NOT the two main collaborators. In addition the number of songs should never exceed 24 at most, however you can decide the number of songs less than this at your own discretion. Do not copy or reusing existing song names as the song names of this conceptual album. Format response should include the Title of the project, each song with a name and its possible feature(s) if applicable along with a brief description of the track and its atmosphere and vibe. each song is followed by a new line character. There should be nothing else included in your response besides these things. ";
      //var prompt = "You are a music industry executive. Your job is when provided information based on two musical artists, you are to create an appealing conceptual album between those two artists. This album is to take inspiration from the bodies of work of these two artists and seamlessly blend them into one cohesive project. You are to tastefully pick and place appropiate and exciting features in this hypothetical project. In addition you will be supplied extensive data on the titles of each of these artists existing song titles are inspiration on how to name the songs on this concept album. The two artists are "+ artistOne + " and " + artistTwo +" The genre of these two artists are " + genreString + ". Furthermore, here are some of names of "+ artistOne+"'s existing songs: "+artistOneSongs +". Here are alos some of names of "+ artistTwo+"'s existing songs: "+artistTwoSongs+". Use these song titles are inspiration for titling the songs on the project. Using all of this information please produce this conceptual albu. You response should only include a title for this project and a numbered list of the songs and their features if any. features are only listed if they are artists that are NOT the two main collaborators. In addition the number of songs should never exceed 24 at most, however you can decide the number of songs less than this at your own discretion. Try to avoid to copying and reusing existing song names as the song names of this conceptual album. Format response should include the Title of the project, each song with a name and its possible feature(s) if applicable along with a brief description of the track and its atmosphere and vibe. each song is followed by a new line character. There should be nothing else included in your response besides these things. ";
      //var prompt = "You are a music industry executive. Your job is when provided information based on two musical artists, you are to create an appealing conceptual album between those two artists. This album is to take inspiration from the bodies of work of these two artists and seamlessly blend them into one cohesive project. You are to tastefully pick and place appropiate and exciting features in this hypothetical project. In addition you will be supplied extensive data on the titles of each of these artists existing song titles are inspiration on how to name the songs on this concept album. The two artists are "+ artistOne + " and " + artistTwo +" The genre of these two artists are " + genreString + ". Furthermore, here are some of names of "+ artistOne+"'s existing songs: "+artistOneSongs +". Here are alos some of names of "+ artistTwo+"'s existing songs: "+artistTwoSongs+". Use these song titles are inspiration for titling the songs on the project. Using all of this information please produce this conceptual albu. You response should only include a title for this project and a numbered list of the songs and their features if any. features are only listed if they are artists that are NOT the two main collaborators. In addition the number of songs should never exceed 24 at most, however you can decide the number of songs less than this at your own discretion. Try to avoid to copying and reusing existing song names as the song names of this conceptual album. Format response should include the Title of the project, each song with a name and its possible feature(s) if applicable along with a brief description of the track and its atmosphere and vibe. each song is followed by a new line character. There should be nothing else included in your response besides these things. ";
      console.log(prompt);
      promises.push(callLLM(prompt));
    }

    const responses = await Promise.all(promises);

    // const contentResponses = responses.map(response => ({ content: response.content }));
    res.json(responses);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/callback', function(req, res) {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        access_token = body.access_token;
        const refresh_token = body.refresh_token;

        const options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // Use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        const artistList = {
          url: `https://api.spotify.com/v1/me/top/artists/?limit=${num_artists}`,
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        request.get(artistList, function(error, response, body) {
          if (!error && response.statusCode === 200) {
            top_artists = body;

            // Get similar artists for each top artist
            let completedRequests = 0;
            top_artists.items.forEach((artist, index) => {
              top_artist_names.add(artist.name);
              // Fetch similar artists with caching and prioritize by popularity
              fetchSimilarArtists(artist.id, artist.popularity).then(similarArtists => {
                top_artists.items[index].similar_artists = similarArtists;
                completedRequests++;
                if (completedRequests === top_artists.items.length) {
                  // All requests completed
                  res.redirect('/#' +
                    querystring.stringify({
                      access_token: access_token,
                      refresh_token: refresh_token
                    }));
                }
              }).catch(error => {
                console.error(`Error fetching similar artists for ${artist.name}:`, error);
                top_artists.items[index].similar_artists = [];
                completedRequests++;
                if (completedRequests === top_artists.items.length) {
                  // All requests completed
                  res.redirect('/#' +
                    querystring.stringify({
                      access_token: access_token,
                      refresh_token: refresh_token
                    }));
                }
              });
            });
          } else {
            console.log(response.statusCode);
          }
        });
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {
  // Requesting access token from refresh token
  const refresh_token = req.query.refresh_token;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      const access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

console.log('Listening on port ' + port + '...');
app.listen(process.env.PORT || port);
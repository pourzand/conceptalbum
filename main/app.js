// const { HfInference } = require("@huggingface/inference");
// const { HuggingFaceInference } = require("@huggingface/inference");
// Ignore above for now
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
// run "npm install @langchain/google-genai"


const express = require('express'); // Express web server framework
const session = require('express-session');
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
      "Drake",
      "A$AP Rocky"
    ],
    "genres": [
      "hip hop",
      "rap"
    ],
    "ids": [
      "3TVXtAsR1Inumwj472S9r4",
      "13ubrt8QOOCPljQ2FL1Kca"
    ],
    "popularity": [94, 94],
    "Drake": [
      "Virginia Beach",
      "Amen",
      "Calling For You",
      "Fear Of Heights",
      "Daylight",
      "First Person Shooter",
      "IDGAF",
      "7969 Santa",
      "Slime You Out",
      "Bahamas Promises",
      "Tried Our Best",
      "Screw The World - Interlude",
      "Drew A Picasso",
      "Members Only",
      "What Would Pluto Do",
      "All The Parties",
      "8am in Charlotte",
      "BBL Love - Interlude",
      "Gently",
      "Rich Baby Daddy",
      "Another Late Night",
      "Away From Home",
      "Polar Opposites",
      "Red Button",
      "Stories About My Brother",
      "The Shoe Fits",
      "Wick Man",
      "Evil Ways",
      "You Broke My Heart",
      "Rich Flex",
      "Major Distribution",
      "On BS",
      "BackOutsideBoyz",
      "Privileged Rappers",
      "Spin Bout U",
      "Hours In Silence",
      "Treacherous Twins",
      "Circo Loco",
      "Pussy & Millions",
      "Broke Boys",
      "Middle of the Ocean",
      "Jumbotron Shit Poppin",
      "More M’s",
      "I Guess It’s Fuck Me",
      "Intro",
      "Falling Back",
      "Texts Go Green",
      "Currents",
      "A Keeper",
      "Calling My Name",
      "Sticky",
      "Massive",
      "Flight's Booked",
      "Overdrive",
      "Down Hill",
      "Tie That Binds",
      "Liability",
      "Jimmy Cooks",
      "Champagne Poetry",
      "Papi’s Home",
      "Girls Want Girls",
      "In The Bible",
      "Love All",
      "Fair Trade",
      "Way 2 Sexy",
      "TSU",
      "N 2 Deep",
      "Pipe Down",
      "Yebba’s Heartbreak",
      "No Friends In The Industry",
      "Knife Talk",
      "7am On Bridle Path",
      "Race My Mind",
      "Fountains",
      "Get Along Better",
      "You Only Live Twice",
      "IMY2",
      "F*****g Fans",
      "The Remorse",
      "Deep Pockets",
      "When To Say When",
      "Chicago Freestyle",
      "Not You Too",
      "Toosie Slide",
      "Desires",
      "Time Flies",
      "Landed",
      "D4L",
      "Pain 1993",
      "Losses",
      "From Florida With Love",
      "Demons",
      "War",
      "Dreams Money Can Buy",
      "The Motion",
      "How Bout Now",
      "Trust Issues",
      "Days in The East",
      "Draft Day",
      "4pm in Calabasas",
      "5 Am in Toronto",
      "I Get Lonely",
      "My Side",
      "Jodeci Freestyle",
      "Club Paradise",
      "Free Spirit",
      "Heat Of The Moment",
      "Girls Love Beyoncé",
      "Paris Morton Music",
      "Can I",
      "Survival",
      "Nonstop",
      "Elevate",
      "Emotionless",
      "God's Plan",
      "I'm Upset",
      "8 Out Of 10",
      "Mob Ties",
      "Can’t Take A Joke",
      "Sandra’s Rose",
      "Talk Up",
      "Is There More",
      "Peak",
      "Summer Games",
      "Jaded",
      "Nice For What",
      "Finesse",
      "Ratchet Happy Birthday",
      "That’s How You Feel",
      "Blue Tint",
      "In My Feelings",
      "Don’t Matter To Me",
      "After Dark",
      "Final Fantasy",
      "March 14",
      "Free Smoke",
      "No Long Talk",
      "Passionfruit",
      "Jorja Interlude",
      "Get It Together",
      "Madiba Riddim",
      "Blem",
      "4422",
      "Gyalchester",
      "Skepta Interlude",
      "Portland",
      "Sacrifices",
      "Nothings Into Somethings",
      "Teenage Fever",
      "KMT",
      "Lose You",
      "Can't Have Everything",
      "Glow",
      "Since Way Back",
      "Fake Love",
      "Ice Melts",
      "Do Not Disturb",
      "Keep The Family Close",
      "9",
      "U With Me?",
      "Feel No Ways",
      "Hype",
      "Weston Road Flows",
      "Redemption",
      "With You",
      "Faithful",
      "Still Here",
      "Controlla",
      "One Dance",
      "Grammys",
      "Childs Play",
      "Pop Style",
      "Too Good",
      "Summers Over Interlude",
      "Fire & Desire",
      "Views",
      "Hotline Bling"
    ],
    "A$AP Rocky": [
      "Distorted Records",
      "A$AP Forever REMIX",
      "Tony Tone",
      "Fukk Sleep",
      "Praise The Lord",
      "CALLDROPS",
      "Buck Shots",
      "Gunz N Butter",
      "Brotha Man",
      "OG Beeper",
      "Kids Turned Out Fine",
      "Hun43rd",
      "Changes",
      "Black Tux, White Collar",
      "Purity",
      "Holy Ghost",
      "Canal St.",
      "Fine Whine",
      "L$D",
      "Excuse Me",
      "JD",
      "Lord Pretty Flacko Jodye 2",
      "Electric Body",
      "Jukebox Joints",
      "Max B",
      "Pharsyde",
      "Wavybone",
      "West Side Highway",
      "Better Things",
      "M'$",
      "Dreams",
      "Everyday",
      "Back Home",
      "Long Live A$AP",
      "Goldie",
      "PMW",
      "LVL",
      "Hell",
      "Pain",
      "F**kin' Problems",
      "Wild for the Night",
      "1Train",
      "Fashion Killa",
      "Phoenix",
      "Suddenly",
      "Jodye",
      "Ghetto Symphony",
      "Angels",
      "I Come Apart",
      "Purple Swag REMIX",
      "Palace",
      "Peso",
      "Bass",
      "Wassup",
      "Brand New Guy",
      "Purple Swag",
      "Get Lit",
      "Trilla",
      "Keep It G",
      "Houston Old Head",
      "Acid Drip",
      "Leaf",
      "Roll One Up",
      "Demons",
      "Sandman",
      "HIGHJACK",
      "HOODLUMZ",
      "Gangsta",
      "I Smoked Away My Brain",
      "RIOT",
      "Same Problems?"
    ]
  },
  {
    "pair": [
      "Drake",
      "Travis Scott"
    ],
    "genres": [
      "rap"
    ],
    "ids": [
      "3TVXtAsR1Inumwj472S9r4",
      "0Y5tJX1MQlPlqiwlOH1tJY"
    ],
    "popularity": [94, 94],
    "Drake": [
      "Virginia Beach",
      "Amen",
      "Calling For You",
      "Fear Of Heights",
      "Daylight",
      "First Person Shooter",
      "IDGAF",
      "7969 Santa",
      "Slime You Out",
      "Bahamas Promises",
      "Tried Our Best",
      "Screw The World - Interlude",
      "Drew A Picasso",
      "Members Only",
      "What Would Pluto Do",
      "All The Parties",
      "8am in Charlotte",
      "BBL Love - Interlude",
      "Gently",
      "Rich Baby Daddy",
      "Another Late Night",
      "Away From Home",
      "Polar Opposites",
      "Red Button",
      "Stories About My Brother",
      "The Shoe Fits",
      "Wick Man",
      "Evil Ways",
      "You Broke My Heart",
      "Rich Flex",
      "Major Distribution",
      "On BS",
      "BackOutsideBoyz",
      "Privileged Rappers",
      "Spin Bout U",
      "Hours In Silence",
      "Treacherous Twins",
      "Circo Loco",
      "Pussy & Millions",
      "Broke Boys",
      "Middle of the Ocean",
      "Jumbotron Shit Poppin",
      "More M’s",
      "I Guess It’s Fuck Me",
      "Intro",
      "Falling Back",
      "Texts Go Green",
      "Currents",
      "A Keeper",
      "Calling My Name",
      "Sticky",
      "Massive",
      "Flight's Booked",
      "Overdrive",
      "Down Hill",
      "Tie That Binds",
      "Liability",
      "Jimmy Cooks",
      "Champagne Poetry",
      "Papi’s Home",
      "Girls Want Girls",
      "In The Bible",
      "Love All",
      "Fair Trade",
      "Way 2 Sexy",
      "TSU",
      "N 2 Deep",
      "Pipe Down",
      "Yebba’s Heartbreak",
      "No Friends In The Industry",
      "Knife Talk",
      "7am On Bridle Path",
      "Race My Mind",
      "Fountains",
      "Get Along Better",
      "You Only Live Twice",
      "IMY2",
      "F*****g Fans",
      "The Remorse",
      "Deep Pockets",
      "When To Say When",
      "Chicago Freestyle",
      "Not You Too",
      "Toosie Slide",
      "Desires",
      "Time Flies",
      "Landed",
      "D4L",
      "Pain 1993",
      "Losses",
      "From Florida With Love",
      "Demons",
      "War",
      "Dreams Money Can Buy",
      "The Motion",
      "How Bout Now",
      "Trust Issues",
      "Days in The East",
      "Draft Day",
      "4pm in Calabasas",
      "5 Am in Toronto",
      "I Get Lonely",
      "My Side",
      "Jodeci Freestyle",
      "Club Paradise",
      "Free Spirit",
      "Heat Of The Moment",
      "Girls Love Beyoncé",
      "Paris Morton Music",
      "Can I",
      "Survival",
      "Nonstop",
      "Elevate",
      "Emotionless",
      "God's Plan",
      "I'm Upset",
      "8 Out Of 10",
      "Mob Ties",
      "Can’t Take A Joke",
      "Sandra’s Rose",
      "Talk Up",
      "Is There More",
      "Peak",
      "Summer Games",
      "Jaded",
      "Nice For What",
      "Finesse",
      "Ratchet Happy Birthday",
      "That’s How You Feel",
      "Blue Tint",
      "In My Feelings",
      "Don’t Matter To Me",
      "After Dark",
      "Final Fantasy",
      "March 14",
      "Free Smoke",
      "No Long Talk",
      "Passionfruit",
      "Jorja Interlude",
      "Get It Together",
      "Madiba Riddim",
      "Blem",
      "4422",
      "Gyalchester",
      "Skepta Interlude",
      "Portland",
      "Sacrifices",
      "Nothings Into Somethings",
      "Teenage Fever",
      "KMT",
      "Lose You",
      "Can't Have Everything",
      "Glow",
      "Since Way Back",
      "Fake Love",
      "Ice Melts",
      "Do Not Disturb",
      "Keep The Family Close",
      "9",
      "U With Me?",
      "Feel No Ways",
      "Hype",
      "Weston Road Flows",
      "Redemption",
      "With You",
      "Faithful",
      "Still Here",
      "Controlla",
      "One Dance",
      "Grammys",
      "Childs Play",
      "Pop Style",
      "Too Good",
      "Summers Over Interlude",
      "Fire & Desire",
      "Views",
      "Hotline Bling"
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
      "née-nah"
    ]
  },
  {
    "pair": [
      "Radiohead",
      "The Strokes"
    ],
    "genres": [
      "alternative rock",
      "permanent wave",
      "rock"
    ],
    "ids": [
      "4Z8W4fKeB5YxbusRsdQVPb",
      "0epOFNiUfyON9EYx7Tpr6V"
    ],
    "popularity": [81, 81],
    "Radiohead": [
      "Everything In Its Right Place",
      "Kid A",
      "The National Anthem",
      "How to Disappear Completely",
      "Treefingers",
      "Optimistic",
      "In Limbo",
      "Idioteque",
      "Morning Bell",
      "Motion Picture Soundtrack",
      "Untitled",
      "Packt Like Sardines In a Crushd Tin Box",
      "Pyramid Song",
      "Pulk/Pull Revolving Doors",
      "You And Whose Army?",
      "I Might Be Wrong",
      "Knives Out",
      "Morning Bell/Amnesiac",
      "Dollars and Cents",
      "Hunting Bears",
      "Like Spinning Plates",
      "Life In a Glasshouse",
      "Like Spinning Plates - 'Why Us?' Version",
      "Untitled v1",
      "Fog - Again Again Version",
      "If You Say the Word",
      "Follow Me Around",
      "Pulk/Pull - True Love Waits Version",
      "Untitled v2",
      "The Morning Bell - In the Dark Version",
      "Pyramid Strings",
      "Alt. Fast Track",
      "Untitled v3",
      "How to Disappear into Strings",
      "Airbag - Remastered",
      "Paranoid Android - Remastered",
      "Subterranean Homesick Alien - Remastered",
      "Exit Music- Remastered",
      "Let Down - Remastered",
      "Karma Police - Remastered",
      "Fitter Happier - Remastered",
      "Electioneering - Remastered",
      "Climbing Up the Walls - Remastered",
      "No Surprises - Remastered",
      "Lucky - Remastered",
      "The Tourist - Remastered",
      "I Promise",
      "Man of War",
      "Lift",
      "Lull - Remastered",
      "Meeting in the Aisle - Remastered",
      "Melatonin - Remastered",
      "A Reminder - Remastered",
      "Polyethylene- Remastered",
      "Pearly* - Remastered",
      "Palo Alto - Remastered",
      "How I Made My Millions - Remastered",
      "Burn the Witch",
      "Daydreaming",
      "Decks Dark",
      "Desert Island Disk",
      "Ful Stop",
      "Glass Eyes",
      "Identikit",
      "The Numbers",
      "Present Tense",
      "Tinker Tailor Soldier Sailor Rich Man Poor Man Beggar Man Thief",
      "True Love Waits",
      "Little By Little - Caribou Rmx",
      "Lotus Flower - Jacques Greene Rmx",
      "Morning Mr Magpie - Nathan Fake Rmx",
      "Bloom - Harmonic 313 Rmx",
      "Bloom - Mark Pritchard Rmx",
      "Feral - Lone RMX",
      "Morning Mr Magpie - Pearson Sound Scavenger RMX",
      "Separator - Four Tet RMX",
      "Give Up The Ghost - Thriller Houseghost Remix",
      "Codex",
      "Little By Little",
      "Give Up The Ghost - Brokenchord Rmx",
      "TKOL - Altrice Rmx",
      "Bloom - Blawan Rmx",
      "Good Evening Mrs Magpie - Modeselektor RMX",
      "Bloom - Objekt RMX",
      "Bloom - Jamie xx Rework",
      "Separator - Anstam RMX",
      "Lotus Flower - SBTRKT RMX",
      "Bloom",
      "Morning Mr Magpie",
      "Feral",
      "Lotus Flower",
      "Give Up The Ghost",
      "Separator",
      "15 Step",
      "Bodysnatchers",
      "Nude",
      "Weird Fishes/ Arpeggi",
      "All I Need",
      "Faust Arp",
      "Reckoner",
      "House Of Cards",
      "Jigsaw Falling Into Place",
      "Videotape",
      "MK 1",
      "Down Is The New Up",
      "Go Slowly",
      "MK 2",
      "Last Flowers",
      "Up On The Ladder",
      "Bangers + Mash",
      "4 Minute Warning",
      "2 + 2 = 5",
      "Sit Down. Stand Up",
      "Sail To The Moon",
      "Backdrifts",
      "Go To Sleep",
      "Where I End and You Begin",
      "We Suck Young Blood",
      "The Gloaming",
      "There, There",
      "I Will",
      "A Punch Up at a Wedding",
      "Myxomatosis",
      "Scatterbrain",
      "A Wolf At the Door",
      "The National Anthem - Live in France",
      "I Might Be Wrong - Live",
      "Morning Bell - Live in Oxford",
      "Like Spinning Plates - Live",
      "Idioteque - Live in Oxford",
      "Everything In Its Right Place - Live in France",
      "Dollars and Cents - Live",
      "True Love Waits - Live in Oslo"
    ],
    "The Strokes": [
      "The Modern Age - Rough Trade Version",
      "Last Nite - Rough Trade Version - The Modern Age B-Side",
      "Hard To Explain",
      "New York City Cops",
      "Last Nite",
      "When It Started",
      "Someday",
      "Alone, Together - Home Recording - Someday B-Side",
      "Is This It - Home Recording - Someday B-Side",
      "12:51",
      "The Way It Is - Home Recording - 12:51 B-Side",
      "Reptilia",
      "Modern Girls & Old Fashion Men - Reptilia B-Side",
      "The End Has No End",
      "Clampdown - The End Has No End B-Side / Live at Alexandra Palace, London, UK - Dec. 5, 2003",
      "Juicebox",
      "Hawaii - Juicebox B-Side",
      "Heart In a Cage",
      "I'll Try Anything Once- Heart In a Cage B-Side",
      "You Only Live Once",
      "Mercy Mercy Me- You Only Live Once B-Side",
      "The Adults Are Talking",
      "Selfless",
      "Brooklyn Bridge To Chorus",
      "Bad Decisions",
      "Eternal Summer",
      "At The Door",
      "Why Are Sundays So Depressing",
      "Not The Same Anymore",
      "Ode To The Mets",
      "Tap Out",
      "All The Time",
      "One Way Trigger",
      "Welcome To Japan",
      "80's Comedown Machine",
      "50/50",
      "Slow Animals",
      "Partners In Crime",
      "Chances",
      "Happy Ending",
      "Call It Fate, Call It Karma",
      "Machu Picchu",
      "Under Cover of Darkness",
      "Two Kinds of Happiness",
      "You're So Right",
      "Taken for a Fool",
      "Games",
      "Call Me Back",
      "Gratisfaction",
      "Metabolism",
      "Life Is Simple in the Moonlight",
      "Razorblade",
      "On the Other Side",
      "Vision of Division",
      "Ask Me Anything",
      "Electricityscape",
      "Killing Lies",
      "Fear of Sleep",
      "15 Minutes",
      "Ize of the World",
      "Evening Sun",
      "Red Light",
      "What Ever Happened?",
      "Automatic Stop",
      "You Talk Way Too Much",
      "Between Love & Hate",
      "Meet Me in the Bathroom",
      "Under Control",
      "The Way It Is",
      "I Can't Win",
      "Is This It",
      "The Modern Age",
      "Soma",
      "Barely Legal",
      "Alone, Together",
      "Trying Your Luck",
      "Take It Or Leave It",
      "Drag Queen",
      "Oblivius",
      "Threat of Joy",
      "Oblivius - Moretti Remix",
      "Fast Animals",
      "Taken for a Fool- Live from Madison Square Garden, New York, NY - April 2011"
    ]
  },
  {
    "pair": [
      "Future",
      "Don Toliver"
    ],
    "genres": [
      "rap"
    ],
    "ids": [
      "1RyvyyTE3xzB2ZywiAwp0i",
      "4Gso3d4CscCijv0lmajZWs"
    ],
    "popularity": [91, 91],
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
      "712PM",
      "I'M DAT N****",
      "KEEP IT BURNIN",
      "FOR A NUT",
      "PUFFIN ON ZOOTIEZ",
      "GOLD STACKS",
      "WAIT FOR U",
      "LOVE YOU BETTER",
      "MASSAGING ME",
      "CHICKENS",
      "WE JUS WANNA GET HIGH",
      "VOODOO",
      "HOLY GHOST",
      "THE WAY THINGS GOING",
      "I'M ON ONE",
      "BACK TO THE BASICS",
      "NO SECURITY",
      "LIKE ME",
      "AFFILIATED",
      "STAYED DOWN",
      "WORST DAY",
      "JUST THE BEGINNING",
      "712PM - Instrumental",
      "I'M DAT N**** - Instrumental",
      "KEEP IT BURNIN- Instrumental",
      "FOR A NUT- Instrumental",
      "PUFFIN ON ZOOTIEZ - Instrumental",
      "GOLD STACKS - Instrumental",
      "WAIT FOR U- Instrumental",
      "LOVE YOU BETTER - Instrumental",
      "MASSAGING ME - Instrumental",
      "CHICKENS- Instrumental",
      "WE JUS WANNA GET HIGH - Instrumental",
      "VOODOO- Instrumental",
      "HOLY GHOST - Instrumental",
      "THE WAY THINGS GOING - Instrumental",
      "I'M ON ONE- Instrumental",
      "BACK TO THE BASICS - Instrumental",
      "NO SECURITY- Instrumental",
      "LIKE ME- Instrumental",
      "AFFILIATED- Instrumental",
      "STAYED DOWN- Instrumental",
      "WORST DAY - Instrumental",
      "JUST THE BEGINNING - Instrumental",
      "Tic Tac",
      "My Legacy",
      "Heart In Pieces",
      "Because of You",
      "Bust a Move",
      "Baby Sasuke",
      "Stripes Like Burberry",
      "Marni On Me",
      "Sleeping On The Floor",
      "Real Baby Pluto",
      "Drankin N Smokin",
      "Million Dollar Play",
      "Plastic",
      "That’s It",
      "Bought A Bad Bitch",
      "Rockstar Chainz",
      "She Never Been To Pluto",
      "Off Dat",
      "I Don’t Wanna Break Up",
      "Bankroll",
      "Moment of Clarity",
      "Patek",
      "Over Your Head",
      "Trapped In The Sun",
      "HiTek Tek",
      "Touch The Sky",
      "Solitaires",
      "Ridin Strikers",
      "One Of My",
      "Posted With Demons",
      "Hard To Choose One",
      "Trillionaire",
      "Harlem Shake",
      "Up the River",
      "Pray For A Key",
      "Too Comfortable",
      "All Bad",
      "Outer Space Bih",
      "Accepting My Flaws",
      "Life Is Good",
      "Last Name",
      "Tycoon",
      "100 Shooters",
      "Life Is Good- Remix",
      "XanaX Damage",
      "St. Lucia",
      "Please Tell Me",
      "Shotgun",
      "Government Official",
      "Extra",
      "Love Thy Enemies",
      "Never Stop",
      "Jumpin on a Jet",
      "Rocket Ship",
      "Temptation",
      "Crushed Up",
      "F&N",
      "Call the Coroner",
      "Talk Shit Like a Preacher",
      "Promise U That",
      "Stick to the Models",
      "Overdose",
      "Krazy but True",
      "Servin Killa Kam",
      "Baptiize",
      "Unicorn Purp",
      "Goin Dummi",
      "First Off",
      "Faceshot",
      "Ain't Coming Back",
      "Tricks on Me",
      "Jet Lag",
      "Astronauts",
      "Fine China",
      "Red Bentley",
      "Oxy",
      "7 Am Freestyle",
      "Different",
      "Shorty",
      "Realer N Realer",
      "No Issue",
      "WRLD On Drugs",
      "Afterlife",
      "Ain't Livin Right",
      "Transformer",
      "Hard Work Pays Off"
    ],
    "Don Toliver": [
      "KRYPTONITE",
      "TORE UP",
      "BROTHER STONE",
      "ATTITUDE",
      "BANDIT",
      "GLOCK",
      "ICE AGE",
      "4X4",
      "PURPLE RAIN",
      "NEW DROP",
      "BACKSTREETS",
      "DEEP IN THE WATER",
      "INSIDE",
      "5 TO 10",
      "LAST LAUGH",
      "HARDSTONE NATIONAL ANTHEM",
      "ROCKSTAR GIRL",
      "LOVE IS A DRUG",
      "DONNY DARKO",
      "GEEKED UP",
      "No Pole",
      "Embarrassed",
      "Geronimo",
      "Luckily I’m Having",
      "LoveSickness",
      "Let Her Go",
      "Leave the Club",
      "4 Me",
      "Go Down",
      "Time Heals All",
      "Leather Coat",
      "Honeymoon",
      "Private Landing",
      "Slow Motion",
      "Do It Right",
      "If I Had",
      "Company Pt. 3",
      "Bus Stop",
      "Cinderella",
      "Encouragement",
      "XSCAPE",
      "5X",
      "Way Bigger",
      "Flocky Flocky",
      "What You Need",
      "Double Standards",
      "Swangin’ On Westheimer",
      "Drugs N Hella Melodies",
      "2AM",
      "Get Throwed",
      "Company Pt 2",
      "OUTERSPACE",
      "Smoke",
      "You",
      "Crossfaded",
      "BOGUS",
      "Heaven or Hell - CHOPNOTSLOP REMIX",
      "Euphoria- CHOPNOTSLOP REMIX",
      "No Idea - CHOPNOTSLOP REMIX",
      "No Photos - CHOPNOTSLOP REMIX",
      "Can't Feel My Legs - CHOPNOTSLOP REMIX",
      "Cardigan - CHOPNOTSLOP REMIX",
      "Spaceship- CHOPNOTSLOP REMIX",
      "Company - CHOPNOTSLOP REMIX",
      "Had Enough- CHOPNOTSLOP REMIX",
      "Wasted - CHOPNOTSLOP REMIX",
      "After Party - CHOPNOTSLOP REMIX",
      "Candy - CHOPNOTSLOP REMIX",
      "Heaven or Hell",
      "Euphoria",
      "Cardigan",
      "After Party",
      "Wasted",
      "Can't Feel My Legs",
      "Candy",
      "Company",
      "Had Enough",
      "Spaceship",
      "No Photos",
      "No Idea",
      "Diamonds",
      "Diva",
      "Issues",
      "Backend",
      "Mamma Mia",
      "Holdin' Steel",
      "Bang Bang",
      "2 Lil Shorty",
      "Video Girl",
      "Around",
      "AMG",
      "Run Up",
      "Talk No More",
      "FIELD TRIP"
    ]
  },
  {
    "pair": [
      "Ken Carson",
      "Homixide Gang"
    ],
    "genres": [
      "rage rap"
    ],
    "ids": [
      "3gBZUcNeVumkeeJ19CY2sX",
      "2ojqsY1ycYzZOpLDBBwHPU"
    ],
    "popularity": [80, 80],
    "Ken Carson": [
      "Green Room",
      "Jennifer’s Body",
      "Fighting My Demons",
      "Singapore",
      "Lose It",
      "Hardcore",
      "Me N My Kup",
      "It’s Over",
      "Succubus",
      "Paranoid",
      "Pots",
      "Like This",
      "Overtime",
      "Vampire Hour",
      "Nightcore",
      "Nightcore 2",
      "Rockstar Lifestyle",
      "i need u",
      "loading",
      "more chaos",
      "toxic",
      "leather jacket",
      "mewtwo",
      "ss",
      "overseas",
      "Intro",
      "New",
      "Gems",
      "Nobody",
      "Go",
      "MDMA",
      "X",
      "PDBMH",
      "Money Hunt",
      "South Beach",
      "Going Schitz",
      "Same Thing",
      "Freestyle 1",
      "Freestyle 2",
      "Fuk 12",
      "Murda Musik",
      "Delinquent",
      "Get Rich Or Die",
      "Turn Up",
      "The End",
      "Freestyle 3",
      "Fashion Habits",
      "Shoot",
      "Swag Overload",
      "Lookbook",
      "Who's Next",
      "Rock N Roll",
      "Party All Day",
      "Change",
      "Run + Ran",
      "Shake",
      "Hella",
      "Clutch",
      "Till I Die",
      "Burnin Up",
      "So What",
      "Teen Bean",
      "Teen X Babe",
      "Teenager Rager",
      "Butterfly",
      "High as Sh!T",
      "On the Low",
      "Teen X",
      "Yale",
      "Meds",
      "Why",
      "For Her",
      "Pissed Off"
    ],
    "Homixide Gang": [
      "Sharp Sh00ter",
      "VersionF!VE",
      "SIDE EFFExT",
      "FA5EBUSTER",
      "SRT",
      "SwanTon BOMB",
      "FiGure5 [INTERLUDE]",
      "R50",
      "DeathLOK",
      "2xTREME",
      "00-MEGA",
      "HI-VOLTAGE",
      "SMAKDWN",
      "TABLESandLATTER5",
      "Gunz in SOHO",
      "LexLuger",
      "B5",
      "NiNO 5ROWN",
      "MW5",
      "FroZone",
      "What It Is?!",
      "5ONJOUR",
      "Hom3 Invasion",
      "5REW",
      "Roundz",
      "DesignerDRÜGZ",
      "ROAD RAGE!",
      "Left Hand",
      "RCKstarB!tch",
      "25/8",
      "AddXcts",
      "E.U.",
      "HXG Bizness",
      "ADHD",
      "Homixide Language",
      "5!RE",
      "Wants & Needs",
      "TNT",
      "C4N",
      "Snot Sh!t",
      "Dive In",
      "Uzi Work",
      "2 Da Face",
      "Block Work",
      "Flight's Booked",
      "Lifestyle",
      "Guitars",
      "Can't Go",
      "Tatted",
      "5 Ways",
      "V-Friends",
      "BB",
      "Lif3",
      "TF!",
      "Notice It",
      "None 2 Some",
      "Scale Stretcher",
      "Tripping",
      "Stunt",
      "Drakon !",
      "CV",
      "Wings",
      "Shots Off",
      "Holler!",
      "5unna",
      "Grab Da Door!",
      "Big O Shit",
      "55 Lifestyle",
      "Rockstar",
      "Step Daddy",
      "Gun",
      "Snotty Run!",
      "Puttem On"
    ]
  }
]


function getRandomItems(arr, numItems) {
  return arr.sort(() => 0.5 - Math.random()).slice(0, numItems);
}

// kept getting: Error: TypeError: firstArtistSet.intersection is not a function
// so i manually defined it here via mozilla docs
function intersection_def(setA, setB) {
  const _intersection = new Set();
  for (const elem of setB) {
    if (setA.has(elem)) {
      _intersection.add(elem);
    }
  }
  return _intersection;
}

function removeIntersection(setA, setB) {
  const intersectionSet = intersection_def(setA, setB);
  
  for (const elem of intersectionSet) {
    setB.delete(elem);
  }
  
  return setB;
}

function responseParsing(response, entireDiscogOne, entireDiscoTwo) {
  const lines = response.split('\n');
  // console.log(lines);
  const pair = lines[0].trim();
  const title = lines[1].trim();
  const tracks = lines.slice(2).map(line => line.trim()).filter(line => line !== '');
  
  // llm repition prevention
  const songNames = new Set();
  let reachedSongMax = false;

  const songMax = 22; // the maximum number of songs that can be displayed in the event the llm doesnt properly following instructions

  // runtime techinically suffers because we are iterating over the the generate tracklist twice instead of once on the client side but will hopefully make things easier for reptition prevention
  
  // using filter since it unadvisable to iterate over something while removing from it at the same time.
  const non_repeat_tracks = tracks.filter((track, index) => {
    if (reachedSongMax) return false;
  
    const track_details = track.split("|");
    const songName = track_details[0];
  
    if (songNames.has(songName)) {
      return false;
    } else if (index < songMax) {
      songNames.add(songName);
      return true;
    } else {
      // We've reached songMax
      reachedSongMax = true;
      return false;
    }
  });

  not_direct_copies = basicSimilarityMatch(non_repeat_tracks, pair, entireDiscogOne,entireDiscoTwo);

  // console.log("In Response Parsing: ", {title , non_repeat_tracks , pair })
  finalized_tracks = not_direct_copies;
  // TO DISABLE DIRECT COPY REMOVAL, replace above with "finalized_tracks = non_repeat_tracks;"
  return {title , finalized_tracks , pair };

}


function basicSimilarityMatch(non_repeat_tracks, pair , artistOneSongs,artistTwoSongs) {


  // runtime could maybe be better if i parallelized the iterating during the parsing process on results.html by passing the list of songs for every artist for every album(6 song lists) but that might just be more work
  // but in theory shouldnt be ran when deployed, just for debugging
  // const lines = response.split('\n');
  // const pair = lines[0].trim();
  // const title = lines[1].trim();
 
  const tracks = non_repeat_tracks.map(line => line.split("|")[0]).map(line => { // discard track description
    const index = line.indexOf('(');  // find the position of '('
    return index !== -1 ? line.slice(0, index-1) : line;  // Keep everything before '(' to remove features when song title matching
  }).filter(line => line !== '');  // Filter out empty lines

  const firstArtistSet = new Set(artistOneSongs.map(line => {
    const index = line.indexOf('(');  // find the position of '('
    return index !== -1 ? line.slice(0, index-1) : line;  // keep everything before '(' to remove features when song title matching
  }).map(item => item.toLowerCase()));

  const secondArtistSet = new Set(artistTwoSongs.map(line => {
    const index = line.indexOf('(');  // find the position of '('
    return index !== -1 ? line.slice(0, index-1) : line;  // keep everything before '(' to remove features when song title matching
  }).map(item => item.toLowerCase()));

  const tracksSet = new Set(tracks.map(item => item.toLowerCase()));

  // built in intersection not supported for some reason
  // const firstOverlap = (firstArtistSet.intersection(tracksSet)).size / firstArtistSet.size;
  // const secondOverlap = (secondArtistSet.intersection(tracksSet)).size / secondArtistSet.size;

  const firstOverlap = (intersection_def(firstArtistSet,tracksSet)).size / firstArtistSet.size;
  const secondOverlap = (intersection_def(secondArtistSet,tracksSet)).size / secondArtistSet.size;
  const artists =  pair.split("`"); // Cross reference with uniqueDelim in callLLM

  console.log("Songs Titles DIRECTLY Copied:\n"+artists[0]+": " + (firstOverlap * 100)+ "%\n" + artists[1] + ": " + (100* secondOverlap)+"%");
  // Does not account for instances where the LLM will concatenate song titles together because those are harder to detect and to a degree, concatenating them is creative to an extent. 

  // debug statements
  // console.log(artists[0] ," INTERSECTION: " ,intersection_def(firstArtistSet,tracksSet) );
  // console.log(artists[1] ," INTERSECTION: " ,(intersection_def(secondArtistSet,tracksSet)) );
  // console.log(artists[0]," PARSED: ",firstArtistSet );
  // console.log(artists[1]," PARSED: ", secondArtistSet);
  // console.log("trackset: ", tracksSet);

  // NEW 
  // removing direct copies
  firstArtistRemoved = removeIntersection(firstArtistSet,tracksSet) // tracks - first artist copies
  bothArtistRemoved = removeIntersection(secondArtistSet,firstArtistRemoved) // tracks - first artist copies - second artist copies

  // TODO: re-add descriptions since current tracks are stripped.
  // foreach item in final set, if substring is present, add to some array or remove from existing array and then return
  // cleanedTracks = Array.from(bothArtistRemoved.values());
  let cleanedTracks = non_repeat_tracks.filter(track => {
    let trackName = track.split("|")[0].trim();
    let index = trackName.indexOf('(');
    let cleanedTrackName = index !== -1 ? trackName.slice(0, index - 1) : trackName;
    return bothArtistRemoved.has(cleanedTrackName.toLowerCase());
  });

  console.log("TOTALLY CLEANED: ",cleanedTracks);

  return cleanedTracks;

}



async function callLLM(artists, genreString, artistOneSongs, artistTwoSongs, entireDiscogOne, entireDiscoTwo) {
  // Hardcoded for now, future use dotenv
  var geminiApiKey = "AIzaSyB4N79Wwr8QfI6FKSeeGkPwhCqZoPmJwqg";
  const llm = new ChatGoogleGenerativeAI({
    apiKey: geminiApiKey,
    model: "gemini-1.5-flash", // Initial responses were based on PRO
    // model: "gemini-1.5-pro",
    temperature: .2,
    maxRetries: 2,
  });

  // prompt creation
  var prompt = "When provided information based on two musical artists, you are to create an appealing conceptual album between those two artists. This album is to take inspiration from the bodies of work of these two artists and seamlessly blend them into one cohesive project. You are to tastefully pick and place appropiate and exciting features in this hypothetical project. In addition you will be supplied extensive data on the titles of each of these artists existing song titles are inspiration on how to name the songs on this concept album. The two artists are "+ artists[0] + " and " + artists[1] +" The genre of these two artists are " + genreString + ". Furthermore, here are some of names of "+ artists[0]+ "'s existing songs: "+artistOneSongs +". Here are also some of names of "+ artists[1]+"'s existing songs: "+artistTwoSongs+". Use these song titles are inspiration for titling the songs on the project. Using all of this information please produce this conceptual album. features are only listed if they are artists that are NOT the two main collaborators. In addition the number of songs should NEVER exceed 20 at most, however you can decide the number of songs less than this at your own discretion. Do not copy or reusing existing song names as the song names of this conceptual album. Format response should include the Title of the project, each song with a name and its possible feature(s) if applicable along with a brief description of the track and its atmosphere and vibe. each song is followed by a new line character. There should be nothing else included in your response besides these things. The format for your response should be #Title#\\nTrack name(feat. featured artist if any)|description\\nTrack name(featured artist if any)|description. in addition the title should strictly only contain the title and nothing else, do not include the artists in the title generated. The response should not have any markdown styling aside from the unique styling I've already mentiond. Lastly, do not repeat or copy songs names from the song names already provided, only take inspiration do not blatantly copy. Again do not copy song titles from those already provided and do not let the total number of songs exceed 20";

  const result = await llm.invoke([
    [
      "system",
      prompt,
    ]
  ]);
  
  // DEBUG STATEMENTS

  // console.log("DEBUG_PROMPT:<" , prompt, ">DEBUG_PROMPT");

  console.log("done with singular callLLM function call");
  const uniqueDelim = "`"; // the purpose for this is just appending the array will sepearte the artists with a comma and when we go to split
  // ,artists with commas or typical punctation in their names will be split at the wrong spots, for now using a backtick but could use some crazy unique combo of characters if we wanted to be super robust in our solution.
  const formattedResult = artists[0] + uniqueDelim + artists[1]+ "\n" + result["content"];


  // console.log("DEBUG_RESULT:< ", formattedResult,">DEBUG_RESULT");

  console.log("DEBUG_COPIED_SONGS:<");
  // basicSimilarityMatch(formattedResult
  console.log(">DEBUG_COPIED_SONGS");

  return responseParsing(formattedResult,entireDiscogOne,entireDiscoTwo);
}



// Function to fetch similar artists with caching and prioritize by popularity
async function fetchSimilarArtists(artistId, popularity, access_token) {
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
async function fetchAlbums(artistId, access_token) {
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
async function fetchTracks(albumId, artistId, access_token) {
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


// Authentication middleware to protect routes
function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.access_token) {
    return next(); // User is authenticated, proceed to the next middleware or route handler
  } else {
    res.redirect('/login'); // If not authenticated, redirect to login
  }
}

// Function to fetch the user's top artists and their similar artists
async function fetchTopArtists(access_token) {
  return new Promise((resolve, reject) => {
    const artistList = {
      url: `https://api.spotify.com/v1/me/top/artists/?limit=${num_artists}`,
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };

    request.get(artistList, async function(error, response, body) {
      if (error || response.statusCode !== 200) {
        return reject(error || new Error(`Failed to fetch top artists: ${response.statusCode}`));
      }

      const artist_list = body;

      try {
        for (let i = 0; i < artist_list.items.length; i++) {
          const artist = artist_list.items[i];
          top_artist_names.add(artist.name);

          try {
            const similarArtists = await fetchSimilarArtists(artist.id, artist.popularity, access_token);
            artist_list.items[i].similar_artists = similarArtists;
          } catch (error) {
            console.error(`Error fetching similar artists for ${artist.name}:`, error);
            artist_list.items[i].similar_artists = [];
          }
        }
        resolve(artist_list);
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Main function to get all song names for a given artist
async function getAllSongs(artistId, popularity, access_token) {
  if (songCache.has(artistId)) {
    console.log("----------cache used for songs----------");
    return songCache.get(artistId).songs;
  }

  try {
    const albums = await fetchAlbums(artistId, access_token);
    const allTracksSet = new Set();
    console.log("ALBUMS: " , albums);

    for (const album of albums) {
      const tracks = await fetchTracks(album.id, artistId, access_token);
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
async function processPairs(pairData, access_token) {
  for (let i = 0; i < pairData.length; i++) {
    var pair = pairData[i];
    console.log("pair: " , pair);
    for (let i = 0; i < 2; i++) {
      var artistName = pair.pair[i];
      console.log("artist name: " + artistName);
      var artistId = pair.ids[i];
      console.log("artist id: " + artistId);
      var songs = await getAllSongs(pair.ids[i], pair.popularity[i], access_token);
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

// Set up express-session middleware
app.use(session({
  secret: generateRandomString(16), 
  resave: false,             // Avoid resaving session if unmodified
  saveUninitialized: true,   // Save uninitialized sessions
  cookie: { secure: false }  // Set to true if using HTTPS
}));

app.get('/login', function(req, res) {
  const state = generateRandomString(16);
  req.session[stateKey] = state;  // Store state in session

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

app.get('/results', ensureAuthenticated, (req, res) => {
  res.sendFile(__dirname + '/public/results.html');
});


app.get('/artists', ensureAuthenticated, async function(req, res) {
  try {

    // uncomment if not using sample data
    const top_artists = await fetchTopArtists(req.session.access_token);
    console.log("-----TOP ARTISTS-----\n" + top_artists);
    const pairs = findValidPairs(findArtistPairs(top_artists), top_artist_names);
    console.log('Found pairs:', pairs); // Debug statement
    
    const processedPairs = await processPairs(pairs, access_token);
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

      var pairArray = pairObject['pair']
      var genreString = pairObject['genres']
      var artistOne = pairArray[0];
      var artistTwo = pairArray[1];

      var numSongsForPrompt = 20;
      var artistOneSongs = getRandomItems(pairObject[artistOne],numSongsForPrompt);
      var artistTwoSongs = getRandomItems(pairObject[artistTwo],numSongsForPrompt);
      // artistOneSongs = pairObject[artistOne];
      // artistTwoSongs = pairObject[artistTwo];
      console.log("pair string " + pairArray);
      console.log("genre string " + genreString);
      // console.log("artist one " + artistOneSongs); // Debug
      
      var prompt1 = "When provided information based on two musical artists, you are to create an appealing conceptual album between those two artists. This album is to take inspiration from the bodies of work of these two artists and seamlessly blend them into one cohesive project. You are to tastefully pick and place appropiate and exciting features in this hypothetical project. In addition you will be supplied extensive data on the titles of each of these artists existing song titles are inspiration on how to name the songs on this concept album. The two artists are "+ artistOne + " and " + artistTwo +" The genre of these two artists are " + genreString + ". Furthermore, here are some of names of "+ artistOne+ "'s existing songs: "+artistOneSongs +". Here are also some of names of "+ artistTwo+"'s existing songs: "+artistTwoSongs+". Use these song titles are inspiration for titling the songs on the project. Using all of this information please produce this conceptual album. features are only listed if they are artists that are NOT the two main collaborators. In addition the number of songs should NEVER exceed 20 at most, however you can decide the number of songs less than this at your own discretion. Do not copy or reusing existing song names as the song names of this conceptual album. Format response should include the Title of the project, each song with a name and its possible feature(s) if applicable along with a brief description of the track and its atmosphere and vibe. each song is followed by a new line character. There should be nothing else included in your response besides these things. The format for your response should be #Title#\\nTrack name(feat. featured artist if any)|description\\nTrack name(featured artist if any)|description. in addition the title should strictly only contain the title and nothing else, do not include the artists in the title generated. The response should not have any markdown styling aside from the unique styling I've already mentiond. Lastly, do not repeat or copy songs names from the song names already provided, only take inspiration do not blatantly copy. Again do not copy song titles from those already provided and do not let the total number of songs exceed 20";
      var prompt2 = "When provided information based on two musical artists, come up with what a collaborative work between them would look like. Come up with the album title, track names, and features. Format response should include the Title of the project, each song with a name and its possible feature(s) if applicable along with a brief description of the track and its atmosphere and vibe. each song is followed by a new line character. There should be nothing else included in your response besides these things. The format for your response should be #Title#\\nTrack name(feat. featured artist if any)|description\\nTrack name(featured artist if any)|description. in addition the title should strictly only contain the title and nothing else, do not include the artists in the title generated. The response should not have any markdown styling aside from the unique styling I've already mentioned. Lastly, do not repeat or copy songs names from the song names already provided, only take inspiration do not blatantly copy. Again do not copy song titles from those already provided and do not let the total number of songs exceed 20. The two artists are "+ artistOne + " and " + artistTwo +" The genre of these two artists are " + genreString + ". Furthermore, here are some of names of "+ artistOne+ "'s existing songs: "+artistOneSongs +". Here are also some of names of "+ artistTwo+"'s existing songs: "+artistTwoSongs;
      var prompt = prompt2;



      console.log(prompt);
      promises.push(callLLM(pairArray, genreString,artistOneSongs,artistTwoSongs, pairObject[artistOne], pairObject[artistTwo]));

    }

    const responses = await Promise.all(promises);
    console.log("DEBUG RESPONSE: " , responses)

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
  const storedState = req.session[stateKey];  // Retrieve state from session

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    delete req.session[stateKey];  // Remove state from session
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
        req.session.access_token = body.access_token;
        req.session.refresh_token = body.refresh_token;

        const options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + req.session.access_token },
          json: true
        };

        // Use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });
        res.redirect('/#' +
          querystring.stringify({
            access_token: req.session.access_token,
            refresh_token: req.session.refresh_token
          }));
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
  const refresh_token = req.session.refresh_token;
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
      req.session.access_token = body.access_token;
      res.send({
        'access_token': req.session.access_token
      });
    }
  });
});

console.log('Listening on port ' + port + '...');
app.listen(process.env.PORT || port);

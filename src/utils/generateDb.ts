import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Consolidated real game titles for each system from the user's filesystem
const gbList = [
  "Addams Family, The - Pugsley's Scavenger Hunt (USA, Europe).gb",
  "Adventure Island (USA, Europe).gb",
  "Adventure Island 3.gb",
  "Adventure Island II - Aliens in Paradise (USA, Europe).gb",
  "Aerostar (USA, Europe).gb",
  "Asterix (Europe) (En,Fr,De,Es,It).gb",
  "Battle Pingpong (Japan).gb",
  "Bomb Jack (Europe).gb",
  "Bugs Bunny, The - Crazy Castle (USA, Europe) ROM.gb",
  "Castlevania Adventure, The (USA).gb",
  "Castlevania II - Belmont's Revenge (USA, Europe).gb",
  "Castlevania Legends (USA, Europe).gb",
  "Chessmaster, The (Europe).gb",
  "Choplifter III (Europe).gb",
  "Cliffhanger (USA, Europe).gb",
  "Final Fantasy Adventure (USA).gb",
  "Final Fantasy Legend II (USA).gb",
  "Garfield Labyrinth (Europe).gb",
  "Killer Instinct (USA, Europe).gb",
  "Mega Man in Dr. Wily's Revenge (USA).gb",
  "Megaman IV (Europe).gb",
  "Megaman V (Europe).gb",
  "Metroid II - Return of Samus (Europe).gb",
  "Mickey Mouse II (Japan).gb",
  "Ninja Gaiden Shadow (USA).gb",
  "Operation C (USA).gb",
  "Pac-Man (USA).gb",
  "Pokémon - Blue Version (USA, Europe).gb",
  "Pokémon - Red Version (USA, Europe).gb",
  "Rolan's Curse (USA).gb",
  "SD Saint Seiya Paradise (Japan).gb",
  "Sensible Soccer - European Champions (Europe).gb",
  "Snoopy - Magic Show (USA, Europe).gb",
  "Super Mario Land.gb",
  "World Cup USA '94 (Europe) (En,Fr,De,Es,It,Nl,Pt,Sv).gb",
  "Zool (USA).gb"
];

const gbaList = [
  "2 in 1 - Asterix & Obelix - Bash Them All! + Asterix & Obelix XXL.gba",
  "Banjo-Kazooie - Grunty's Revenge.gba",
  "Batman - Rise of Sin Tzu.gba",
  "Batman Begins.gba",
  "Bomberman Tournament.gba",
  "Breath of Fire (Europe).gba",
  "Breath of Fire II.gba",
  "Castlevania - Aria of Sorrow.gba",
  "Castlevania - Circle of the Moon.gba",
  "Castlevania - Harmony of Dissonance.gba",
  "Contra Advance - The Alien Wars EX.gba",
  "Crash Bandicoot - The Huge Adventure.gba",
  "Crash Bandicoot Purple - Ripto's Rampage.GBA",
  "Crazy Taxi - Catch a Ride.gba",
  "Donkey Kong Country 3.gba",
  "Donkey Kong Country.gba",
  "Dragon Ball - Advanced Adventure.gba",
  "Dragon Ball Z - Taiketsu.gba",
  "Dragon Ball Z - The Legacy of Goku.gba",
  "F-Zero - Maximum Velocity.gba",
  "FIFA Soccer 2004.gba",
  "Final Fantasy I & II - Dawn of Souls.gba",
  "Final Fantasy Tactics Advance (Europe).gba",
  "Final Fantasy VI Advance.gba",
  "Ghost Rider.GBA",
  "Grand Theft Auto Advance.gba",
  "Harry Potter and the Order of the Phoenix.gba",
  "Harry Potter and the Sorcerer's Stone.gba",
  "Harvest Moon - Friends of Mineral Town.gba",
  "Justice League - Injustice for All.gba",
  "Justice League Heroes - The Flash (Europe).gba",
  "Kirby & the Amazing Mirror.gba",
  "Lara Croft Tomb Raider - The Prophecy.gba",
  "Mario & Luigi - Superstar Saga.gba",
  "Marvel - Ultimate Alliance.gba",
  "Medal of Honor - Infiltrator.gba",
  "Medal of Honor - Underground.gba",
  "Mega Man & Bass.gba",
  "Mega Man Zero 2.gba",
  "Mega Man Zero 3.gba",
  "Mega Man Zero 4.gba",
  "Mega Man Zero.gba",
  "Metal Slug Advance.gba",
  "Metroid - Zero Mission.gba",
  "Metroid Fusion.gba",
  "Mortal Kombat - Deadly Alliance.gba",
  "Need for Speed - Most Wanted.gba",
  "One Piece.gba",
  "Pirates of the Caribbean - The Curse of the Black Pearl.gba",
  "Pokemon - AshGray 4.5.3.gba",
  "Pokemon - Emerald Version.gba",
  "Pokemon - Fire Red Version (Rev 1).gba",
  "Pokemon - Leaf Green Version.gba",
  "Pokemon - New Hoenn.gba",
  "Pokemon - Ruby Version (Rev 2).gba",
  "Pokemon - Sapphire Version (Rev 2).gba",
  "Pokemon - Water Blue.gba",
  "Pokemon Dark Fire.gba",
  "Pokemon Dark Pearl.gba",
  "Pokemon Light Platinum (BR).gba",
  "Pokemon My Ass.gba",
  "Pokemon Mystery Dungeon - Red Rescue Team.gba",
  "Pokemon Omega Ruby v1.8.gba",
  "Pokemon Resolute Version.gba",
  "Pokemon Ribeirao Pires.gba",
  "Pokemon Shadow Force.gba",
  "Pokemon Stone Dragon.gba",
  "Pokemon Volcano.gba",
  "Pokémon Blue Stars 2.gba",
  "Pokémon Legendary.gba",
  "Prince of Persia - The Sands of Time.gba",
  "R-Type III - The Third Lightning.gba",
  "Rayman 3.gba",
  "Rayman Advance.gba",
  "Sim City 2000.gba",
  "Spider-Man - Mysterio's Menace.gba",
  "Spider-Man 2.gba",
  "Spider-Man 3.gba",
  "Star Wars - Episode III - Revenge of the Sith.gba",
  "Super Ghouls'n Ghosts.gba",
  "Super Mario Advance 2 - Super Mario World.gba",
  "Super Mario Advance.gba",
  "Teenage Mutant Ninja Turtles 2 - Battle Nexus.gba",
  "Tekken Advance.gba",
  "The Legend of Zelda - A Link to the Past & Four Swords.gba",
  "The Legend of Zelda - The Minish Cap.gba",
  "The Lord of the Rings - The Fellowship of the Ring.gba",
  "Tom Clancy's Rainbow Six - Rogue Spear.GBA",
  "Tom Clancy's Splinter Cell - Pandora Tomorrow.gba",
  "Tom Clancy's Splinter Cell.gba",
  "Tony Hawk's American Sk8land.gba",
  "X-Men - The Official Game.gba",
  "X2 - Wolverine's Revenge.gba",
  "Yu Yu Hakusho - Ghostfiles - Spirit Detective.gba",
  "Yu Yu Hakusho - Ghostfiles - Tournament Tactics.gba",
  "Yu-Gi-Oh! - The Eternal Duelist Soul.gba",
  "Yu-Gi-Oh! - The Sacred Cards.gba"
];

const gbcList = [
  "102 Dalmatians - Puppies to the Rescue.gbc",
  "AirForce Delta.gbc",
  "Alone in the Dark - The New Nightmare.gbc",
  "Army Men.gbc",
  "Batman Beyond - Return of the Joker.gbc",
  "Bionic Commando - Elite Forces.gbc",
  "Bomberman Max - Blue Champion.gbc",
  "Buffy - The Vampire Slayer (BR).gbc",
  "Classic Bubble Bobble.gbc",
  "Croc.gbc",
  "Crystalis.gbc",
  "Donkey Kong Country.gbc",
  "Dragon Warrior Monsters.gbc",
  "Driver - You are the Wheelman.gbc",
  "Extreme Ghostbusters.gbc",
  "Flipper & Lopaka.gbc",
  "Fort Boyard.gbc",
  "Gex - Enter the Gecko.gbc",
  "Gremlins Unleashed.gbc",
  "Halloween Racer.gbc",
  "Harry Potter and the Chamber of Secrets.gbc",
  "Harry Potter and the Sorcerer's Stone.gbc",
  "Harvest Moon 2 GBC.gbc",
  "Harvest Moon 3 GBC.gbc",
  "Harvest Moon GB.gbc",
  "Hugo - Black Diamond Fever.gbc",
  "Hugo - The Evil Mirror.gbc",
  "International Superstar Soccer '99.gbc",
  "Kirikou.gbc",
  "Legend of Zelda, The - Link's Awakening DX (Rev B).gbc",
  "Legend of Zelda, The - Oracle of Ages.gbc",
  "Legend of Zelda, The - Oracle of Seasons.gbc",
  "LEGO Alpha Team.gbc",
  "LEGO Island 2 - The Brickster's Revenge.gbc",
  "LEGO Racers.gbc",
  "LEGO Stunt Rally.gbc",
  "Megaman Xtreme 2.gbc",
  "Megaman Xtreme.gbc",
  "MTV Sports - Skateboarding featuring Andy MacDonald.gbc",
  "N.Y. Race.gbc",
  "New Addams Family Series, The.gbc",
  "Perfect Dark.gbc",
  "Pocket Bomberman.gbc",
  "Pocket Monsters Kin.gbc",
  "Pocket Monsters.gbc",
  "Pocket Soccer.gbc",
  "Pokemon - Crystal Version (Rev A).GBC",
  "Pokemon - Gold Version.gbc",
  "Pokemon - Silver Version.gbc",
  "Pokemon Pinball.gbc",
  "Pokemon Puzzle Challenge.gbc",
  "Pokemon Special Pikachu Edition.gbc",
  "Pokemon Trading Card Game.gbc",
  "Power Spike - Pro Beach Volleyball.gbc",
  "Quest RPG - Brian's Journey.gbc",
  "Resident Evil Gaiden.gbc",
  "Return of the Ninja.gbc",
  "Revelations - The Demon Slayer.gbc",
  "Ronaldo V-Soccer.gbc",
  "Shantae.gbc",
  "SnowCross.gbc",
  "Spider-Man 2 - The Sinister Six.gbc",
  "Spider-Man.gbc",
  "Star Wars Episode I - Obi-Wan's Adventures.gbc",
  "Suzuki Alstare Extreme Racing.gbc",
  "Tetris DX (World).gbc",
  "Top Gear Pocket.gbc",
  "Wario Land II.gb",
  "Yu-Gi-Oh! - Dark Duel Stories.gbc"
];

const genesisList = [
  "Ayrton Senna's Super Monaco GP II (USA) (En,Ja).zip",
  "Batman - Revenge of the Joker (USA).zip",
  "Castle of Illusion Starring Mickey Mouse (USA, Europe).zip",
  "Castlevania - Bloodlines (USA).zip",
  "Ghouls 'n Ghosts (USA, Europe).zip",
  "Golden Axe (World) (Rev A).zip",
  "Golden Axe II (World).zip",
  "Golden Axe III (Japan) (En).zip",
  "James Bond 007 - The Duel (USA).zip",
  "Justice League Task Force (World).zip",
  "Mega Man - The Wily Wars (Europe).zip",
  "Michael Jackson's Moonwalker (Japan, USA).zip",
  "Mortal Kombat (World).zip",
  "Ronaldinho '98.zip",
  "Show do Milhao - Vol. 1.zip",
  "Show do Milhao - Vol. 2.zip",
  "Simpsons, The - Bart vs. the Space Mutants (USA, Europe) (Rev A).zip",
  "Simpsons, The - Bart's Nightmare (USA, Europe).zip",
  "Sonic 3D Blast (USA, Europe).zip",
  "Sonic 3D Blast ~ Sonic 3D Flickies' Island (USA, Europe, Korea).zip",
  "Sonic The Hedgehog (USA, Europe).zip",
  "Spider-Man . Venom - Maximum Carnage (World).zip",
  "Spider-Man vs The Kingpin (W) [!].zip",
  "Streets of Rage (World).zip",
  "Streets of Rage 2 (USA).zip",
  "Streets of Rage 3 (USA).zip",
  "Super Monaco GP (Japan, USA) (En,Ja).zip",
  "Super Street Fighter II - The New Challengers (USA).zip",
  "World of Illusion Starring Mickey Mouse and Donald Duck (USA, Korea).zip",
  "X-Men 2 - Clone Wars (USA, Europe).zip",
  "Yu Yu Hakusho Sunset Fighters.zip"
];

const n64List = [
  "007 GoldenEye.z64",
  "Automobili Lamborghini.z64",
  "Banjo-Kazooie.n64",
  "Diddy Kong Racing.z64",
  "Doom 64.z64",
  "FIFA 99.n64",
  "Mario Kart 64.v64",
  "Perfect Dark.z64",
  "Pokemon Stadium.z64",
  "South Park.z64",
  "Super Mario 64.z64",
  "The Legend of Zelda - Majora's Mask.z64",
  "The Legend of Zelda - Ocarina of Time.z64"
];

const nesList = [
  "Balloon Fight.nes",
  "1943 - The Battle of Midway (USA).nes",
  "8 Eyes (USA).nes",
  "Abadox - The Deadly Inner War (USA).nes",
  "Addams Family, The (USA).nes",
  "Advanced Dungeons & Dragons - DragonStrike (USA).nes",
  "Adventures of Lolo 3 (USA).nes",
  "Akumajou Densetsu (J).nes",
  "Amagon (USA).nes",
  "Archon (USA).nes",
  "Argos no Senshi.nes",
  "Arkanoid (USA).nes",
  "Armadillo.nes",
  "Astyanax (USA).nes",
  "Balloon Fight (USA).nes",
  "Batman - Return of the Joker (USA).nes",
  "Batman - The Video Game (USA).nes",
  "Batman Returns (USA).nes",
  "Battle City.nes",
  "Battleship (USA).nes",
  "Battletoads (USA).nes",
  "Binary Land.nes",
  "Bionic Commando (USA).nes",
  "Blaster Master (USA).nes",
  "Bomber King (J).nes",
  "Bomberman (USA).nes",
  "Bomberman II (USA).nes",
  "Bram Stoker's Dracula (USA).nes",
  "Bubble Bobble Part 2 (USA).nes",
  "Bucky O'Hare (USA).nes",
  "Captain America and the Avengers (USA).nes",
  "Captain Comic - The Adventure (USA) (Unl).nes",
  "Captain Planet and the Planeteers (USA).nes",
  "Castlevania (USA).nes",
  "Castlevania II - Simon's Quest (USA).nes",
  "Castlevania III - Dracula's Curse (USA).nes",
  "Challenger (USA).nes",
  "Chip 'n Dale - Rescue Rangers (USA).nes",
  "Circus Charlie (USA).nes",
  "Clash at Demonhead (USA).nes",
  "Clu Clu Land (World).nes",
  "Code Name - Viper (USA).nes",
  "Commando (USA).nes",
  "Conquest of the Crystal Palace (USA).nes",
  "Contra (USA).nes",
  "Contra Force (USA).nes",
  "Crisis Force (USA).nes",
  "Cross Fire (USA).nes",
  "Crystalis (USA).nes",
  "Darkwing Duck (USA).nes",
  "Dig Dug (USA).nes",
  "Donkey Kong (World).nes",
  "Donkey Kong Jr. (World).nes",
  "Double Dragon (USA).nes",
  "Double Dragon II - The Revenge (USA).nes",
  "Double Dragon III - The Sacred Stones (USA).nes",
  "Dr. Mario (Japan, USA).nes",
  "Dragon Ball - Shen Long no Nazo (J).nes",
  "Dragon Ball Z - Kyoushuu! Saiya Jin (J).nes",
  "Dragon Ninja (USA).nes",
  "Dragon Spirit - The New Legend (USA).nes",
  "Dragon Warrior (USA).nes",
  "Dragon Warrior III (USA).nes",
  "DuckTales (USA).nes",
  "DuckTales 2 (USA).nes",
  "Excitebike (Japan, USA).nes",
  "Faxanadu (USA).nes",
  "Felix the Cat (USA).nes",
  "Final Fantasy (USA).nes",
  "Final Fantasy 3 (J).nes",
  "Final Fantasy II (USA).nes",
  "Final Mission (USA).nes",
  "Fire Emblem - Ankoku Ryuu to Hikari no Tsurugi.nes",
  "Flintstones, The - The Rescue of Dino & Hoppy (USA).nes",
  "Flintstones, The - The Surprise at Dinosaur Peak! (USA).nes",
  "Frankenstein - The Monster Returns (USA).nes",
  "Fuzzical Fighter (J).nes",
  "G.I. Joe - A Real American Hero (USA).nes",
  "G.I. Joe - The Atlantis Factor (USA).nes",
  "Galaga - Demons of Death (USA).nes",
  "Galaxian.nes",
  "Ghosts'n Goblins (USA).nes",
  "Gradius (USA).nes",
  "Gradius II (USA).nes",
  "Gun Nac (USA).nes",
  "Gun.Smoke (USA).nes",
  "Gyruss (USA).nes",
  "Hokuto no Ken 2.nes",
  "Hokuto no Ken.nes",
  "Honoo no Toukyuuji - Dodge Danpei.nes",
  "Hudson Hawk (USA).nes",
  "Hudson's Adventure Island (USA).nes",
  "Hudson's Adventure Island II (USA).nes",
  "Ice Climber (USA, Europe).nes",
  "Immortal, The (USA).nes",
  "J.League Winning Goal (Brasileirão).nes",
  "Jackal (USA).nes",
  "Jackie Chan's Action Kung Fu (USA).nes",
  "Jetsons, The - Cogswell's Caper (USA).nes",
  "Journey to Silius (USA).nes",
  "Jurassic Park (USA).nes",
  "Juuouki (J).nes",
  "Kabuki - Quantum Fighter (USA).nes",
  "Kid Icarus (USA, Europe).nes",
  "Krion Conquest, The (USA).nes",
  "Kung Fu (Japan, USA).nes",
  "Legend of Zelda, The (USA).nes",
  "Little Mermaid, The (USA).nes",
  "Little Nemo - The Dream Master (USA).nes",
  "Lode Runner (USA).nes",
  "Lunar Pool (USA).nes",
  "Mach Rider (Japan, USA).nes",
  "Mappy (USA).nes",
  "Mappy-Land (USA).nes",
  "Mario Runner 2.nes",
  "Mario Runner.nes",
  "Mega Man (USA).nes",
  "Mega Man 2 (USA).nes",
  "Mega Man 3 (USA).nes",
  "Mega Man 4 (USA).nes",
  "Mega Man 5 (USA).nes",
  "Mega Man 6 (USA).nes",
  "Metal Gear (USA).nes",
  "Metroid (USA).nes",
  "Mighty Final Fight (USA).nes",
  "Mike Tyson's Punch-Out!! (Japan, USA).nes",
  "Mitsume ga Tooru.nes",
  "Monster in My Pocket (USA).nes",
  "Moon Crystal (J).nes",
  "Ms. Pac-Man (USA).nes",
  "Nightmare on Elm Street, A (USA).nes",
  "Nightshade (USA).nes",
  "Ninja Crusaders (USA).nes",
  "Ninja Gaiden (USA).nes",
  "Ninja Gaiden II - The Dark Sword of Chaos (USA).nes",
  "Ninja GaidenIII - The Ancient Ship of Doom (USA).nes",
  "Nuts & Milk.nes",
  "Omeka.nes",
  "Othello (USA).nes",
  "P.O.W. - Prisoners of War (USA).nes",
  "Pac-Man (USA).nes",
  "Pipe Dream (USA).nes",
  "Pooyan.nes",
  "Power Blade 2 (USA).nes",
  "Power Blazer (J).nes",
  "Predator (USA).nes",
  "Q-bert (USA).nes",
  "River City Ransom (USA).nes",
  "Road Fighter (Europe).nes",
  "RoboCop (USA).nes",
  "Rockin' Kats (USA).nes",
  "Rockman (J).nes",
  "Rollergames (USA).nes",
  "Rolling Thunder (USA) (Unl).nes",
  "Roto Runner (Load Runner Hack).nes",
  "Rygar (USA).nes",
  "Saint Seiya - Ougon Densetsu Kanketsu Hen.nes",
  "SCAT -Special cibernetic attack team (USA).nes",
  "SD Hero Soukessen - Taose! Aku no Gundan.nes",
  "Shadow of the Ninja (USA).nes",
  "Shadowgate (USA).nes",
  "Shinobi (USA) (Unl).nes",
  "Silver Surfer (USA).nes",
  "Soccer (World).nes",
  "Solstice - The Quest for the Staff of Demnos (USA).nes",
  "Spelunker (USA).nes",
  "Splatter House - Wanpaku Graffiti (J).nes",
  "Star Gate.nes",
  "Star Voyager (USA).nes",
  "Star Wars (USA).nes",
  "Street Fighter 2010 - The Final Fight (USA).nes",
  "Strider (USA).nes",
  "Super Arabian (J).nes",
  "Super C (USA).nes",
  "Super Mario Bros. (World).nes",
  "Super Mario Bros. 2 (USA).nes",
  "Super Mario Bros. 3 (USA).nes",
  "Super Mario Kart Raider (Unl).nes",
  "Super Mario USA.nes",
  "Super Pitfall (USA).nes",
  "Sweet Home (J).nes",
  "Takeshikun (Lode Runner Hack).nes",
  "Tatakae! Chou Robot Seimeitai Transformers - Convoy no Nazo.nes",
  "Teenage Mutant Ninja Turtles (USA).nes",
  "Teenage Mutant Ninja Turtles II - The Arcade Game (USA).nes",
  "Teenage Mutant Ninja Turtles III - The Manhattan Project (USA).nes",
  "Tennis (Japan, USA).nes",
  "Terminator 2 - Judgment Day (USA).nes",
  "Tetris (USA).nes",
  "Time Lord (USA).nes",
  "Tiny Toon Adventures (USA).nes",
  "Todos Contra TCHECO 2.0 by Macbee (Rockin' Kats Hack).nes",
  "Toki (USA).nes",
  "Tokkyuu Shirei Solbrain.nes",
  "Totally Rad (USA).nes",
  "Tower of Druaga.nes",
  "Track & Field (USA).nes",
  "Track & Field II (USA).nes",
  "Trojan (USA).nes",
  "Volleyball (USA, Europe).nes",
  "Werewolf - The Last Warrior (USA).nes",
  "Willow (USA).nes",
  "Wolverine (USA).nes",
  "Yo! Noid (USA).nes",
  "Zanac (USA).nes",
  "Zelda II - The Adventure of Link (USA).nes"
];

const smsList = [
  "Action Fighter (USA, Europe).sms",
  "Aerial Assault (USA).sms",
  "Air Rescue (Europe).sms",
  "Aladdin (Europe).sms",
  "Alex Kidd - High-Tech World (USA, Europe).sms",
  "Alex Kidd in Miracle World (USA, Europe).sms",
  "Alex Kidd in Shinobi World (USA, Europe).sms",
  "Alien Syndrome (USA, Europe).sms",
  "Altered Beast (USA, Europe).sms",
  "Andre Agassi Tennis (Europe).sms",
  "Argos no Juujiken (Japan).sms",
  "Ayrton Senna's Super Monaco GP II (Europe).sms",
  "Black Belt (USA, Europe).sms",
  "Blade Eagle (World).sms",
  "Bomber Raid (World).sms",
  "Bram Stoker's Dracula (Europe).sms",
  "California Games (USA, Europe).sms",
  "Castelo Ra-Tim-Bum (Brazil).sms",
  "Castle of Illusion Starring Mickey Mouse (USA).sms",
  "Chapolim x Dracula - Um Duelo Assustador (Brazil).sms",
  "Choplifter (USA, Europe).sms",
  "Cloud Master (USA, Europe).sms",
  "Columns (USA, Europe).sms",
  "Cyborg Hunter (USA, Europe).sms",
  "Daffy Duck in Hollywood (Europe).sms",
  "Dragon - The Bruce Lee Story (Europe).sms",
  "E-SWAT - City Under Siege (USA, Europe).sms",
  "Enduro Racer (USA, Europe).sms",
  "Ferias Frustradas do Pica Pau (Brazil).sms",
  "FIFA International Soccer (Brazil).sms",
  "Gain Ground (Europe).sms",
  "Game Box Serie Esportes Radicais (Brasil).sms",
  "Geraldinho (Brazil).sms",
  "Ghost House (USA, Europe).sms",
  "Ghouls'n Ghosts (USA, Europe).sms",
  "Golden Axe Warrior.sms",
  "Golvellius - Valley of Doom.sms",
  "Hang-On.sms",
  "Hook (Europe) (Proto).sms",
  "James Bond 007 - The Duel (Europe).sms",
  "Jungle Book, The (Europe).sms",
  "Kenseiden (USA, Europe).sms",
  "Lord of the Sword (USA, Europe).sms",
  "Lucky Dime Caper Starring Donald Duck, The (Europe).sms",
  "Magali no Castelo do Dragao (Monica no Castelo Hack).sms",
  "Master of Darkness (Europe).sms",
  "Monica 3 (WonderBoy in MW Hack).sms",
  "Monica no Castelo do Dragao (Brazil).sms",
  "Mortal Kombat (Europe).sms",
  "Ninja Gaiden (Europe).sms",
  "Olympic Gold (Europe).sms",
  "OutRun Europa (Europe).sms",
  "Phantasy Star (USA, Europe).sms",
  "Psychic World (Europe).sms",
  "Psycho Fox (USA, Europe).sms",
  "R-Type (World).sms",
  "R.C. Grand Prix (USA, Europe).sms",
  "Renegade (Europe).sms",
  "Rodrigo O Resgate (Wonder Boy Hack).sms",
  "Rygar.sms",
  "Sapo Xule - O Mestre do Kung Fu (Brazil).sms",
  "Sapo Xule - S.O.S Lagoa Poluida (Brazil).sms",
  "Sapo Xule vs. Os Invasores do Brejo (Brazil).sms",
  "Sega Chess (Europe).sms",
  "Shinobi (USA, Europe).sms",
  "Sitio do Picapau Amarelo (Brazil).sms",
  "Streets of Rage II (Europe).sms",
  "Strider (USA, Europe).sms",
  "Summer Games (Europe).sms",
  "Super Kick Off (Europe).sms",
  "Superman - The Man of Steel (Europe).sms",
  "Taz-Mania (Europe).sms",
  "Time Soldiers (USA, Europe).sms",
  "Tom and Jerry - The Movie (Europe).sms",
  "Treinamento Do Guerreiro Lobo (Wonder Boy in MW Hack).sms",
  "Turma da Monica 3 v01 (Monster World III Hack).sms",
  "Turma da Monica em O Resgate (Brazil).sms",
  "TV Colosso (Brazil).sms",
  "Where in the World is Carmen Sandiego (USA).sms",
  "Winter Olympics - Lillehammer '94 (Europe).sms",
  "World Cup Italia '90 (Europe).sms",
  "Zillion (USA).sms",
  "Zillion II - The Tri Formation (World).sms"
];

const snesList = [
  "3 Ninjas Kick Back (USA).zip",
  "7th Saga, The (USA).zip",
  "Aaahh!!! Real Monsters (USA).zip",
  "ActRaiser (USA).zip",
  "ActRaiser 2 (USA).zip",
  "Addams Family, The - Pugsley's Scavenger Hunt (USA).zip",
  "Adventures of Dr. Franken, The (USA).zip",
  "Aero Fighters (USA).zip",
  "Aerobiz (USA).zip",
  "Air Cavalry.zip",
  "Aladdin (USA).zip",
  "Alcahest.zip",
  "Alien 3 (USA).zip",
  "Alien vs. Predator (USA).zip",
  "Animaniacs (USA).zip",
  "Arcana (USA).zip",
  "Arkanoid - Doh It Again (USA).zip",
  "Bahamut Lagoon (Japan).zip",
  "Battle Cars.zip",
  "Battle Soccer - Field no Hasha (Japan) (Translated En).zip",
  "Battletoads & Double Dragon (USA).zip",
  "Battletoads in Battlemaniacs (USA).zip",
  "Biker Mice from Mars (USA).zip",
  "BioMetal (USA).zip",
  "Bishoujo Senshi Sailor Moon R (Japan) (Translated En).zip",
  "Blackthorne (USA).zip",
  "Blues Brothers, The (USA).zip",
  "Bobby's World (USA) (Proto).zip",
  "Bonkers (USA).zip",
  "Brain Lord (USA).zip",
  "Brainies, The (USA).zip",
  "Brandish (USA).zip",
  "Breath of Fire (USA).zip",
  "Breath of Fire II (USA).zip",
  "BS Legend of Zelda, The (Japan) (Translated En).zip",
  "BS Radical Dreamers.zip",
  "Bubsy II (USA).zip",
  "Bubsy in Claws Encounters of the Furred Kind (USA).zip",
  "Bugs Bunny - Rabbit Rampage (USA).zip",
  "Captain America and the Avengers (USA).zip",
  "Captain Commando (USA).zip",
  "Captain Tsubasa V - Hasha no Shougou Campione (Japan) (Translated Pt).zip",
  "Castlevania - Dracula X (USA).zip",
  "Choplifter III - Rescue & Survive (USA).zip",
  "Chrono Trigger (USA).zip",
  "Civilization (USA).zip",
  "Claymates (USA).zip",
  "Cliffhanger (USA).zip",
  "Clock Tower (Japan) (Translated En).zip",
  "Combatribes, The (USA).zip",
  "Contra III - The Alien Wars (USA).zip",
  "Cool Spot (USA).zip",
  "Cooly Skunk.zip",
  "Cutthroat Island (USA).zip",
  "Cybernator (USA).zip",
  "Daffy Duck - The Marvin Missions (USA).zip",
  "Dark Half (JP).zip",
  "Daze Before Christmas (Europe).zip",
  "Death and Return of Superman, The (USA).zip",
  "Demolition Man (USA).zip",
  "Demon's Crest (USA).zip",
  "Disney’s Pinocchio.zip",
  "Donkey Kong Country (USA).zip",
  "Donkey Kong Country 2 - Diddy's Kong Quest (USA).zip",
  "Donkey Kong Country 3 - Dixie Kong's Double Trouble! (USA).zip",
  "Dottie dreads nought.zip",
  "Dragon - The Bruce Lee Story (USA).zip",
  "Dragon Ball Z - Hyper Dimension (France).zip",
  "Dragon Ball Z - La Legende Saien (France).zip",
  "Dragon Ball Z - Super Butouden (France).zip",
  "Dragon Ball Z - Super Saiya Densetsu (Japan) (Translated En).zip",
  "Dragon Ball Z - Ultime Menace (France).zip",
  "Dragon Quest I & II (Japan) (Translated En).zip",
  "Dragon Quest III - Soshite Densetsu e... (Japan) (Translated En).zip",
  "Dragon's Lair (USA).zip",
  "E.V.O. - Search for Eden (USA).zip",
  "EarthBound (USA).zip",
  "Earthworm Jim 2 (USA).zip",
  "F-zero.zip",
  "Final Fantasy - Mystic Quest (USA).zip",
  "Final Fantasy II (USA).zip",
  "Final Fantasy III (USA).zip",
  "Final Fantasy IV (Japan) (Translated En).zip",
  "Final Fantasy V (Japan) (Translated En).zip",
  "Final Fantasy VI (Japan) (Translated En).zip",
  "Final Fight (USA).zip",
  "Final Fight 2 (USA).zip",
  "Final Fight 3 (USA).zip",
  "Final Fight Guy (USA).zip",
  "Fire Striker (USA).zip",
  "Firepower 2000 (USA).zip",
  "Flashback - The Quest for Identity (USA).zip",
  "Front Mission (Japan) (Translated En).zip",
  "Front Mission - Gun Hazard (Japan) (Translated En).zip",
  "Futebol Brasileiro '96.zip",
  "Ganpuru - Gunman's Proof (Japan) (Translated En).zip",
  "Ghoul Patrol.zip",
  "Go Go Ackman (Japan) (Translated En).zip",
  "Go Go Ackman 3 (Japan).zip",
  "Goof Troop (USA).zip",
  "GP-1 - Part II (USA).zip",
  "Gradius III (USA).zip",
  "Great Circus Mystery Starring Mickey & Minnie, The (USA).zip",
  "Hameln no Violin Hiki (Japan) (Translated En).zip",
  "Harley's Humongous Adventure (USA).zip",
  "Harvest Moon (USA).zip",
  "Hyper V-Ball (USA).zip",
  "Ignition Factor, The (USA).zip",
  "Illusion of Gaia (USA).zip",
  "Inazuma Serve da! Super Beach Volley (Japan).zip",
  "Inindo - Way of the Ninja (USA).zip",
  "Inspector Gadget (USA).zip",
  "International Super Star Soccer Deluxe - Futebol Brasileiro 2007.zip",
  "International Super Star Soccer Deluxe - Futebol Brasileiro 2008.zip",
  "International Super Star Soccer Deluxe - Ronaldinho Soccer 97.zip",
  "International Super Star Soccer Deluxe - World Cup France 98.zip",
  "International Superstar Soccer Deluxe (Narração Milto.zip",
  "Iron Commando - Koutetsu no Senshi (Japan).zip",
  "J.R.R. Tolkien's The Lord of the Rings - Volume 1 (USA).zip",
  "Jelly Boy (Europe).zip",
  "Jelly Boy 2 (Japan) (Proto) (Translated En).zip",
  "Jetsons, The - Invasion of the Planet Pirates (USA).zip",
  "Joe & Mac 2 - Lost in the Tropics (USA).zip",
  "Jungle Book, The (USA).zip",
  "Jurassic Park II - The Chaos Continues (USA).zip",
  "Kendo Rage (USA).zip",
  "Killer Instinct (USA).zip",
  "King Arthur's World (USA).zip",
  "King of Dragons, The (USA).zip",
  "Knights of the Round (USA).sfc.zip",
  "Lamborghini American Challenge (USA).zip",
  "Last Action Hero (USA).zip",
  "Legend (USA).zip",
  "Legend of Zelda, The - A Link to the Past (USA).zip",
  "Lemmings (USA).zip",
  "Lion King, The (USA).zip",
  "Live A Live (Japan) (Translated En).zip",
  "Looney Tunes B-Ball (USA).zip",
  "Lost Vikings 2 (USA).zip",
  "Lost Vikings, The (USA).zip",
  "Lufia & The Fortress of Doom (USA).zip",
  "Madou Monogatari - Hanamaru Daiyouchienji (Japan) (Translated En).zip",
  "Magic Knight Rayearth (J).zip",
  "Magical Pop'n (Japan) (Translated En).zip",
  "Magical Quest Starring Mickey Mouse, The (USA).zip",
  "Mahou Kishi Rayearth (Japan) (Translated En).zip",
  "Majuu Ou (Japan) (Translated En).zip",
  "Marvel Super Heroes - War of the Gems (USA).zip",
  "Mask, The (USA).zip",
  "Mega Man 7 (USA).zip",
  "Mega Man X (USA).zip",
  "Mega Man X2 (USA).zip",
  "Mega Man X3 (USA).zip",
  "Megaman & Bass (PT-BR).zip",
  "Metal Warriors (USA).zip",
  "Mickey Mania - The Timeless Adventures of Mickey Mouse (USA).zip",
  "Mickey no Tokyo Disneyland Daibouken (Japan).zip",
  "Mickey to Donald - Magical Adventure 3 (Japan) (Translated En).zip",
  "Monstania (Japan) (Translated En).zip",
  "Mortal Kombat (USA).zip",
  "Mortal Kombat 3 (USA).zip",
  "Mortal Kombat II.zip",
  "NBA Live 95 (USA).zip",
  "Neugier Umi to Kaze no Kodō.zip",
  "Ninja Gaiden Trilogy (USA).zip",
  "Ogre Battle - The March of the Black Queen (USA).zip",
  "Panic in Nakayoshi World (Japan) (Translated En).zip",
  "Paperboy 2 (USA).zip",
  "Pirates of Dark Water, The.zip",
  "Pitfall - The Mayan Adventure.zip",
  "Popeye - Ijiwaru Majo Sea Hag no Maki (Japan) (Translated En).zip",
  "Power Drive (Europe).zip",
  "Prince of Persia (USA).zip",
  "Prince of Persia 2 - The Shadow & The Flame (USA).zip",
  "Radical Dreamers.zip",
  "Raiden Trad (USA).zip",
  "Ranma 1-2 - Akanekodan Teki Hihou (Japan) (Translated En).zip",
  "Rock n' Roll Racing (USA).zip",
  "Rockman & Forte (J).zip",
  "Rocko's Modern Life - Spunky's Dangerous Day.zip",
  "Romancing SaGa 3 (Japan) (Translated En).zip",
  "Ronaldinho futebol brasileiro 2011(unl).zip",
  "Ronaldinho Soccer 97.zip",
  "Rudra no Hihou (Japan) (Translated En).zip",
  "Rushing Beat Shura (Japan).zip",
  "Saturday Night Slam Masters.zip",
  "Scooby-Doo Mystery (USA).zip",
  "Secret of Evermore (USA).zip",
  "Secret of Mana (USA).zip",
  "Secret of the Stars.zip",
  "Seiken Densetsu 3 (Japan) (Translated En).zip",
  "Shadow, The (USA) (Proto).zip",
  "Shadowrun (USA).zip",
  "Shin Kidou Senki Gundam W - Endless Duel (Japan) (Translated En).zip",
  "Side Pocket (USA).zip",
  "SimCity (USA).zip",
  "Skyblazer (USA).zip",
  "Snoopy Concert (Japan) (Translated En).zip",
  "Soldiers of Fortune (USA).zip",
  "Sonic the Hedgehog.zip",
  "Space Ace (USA).zip",
  "Sparkster (USA).zip",
  "Spawn (USA).zip",
  "Speedy Gonzales - Los Gatos Bandidos (USA).zip",
  "SpellCraft (USA) (Proto).zip",
  "Spider-Man & Venom - Separation Anxiety (USA).zip",
  "Spider-Man and the X-Men - Arcade's Revenge (USA).zip",
  "Star Fox (USA).zip",
  "Star Fox 2 (Japan) (Proto) (Translated En).zip",
  "Star Ocean (Japan) (Translated En).zip",
  "Stargate.zip",
  "Stone Protectors.zip",
  "Street Fighter II (USA).zip",
  "Street Fighter II Turbo - Hyper Fighting.zip",
  "Strike Gunner.zip",
  "Sunset Riders (USA).zip",
  "Super Aleste.zip",
  "Super Bomberman 2 (USA).zip",
  "Super Castlevania IV (USA).zip",
  "Super Copa (Brazil) (Es,Pt).zip",
  "Super Mario All-Stars (USA).zip",
  "Super Mario All-Stars + Super Mario World (USA).zip",
  "Super Mario Kart (USA).zip",
  "Super Mario RPG - Legend of the Seven Stars (USA).zip",
  "Super Mario World (USA).zip",
  "Super Mario World 2 - Yoshi's Island (USA).zip",
  "Super Metroid (Japan, USA).zip",
  "Super Morph (Europe).zip",
  "Super R-Type (USA).zip",
  "Super Soccer (USA).zip",
  "Super Street Fighter II (USA).zip",
  "Tales of Phantasia (Japan) (Translated En).zip",
  "Tecmo Secret of the Stars (USA).zip",
  "Teenage Mutant Ninja Turtles - Tournament Fighters (USA).zip",
  "Teenage Mutant Ninja Turtles IV - Turtles in Time (USA).zip",
  "Tenchi Muyou! - Game Hen (Japan) (Translated En).zip",
  "Terranigma (Europe).zip",
  "The Ignition Factor.zip",
  "Theme Park (Europe).zip",
  "Tick, The (USA).zip",
  "Time Slip (USA).zip",
  "Timecop (USA).zip",
  "Tiny Toon Adventures - Wacky Sports Challenge (USA).zip",
  "Tom & Jerry (USA).zip",
  "Top Gear (USA).zip",
  "Top Gear 2 (USA).zip",
  "Top Gear 3000 (USA).zip",
  "Treasure of Rudras.zip",
  "Trials of Mana.zip",
  "True Lies (USA).zip",
  "TwinBee - Rainbow Bell Adventure (Japan) (Translated En).zip",
  "U.N. Squadron (USA).zip",
  "Ultimate Mortal Kombat 3.zip",
  "Umihara Kawase (Japan) (Translated En).zip",
  "Warlock (USA).zip",
  "Winter Olympic Games - Lillehammer '94 (USA).zip",
  "Wolfchild (USA).zip",
  "Wonder Project J - Kikai no Shounen Pino (Japan) (Translated En).zip",
  "World Cup France 98.zip",
  "World Cup USA 94 (USA).zip",
  "Worms (Europe).zip",
  "X-Men - Mutant Apocalypse (USA).zip"
];

const MASTER_TEMPLATES = {
  snes: {
    name: "Super Nintendo",
    shortName: "snes",
    logo: "SNES",
    badgeColor: "bg-[#3C3C9C] border-indigo-500 text-white hover:shadow-[0_0_15px_rgba(60,60,156,0.4)]",
    releaseYear: "1990",
    manufacturer: "Nintendo",
    backgroundImage: "/systems/snes.svg",
    themeColor: "from-[#3C3C9C] to-black",
    emulatorCore: "snes9x",
    list: snesList
  },
  gb: {
    name: "Game Boy",
    shortName: "gb",
    logo: "Game Boy",
    badgeColor: "bg-[#047857] border-emerald-600 text-emerald-50 hover:shadow-[0_0_15px_rgba(4,120,87,0.4)]",
    releaseYear: "1989",
    manufacturer: "Nintendo",
    backgroundImage: "/systems/gb.svg",
    themeColor: "from-[#0F766E] to-[#022C22]",
    emulatorCore: "gambatte",
    list: gbList
  },
  gba: {
    name: "Game Boy Advance",
    shortName: "gba",
    logo: "GBA",
    badgeColor: "bg-[#9333EA] border-purple-500 text-white hover:shadow-[0_0_15px_rgba(147,51,234,0.4)]",
    releaseYear: "2001",
    manufacturer: "Nintendo",
    backgroundImage: "/systems/gba.svg",
    themeColor: "from-[#5B21B6] to-[#0D1B2A]",
    emulatorCore: "mgba",
    list: gbaList
  },
  gbc: {
    name: "Game Boy Color",
    shortName: "gbc",
    logo: "GBC",
    badgeColor: "bg-[#C084FC] border-fuchsia-450 text-white hover:shadow-[0_0_15px_rgba(192,132,252,0.4)]",
    releaseYear: "1998",
    manufacturer: "Nintendo",
    backgroundImage: "/systems/gbc.svg",
    themeColor: "from-[#A21CAF] to-[#0F172A]",
    emulatorCore: "gambatte",
    list: gbcList
  },
  genesis: {
    name: "Sega Genesis / Mega Drive",
    shortName: "megadrive",
    logo: "Genesis",
    badgeColor: "bg-[#111111] border-neutral-600 text-white hover:shadow-[0_0_15px_rgba(17,17,17,0.4)]",
    releaseYear: "1988",
    manufacturer: "Sega",
    backgroundImage: "/systems/genesis.svg",
    themeColor: "from-[#222222] to-black",
    emulatorCore: "genesis_plus_gx",
    list: genesisList
  },
  n64: {
    name: "Nintendo 64",
    shortName: "n64",
    logo: "N64",
    badgeColor: "bg-[#3B82F6] border-blue-400 text-white hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]",
    releaseYear: "1996",
    manufacturer: "Nintendo",
    backgroundImage: "/systems/n64.svg",
    themeColor: "from-[#1E3A8A] to-black",
    emulatorCore: "mupen64plus_next",
    list: n64List
  },
  nes: {
    name: "Nintendo Entertainment System",
    shortName: "nes",
    logo: "NES",
    badgeColor: "bg-[#E60012] border-red-500 text-white hover:shadow-[0_0_15px_rgba(230,0,18,0.4)]",
    releaseYear: "1983",
    manufacturer: "Nintendo",
    backgroundImage: "/systems/nes.svg",
    themeColor: "from-[#E60012] to-black",
    emulatorCore: "fceumm",
    list: nesList
  },
  sms: {
    name: "Sega Master System",
    shortName: "sms",
    logo: "Master System",
    badgeColor: "bg-[#0000AA] border-blue-650 text-white hover:shadow-[0_0_15px_rgba(0,0,170,0.4)]",
    releaseYear: "1985",
    manufacturer: "Sega",
    backgroundImage: "/systems/sms.svg",
    themeColor: "from-[#0000AA] to-black",
    emulatorCore: "genesis_plus_gx",
    list: smsList
  }
};

function cleanGameTitle(base: string): string {
  let title = base
    .replace(/\[.*?\]/gi, '') // remove os colchetes Ex: [PT-BR]
    .replace(/\(.*?\)/gi, '') // remove os parênteses Ex: (USA) (Rev 1)
    .replace(/\bROM\b/gi, '') // remove a palavra isolada ROM
    .replace(/_/g, ' ')
    .trim();

  // Limpa hifens duplos ou isolados redundantes
  title = title.replace(/\s+-\s+/g, ' - ').replace(/\s+/g, ' ').trim();

  // Conserta artigos no fim como ", The" ou ", A" (Ex: Addams Family, The -> The Addams Family)
  if (title.toUpperCase().endsWith(', THE')) {
    title = 'The ' + title.substring(0, title.length - 5).trim();
  }
  if (title.toUpperCase().endsWith(', A')) {
    title = 'A ' + title.substring(0, title.length - 3).trim();
  }

  // Capitalização limpa
  return title;
}

function getGameSpecs(sysId: string, rawTitle: string) {
  const title = rawTitle.toLowerCase();
  
  let genre = "Ação / Clássico";
  let year = "1994";
  let dev = "Retro Creator";
  let pub = "Retro Classic";
  let desc = `Um clássico nostálgico memorável, pronto para rodar com emulação ultra fluida, controles responsivos e som original fiel de época.`;

  // Defaults baseados em sistema
  if (sysId === 'nes') {
    year = '1987';
    dev = 'NES Division';
    pub = 'Nintendo';
  } else if (sysId === 'snes') {
    year = '1992';
    dev = 'SNES Team';
    pub = 'Nintendo';
  } else if (sysId === 'n64') {
    year = '1997';
    dev = 'Nintendo R&D3';
    pub = 'Nintendo';
  } else if (sysId === 'gba') {
    year = '2002';
    dev = 'GBA Team';
    pub = 'Nintendo';
  } else if (sysId === 'gb' || sysId === 'gbc') {
    year = '1995';
    dev = 'Game Freak';
    pub = 'Nintendo';
  } else if (sysId === 'genesis' || sysId === 'sms') {
    year = '1991';
    dev = 'SEGA AM2';
    pub = 'Sega';
  }

  const matchers = [
    {
      keys: ['mario', 'yoshi', 'luigi', 'peach', 'wario', 'toad', 'dr. mario'],
      genre: 'Plataforma / Aventura',
      dev: 'Nintendo EAD',
      pub: 'Nintendo',
      desc: 'Entre no Reino dos Cogumelos em uma aventura de plataforma fascinante cheia de canos secretos, power-ups icônicos e saltos precisos memoráveis.'
    },
    {
      keys: ['zelda', 'link\'s awakening', 'minish cap', 'ocarina', 'majora'],
      genre: 'Aventura / RPG',
      dev: 'Nintendo EAD',
      pub: 'Nintendo',
      desc: 'Explore masmorras perigosas, colete equipamentos icônicos e lute contra as forças das trevas para restaurar a paz no reino lendário de Hyrule.'
    },
    {
      keys: ['metroid'],
      genre: 'Metroidvania / Ação',
      dev: 'Nintendo R&D1',
      pub: 'Nintendo',
      desc: 'Explore labirintos futuristas sombrios e claustrofóbicos sob o controle da destemida caçadora de recompensas Samus Aran no ameaçador planeta Zebes.'
    },
    {
      keys: ['pokemon', 'pocket monster'],
      genre: 'RPG / Colecionável',
      dev: 'Game Freak',
      pub: 'Nintendo',
      desc: 'Capture, treine e batalhe com os monstros colecionáveis mais famosos do mundo nas ligas competitivas clássicas deste RPG portátil lendário.'
    },
    {
      keys: ['sonic'],
      genre: 'Plataforma de Velocidade',
      dev: 'Sonic Team',
      pub: 'Sega',
      desc: 'Corra em loops vertiginosos e colete argolas brilhantes em alta velocidade na clássica campanha do ouriço mais rápido da terra contra o Dr. Robotnik.'
    },
    {
      keys: ['castlevania', 'belmont', 'symphony of the night'],
      genre: 'Ação / Metroidvania',
      dev: 'Konami',
      pub: 'Konami',
      desc: 'Empunhe chicotes lendários ou espadas mágicas cruzando os salões góticos sinistros do castelo do Conde Drácula neste aclamado jogo retro.'
    },
    {
      keys: ['mega man', 'megaman', 'rockman', 'mega man & bass'],
      genre: 'Ação / Plataforma',
      dev: 'Capcom',
      pub: 'Capcom',
      desc: 'Cruze fases super desafiadoras, derrote os Robot Masters cibernéticos do malvado Dr. Wily e absorva suas armas elementares para o canhão buster.'
    },
    {
      keys: ['street fighter'],
      genre: 'Luta Competitiva',
      dev: 'Capcom',
      pub: 'Capcom',
      desc: 'Escolha os melhores lutadores de rua do mundo e dispute campeonatos intensos de artes marciais aplicando rítmicos golpes clássicos como Hadouken.'
    },
    {
      keys: ['mortal kombat'],
      genre: 'Luta / Combate',
      dev: 'Midway',
      pub: 'Acclaim',
      desc: 'Participe do torneio de karatê de morte mais violento e famoso do mundo com combates realistas e finalizações de Fatalities brutais extremas.'
    },
    {
      keys: ['donkey kong', 'diddy kong'],
      genre: 'Plataforma / Aventura',
      dev: 'Rare',
      pub: 'Nintendo',
      desc: 'Uma aventura fantástica na floresta com visuais 3D pré-renderizados perfeitos, física viciante e trilha sonora selvagem de altíssima qualidade.'
    },
    {
      keys: ['alex kidd'],
      genre: 'Plataforma Clássico',
      dev: 'Sega',
      pub: 'Sega',
      desc: 'Conduza motocicletas e helicópteros em Miracle World, resolva disputas de pedra-papel-tesoura e salve o reino com Alex Kidd.'
    },
    {
      keys: ['streets of rage'],
      genre: 'Beat \'em Up',
      dev: 'Sega AM7',
      pub: 'Sega',
      desc: 'Limpe as ruas da corrupção em brigas urbanas incríveis com trilha sonora de house/techno eletrônica impecável na pele de heróis audazes.'
    },
    {
      keys: ['golden axe'],
      genre: 'Beat \'em Up / Fantasia',
      dev: 'Sega AM1',
      pub: 'Sega',
      desc: 'Pancadaria bárbara medieval memorável no controle de guerreiros heróicos conjurando magias mágicas colossais na tela.'
    },
    {
      keys: ['batman'],
      genre: 'Ação / Plataforma',
      dev: 'Sunsoft',
      pub: 'Sunsoft',
      desc: 'Voe pelas sombras da corrupta Gotham City na pele do Cavaleiro das Trevas, combatendo capangas e chefes icônicos inspirados no filme.'
    },
    {
      keys: ['spider-man'],
      genre: 'Ação / Heroi',
      dev: 'Sega / Acclaim',
      pub: 'Sega',
      desc: 'Dispare teias de aranha e suba em edifícios urbanos altos no papel de Peter Parker contra o Sexteto Sinistro e vilões da Marvel.'
    },
    {
      keys: ['double dragon'],
      genre: 'Beat \'em Up',
      dev: 'Technos',
      pub: 'Nintendo',
      desc: 'Billy e Jimmy Lee lutam nas ruas contra as gangues locais para resgatar Marian neste clássico que fundou os jogos de pancadaria cooperativa.'
    },
    {
      keys: ['final fantasy', 'chrono trigger', 'chrono cross', 'breath of fire', 'golden sun', 'earthbound'],
      genre: 'RPG Clássico',
      dev: 'Square',
      pub: 'Square',
      desc: 'Participe de uma profunda jornada de fantasia com enredo maduro emocionante, batalhas por turnos e trilhas sonoras memoráveis.'
    },
    {
      keys: ['harry potter'],
      genre: 'Aventura / Magia',
      dev: 'EA Games',
      pub: 'Electronic Arts',
      desc: 'Estude na renomada escola de magia e bruxaria de Hogwarts na pele de Harry Potter, desvendando segredos fabulosos e superando testes.'
    },
    {
      keys: ['tom clancy', 'splinter cell', 'rainbow six'],
      genre: 'Infiltração / Stealth',
      dev: 'Ubisoft',
      pub: 'Ubisoft',
      desc: 'Espionagem tática furtiva de altíssima tensão, cumprindo assassinatos e infiltrações de segurança nacional vestindo óculos de visão noturna.'
    },
    {
      keys: ['dragon ball'],
      genre: 'Combate anime',
      dev: 'Dimps',
      pub: 'Bandai',
      desc: 'Duelos incríveis de ki e de socos de altíssima velocidade baseados no aclamado mangá de artes marciais lendário de Akira Toriyama.'
    },
    {
      keys: ['ayrton senna', 'super monaco', 'formula 1'],
      genre: 'Corrida de F1',
      dev: 'Sega AM2',
      pub: 'Sega',
      desc: 'Sinta a adrenalina das pistas de alta velocidade correndo no circuito de Fórmula 1 sob as rédeas e conselhos técnicos de Ayrton Senna.'
    },
    {
      keys: ['show do milhao'],
      genre: 'Trivia / Quiz',
      dev: 'SBT Digital',
      pub: 'SBT',
      desc: 'Responda as perguntas difíceis do carismático apresentador Silvio Santos e utilize cartas, universitários ou pulos para faturar 1 milhão.'
    },
    {
      keys: ['contra', 'metal slug', 'gunstar'],
      genre: 'Run and Gun / Tiro',
      dev: 'Konami',
      pub: 'Konami',
      desc: 'Tiroteio frenético em ritmo de ação contínua sem tréguas, repleto de armas pesadas insanas e chefes de guerra titânicos de combate.'
    },
    {
      keys: ['pac-man', 'pacman', 'tetris', 'bubble bobble', 'dig dug', 'puzzle'],
      genre: 'Puzzle / Clássico',
      dev: 'Namco',
      pub: 'Namco',
      desc: 'Use sua agilidade mental e reflexos rápidos em labirintos ou encaixes de blocos simétricos sob pontuações desafiadoras de época.'
    },
    {
      keys: ['resident evil', 'alone in the dark'],
      genre: 'Survival Horror / Terror',
      dev: 'Capcom',
      pub: 'Capcom',
      desc: 'Sobreviva a hordas assustadoras de zumbis em mansões isoladas com gerenciamento escasso de munições e enigmas assombrados.'
    },
    {
      keys: ['fifa', 'soccer', 'ronaldinho', 'world cup', 'athlete', 'olympics', 'tennis'],
      genre: 'Esporte / Competição',
      dev: 'EA Sports',
      pub: 'Electronic Arts',
      desc: 'Dispute as partidas mais divertidas do esporte cobrando faltas, organizando ligas estrelas e defendendo o gol com agilidade.'
    }
  ];

  for (const item of matchers) {
    if (item.keys.some(k => title.includes(k))) {
      genre = item.genre;
      dev = item.dev;
      pub = item.pub;
      desc = item.desc;
      break;
    }
  }

  // Atribui anos dinâmicos dependendo do título para variedade realista
  if (title.includes('stg') || title.includes('2') || title.includes('ii') || title.includes('II')) {
    year = (parseInt(year) + 2).toString();
  } else if (title.includes('3') || title.includes('iii') || title.includes('III') || title.includes('emerald')) {
    year = (parseInt(year) + 4).toString();
  }

  return { genre, year, dev, pub, desc };
}

export function buildDatabase() {
  const outputDb: any[] = [];

  Object.entries(MASTER_TEMPLATES).forEach(([sysId, sysMeta]) => {
    const gameDefs = sysMeta.list.map(filename => {
      const ext = path.extname(filename);
      const base = path.basename(filename, ext);
      
      // Regras de Formatação Absolutas e Polimento:
      const title = cleanGameTitle(base);
      const specs = getGameSpecs(sysId, title);

      // No campo 'romUrl', monte o caminho relativo exato baseado na extensão do arquivo real listado
      const romUrl = `/roms/${sysId}/${filename}`;
      
      // No campo 'logoUrl' correspondente dentro da pasta de imagens
      const logoUrl = `/images/logos/${sysId}/${title}.png`;

      return {
        title: title,
        year: specs.year,
        genre: specs.genre,
        dev: specs.dev,
        pub: specs.pub,
        desc: specs.desc,
        romUrl: romUrl,
        logoUrl: logoUrl
      };
    });

    outputDb.push({
      id: sysId,
      name: sysMeta.name,
      shortName: sysMeta.shortName,
      logo: sysMeta.logo,
      badgeColor: sysMeta.badgeColor,
      releaseYear: sysMeta.releaseYear,
      manufacturer: sysMeta.manufacturer,
      backgroundImage: sysMeta.backgroundImage,
      themeColor: sysMeta.themeColor,
      emulatorCore: sysMeta.emulatorCore,
      gameDefs: gameDefs
    });
  });

  // Load and merge original systems that were NOT customized from the filesystem lists
  try {
    const originalDbPath = path.join(process.cwd(), 'src', 'data', 'systems.json');
    if (fs.existsSync(originalDbPath)) {
      const originalDb = JSON.parse(fs.readFileSync(originalDbPath, 'utf8'));
      originalDb.forEach((sys: any) => {
        if (!MASTER_TEMPLATES.hasOwnProperty(sys.id)) {
          console.log(`[DatabaseCompiler] Restoring un-updated console: ${sys.name} (${sys.id})`);
          outputDb.push(sys);
        }
      });
    }
  } catch (originalDbErr) {
    console.error("[DatabaseCompiler] Error reading or parsing original systems.json:", originalDbErr);
  }

  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const dbPath = path.join(publicDir, 'db.json');
  fs.writeFileSync(dbPath, JSON.stringify(outputDb, null, 2), 'utf8');

  // Also write to dist/db.json if it exists, ensuring the server serves fresh runtime records in production
  const distDir = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'db.json'), JSON.stringify(outputDb, null, 2), 'utf8');
  }

  console.log(`[DatabaseCompiler] Successfully compiled db.json with ${outputDb.reduce((acc, cv) => acc + cv.gameDefs.length, 0)} classic games in public & dist!`);

  // Force-trigger the generate_offline_assets process synchronized
  try {
    const scriptPath = path.join(process.cwd(), 'create_offline_assets.cjs');
    if (fs.existsSync(scriptPath)) {
      console.log('[DatabaseCompiler] Triggering create_offline_assets.cjs to build retro covers & wallpaper SVG assets...');
      execSync('node create_offline_assets.cjs', { stdio: 'inherit' });
      console.log('[DatabaseCompiler] Offline assets created successfully.');
    } else {
      console.warn('[DatabaseCompiler] create_offline_assets.cjs not found, skipping asset generation!');
    }
  } catch (assetsErr) {
    console.error('[DatabaseCompiler] Warning: Error generating offline assets:', assetsErr);
  }
}

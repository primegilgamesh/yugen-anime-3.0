import type { AnimeEntry } from "./animeData";

/**
 * Franchise catalog: movies, specials, OVAs, prequels and sequels for the big
 * shounen franchises (Naruto, One Piece, Bleach, Dragon Ball...) plus other
 * major anime films, so they surface in Discover and search.
 */

const fgradients = [
  "from-blue-600 to-purple-700",
  "from-rose-600 to-orange-500",
  "from-emerald-600 to-teal-500",
  "from-amber-500 to-red-600",
  "from-indigo-600 to-blue-500",
  "from-pink-500 to-violet-600",
  "from-cyan-500 to-blue-600",
  "from-fuchsia-600 to-pink-500",
  "from-lime-500 to-emerald-600",
  "from-orange-500 to-amber-400",
  "from-violet-600 to-indigo-500",
  "from-teal-500 to-cyan-600",
];

type Row = [
  slug: string,
  title: string,
  titleEnglish: string,
  season: string,
  score: number,
  format: string,
  episodes: number,
  genres: string,
  studios: string,
  synopsis: string,
];

const rows: Row[] = [
  // ---- Naruto: movies, specials, sequels ----
  ["naruto-movie-1-ninja-clash", "Naruto the Movie: Daikatsugeki! Yukihime Ninpouchou Dattebayo!!", "Naruto the Movie: Ninja Clash in the Land of Snow", "Spring 2004", 6.9, "Movie", 1, "Action, Adventure, Martial Arts, Shounen", "Studio Pierrot", "Team 7 escorts an actress back to the Land of Snow and clashes with rogue ninja."],
  ["naruto-movie-2-stone-of-gelel", "Naruto Movie 2: Dai Gekitotsu! Maboroshi no Chiteiiseki Dattebayo!", "Naruto the Movie: Legend of the Stone of Gelel", "Summer 2005", 6.6, "Movie", 1, "Action, Adventure, Shounen", "Studio Pierrot", "Naruto and friends are drawn into a war over the power of the Stone of Gelel."],
  ["naruto-movie-3-crescent-moon-kingdom", "Naruto Movie 3: Dai Koufun! Mikazuki Jima no Animal Panic Dattebayo!", "Naruto the Movie: Guardians of the Crescent Moon Kingdom", "Summer 2006", 6.5, "Movie", 1, "Action, Adventure, Comedy, Shounen", "Studio Pierrot", "A bodyguard mission for a spoiled prince turns into a fight for a kingdom."],
  ["naruto-shippuden-movie-1", "Naruto: Shippuuden Movie 1", "Naruto Shippuden the Movie", "Summer 2007", 7.0, "Movie", 1, "Action, Adventure, Supernatural, Shounen", "Studio Pierrot", "Naruto guards a priestess who has foreseen his death."],
  ["naruto-shippuden-movie-2-bonds", "Naruto: Shippuuden Movie 2 - Kizuna", "Naruto Shippuden the Movie: Bonds", "Summer 2008", 7.0, "Movie", 1, "Action, Adventure, Shounen", "Studio Pierrot", "Sky ninja attack Konoha, and Naruto fights alongside Sasuke once more."],
  ["naruto-shippuden-movie-3-will-of-fire", "Naruto: Shippuuden Movie 3 - Hi no Ishi wo Tsugu Mono", "Naruto Shippuden the Movie: The Will of Fire", "Summer 2009", 7.0, "Movie", 1, "Action, Adventure, Shounen", "Studio Pierrot", "Kakashi prepares to sacrifice himself to stop a bloodline-stealing ninja."],
  ["naruto-shippuden-movie-4-lost-tower", "Naruto: Shippuuden Movie 4 - The Lost Tower", "Naruto Shippuden the Movie: The Lost Tower", "Summer 2010", 7.1, "Movie", 1, "Action, Adventure, Time Travel, Shounen", "Studio Pierrot", "Naruto is thrown twenty years into the past and meets the Fourth Hokage."],
  ["naruto-shippuden-movie-5-blood-prison", "Naruto: Shippuuden Movie 5 - Blood Prison", "Naruto Shippuden the Movie: Blood Prison", "Summer 2011", 7.2, "Movie", 1, "Action, Mystery, Shounen", "Studio Pierrot", "Framed for an attack on the Raikage, Naruto is locked in an inescapable prison."],
  ["naruto-shippuden-movie-6-road-to-ninja", "Road to Ninja: Naruto the Movie", "Road to Ninja: Naruto the Movie", "Summer 2012", 7.6, "Movie", 1, "Action, Adventure, Fantasy, Shounen", "Studio Pierrot", "A genjutsu world shows Naruto a life where his parents are still alive."],
  ["the-last-naruto-the-movie", "The Last: Naruto the Movie", "The Last: Naruto the Movie", "Winter 2014", 7.8, "Movie", 1, "Action, Romance, Shounen", "Studio Pierrot", "As the moon falls toward Earth, Naruto finally faces his feelings for Hinata."],
  ["boruto-naruto-the-movie", "Boruto: Naruto the Movie", "Boruto: Naruto the Movie", "Summer 2015", 7.5, "Movie", 1, "Action, Adventure, Shounen", "Studio Pierrot", "Boruto seeks his father's attention during the Chunin Exams as Otsutsuki attack."],
  ["naruto-sunny-side-battle-special", "Naruto: Shippuuden - Sunny Side Battle", "Naruto Shippuden: Sunny Side Battle", "Summer 2013", 6.8, "Special", 1, "Comedy, Shounen", "Studio Pierrot", "A short comedic special where Naruto's team argues about fried eggs."],
  ["naruto-ova-hidden-waterfall", "Naruto: Takigakure no Shitou - Ore ga Eiyuu Dattebayo!", "Naruto OVA: Battle at Hidden Falls", "Summer 2003", 6.6, "OVA", 1, "Action, Adventure, Shounen", "Studio Pierrot", "A bonus mission sends Team 7 to the Village Hidden in the Waterfall."],
  ["boruto-naruto-next-generations", "Boruto: Naruto Next Generations", "Boruto: Naruto Next Generations", "Spring 2017", 6.1, "TV", 293, "Action, Adventure, Shounen", "Studio Pierrot", "The next generation of Konoha shinobi grows up in the shadow of legends."],
  ["boruto-two-blue-vortex", "Boruto: Two Blue Vortex", "Boruto: Two Blue Vortex", "Winter 2026", 7.9, "TV", 12, "Action, Adventure, Shounen", "Studio Pierrot", "Three years after the timeline shift, Boruto returns to a village that forgot him."],

  // ---- One Piece: movies & specials ----
  ["one-piece-movie-1", "One Piece Movie 1", "One Piece: The Movie", "Spring 2000", 6.9, "Movie", 1, "Action, Adventure, Comedy, Shounen", "Toei Animation", "The Straw Hats race the pirate Woonan to a legendary hidden treasure."],
  ["one-piece-movie-2-clockwork-island", "One Piece Movie 2: Nejimaki-jima no Daibouken", "One Piece: Clockwork Island Adventure", "Spring 2001", 7.0, "Movie", 1, "Action, Adventure, Comedy, Shounen", "Toei Animation", "The crew storms Clockwork Island to rescue Nami and the Going Merry."],
  ["one-piece-movie-3-choppers-kingdom", "One Piece Movie 3: Chinjuu-jima no Chopper Oukoku", "One Piece: Chopper's Kingdom on the Island of Strange Animals", "Spring 2002", 6.8, "Movie", 1, "Adventure, Comedy, Fantasy, Shounen", "Toei Animation", "Chopper is crowned king by the animals of a strange island."],
  ["one-piece-movie-4-dead-end-adventure", "One Piece Movie 4: Dead End no Bouken", "One Piece: Dead End Adventure", "Spring 2003", 7.4, "Movie", 1, "Action, Adventure, Shounen", "Toei Animation", "The Straw Hats enter a deadly secret race across the sea."],
  ["one-piece-movie-5-cursed-holy-sword", "One Piece Movie 5: Norowareta Seiken", "One Piece: The Cursed Holy Sword", "Spring 2004", 6.9, "Movie", 1, "Action, Adventure, Shounen", "Toei Animation", "Zoro seems to betray the crew for a cursed blade's power."],
  ["one-piece-movie-6-baron-omatsuri", "One Piece Movie 6: Omatsuri Danshaku to Himitsu no Shima", "One Piece: Baron Omatsuri and the Secret Island", "Spring 2005", 7.4, "Movie", 1, "Adventure, Mystery, Psychological, Shounen", "Toei Animation", "A resort island's games slowly tear the Straw Hat crew apart."],
  ["one-piece-movie-7-karakuri-castle", "One Piece Movie 7: Karakuri-jou no Mecha Kyohei", "One Piece: The Giant Mechanical Soldier of Karakuri Castle", "Spring 2006", 6.9, "Movie", 1, "Action, Adventure, Comedy, Shounen", "Toei Animation", "A golden crown and an ancient mecha threaten a floating castle."],
  ["one-piece-movie-8-episode-of-alabasta", "One Piece Movie 8: Episode of Alabasta", "One Piece: Episode of Alabasta - The Desert Princess and the Pirates", "Spring 2007", 7.1, "Movie", 1, "Action, Adventure, Shounen", "Toei Animation", "A retelling of the Alabasta arc and the battle with Crocodile."],
  ["one-piece-movie-9-episode-of-chopper", "One Piece Movie 9: Episode of Chopper Plus", "One Piece: Episode of Chopper Plus - Bloom in Winter, Miracle Sakura", "Spring 2008", 7.6, "Movie", 1, "Adventure, Drama, Shounen", "Toei Animation", "A retelling of Drum Island and Doctor Hiluluk's miracle."],
  ["one-piece-film-strong-world", "One Piece Film: Strong World", "One Piece Film: Strong World", "Winter 2009", 8.1, "Movie", 1, "Action, Adventure, Shounen", "Toei Animation", "Golden Lion Shiki tears islands into the sky and kidnaps Nami."],
  ["one-piece-3d-straw-hat-chase", "One Piece 3D: Mugiwara Chase", "One Piece 3D: Straw Hat Chase", "Spring 2011", 6.6, "Movie", 1, "Adventure, Comedy, Shounen", "Toei Animation", "A short 3D chase after Luffy's stolen straw hat."],
  ["one-piece-film-z", "One Piece Film: Z", "One Piece Film: Z", "Winter 2012", 8.1, "Movie", 1, "Action, Adventure, Shounen", "Toei Animation", "Former Marine admiral Z wages war on all pirates with Dyna Stones."],
  ["one-piece-film-gold", "One Piece Film: Gold", "One Piece Film: Gold", "Summer 2016", 7.8, "Movie", 1, "Action, Adventure, Shounen", "Toei Animation", "The crew gambles everything inside Gran Tesoro, the golden entertainment city."],
  ["one-piece-stampede", "One Piece: Stampede", "One Piece: Stampede", "Summer 2019", 8.0, "Movie", 1, "Action, Adventure, Shounen", "Toei Animation", "The Pirate Festival gathers the world's crews to hunt Roger's treasure."],
  ["one-piece-film-red", "One Piece Film: Red", "One Piece Film: Red", "Summer 2022", 7.7, "Movie", 1, "Action, Adventure, Music, Shounen", "Toei Animation", "Uta, Shanks' daughter and the world's diva, dreams of a new age without pirates."],
  ["one-piece-episode-of-luffy", "One Piece: Episode of Luffy - Hand Island no Bouken", "One Piece: Episode of Luffy - Adventure on Hand Island", "Winter 2012", 7.3, "Special", 1, "Adventure, Comedy, Shounen", "Toei Animation", "A TV special retelling of an early Straw Hat adventure."],
  ["one-piece-episode-of-sabo", "One Piece: Episode of Sabo", "One Piece: Episode of Sabo - The Three Brothers' Bond", "Summer 2015", 7.7, "Special", 1, "Action, Drama, Shounen", "Toei Animation", "The bond of Luffy, Ace and Sabo retold ahead of Dressrosa."],
  ["one-piece-episode-of-east-blue", "One Piece: Episode of East Blue", "One Piece: Episode of East Blue - Luffy and His Four Crewmates", "Summer 2017", 7.7, "Special", 1, "Action, Adventure, Shounen", "Toei Animation", "A condensed retelling of how the first Straw Hats joined."],
  ["one-piece-episode-of-skypiea", "One Piece: Episode of Sorajima", "One Piece: Episode of Skypiea", "Summer 2018", 7.5, "Special", 1, "Adventure, Fantasy, Shounen", "Toei Animation", "The Skypiea arc retold as a single feature-length special."],
  ["one-piece-heart-of-gold", "One Piece: Heart of Gold", "One Piece: Heart of Gold", "Summer 2016", 7.2, "Special", 1, "Action, Adventure, Shounen", "Toei Animation", "A prequel special leading directly into Film: Gold."],

  // ---- Bleach: movies, OVAs, sequel ----
  ["bleach-movie-1-memories-of-nobody", "Bleach: Memories of Nobody", "Bleach: Memories of Nobody", "Winter 2006", 7.3, "Movie", 1, "Action, Supernatural, Shounen", "Studio Pierrot", "Ichigo faces blank souls threatening to collide the worlds of the living and dead."],
  ["bleach-movie-2-diamonddust-rebellion", "Bleach: The DiamondDust Rebellion", "Bleach: The DiamondDust Rebellion", "Winter 2007", 7.3, "Movie", 1, "Action, Supernatural, Shounen", "Studio Pierrot", "Hitsugaya vanishes with a stolen royal artifact and is branded a traitor."],
  ["bleach-movie-3-fade-to-black", "Bleach: Fade to Black - Kimi no Na wo Yobu", "Bleach: Fade to Black", "Winter 2008", 7.4, "Movie", 1, "Action, Supernatural, Shounen", "Studio Pierrot", "Soul Society forgets Rukia, and only Ichigo remembers her name."],
  ["bleach-movie-4-hell-verse", "Bleach: Jigoku-hen", "Bleach: Hell Verse", "Winter 2010", 7.5, "Movie", 1, "Action, Supernatural, Shounen", "Studio Pierrot", "Ichigo descends into Hell to save his sister from the Togabito."],
  ["bleach-sennen-kessen-hen", "Bleach: Sennen Kessen-hen", "Bleach: Thousand-Year Blood War", "Fall 2022", 9.0, "TV", 52, "Action, Adventure, Supernatural, Shounen", "Studio Pierrot", "The Quincy Wandenreich declares war on Soul Society."],
  ["bleach-ova-sealed-sword-frenzy", "Bleach: The Sealed Sword Frenzy", "Bleach OVA: The Sealed Sword Frenzy", "Fall 2006", 7.1, "OVA", 2, "Action, Supernatural, Shounen", "Studio Pierrot", "Bonus OVA episodes covering an escaped soul weapon and Ichigo's past."],

  // ---- Dragon Ball ----
  ["dragon-ball-z-battle-of-gods", "Dragon Ball Z: Kami to Kami", "Dragon Ball Z: Battle of Gods", "Spring 2013", 7.4, "Movie", 1, "Action, Comedy, Fantasy, Shounen", "Toei Animation", "Beerus, God of Destruction, awakens to challenge the Super Saiyan God."],
  ["dragon-ball-z-resurrection-f", "Dragon Ball Z: Fukkatsu no F", "Dragon Ball Z: Resurrection 'F'", "Spring 2015", 7.2, "Movie", 1, "Action, Comedy, Shounen", "Toei Animation", "Frieza returns from the dead with a new golden form."],
  ["dragon-ball-super-broly", "Dragon Ball Super: Broly", "Dragon Ball Super: Broly", "Winter 2018", 8.0, "Movie", 1, "Action, Fantasy, Shounen", "Toei Animation", "Goku and Vegeta face the strongest Saiyan ever born."],
  ["dragon-ball-super-super-hero", "Dragon Ball Super: Super Hero", "Dragon Ball Super: Super Hero", "Summer 2022", 7.4, "Movie", 1, "Action, Comedy, Shounen", "Toei Animation", "The Red Ribbon Army returns with new androids, and Gohan steps up."],
  ["dragon-ball-daima", "Dragon Ball Daima", "Dragon Ball Daima", "Fall 2024", 7.5, "TV", 20, "Action, Adventure, Comedy, Shounen", "Toei Animation", "Goku and friends are turned into children and travel to the Demon Realm."],

  // ---- Demon Slayer / Jujutsu Kaisen / My Hero Academia ----
  ["kimetsu-no-yaiba-mugen-train-movie", "Kimetsu no Yaiba Movie: Mugen Ressha-hen", "Demon Slayer: Kimetsu no Yaiba - Mugen Train", "Fall 2020", 8.6, "Movie", 1, "Action, Supernatural, Historical, Shounen", "ufotable", "Tanjiro and the Flame Hashira battle a demon aboard a cursed train."],
  ["kimetsu-no-yaiba-infinity-castle-movie", "Kimetsu no Yaiba Movie: Mugen Jou-hen", "Demon Slayer: Kimetsu no Yaiba - Infinity Castle", "Summer 2025", 9.1, "Movie", 1, "Action, Supernatural, Shounen", "ufotable", "The Demon Slayer Corps falls into Muzan's Infinity Castle for the final war."],
  ["jujutsu-kaisen-0-movie", "Jujutsu Kaisen 0 Movie", "Jujutsu Kaisen 0", "Winter 2021", 8.4, "Movie", 1, "Action, Supernatural, School, Shounen", "MAPPA", "Yuta Okkotsu and his cursed childhood friend enroll at Jujutsu High."],
  ["jujutsu-kaisen-hidden-inventory-special", "Jujutsu Kaisen: Kaigyoku / Gyokusetsu", "Jujutsu Kaisen: Hidden Inventory / Premature Death", "Summer 2023", 8.8, "Special", 1, "Action, Supernatural, Shounen", "MAPPA", "Gojo and Geto's fateful mission compiled as a theatrical special."],
  ["my-hero-academia-two-heroes", "Boku no Hero Academia the Movie: Futari no Hero", "My Hero Academia: Two Heroes", "Summer 2018", 7.6, "Movie", 1, "Action, Super Power, School, Shounen", "Bones", "Deku and All Might visit I-Island as villains seize the floating city."],
  ["my-hero-academia-heroes-rising", "Boku no Hero Academia the Movie 2: Heroes:Rising", "My Hero Academia: Heroes Rising", "Winter 2019", 8.0, "Movie", 1, "Action, Super Power, Shounen", "Bones", "Class 1-A defends an island village from a quirk-stealing villain."],
  ["my-hero-academia-world-heroes-mission", "Boku no Hero Academia the Movie 3: World Heroes' Mission", "My Hero Academia: World Heroes' Mission", "Summer 2021", 7.6, "Movie", 1, "Action, Super Power, Shounen", "Bones", "A global cult plans to wipe out everyone with a quirk."],
  ["my-hero-academia-youre-next", "Boku no Hero Academia the Movie 4: You're Next", "My Hero Academia: You're Next", "Summer 2024", 7.2, "Movie", 1, "Action, Super Power, Shounen", "Bones", "A man claiming to be All Might's successor seizes control of a city."],

  // ---- Attack on Titan / Tokyo Ghoul / Chainsaw Man ----
  ["attack-on-titan-lost-girls-ova", "Shingeki no Kyojin: Lost Girls", "Attack on Titan: Lost Girls", "Winter 2017", 7.6, "OVA", 3, "Action, Drama, Mystery", "Wit Studio", "Side stories following Annie in Stohess and Mikasa's other life."],
  ["attack-on-titan-no-regrets-ova", "Shingeki no Kyojin: Kuinaki Sentaku", "Attack on Titan: No Regrets", "Winter 2014", 8.0, "OVA", 2, "Action, Drama", "Wit Studio", "Levi's origins in the Underground and his recruitment by Erwin."],
  ["attack-on-titan-the-last-attack", "Shingeki no Kyojin Movie: Kanketsu-hen - The Last Attack", "Attack on Titan: The Last Attack", "Winter 2024", 8.8, "Movie", 1, "Action, Drama, Fantasy", "MAPPA", "The finale of the Rumbling recut and expanded for theaters."],
  ["chainsaw-man-reze-arc-movie", "Chainsaw Man Movie: Reze-hen", "Chainsaw Man - The Movie: Reze Arc", "Fall 2025", 8.7, "Movie", 1, "Action, Supernatural, Shounen", "MAPPA", "Denji falls for Reze, a girl who is far more dangerous than she seems."],
  ["tokyo-ghoul-jack-pinto-ova", "Tokyo Ghoul: Jack / Pinto", "Tokyo Ghoul: Jack & Pinto OVA", "Fall 2015", 7.1, "OVA", 2, "Action, Horror, Supernatural", "Studio Pierrot", "Prequel OVAs following Arima's youth and Tsukiyama's school days."],

  // ---- Ghibli & Shinkai ----
  ["spirited-away-movie", "Sen to Chihiro no Kamikakushi", "Spirited Away", "Summer 2001", 9.0, "Movie", 1, "Adventure, Fantasy, Supernatural", "Studio Ghibli", "Chihiro must work in a spirit bathhouse to free her parents."],
  ["princess-mononoke-movie", "Mononoke Hime", "Princess Mononoke", "Summer 1997", 8.7, "Movie", 1, "Adventure, Fantasy, Historical", "Studio Ghibli", "Ashitaka is caught between the forest gods and the iron town."],
  ["howls-moving-castle-movie", "Howl no Ugoku Shiro", "Howl's Moving Castle", "Fall 2004", 8.7, "Movie", 1, "Adventure, Fantasy, Romance", "Studio Ghibli", "Cursed into an old woman, Sophie takes shelter in a wandering castle."],
  ["the-boy-and-the-heron", "Kimi-tachi wa Dou Ikiru ka", "The Boy and the Heron", "Summer 2023", 8.3, "Movie", 1, "Adventure, Fantasy, Drama", "Studio Ghibli", "Grieving Mahito follows a talking heron into a world of the dead."],
  ["your-name-movie", "Kimi no Na wa.", "Your Name.", "Summer 2016", 8.8, "Movie", 1, "Romance, Supernatural, Drama", "CoMix Wave Films", "Two teenagers swap bodies across distance and time."],
  ["weathering-with-you-movie", "Tenki no Ko", "Weathering with You", "Summer 2019", 8.3, "Movie", 1, "Romance, Fantasy, Drama", "CoMix Wave Films", "A runaway boy meets a girl who can clear the endless Tokyo rain."],
  ["suzume-movie", "Suzume no Tojimari", "Suzume", "Fall 2022", 8.3, "Movie", 1, "Adventure, Fantasy, Drama", "CoMix Wave Films", "Suzume closes mysterious doors that unleash disaster across Japan."],

  // ---- Other major films, specials and OVAs ----
  ["a-silent-voice-movie", "Koe no Katachi", "A Silent Voice", "Summer 2016", 8.9, "Movie", 1, "Drama, Romance, School", "Kyoto Animation", "A former bully seeks redemption with the deaf girl he tormented."],
  ["violet-evergarden-the-movie", "Violet Evergarden Movie", "Violet Evergarden: The Movie", "Fall 2020", 8.9, "Movie", 1, "Drama, Fantasy, Romance", "Kyoto Animation", "Violet's search for the Major reaches its conclusion."],
  ["a-whisker-away-movie", "Nakitai Watashi wa Neko wo Kaburu", "A Whisker Away", "Summer 2020", 7.5, "Movie", 1, "Romance, Fantasy, Drama", "Studio Colorido", "A girl uses a magic mask to become a cat and get close to her crush."],
  ["haikyuu-dumpster-battle-movie", "Haikyuu!! Movie: Gomisuteba no Kessen", "Haikyu!! The Dumpster Battle", "Winter 2024", 8.6, "Movie", 1, "Sports, Comedy, School, Shounen", "Production I.G", "Karasuno faces Nekoma in the long-awaited Dumpster Battle."],
  ["sword-art-online-ordinal-scale", "Sword Art Online Movie: Ordinal Scale", "Sword Art Online: Ordinal Scale", "Winter 2017", 7.4, "Movie", 1, "Action, Adventure, Sci-Fi, Romance", "A-1 Pictures", "An AR game starts stealing the memories of SAO survivors."],
  ["sword-art-online-progressive-aria", "Sword Art Online: Progressive - Hoshi Naki Yoru no Aria", "Sword Art Online Progressive: Aria of a Starless Night", "Fall 2021", 7.6, "Movie", 1, "Action, Adventure, Fantasy", "A-1 Pictures", "Aincrad's first floors retold from Asuna's perspective."],
  ["fate-stay-night-heavens-feel-i", "Fate/stay night Movie: Heaven's Feel - I. Presage Flower", "Fate/stay night: Heaven's Feel I - Presage Flower", "Fall 2017", 8.2, "Movie", 1, "Action, Fantasy, Supernatural", "ufotable", "The Holy Grail War begins again with Sakura at its dark center."],
  ["fate-stay-night-heavens-feel-iii", "Fate/stay night Movie: Heaven's Feel - III. Spring Song", "Fate/stay night: Heaven's Feel III - Spring Song", "Summer 2020", 8.8, "Movie", 1, "Action, Fantasy, Supernatural", "ufotable", "Shirou's final choice as the Grail's corruption consumes Fuyuki."],
  ["mob-psycho-100-reigen-special", "Mob Psycho 100: Reigen - Shirarezaru Kiseki no Reinouryokusha", "Mob Psycho 100: Reigen", "Spring 2018", 7.9, "Special", 1, "Action, Comedy, Supernatural", "Bones", "A recap special told through Reigen's very unreliable narration."],
  ["made-in-abyss-dawn-of-the-deep-soul", "Made in Abyss Movie 3: Fukaki Tamashii no Reimei", "Made in Abyss: Dawn of the Deep Soul", "Winter 2020", 8.7, "Movie", 1, "Adventure, Drama, Fantasy, Horror", "Kinema Citrus", "Riko and Reg confront Bondrewd in the Idofront."],
  ["psycho-pass-providence-movie", "Psycho-Pass Movie: Providence", "Psycho-Pass: Providence", "Spring 2023", 7.6, "Movie", 1, "Action, Psychological, Sci-Fi", "Production I.G", "Akane investigates a case that bridges the Sibyl System's history."],
  ["evangelion-3-0-1-0-thrice-upon-a-time", "Shin Evangelion Gekijouban", "Evangelion: 3.0+1.0 Thrice Upon a Time", "Spring 2021", 8.6, "Movie", 1, "Action, Drama, Mecha, Sci-Fi, Psychological", "Studio Khara", "The Rebuild saga ends as Shinji faces the final Impact."],
  ["the-end-of-evangelion", "Shin Seiki Evangelion Gekijouban: Air/Magokoro wo, Kimi ni", "The End of Evangelion", "Summer 1997", 8.5, "Movie", 1, "Drama, Mecha, Psychological, Sci-Fi", "Gainax", "The alternate, apocalyptic conclusion to Neon Genesis Evangelion."],
  ["akira-movie", "Akira", "Akira", "Summer 1988", 8.2, "Movie", 1, "Action, Sci-Fi, Cyberpunk, Psychological", "Tokyo Movie Shinsha", "Kaneda hunts his mutating friend Tetsuo through Neo-Tokyo."],
  ["ghost-in-the-shell-movie", "Koukaku Kidoutai", "Ghost in the Shell", "Fall 1995", 8.3, "Movie", 1, "Action, Sci-Fi, Cyberpunk, Psychological", "Production I.G", "Major Kusanagi hunts the Puppet Master and questions her own soul."],
  ["perfect-blue-movie", "Perfect Blue", "Perfect Blue", "Winter 1997", 8.6, "Movie", 1, "Psychological, Thriller, Drama", "Madhouse", "An idol turned actress loses her grip on reality."],
  ["paprika-movie", "Paprika", "Paprika", "Fall 2006", 8.2, "Movie", 1, "Psychological, Sci-Fi, Fantasy", "Madhouse", "A stolen dream device blurs the line between sleep and waking."],
  ["wolf-children-movie", "Ookami Kodomo no Ame to Yuki", "Wolf Children", "Summer 2012", 8.6, "Movie", 1, "Drama, Fantasy, Slice of Life", "Studio Chizu", "Hana raises two children who can turn into wolves."],
  ["summer-wars-movie", "Summer Wars", "Summer Wars", "Summer 2009", 7.9, "Movie", 1, "Sci-Fi, Comedy, Drama", "Madhouse", "A math prodigy fights a rogue AI threatening the virtual world OZ."],
  ["belle-movie", "Ryuu to Sobakasu no Hime", "Belle", "Summer 2021", 7.8, "Movie", 1, "Drama, Fantasy, Music, Sci-Fi", "Studio Chizu", "A shy teen becomes a global singing star inside the virtual world U."],
  ["spy-x-family-code-white", "Spy x Family Movie: Code: White", "Spy x Family Code: White", "Winter 2023", 7.9, "Movie", 1, "Action, Comedy, Shounen", "Wit Studio", "A family trip turns into a mission to stop a war over dessert."],
  ["the-first-slam-dunk", "The First Slam Dunk", "The First Slam Dunk", "Winter 2022", 8.7, "Movie", 1, "Sports, Drama, Shounen", "Toei Animation", "Ryota Miyagi leads Shohoku against the unbeatable Sannoh."],
  ["one-punch-man-ova-collection", "One Punch Man Specials", "One Punch Man OVA Collection", "Winter 2015", 7.6, "OVA", 6, "Action, Comedy, Super Power, Parody", "Madhouse", "Bonus episodes of Saitama's mundane heroics."],
  ["hunter-x-hunter-phantom-rouge", "Gekijouban Hunter x Hunter: Phantom Rouge", "Hunter x Hunter: Phantom Rouge", "Winter 2013", 6.7, "Movie", 1, "Action, Adventure, Shounen", "Madhouse", "Kurapika's stolen eyes lead the group to a former Phantom Troupe member."],
  ["hunter-x-hunter-the-last-mission", "Gekijouban Hunter x Hunter: The Last Mission", "Hunter x Hunter: The Last Mission", "Winter 2013", 7.1, "Movie", 1, "Action, Adventure, Shounen", "Madhouse", "The Shadow, a group of exiled Hunters, attacks Heavens Arena."],
  ["fairy-tail-dragon-cry", "Fairy Tail Movie 2: Dragon Cry", "Fairy Tail: Dragon Cry", "Spring 2017", 7.3, "Movie", 1, "Action, Adventure, Fantasy, Shounen", "A-1 Pictures", "The guild races to recover a staff that can destroy the world."],
  ["black-clover-sword-of-the-wizard-king", "Black Clover: Mahou Tei no Ken", "Black Clover: Sword of the Wizard King", "Summer 2023", 7.5, "Movie", 1, "Action, Fantasy, Shounen", "Studio Pierrot", "Four resurrected Wizard Kings threaten the Clover Kingdom."],
  ["blue-lock-episode-nagi", "Blue Lock: Episode Nagi", "Blue Lock: Episode Nagi", "Spring 2024", 7.4, "Movie", 1, "Sports, Drama, Shounen", "8bit", "The Blue Lock project retold from Nagi Seishiro's point of view."],
  ["given-movie", "Given Movie", "Given: The Movie", "Summer 2020", 8.0, "Movie", 1, "Drama, Music, Romance, Boys Love", "Lerche", "Akihiko and Haruki's relationship comes to a head after the band's rise."],
  ["kaguya-sama-first-kiss-movie", "Kaguya-sama wa Kokurasetai: First Kiss wa Owaranai", "Kaguya-sama: Love Is War - The First Kiss That Never Ends", "Winter 2022", 8.7, "Movie", 1, "Comedy, Romance, School, Psychological", "A-1 Pictures", "Shirogane and Kaguya navigate the aftermath of their first kiss."],
  ["rurouni-kenshin-tsuiokuhen", "Rurouni Kenshin: Meiji Kenkaku Romantan - Tsuiokuhen", "Rurouni Kenshin: Trust & Betrayal", "Winter 1999", 8.6, "OVA", 4, "Action, Drama, Historical, Romance", "Studio Deen", "The origin of Kenshin's cross-shaped scar during the Bakumatsu."],
  ["cowboy-bebop-movie", "Cowboy Bebop: Tengoku no Tobira", "Cowboy Bebop: Knockin' on Heaven's Door", "Fall 2001", 8.4, "Movie", 1, "Action, Sci-Fi, Space, Drama", "Sunrise", "The Bebop crew hunts a bioterrorist on Mars."],
  ["trigun-badlands-rumble", "Trigun: Badlands Rumble", "Trigun: Badlands Rumble", "Spring 2010", 7.6, "Movie", 1, "Action, Adventure, Sci-Fi, Comedy", "Madhouse", "Vash faces a bandit with a twenty-year grudge."],
  ["code-geass-lelouch-of-the-resurrection", "Code Geass: Fukkatsu no Lelouch", "Code Geass: Lelouch of the Re;surrection", "Winter 2019", 7.5, "Movie", 1, "Action, Mecha, Drama, Sci-Fi", "Sunrise", "A sequel film following Zero and C.C. in the Kingdom of Zilkhstan."],
  ["steins-gate-load-region-of-deja-vu", "Steins;Gate Movie: Fuka Ryouiki no Deja vu", "Steins;Gate: The Movie - Load Region of Deja Vu", "Spring 2013", 8.4, "Movie", 1, "Sci-Fi, Thriller, Drama, Time Travel", "White Fox", "Okabe begins vanishing from the world line and Kurisu must save him."],
  ["k-on-movie", "K-On! Movie", "K-On! The Movie", "Winter 2011", 8.1, "Movie", 1, "Comedy, Music, Slice of Life, School", "Kyoto Animation", "Ho-kago Tea Time takes a graduation trip to London."],
  ["free-the-final-stroke", "Free! The Final Stroke", "Free! The Final Stroke", "Fall 2021", 8.0, "Movie", 1, "Sports, Drama, School", "Kyoto Animation", "Haruka chases the world stage in the finale of the swim saga."],
  ["gintama-the-final", "Gintama: The Final", "Gintama: The Final", "Winter 2021", 9.0, "Movie", 1, "Action, Comedy, Sci-Fi, Shounen", "Bandai Namco Pictures", "The Yorozuya face Utsuro in the finale of Gintama."],
  ["gintama-be-forever-yorozuya", "Gintama Movie 2: Kanketsu-hen - Yorozuya yo Eien Nare", "Gintama: The Movie - Be Forever Yorozuya", "Summer 2013", 8.7, "Movie", 1, "Action, Comedy, Sci-Fi, Shounen", "Sunrise", "Gintoki is flung five years into a bleak future Edo."],
  ["detective-conan-the-scarlet-bullet", "Meitantei Conan: Hiiro no Dangan", "Detective Conan: The Scarlet Bullet", "Spring 2021", 7.6, "Movie", 1, "Mystery, Adventure, Police, Shounen", "TMS Entertainment", "Conan investigates kidnappings around the World Sports Games."],
  ["pokemon-mewtwo-strikes-back", "Pocket Monsters Movie: Mewtwo no Gyakushuu", "Pokemon: The First Movie - Mewtwo Strikes Back", "Summer 1998", 7.5, "Movie", 1, "Action, Adventure, Fantasy, Kids", "OLM", "Ash confronts the cloned legendary Pokemon Mewtwo."],
  ["digimon-last-evolution-kizuna", "Digimon Adventure: Last Evolution Kizuna", "Digimon Adventure: Last Evolution Kizuna", "Winter 2020", 7.9, "Movie", 1, "Adventure, Drama, Fantasy", "Toei Animation", "The DigiDestined face the cost of growing up."],
];

export const franchiseMovieEntries: AnimeEntry[] = rows.map(
  ([slug, title, titleEnglish, season, score, format, episodes, genres, studios, synopsis], i) => ({
    slug,
    title,
    titleEnglish,
    titleRomaji: title,
    season,
    score,
    cover: fgradients[i % fgradients.length],
    episodes,
    duration: format === "Movie" ? "1 hr 45 min" : "24 min",
    status: season.includes("2026") ? "Currently Airing" : "Finished Airing",
    premiered: season,
    genres,
    studios,
    format,
    synopsis,
    dubbed: true,
  })
);

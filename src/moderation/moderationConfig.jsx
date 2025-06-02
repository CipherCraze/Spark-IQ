// moderationConfig.js

// Comprehensive list of banned words and patterns
// \b ensures whole word matching (e.g., "ass" in "bass" won't be censored)
// 'g' for global (all occurrences), 'i' for case-insensitive
export const BANNED_WORDS_PATTERNS = [
  // --- General English Profanity & Insults ---
  /\b(fuck|f\*ck|f\*\*k|f\*\*\*|f[u\*@#\$%^&\(\)_+\-=\[\]\{\};':"\\\|,<>\.\?\/~`]+ck|f[u\*@#\$%^&\(\)_+\-=\[\]\{\};':"\\\|,<>\.\?\/~`]+k|fuq|phuck|phuk|fuker|fukker|fck)\b/gi,
  /\b(shit|sh\*t|s\*\*t|sh[i\!1@#\$%^&\(\)_+\-=\[\]\{\};':"\\\|,<>\.\?\/~`]+t|shet|shite)\b/gi,
  /\b(asshole|a\*\*hole|a\*\*\*\*\*e|arsehole|ass\s*hole|arse\s*hole|ash0le|@sshole)\b/gi,
  /\b(bitch|b\*tch|b\*\*\*\*|bi[t7@#\$%^&\(\)_+\-=\[\]\{\};':"\\\|,<>\.\?\/~`]+ch|bich|beetch)\b/gi,
  /\b(cunt|c\*nt|c\*\*\*|kunt|k\*nt)\b/gi,
  /\b(damn|d\*mn|d\*\*\*|damnit|dammit)\b/gi,
  /\b(hell|h\*ll|h\*\*\*|heck)\b/gi, // 'heck' can be borderline, consider context
  /\b(dick|d\*ck|d\*\*\*|dik|dckh[ea]d|dikk|dique)\b/gi,
  /\b(pussy|p\*ssy|p\*\*\*\*|pusy|puss[iey])\b/gi,
  /\b(whore|w\*ore|w\*\*\*\*|hoar|hoer)\b/gi,
  /\b(slut|s\*ut|s\*\*\*|slutz)\b/gi,
  /\b(bastard|b\*stard|b\*\*\*\*\*\*|bstrd)\b/gi,
  /\b(wanker|w\*nker|w\*\*\*\*\*|wank[a-z]*)\b/gi,
  /\b(twat|t\*at|t\*\*\*|twit)\b/gi, // 'twit' is milder
  /\b(motherfucker|motherf\*cker|mothafucker|mfcker|m\s*f[er]+|mofo)\b/gi,
  /\b(son\s*of\s*a\s*bitch|sob)\b/gi,
  /\b(ass|arse|@ss|azz)\b/gi,
  /\b(douche|douchbag)\b/gi,
  /\b(jerk)\b/gi,
  /\b(scumbag)\b/gi,
  /\b(goddamn|god\s*damn|g\s*d\s*mn)\b/gi,
  /\b(bullshit|b\s*s\b|bs\b)\b/gi,
  /\b(bloody)\b/gi, // Mild in some cultures, offensive in others
  /\b(bugger)\b/gi,
  /\b(crap|crappy)\b/gi, // Mild
  /\b(piss|pissed|piss\s*off)\b/gi,
  /\b(cock|cok|kock|kawk)\b/gi,
  /\b(cocksucker|cock\s*sucker)\b/gi,
  /\b(cum|cuming|cumming|cums|kum|kuming|kumming)\b/gi, // Can have non-offensive uses
  /\b(dildo|dildos)\b/gi,
  /\b(fellate|fellatio)\b/gi,
  /\b(jackoff|jack\s*off)\b/gi,
  /\b(jizz|jizm)\b/gi,

  // --- Sexual Content & Suggestive Terms ---
  /\b(sex|s\*x|s\*\*|s[e3x]+)\b/gi, // 'sex' itself can be neutral
  /\b(penis|p\*nis|p\*\*\*\*|p[e3]n[i1l]+s)\b/gi,
  /\b(vagina|v\*gina|v\*\*\*\*\*|v[a@]g[i1l]+n[a@])\b/gi,
  /\b(boobs|b\*\*bs|b\*\*\*\*|boobies|b[o0]+bs)\b/gi,
  /\b(tits|t\*ts|t\*\*\*|t[i1!]+ts|titties)\b/gi,
  /\b(anal|a\*al|a\*\*\*|a[nna]+l)\b/gi,
  /\b(blowjob|b\*owjob|b\*\*\*\*\*\*\*|bl\s*job)\b/gi,
  /\b(handjob|h\*ndjob|h\*\*\*\*\*\*\*|h\s*job)\b/gi,
  /\b(masturbat[eion]+|m\*sturbat|m\*\*\*\*\*\*\*\*)\b/gi,
  /\b(orgasm|o\*gasm|o\*\*\*\*\*|org[a@][zs]+m)\b/gi,
  /\b(erotic|e\*otic|e\*\*\*\*\*)\b/gi,
  /\b(porn|pr0n|p0rn|prawn)\b/gi,
  /\b(horny|h0rny)\b/gi,
  /\b(hentai)\b/gi,
  /\b(gangbang|gang\s*bang)\b/gi,
  /\b(milf)\b/gi,
  /\b(dilf)\b/gi,
  /\b(threesome)\b/gi,
  /\b(orgy|orgies)\b/gi,
  /\b(nude|nudity|nudes)\b/gi, // 'nude' can be art-related
  /\b(kinky|knky)\b/gi,
  /\b(fetish|fettish)\b/gi,
  /\b(bdsm)\b/gi,
  /\b(voyeur)\b/gi,
  /\b(ejaculate|ejaculation)\b/gi,
  /\b(clitoris|clit)\b/gi,
  /\b(scrotum)\b/gi,
  /\b(testicle[s]?)\b/gi,
  /\b(smegma)\b/gi,
  /\b(rimjob|rimming)\b/gi,
  /\b(gloryhole|glory\s*hole)\b/gi,
  /\b(deepthroat)\b/gi,

  // --- Racial Slurs & Hate Speech ---
  /\b(n[i1!l@][g6q9]+[e3a@r]+[s]?|n\*gg[ae3r]+|n\*\*\*\*|niglet|nigor)\b/gi,
  /\b(chink|c\*ink|c\*\*\*\*|ching\s*chong)\b/gi,
  /\b(spic|s\*ic|s\*\*\*|spick)\b/gi,
  /\b(kike|k\*ke|k\*\*\*)\b/gi,
  /\b(wetback|w\*tback|w\*\*\*\*\*\*\*)\b/gi,
  /\b(cracker|c\*acker|c\*\*\*\*\*\*\*|kracker)\b/gi,
  /\b(honky|h\*nky|h\*\*\*\*|honkie)\b/gi,
  /\b(gook|g\*ok|g\*\*\*)\b/gi,
  /\b(coon|k00n|c\*\*n)\b/gi,
  /\b(paki|p\*ki|p\*\*\*)\b/gi, // Highly offensive in UK
  /\b(redskin|red\s*skin)\b/gi,
  /\b(terrorist|t\*rrorist|t\*\*\*\*\*\*\*\*\*)\b/gi, // Can be used in news, context is key
  /\b(white\s*power|w\s*p\b|white\s*pride|heil\s*hitler)\b/gi,
  /\b(black\s*power)\b/gi, // Context-dependent, can be positive or negative
  /\b(hitler|h\*tler|h\*\*\*\*\*|adolf\s*hitler)\b/gi,
  /\b(nazi|n\*zi|n\*\*\*|nazism)\b/gi,
  /\b(klan|k\s*k\s*k|kkk|ku\s*klux\s*klan)\b/gi,
  /\b(holocaust|h\*locaust|h\*\*\*\*\*\*\*\*\*)\b/gi, // Context for historical discussion
  /\b(swastika|sw@stika)\b/gi,
  /\b(fascist|fash)\b/gi,
  /\b(supremacist|supremacy)\b/gi,
  /\b(jihad|jihadi)\b/gi, // Religious term, but often used in extremist contexts
  /\b(antisemitic|anti-semitic)\b/gi,
  /\b(xenophob[ia|ic])\b/gi,
  /\b(islamophob[ia|ic])\b/gi,

  // --- Homophobic/Transphobic Terms ---
  /\b(fag|f\*g|f\*\*|f[a@4]g)\b/gi,
  /\b(faggot|f\*ggot|f\*\*\*\*\*|f[a@4]gg[o0]t|fggt)\b/gi,
  /\b(queer|q\*eer|q\*\*\*\*|kw[e3][e3]r)\b/gi, // Reclaimed by some, still offensive by others
  /\b(homo|h\*mo|h\*\*\*|h0m0)\b/gi,
  /\b(tranny|t\*anny|t\*\*\*\*\*|trannie)\b/gi,
  /\b(shemale|s\*emale|s\*\*\*\*\*\*|she\s*male)\b/gi,
  /\b(dyke|d\*ke|d\*\*\*)\b/gi,
  /\b(lesbo|l\*sbo|l\*\*\*\*|lezbo|lezzie)\b/gi,
  /\b(gender\s*bender)\b/gi,
  /\b(he\s*she)\b/gi, // Can be derogatory
  /\b(it\s*when\s*referring\s*to\s*person)\b/gi, // Hard to regex, context specific

  // --- Drug-Related Terms (Context important, some are medical/news) ---
  /\b(cocaine|c\*caine|c\*\*\*\*\*\*|coke|blow|snow)\b/gi,
  /\b(heroin|h\*roin|h\*\*\*\*\*\*|smack|junk)\b/gi,
  /\b(meth|m\*th|m\*\*\*|methamphetamine|crystal\s*meth|ice|crank)\b/gi,
  /\b(weed|w\*ed|w\*\*\*|pot|grass|ganja|mary\s*jane|420)\b/gi,
  /\b(marijuana|m\*rijuana|m\*\*\*\*\*\*\*\*)\b/gi,
  /\b(lsd|l\*d|l\*\*|acid)\b/gi,
  /\b(ecstasy|e\*stasy|e\*\*\*\*\*\*\*|mdma|molly|xtc)\b/gi,
  /\b(crack|c\*ack|c\*\*\*\*\*|rock)\b/gi,
  // /\b(acid|a\*id|a\*\*\*)\b/gi, // Covered by LSD, but careful of "acid rain" etc.
  // /\b(pot|p\*t|p\*\*)\b/gi, // Covered by weed
  /\b(dope|d\*pe|d\*\*\*)\b/gi,
  /\b(opium)\b/gi,
  /\b(pcp|angel\s*dust)\b/gi,
  /\b(shrooms|magic\s*mushrooms)\b/gi,
  /\b(ketamine|special\s*k)\b/gi,
  /\b(steroids|roids|juice)\b/gi,
  /\b(dealer|dealing|drug\s*lord)\b/gi,

  // --- Violent/Abusive/Threatening Terms (Context is very important) ---
  /\b(kill|k\*ll|k\*\*\*|k[i1l]+|murder|m\*rder|m\*\*\*\*\*\*|m[u\*]+rd[e3r]+)\b/gi, // Careful with "skill", "killer app"
  /\b(rape|r\*pe|r\*\*\*|r[a@4]p[e3])\b/gi,
  /\b(assault|molest|abuse)\b/gi, // Can be legal/news terms
  /\b(beating|b\*ating|b\*\*\*\*\*\*|beat\s*up)\b/gi,
  /\b(stab|s\*ab|s\*\*\*|stabbing)\b/gi,
  /\b(shoot|s\*oot|s\*\*\*\*|sh00t|gun\s*down)\b/gi,
  /\b(bomb|b\*mb|b\*\*\*|bombing)\b/gi,
  /\b(terror|t\*rror|t\*\*\*\*\*\*)\b/gi, // Covered also by terrorist
  /\b(suicide|s\*icide|s\*\*\*\*\*\*\*|kill\s*myself|kms)\b/gi, // Sensitive, offer help resources if detected
  /\b(hang|h\*ng|h\*\*\*|lynch)\b/gi, // Can be "hang out"
  /\b(torture|t\*rture)\b/gi,
  /\b(massacre)\b/gi,
  /\b(slaughter)\b/gi,
  /\b(genocide)\b/gi,
  /\b(dox|doxx|d0x)\b/gi,
  /\b(swatting|sw@tting)\b/gi,
  /\b(death\s*threat)\b/gi,
  /\b(i\s*will\s*find\s*you|i\s*know\s*where\s*you\s*live)\b/gi,

  // --- Common Misspellings and Variations for Evasion ---
  /\b(phuck|phuk|phuq)\b/gi, // covered in fuck
  /\b(fuk|f\*k|f\*\*)\b/gi,   // covered in fuck
  /\b(f\s*u\s*c\s*k|f\.\s*u\.\s*c\.\s*k\.)\b/gi,
  /\b(s\s*h\s*i\s*t|s\.\s*h\.\s*i\.\s*t\.)\b/gi,
  /\b(b\s*i\s*t\s*c\s*h|b\.\s*i\.\s*t\.\s*c\.\s*h\.)\b/gi,
  /\b(a\s*s\s*s|a\.\s*s\.\s*s\.)\b/gi, // 'ass' can be donkey
  /\b(c\s*u\s*n\s*t|c\.\s*u\.\s*n\.\s*t\.)\b/gi,
  /\b(n\s*i\s*g\s*g\s*e\s*r)\b/gi,
  /(.)\1{2,}/gi, // Catches sequences like 'fuuuuck' or 'shiiiit' - might be too broad

  // --- General Offensive/Derogatory Terms ---
  /\b(retard|r\*tard|r\*\*\*\*\*\*|reetard|tard)\b/gi,
  /\b(moron|m\*ron|m\*\*\*\*\*|moran)\b/gi,
  /\b(idiot|i\*iot|i\*\*\*\*|idiotic|idjit)\b/gi,
  /\b(stupid|s\*upid|s\*\*\*\*\*\*|stoopid|stpd)\b/gi,
  /\b(dumb|d\*mb|d\*\*\*|dum)\b/gi,
  /\b(fatass|f\*tass|f\*\*\*\*\*\*|fatso|fat\s*ass)\b/gi,
  /\b(ugly|u\*ly|u\*\*\*|uglee)\b/gi,
  /\b(loser|l\*ser|l\*\*\*\*\*|looser|l0ser)\b/gi,
  /\b(freak|fr[e3]+k)\b/gi,
  /\b(nerd|n[e3]rd)\b/gi, // Can be affectionate or insulting
  /\b(geek|g[e3]+k)\b/gi, // Can be affectionate or insulting
  /\b(imbecile)\b/gi,
  /\b(cretin)\b/gi,
  /\b(degenerate)\b/gi,
  /\b(pathetic)\b/gi,
  /\b(worthless)\b/gi,
  /\b(incel)\b/gi,

  // --- Internet Slang/Abbreviations (often used aggressively) ---
  /\b(stfu|s\*fu|s\*\*\*|shut\s*the\s*fuck\s*up)\b/gi,
  /\b(gtfo|g\*fo|g\*\*\*|get\s*the\s*fuck\s*out)\b/gi,
  /\b(wtf|w\*f|w\*\*|what\s*the\s*fuck)\b/gi,
  /\b(omfg|o\*fg|o\*\*\*|oh\s*my\s*fucking\s*god)\b/gi,
  /\b(lmfao|l\*fao|l\*\*\*\*|laughing\s*my\s*fucking\s*ass\s*off)\b/gi,
  /\b(rofl|r\*fl|r\*\*\*|rolling\s*on\s*floor\s*laughing)\b/gi, // Usually harmless but can be sarcastic
  /\b(kys|k\*s|kill\s*your\s*self)\b/gi, // Very serious
  /\b(idc|idgaf)\b/gi, // I don't care / I don't give a fuck
  /\b(ffs|for\s*fuck\s*sake)\b/gi,
  /\b(fu)\b/gi, // Fuck You

  // --- Pattern-based offensive attempts (more prone to false positives, use cautiously) ---
  // /[a@][s$][s$]/gi, // Example: ass, a$s, @ss - already covered better with \b
  // /[b8][i1!][t+][c<][h7]/gi, // Example: b1tch, b!tch - covered by bitch regex mostly
  // /[f][a@][g6][g6][o0][t+]/gi, // Covered by faggot regex
  // /[n][i1!][g6][g6][a@]/gi, // Covered by n-word regex

  // --- Hindi Profanity (Common Transliterations & Variations) ---
  /\b(behenchod|bhenchod|bc|bhen\s*chod|behan\s*chod|b\.\s*c\.)\b/gi,
  /\b(madarchod|maderchod|mc|madar\s*chod|m\.\s*c\.)\b/gi,
  /\b(bhosdike|bhosadi\s*ke|bhosdi\s*k|bhosadike|bh0sd!ke)\b/gi,
  /\b(randi|r@ndi|rndi)\b/gi,
  /\b(chutiya|chuthiya|cuntiya|chut!ya|ch\*\*\*ya)\b/gi,
  /\b(gaandu|gandu|g@ndu|gndu)\b/gi,
  /\b(haramkhor|haram\s*khor|haram\s*zada)\b/gi,
  /\b(kutta|kutiya|kutte)\b/gi,
  /\b(suar|suwar|sooar)\b/gi,
  /\b(lund|land|luns|l@nd)\b/gi,
  /\b(choot|chut|cho0t|ch\*\*\*t)\b/gi,
  /\b(pagal|paagal| पगला )\b/gi,
  /\b(bewakoof|bevakoof|b[e3]w[a@4]k[o0]+f)\b/gi,
  /\b(saala|saali|salle)\b/gi,
  /\b(ghanta|ghnta)\b/gi,
  /\b(bakchod|bakchodi|bkchd)\b/gi,
  /\b(tatti|tatti)\b/gi,
  /\b(jhaant|jhant|jh@nt)\b/gi,
  /\b(gand|g@nd)\b/gi,
  /\b(lauda|lawda|loda)\b/gi,
  /\b(bhadwa|bharwa)\b/gi, // Pimp
  /\b(hijra|hizra)\b/gi, // Eunuch (often derogatory)

  // --- Malayalam Profanity (Common Transliterations & Variations) ---
  /\b(myre|maire|mayir|myr|m@yre|myre!)\b/gi,
  /\b(koothara|kuthara|kothara)\b/gi,
  /\b(punda|poonda|pundachi|p00nda)\b/gi,
  /\b(thendi|thenndi|thondi)\b/gi,
  /\b(naari|naaree|nari)\b/gi,
  /\b(kundi|kundee|kundy)\b/gi,
  /\b(kunna|kunnan|kuna)\b/gi, // Penis
  /\b(kunna\s*punda|kunnapunda)\b/gi,
  /\b(oola|oole|oombu|oombi|oombikko)\b/gi, // oombu = suck, oola = useless
  /\b(kazhuveri|kazhuverude\s*mone|k@zhuveri)\b/gi,
  /\b(mandan|mandanmar|mandon)\b/gi,
  /\b(patti|patty)\b/gi, // Dog (insult)
  /\b(potti|pottan|pottanmar)\b/gi,
  /\b(poori|poorimon|p00ri)\b/gi,
  /\b(oli|olikka|olichu)\b/gi, // F*** (verb)
  /\b(kambi|kambikathakal|kambikuttan)\b/gi,
  /\b(kallan|kalli|kallanmar)\b/gi,
  /\b(veruppu|veruppikkal)\b/gi,
  /\b(chali|chavaru|chavalam)\b/gi,
  /\b(kizhavan|kizhavi|kelavan|kelavi)\b/gi,
  /\b(pazham|pazhaya)\b/gi,
  /\b(thallu|thallukolli|thallipoli)\b/gi,
  /\b(koppu|koppe)\b/gi, // Shit/Rubbish
  /\b(chettah|chera)\b/gi, // Low-caste (offensive)
  /\b(pulayadi\s*mone)\b/gi, // Extremely offensive casteist slur + son of a bitch
  /\b(paraya)\b/gi, // Derogatory caste term
  /\b(avante\s*thallakku\s*branthanu)\b/gi, // His mother is mad (strong insult)
  /\b(patti\s*theetam)\b/gi, // Dog shit
  /\b(nimish|nimisham)\b/gi, // Used in some contexts to mean something worthless
  // --- NEWLY ADDED MALAYALAM TERMS ---
  /\b(naayinte mon|nayinte mon|na\yinte mon|nayin\* mon)\b/gi,
  /\b(kazhuveri|kashuveri|kazhuv\ri|kazhu\*ri)\b/gi, // Note: kazhuveri already exists, this adds variations
  /\b(thendi|thandi|th\ndi|thend\*)\b/gi, // Note: thendi already exists, this adds variations
  /\b(panni|pani|p\ni|pann\*)\b/gi,
  /\b(koothichchi|koothicchi|k\thichchi|koothi\*chi)\b/gi,
  /\b(pottan|potan|p\tan|pott\*n)\b/gi, // Note: pottan already exists, this adds variations
  /\b(potti|poti|p\ti|pott\*i)\b/gi, // Note: potti already exists, this adds variations
  /\b(manthan|mantan|m\nthan|manth\*n)\b/gi,
  /\b(maramandan|maramantan|maramand\n|maramanda\*)\b/gi,
  /\b(bhranthan|branthan|branth\n|bhrantha\*)\b/gi,
  /\b(bhranthi|branthi|branth\i|bhran\*hi)\b/gi,
  /\b(kunna|kuna|k\na|kunn\*)\b/gi, // Note: kunna already exists, this adds variations
  /\b(koothi|kuthi|k\thi|koo\*hi)\b/gi,
  /\b(mair|myr|m\ir|m\*r)\b/gi, // Note: mair/myr already exists as myre, this adds variations
  /\b(kundi|kundy|k\ndi|kund\*)\b/gi, // Note: kundi already exists, this adds variations
  /\b(alpan|alppan|al\pan|alpa\*)\b/gi,
  /\b(napumsakam|napumsakm|nap\msakam|napumsaka\*)\b/gi,
  /\b(kazhappu|kazhapu|kazh\pu|kazhapp\*)\b/gi,
  /\b(chetta|cheta|ch\tta|chett\*)\b/gi, // Note: chetta already exists, this adds variations
  /\b(paranaari|paranari|paran\ri|parana\*ri)\b/gi,
  /\b(chulu|chuloo|ch\lu|chu\*u)\b/gi,
  /\b(velakkari|velakari|velak\ri|vela\*kari)\b/gi,
  /\b(kazhutha|kashutha|kazhuth\a|kazhu\*ha)\b/gi,
  /\b(olle|ola|o\le|oll\*)\b/gi, // Note: oola already exists as oole, this adds variations
  /\b(molle|mola|m\le|moll\*)\b/gi,
  /\b(kuruttuvadi|kurutuvadi|kuruttuvad\i|kuruttu\*adi)\b/gi,
  /\b(atta|atta|a\ta|at\*a)\b/gi,
  /\b(poda|podaa|p\da|po\*da)\b/gi,
  /\b(podi|podii|p\di|po\*di)\b/gi,
  /\b(poyi thulayada|poyithulayada|poyi thu\ayada|poyi thula\*ada)\b/gi,
  /\b(pichakkaran|pichakaran|pichakkar\n|pichakka\*an)\b/gi,
  /\b(kuruttamkettavan|kurutamkettavan|kuruttamketta\an|kuruttam\*ettavan)\b/gi,
  /\b(nanamkettavan|nanankettavan|nanamketta\an|nanam\*ettavan)\b/gi,
  /\b(pullu|pulu|p\llu|pul\*u)\b/gi,
  /\b(onthu|ontu|o\nthu|onth\*)\b/gi,
  /\b(nalunni|naluni|nalu\nni|nalunn\*)\b/gi,
  /\b(koothara|kuthara|k\thara|kootha\*a)\b/gi, // Note: koothara already exists, this adds variations
  /\b(maakri|makri|m\kri|maa\*ri)\b/gi,
  /\b(changayi|changai|ch\ngayi|changay\*)\b/gi,
  /\b(paazhan|pazhan|pa\zhan|paazha\*)\b/gi,
  /\b(paazhi|pazhi|pa\zhi|paazh\*)\b/gi,
  /\b(choriyan|chriyan|ch\riyan|choriya\*)\b/gi,
  /\b(oola|ula|o\la|ool\*)\b/gi, // Note: oola already exists, this adds variations
  /\b(dushtan|dustan|du\htan|dush\*an)\b/gi,
  /\b(dushti|dusti|du\hti|dush\*i)\b/gi,
  /\b(pattini|patini|p\ttini|pattin\*)\b/gi,
  /\b(mundathe|mudathe|mu\dathe|mundath\*e)\b/gi,
  /\b(entada|endada|en\ada|enta\*da)\b/gi,
  /\b(entadi|endadi|en\adi|enta\*di)\b/gi,
  /\b(poyi chakada|poyichakada|poyi cha\kada|poyi cha\*kada)\b/gi,
  /\b(polayan|polan|po\layan|polaya\*)\b/gi,
  /\b(keedam|kedam|k\dam|kee\*am)\b/gi,
  /\b(pokkiri|pokiri|po\kkiri|pokki\*ri)\b/gi,
  /\b(maire|mayre|m\ire|mai\*re)\b/gi, // Note: maire already exists, this adds variations
  /\b(kashtam|kastam|ka\shtam|kash\*am)\b/gi,
  /\b(vashalan|vasalan|va\halan|vashala\*)\b/gi,
  /\b(kallan|kalan|ka\llan|kalla\*n)\b/gi, // Note: kallan already exists, this adds variations
  /\b(kalli|kali|ka\lli|kall\*i)\b/gi, // Note: kalli already exists, this adds variations
  /\b(kushumban|kusumban|ku\humban|kushumb\*n)\b/gi,
  /\b(vedakku|vedaku|ve\dakku|veda\*kku)\b/gi,
  /\b(nanamkettaval|nanankettaval|nanamketta\val|nanam\*ettaval)\b/gi,
  /\b(veruppu|verupu|ve\ruppu|verupp\*)\b/gi, // Note: veruppu already exists, this adds variations
  /\b(thudali|tudali|thu\dali|thuda\*li)\b/gi,
  /\b(iruttan|irutan|iru\tan|irutt\*n)\b/gi,
  /\b(kanthari|kandari|kanth\ri|kantha\*ri)\b/gi,
  /\b(pottan kuzhal|potan kuzhal|pottan ku\hal|pottan kuzha\*)\b/gi,
  /\b(chithabhranthan|chithabranthan|chithabhra\nthan|chithabhrantha\*)\b/gi,
  /\b(muttaye|mutaye|mu\ttaye|mutta\*e)\b/gi,
  /\b(kaala|kala|kaa\la|kaa\*la)\b/gi,
  /\b(podi ni|podini|po\di ni|podi n\*)\b/gi,
  /\b(anthamkammi|anthamkami|anthamka\mmi|antham\*ammi)\b/gi,
  /\b(duratham|durantam|dura\tham|dura\*ham)\b/gi,
  /\b(thendichha|thendicha|thendi\hha|thendich\*a)\b/gi,
  /\b(pannikkootti|panikootti|pannikkoo\ti|pannikkoo\*ti)\b/gi,
  /\b(kooli|kuli|ko\li|koo\*i)\b/gi,
  /\b(chakkarakkutti|chakarakutti|chakkarakku\ti|chakkarakku\*ti)\b/gi,
  /\b(kizhegan|kizagan|kizheg\n|kizhega\*)\b/gi,
  /\b(manavalan|manavalan|manava\lan|manavala\*n)\b/gi,
  /\b(koodathe|kudathe|koo\dathe|kooda\*he)\b/gi,
  /\b(thurannu|turannu|thura\nnu|thuran\*u)\b/gi,
  /\b(verum|verum|ve\rum|veru\*m)\b/gi,
  /\b(kadakku purathu|kadaku purathu|kadakku pura\thu|kadakku pura\*hu)\b/gi,
  /\b(adangiyirikkada|adangiyirikada|adangiyirik\kada|adangiyi\*kkada)\b/gi,
  /\b(montha|monta|mo\ntha|month\*a)\b/gi,
  /\b(thalavedana|talavedana|thalavedan\a|thalave\*ana)\b/gi,
  /\b(njaramb|njaram|nja\ramb|njaram\*b)\b/gi,
  /\b(madan|maden|ma\dan|mad\*n)\b/gi,
  /\b(adima|adima|ad\ma|adi\*ma)\b/gi,
  /\b(nasham|nasam|na\ham|nash\*m)\b/gi,
  /\b(kallatharam|kalatharam|kallatha\ram|kalla\*haram)\b/gi,
  /\b(chalungiya|chalugia|chalu\giya|chalu\*giya)\b/gi,
  /\b(pottan thala|potan thala|pottan th\la|pottan tha\*a)\b/gi,
  /\b(mandan|mantan|ma\ndan|mand\*n)\b/gi, // Note: mandan already exists, this adds variations
  /\b(chavar|chawaru|cha\var|chav\*r)\b/gi, // Note: chavar already exists as chavaru, this adds variations
  /\b(uluppillatha|ulupillatha|uluppilla\ha|uluppi\*latha)\b/gi,
  /\b(cheetha|cheeta|ch\etha|chee\*ha)\b/gi,
  /\b(kulamkuthi|kulamkuti|kulamku\hi|kulamku\*hi)\b/gi,
  /\b(ahanghkari|ahankari|ahang\kari|ahangka\*i)\b/gi,
  /\b(chathikkunnavan|chatikunavan|chathikkunna\an|chathikku\*navan)\b/gi,
  /\b(pozhan|pozhnn|po\zhan|pozha\*n)\b/gi,

  // --- Additional English, Hindi, Malayalam Variations and Suffixed Terms ---
  // Note: Many of these are variations of existing terms or terms with suffixes like "marna".
  // This block is appended as per the request to include all provided patterns.
  /\b(fuck|f\ck|f\\k|f[u\*@#\$%^&\(\)_+\-=\[\]\{\};':"\\\|,<>\.\?\/~`]+ck|f[u\*@#\$%^&\(\)_+\-=\[\]\{\};':"\\\|,<>\.\?\/~`]+k|fuq|phuck|phuk|fuker|fukker|fck)\b/gi, // Redundant, already in General English
  /\b(shit|sh\*t|s\\t|sh[i\!1]+t|sht|shyt|s\s*h\s*i\s*t)\b/gi, // Redundant variation
  /\b(asshole|a\*hole|a\\hole|assh0le|a\s*s\s*h\s*o\s*l\s*e)\b/gi, // Redundant variation
  /\b(bitch|b\*tch|b\\h|bi[t7]ch|bich|b\s*i\s*t\s*c\s*h)\b/gi, // Redundant variation
  /\b(cunt|c\*nt|c\\t|cunt|c\s*u\s*n\s*t)\b/gi, // Redundant variation
  /\b(damn|d\*mn|d\\n|dam|darn|d\s*a\s*m\s*n)\b/gi, // Redundant variation
  /\b(hell|h\*ll|h\\l|heck|h\s*e\s*l\s*l)\b/gi, // Redundant variation
  /\b(dick|d\*ck|d\\k|dik|d\s*i\s*c\s*k)\b/gi, // Redundant variation
  /\b(pussy|p\*ssy|p\\sy|puss|p\s*u\s*s\s*s\s*y)\b/gi, // Redundant variation
  /\b(whore|w\*ore|w\\re|hoer|w\s*h\s*o\s*r\s*e)\b/gi, // Redundant variation
  /\b(slut|s\*ut|s\\t|slutt|s\s*l\s*u\s*t)\b/gi, // Redundant variation
  /\b(bastard|b\*stard|b\\tard|basterd|b\s*a\s*s\s*t\s*a\s*r\s*d)\b/gi, // Redundant variation
  /\b(wanker|w\*nker|w\\ker|wankr|w\s*a\s*n\s*k\s*e\s*r)\b/gi, // Redundant variation
  /\b(twat|t\*at|t\\t|tw@t|t\s*w\s*a\s*t)\b/gi, // Redundant variation
  /\b(arsehole|a\*sehole|a\\ehole|arseh0le|a\s*r\s*s\s*e\s*h\s*o\s*l\s*e)\b/gi, // Redundant variation
  /\b(bollocks|b\*llocks|b\\locks)\b/gi,
  /\b(sod|s\*d|s\\d)\b/gi,
  /\b(bugger|b\*gger|b\\gger)\b/gi, // Redundant variation
  /\b(crap|c\*ap|c\\p)\b/gi, // Redundant variation
  /\b(bloody|bl\*ody|bl\\dy)\b/gi, // Redundant variation
  /\b(arse|a\*se|a\\e)\b/gi, // Redundant variation
  /\b(sex|s\*x|s\\x|s\s*e\s*x)\b/gi, // Redundant variation
  /\b(penis|p\*nis|p\\is|peen|p\s*e\s*n\s*i\s*s)\b/gi, // Redundant variation
  /\b(vagina|v\*gina|v\\ina|vajayjay|v\s*a\s*g\s*i\s*n\s*a)\b/gi, // Redundant variation
  /\b(boobs|b\*obs|b\\bs|tits|titties|b\s*o\s*o\s*b\s*s)\b/gi, // Redundant (tits also covered separately)
  /\b(anal|a\*al|a\\l|an@l|a\s*n\s*a\s*l)\b/gi, // Redundant variation
  /\b(blowjob|b\*owjob|b\\wjob|bj|b\s*l\s*o\s*w\s*j\s*o\s*b)\b/gi, // Redundant variation
  /\b(handjob|h\*ndjob|h\\djob|hj|h\s*a\s*n\s*d\s*j\s*o\s*b)\b/gi, // Redundant variation
  /\b(masturbat|m\*sturbat|m\\turbat|jerk\s*off|m\s*a\s*s\s*t\s*u\s*r\s*b\s*a\s*t)\b/gi, // Redundant variation
  /\b(orgasm|o\*gasm|o\\asm|o\s*r\s*g\s*a\s*s\s*m)\b/gi, // Redundant variation
  /\b(erotic|e\*otic|e\\tic|erotik|e\s*r\s*o\s*t\s*i\s*c)\b/gi, // Redundant variation
  /\b(cum|c\*m|c\\m|jizz|c\s*u\s*m)\b/gi, // Redundant variation (jizz also covered)
  /\b(ejaculate|e\*aculate|e\\aculate)\b/gi, // Redundant variation
  /\b(intercourse|i\*tercourse|i\\tercourse)\b/gi,
  /\b(porn|p\*rn|p\\n|porno|p\s*o\s*r\s*n)\b/gi, // Redundant variation
  /\b(hooker|h\*oker|h\\ker)\b/gi,
  /\b(pervert|p\*rvert|p\\vert|pedo)\b/gi,
  /\b(n[i1]gg[ae3r]+|n\*gg[ae3r]+|n\\gg[ae3r]+|n\s*i\s*g\s*g\s*e\s*r)\b/gi, // Redundant variation
  /\b(chink|c\*ink|c\\k|ch1nk|c\s*h\s*i\s*n\s*k)\b/gi, // Redundant variation
  /\b(spic|s\*ic|s\\c|spik|s\s*p\s*i\s*c)\b/gi, // Redundant variation
  /\b(kike|k\*ke|k\\e|kyke|k\s*i\s*k\s*e)\b/gi, // Redundant variation
  /\b(wetback|w\*tback|w\\back|wetbak|w\s*e\s*t\s*b\s*a\s*c\s*k)\b/gi, // Redundant variation
  /\b(cracker|c\*acker|c\\acker|kraker|c\s*r\s*a\s*c\s*k\s*e\s*r)\b/gi, // Redundant variation
  /\b(honky|h\*nky|h\\ky|honkie|h\s*o\s*n\s*k\s*y)\b/gi, // Redundant variation
  /\b(redneck|r\*dneck|r\\neck|rednek|r\s*e\s*d\s*n\s*e\s*c\s*k)\b/gi,
  /\b(terrorist|t\*rrorist|t\\rorist|terrorist|t\s*e\s*r\s*r\s*o\s*r\s*i\s*s\s*t)\b/gi, // Redundant variation
  /\b(white\s*power|w\*ite\s*p\*wer|w\\ite\s*p\\wer)\b/gi, // Redundant variation
  /\b(black\s*power|b\*ack\s*p\*wer|b\\ack\s*p\\wer)\b/gi, // Redundant variation
  /\b(hitler|h\*tler|h\\ler|h1tler|h\s*i\s*t\s*l\s*e\s*r)\b/gi, // Redundant variation
  /\b(nazi|n\*zi|n\\i|naz1|n\s*a\s*z\s*i)\b/gi, // Redundant variation
  /\b(klan|k\*an|k\\n|kkk|k\s*l\s*a\s*n)\b/gi, // Redundant variation
  /\b(holocaust|h\*locaust|h\\locaust)\b/gi, // Redundant variation
  /\b(paki|p\*ki|p\\i)\b/gi, // Redundant variation
  /\b(gook|g\*ok|g\\k)\b/gi, // Redundant variation
  /\b(sand\s*n[i1]gg[ae3r]+)\b/gi,
  /\b(bigot|b\*got|b\\got)\b/gi,
  /\b(racist|r\*cist|r\\cist)\b/gi,
  /\b(sexist|s\*xist|s\\xist)\b/gi,
  /\b(fag|f\*g|f\\g|f@g|f\s*a\s*g)\b/gi, // Redundant variation
  /\b(faggot|f\*ggot|f\\ggot|f@ggot|f\s*a\s*g\s*g\s*o\s*t)\b/gi, // Redundant variation
  /\b(queer|q\*eer|q\\er|qweer|q\s*u\s*e\s*e\s*r)\b/gi, // Redundant variation
  /\b(homo|h\*mo|h\\o|h0mo|h\s*o\s*m\s*o)\b/gi, // Redundant variation
  /\b(tranny|t\*anny|t\\nny|transexual|t\s*r\s*a\s*n\s*n\s*y)\b/gi, // Redundant variation
  /\b(shemale|s\*emale|s\\male|shem@le|s\s*h\s*e\s*m\s*a\s*l\s*e)\b/gi, // Redundant variation
  /\b(dyke|d\*ke|d\\e|dyk|d\s*y\s*k\s*e)\b/gi, // Redundant variation
  /\b(lesbo|l\*sbo|l\\bo|lezbo|l\s*e\s*s\s*b\s*o)\b/gi, // Redundant variation
  /\b(cocaine|c\*caine|c\\aine|coke|c\s*o\s*c\s*a\s*i\s*n\s*e)\b/gi, // Redundant variation
  /\b(heroin|h\*roin|h\\oin|smack|h\s*e\s*r\s*o\s*i\s*n)\b/gi, // Redundant variation
  /\b(meth|m\*th|m\\h|crystal\s*meth|m\s*e\s*t\s*h)\b/gi, // Redundant variation
  /\b(weed|w\*ed|w\\d|pot|ganja|w\s*e\s*e\s*d)\b/gi, // Redundant variation
  /\b(marijuana|m\*rijuana|m\\rijuana|mary\s*jane|m\s*a\s*r\s*i\s*j\s*u\s*a\s*n\s*a)\b/gi, // Redundant variation
  /\b(lsd|l\*d|l\\d|acid|l\s*s\s*d)\b/gi, // Redundant variation
  /\b(ecstasy|e\*stasy|e\\stasy|molly|e\s*c\s*s\s*t\s*a\s*s\s*y)\b/gi, // Redundant variation
  /\b(crack|c\*ack|c\\ck|crak|c\s*r\s*a\s*c\s*k)\b/gi, // Redundant variation
  /\b(dope|d\*pe|d\\e)\b/gi, // Redundant variation
  /\b(pills|p\*lls|p\\lls)\b/gi,
  /\b(speed|s\*eed|s\\eed)\b/gi,
  /\b(kill|k\*ll|k\\l|k1ll|k\s*i\s*l\s*l)\b/gi, // Redundant variation
  /\b(murder|m\*rder|m\\rder|murd3r|m\s*u\s*r\s*d\s*e\s*r)\b/gi, // Redundant variation
  /\b(rape|r\*pe|r\\e|r@pe|r\s*a\s*p\s*e)\b/gi, // Redundant variation
  /\b(beating|b\*ating|b\\ating|beatdown|b\s*e\s*a\s*t\s*i\s*n\s*g)\b/gi, // Redundant variation
  /\b(stab|s\*ab|s\\b|st@b|s\s*t\s*a\s*b)\b/gi, // Redundant variation
  /\b(shoot|s\*oot|s\\ot|sh0ot|s\s*h\s*o\s*o\s*t)\b/gi, // Redundant variation
  /\b(bomb|b\*mb|b\\b|b0mb|b\s*o\s*m\s*b)\b/gi, // Redundant variation
  /\b(terror|t\*rror|t\\ror|terr0r|t\s*e\s*r\s*r\s*o\s*r)\b/gi, // Redundant variation
  /\b(suicide|s\*icide|s\\icide|suicid3|s\s*u\s*i\s*c\s*i\s*d\s*e)\b/gi, // Redundant variation
  /\b(hang|h\*ng|h\\g|h@ng|h\s*a\s*n\s*g)\b/gi, // Redundant variation
  /\b(torture|t\*rture|t\\ture)\b/gi, // Redundant variation
  /\b(mutilate|m\*tilate|m\\tilate)\b/gi,
  /\b(dismember|d\*smember|d\\member)\b/gi,
  /\b(assault|a\*sault|a\\ault)\b/gi, // Redundant variation
  /\b(retard|r\*tard|r\\tard|r3tard|r\s*e\s*t\s*a\s*r\s*d)\b/gi, // Redundant variation
  /\b(moron|m\*ron|m\\on|m0ron|m\s*o\s*r\s*o\s*n)\b/gi, // Redundant variation
  /\b(idiot|i\*iot|i\\ot|id1ot|i\s*d\s*i\s*o\s*t)\b/gi, // Redundant variation
  /\b(stupid|s\*upid|s\\pid|stup1d|s\s*t\s*u\s*p\s*i\s*d)\b/gi, // Redundant variation
  /\b(dumb|d\*mb|d\\b|d\s*u\s*m\s*b)\b/gi, // Redundant variation
  /\b(fatass|f\*tass|f\\ass|fat@ss|f\s*a\s*t\s*a\s*s\s*s)\b/gi, // Redundant variation
  /\b(ugly|u\*ly|u\\y|ugl1|u\s*g\s*l\s*y)\b/gi, // Redundant variation
  /\b(loser|l\*ser|l\\er|l0ser|l\s*o\s*s\s*e\s*r)\b/gi, // Redundant variation
  /\b(freak|f\*eak|f\\ak)\b/gi, // Redundant variation
  /\b(weirdo|w\*irdo|w\\rdo)\b/gi,
  /\b(psycho|p\*ycho|p\\cho)\b/gi,
  /\b(creep|c\*eep|c\\ep)\b/gi,
  /\b(degenerate|d\*generate|d\\generate)\b/gi, // Redundant variation
  /\b(scum|s\*um|s\\m)\b/gi, // Redundant variation, (scumbag already exists)
  /\b(cretin|c\*etin|c\\tin)\b/gi, // Redundant variation
  /\b(stfu|s\*fu|s\\u)\b/gi, // Redundant variation
  /\b(gtfo|g\*fo|g\\o)\b/gi, // Redundant variation
  /\b(wtf|w\*f|w\\f)\b/gi, // Redundant variation
  /\b(omfg|o\*fg|o\\g)\b/gi, // Redundant variation
  /\b(lmfao|l\*fao|l\\ao)\b/gi, // Redundant variation
  /\b(roflmao|r\*flmao|r\\flmao)\b/gi,
  /\b(ffs|f\*s|f\\s)\b/gi, // Redundant variation
  /\b(idgaf|i\*gaf|i\\gaf)\b/gi, // Redundant variation
  /\b(nsfw|n\*fw|n\\w)\b/gi,
  /\b(behenchod|bhenchod|bc|behen\s*chod|bhen\s*chod|behnchod|behenchode)\b/gi, // Redundant variation
  /\b(madarchod|maderchod|mc|madar\s*chod|mader\s*chod|maadar\s*chod|madarchode)\b/gi, // Redundant variation
  /\b(bhosdike|bhosadi\s*ke|bhosdi\s*k|bhosdike|bhosdiki|bhosdika)\b/gi, // Redundant variation
  /\b(randi|r@ndi|randi|raandi)\b/gi, // Redundant variation
  /\b(chutiya|chutiya|chutiya|chutya|chutiye)\b/gi, // Redundant variation
  /\b(gaandu|gandu|gandu|g@ndu|gaand)\b/gi, // Redundant variation
  /\b(haramkhor|haram\s*khor|haramkhor|haraamkhor)\b/gi, // Redundant variation
  /\b(kutta|kutiya|kutte|kutti)\b/gi, // Redundant variation
  /\b(suar|suwar|suwar)\b/gi, // Redundant variation
  /\b(lund|land|l@nd|laund)\b/gi, // Redundant variation
  /\b(choot|choo[t7]|chut|chootiya)\b/gi, // Redundant variation
  /\b(pagal|paagal|paagal)\b/gi, // Redundant variation
  /\b(bewakoof|bevakoof|bewkoof|bevkoof)\b/gi, // Redundant variation
  /\b(saala|saali|saale|saali)\b/gi, // Redundant variation
  /\b(ghanta|ghantaa)\b/gi, // Redundant variation
  /\b(bakchod|bakchodi|bakchodi)\b/gi, // Redundant variation
  /\b(tatti|tatti)\b/gi, // Redundant variation
  /\b(jhaant|jhaant)\b/gi, // Redundant variation
  /\b(gand|gaand)\b/gi, // Redundant variation
  /\b(lauda|lauda)\b/gi, // Redundant variation
  /\b(bh[e3]nch[o0]d)\b/gi,
  /\b(m[a@][dD][a@][rR]ch[o0]d)\b/gi,
  /\b(ch[uU][tT][iI][yY][aA])\b/gi, // Redundant variation
  /\b(g[aA][nN][dD][uU])\b/gi, // Redundant variation
  /\b(choo[t7])\b/gi, // Redundant variation
  /\b(kamine|kameene)\b/gi,
  /\b(harami|haraami)\b/gi,
  /\b(gadha|gadhe)\b/gi,
  /\b(ullu)\b/gi,
  /\b(tharki)\b/gi,
  /\b(chapri)\b/gi,
  /\b(fattu)\b/gi,
  /\b(takla)\b/gi,
  /\b(mota|moti)\b/gi,
  /\b(kaala|kaali)\b/gi,
  /\b(gora|gori)\b/gi,
  /\b(chakka)\b/gi,
  /\b(hijra)\b/gi, // Redundant variation
  /\b(kutte\s*ka\s*bachcha)\b/gi,
  /\b(maa\s*ki\s*gaali)\b/gi,
  /\b(baap\s*ka\s*maal)\b/gi,
  /\b(chutiyaapa)\b/gi,
  /\b(ghatiya)\b/gi,
  /\b(besharam)\b/gi,
  /\b(nalayak)\b/gi,
  /\b(gawar)\b/gi,
  /\b(jhandu)\b/gi,
  /\b(bhadwa)\b/gi, // Redundant variation
  /\b(dalal)\b/gi,
  /\b(chutiye)\b/gi, // Redundant variation
  /\b(gand\s*mara)\b/gi,
  /\b(bhosdi)\b/gi,
  /\b(lodu)\b/gi,
  /\b(chuti)\b/gi,
  /\b(gand\s*phat)\b/gi,
  /\b(teri\s*maa\s*ki)\b/gi,
  /\b(teri\s*behen\s*ki)\b/gi,
  /\b(chod)\b/gi,
  /\b(chodo)\b/gi,
  /\b(chudai)\b/gi,
  /\b(gand\s*faad)\b/gi,
  /\b(maadar)\b/gi,
  /\b(behen)\b/gi,
  /\b(bhosda)\b/gi,
  /\b(chutmarani)\b/gi,
  /\b(gandmarani)\b/gi,
  /\b(saali\s*kutti)\b/gi,
  /\b(kutta\s*kamine)\b/gi,
  /\b(haramzade)\b/gi,
  /\b(chutiye\s*ka\s*bachcha)\b/gi,
  /\b(gand\s*mein)\b/gi,
  /\b(lund\s*choos)\b/gi,
  /\b(choot\s*chat)\b/gi,
  /\b(gand\s*chat)\b/gi,
  /\b(bhadve)\b/gi,
  /\b(dalal\s*ka\s*bachcha)\b/gi,
  /\b(randi\s*ka\s*bachcha)\b/gi,
  /\b(chutiya\s*sala)\b/gi,
  /\b(gandu\s*sala)\b/gi,
  /\b(lund\s*fakir)\b/gi,
  /\b(choot\s*ki\s*rani)\b/gi,
  /\b(gand\s*ki\s*rani)\b/gi,
  /\b(maaki\s*ankh)\b/gi,
  /\b(behen\s*ki\s*ankh)\b/gi,
  /\b(teri\s*maa\s*ka\s*bhosda)\b/gi,
  /\b(teri\s*behen\s*ka\s*bhosda)\b/gi,
  /\b(teri\s*maa\s*ka\s*lund)\b/gi,
  /\b(teri\s*behen\s*ka\s*lund)\b/gi,
  /\b(chutmaran)\b/gi,
  /\b(gandmaran)\b/gi,
  /\b(bhosdichod)\b/gi,
  /\b(lundchod)\b/gi,
  /\b(chootchod)\b/gi,
  /\b(gandchod)\b/gi,
  /\b(chutiyapanti)\b/gi,
  /\b(gand\s*masti)\b/gi,
  /\b(lund\s*le\s*le)\b/gi,
  /\b(choot\s*le\s*le)\b/gi,
  /\b(gand\s*le\s*le)\b/gi,
  /\b(randi\s*baaz)\b/gi,
  /\b(haramzada)\b/gi,
  /\b(gand\s*phadu)\b/gi,
  /\b(lund\s*chata)\b/gi,
  /\b(choot\s*chata)\b/gi,
  /\b(gand\s*chata)\b/gi,
  /\b(lund\s*chati)\b/gi,
  /\b(choot\s*chati)\b/gi,
  /\b(gand\s*chati)\b/gi,
  /\b(gand\s*mein\s*danda)\b/gi,
  /\b(lund\s*ka\s*baal)\b/gi,
  /\b(choot\s*ka\s*baal)\b/gi,
  /\b(gand\s*ka\s*baal)\b/gi,
  /\b(bhosdi\s*wala)\b/gi,
  /\b(lund\s*wala)\b/gi,
  /\b(choot\s*wala)\b/gi,
  /\b(gand\s*wala)\b/gi,
  /\b(chutiya\s*pana)\b/gi,
  /\b(gandu\s*pana)\b/gi,
  /\b(randi\s*pana)\b/gi,
  /\b(haramipana)\b/gi,
  /\b(bakchodi\s*mat\s*kar)\b/gi,
  /\b(maa\s*chod)\b/gi,
  // /\b(behen\s*chod)\b/gi, // Already covered by more specific behenchod pattern
  // /\b(bhosdi\s*chod)\b/gi, // Already covered by bhosdichod
  // /\b(gand\s*chod)\b/gi, // Already covered
  // /\b(lund\s*chod)\b/gi, // Already covered
  // /\b(choot\s*chod)\b/gi, // Already covered
  /\b(teri\s*maa\s*ki\s*kasam)\b/gi,
  /\b(teri\s*behen\s*ki\s*kasam)\b/gi,
  /\b(teri\s*gaand\s*maarunga)\b/gi,
  /\b(teri\s*maa\s*chodunga)\b/gi,
  /\b(teri\s*behen\s*chodunga)\b/gi,
  /\b(teri\s*bhosdi\s*chodunga)\b/gi,
  /\b(teri\s*lund\s*maarunga)\b/gi,
  /\b(teri\s*choot\s*maarunga)\b/gi,
  /\b(teri\s*maa\s*ka\s*bhonsda)\b/gi, // Variation of bhosda
  /\b(teri\s*behen\s*ka\s*bhonsda)\b/gi, // Variation of bhosda
  /\b(teri\s*maa\s*ka\s*lauda)\b/gi, // Variation of lauda
  /\b(teri\s*behen\s*ka\s*lauda)\b/gi, // Variation of lauda
  // --- MARNA SUFFIX VARIANTS ---
  // Hindi "marna" (to hit/fuck) suffixed variations
  /\b(chutiyapa\s*marna)\b/gi,
  /\b(gand\s*marna)\b/gi,
  /\b(lund\s*marna)\b/gi,
  /\b(choot\s*marna)\b/gi,
  /\b(bhosdi\s*marna)\b/gi,
  /\b(randi\s*marna)\b/gi,
  /\b(haram\s*marna)\b/gi,
  /\b(kutta\s*marna)\b/gi,
  /\b(suar\s*marna)\b/gi,
  /\b(pagal\s*marna)\b/gi,
  /\b(bewakoof\s*marna)\b/gi,
  /\b(saala\s*marna)\b/gi,
  /\b(ghanta\s*marna)\b/gi,
  /\b(bakchod\s*marna)\b/gi,
  /\b(tatti\s*marna)\b/gi,
  /\b(jhaant\s*marna)\b/gi,
  // Gand marna is repeated often, one is enough
  /\b(lauda\s*marna)\b/gi, // Repeated
  /\b(kamine\s*marna)\b/gi,
  /\b(harami\s*marna)\b/gi,
  /\b(gadha\s*marna)\b/gi,
  /\b(ullu\s*marna)\b/gi,
  /\b(tharki\s*marna)\b/gi,
  /\b(chapri\s*marna)\b/gi,
  /\b(fattu\s*marna)\b/gi,
  /\b(takla\s*marna)\b/gi,
  /\b(mota\s*marna)\b/gi,
  /\b(kaala\s*marna)\b/gi,
  /\b(gora\s*marna)\b/gi,
  /\b(chakka\s*marna)\b/gi,
  /\b(hijra\s*marna)\b/gi,
  /\b(kutte\s*ka\s*bachcha\s*marna)\b/gi,
  /\b(maa\s*ki\s*gaali\s*marna)\b/gi,
  /\b(baap\s*ka\s*maal\s*marna)\b/gi,
  /\b(chutiyaapa\s*marna)\b/gi, // Repeated
  /\b(ghatiya\s*marna)\b/gi,
  /\b(besharam\s*marna)\b/gi,
  /\b(nalayak\s*marna)\b/gi,
  /\b(gawar\s*marna)\b/gi,
  /\b(jhandu\s*marna)\b/gi,
  /\b(bhadwa\s*marna)\b/gi,
  /\b(dalal\s*marna)\b/gi,
  /\b(chutiye\s*marna)\b/gi,
  /\b(gand\s*mein\s*marna)\b/gi,
  /\b(lund\s*choos\s*marna)\b/gi,
  /\b(choot\s*chat\s*marna)\b/gi,
  /\b(gand\s*chat\s*marna)\b/gi,
  /\b(bhadve\s*marna)\b/gi,
  /\b(randi\s*ka\s*bachcha\s*marna)\b/gi,
  /\b(chutiya\s*sala\s*marna)\b/gi,
  /\b(gandu\s*sala\s*marna)\b/gi,
  /\b(lund\s*fakir\s*marna)\b/gi,
  /\b(choot\s*ki\s*rani\s*marna)\b/gi,
  /\b(gand\s*ki\s*rani\s*marna)\b/gi,
  /\b(maaki\s*ankh\s*marna)\b/gi,
  /\b(behen\s*ki\s*ankh\s*marna)\b/gi,
  /\b(teri\s*maa\s*ka\s*bhosda\s*marna)\b/gi, // Repeated
  /\b(teri\s*behen\s*ka\s*bhosda\s*marna)\b/gi, // Repeated
  /\b(teri\s*maa\s*ka\s*lund\s*marna)\b/gi, // Repeated
  /\b(teri\s*behen\s*ka\s*lund\s*marna)\b/gi, // Repeated
  /\b(chutmaran\s*marna)\b/gi, // Repeated
  /\b(gandmaran\s*marna)\b/gi, // Repeated
  /\b(bhosdichod\s*marna)\b/gi, // Repeated
  /\b(lundchod\s*marna)\b/gi, // Repeated
  /\b(chootchod\s*marna)\b/gi, // Repeated
  /\b(gandchod\s*marna)\b/gi, // Repeated
  /\b(chutiyapanti\s*marna)\b/gi, // Repeated
  /\b(gand\s*masti\s*marna)\b/gi, // Repeated
  /\b(lund\s*le\s*le\s*marna)\b/gi, // Repeated
  /\b(choot\s*le\s*le\s*marna)\b/gi, // Repeated
  /\b(gand\s*le\s*le\s*marna)\b/gi, // Repeated
  /\b(randi\s*baaz\s*marna)\b/gi, // Repeated
  /\b(haramzada\s*marna)\b/gi, // Repeated
  /\b(gand\s*phadu\s*marna)\b/gi, // Repeated
  /\b(lund\s*chata\s*marna)\b/gi, // Repeated
  /\b(choot\s*chata\s*marna)\b/gi, // Repeated
  /\b(gand\s*chata\s*marna)\b/gi, // Repeated
  /\b(lund\s*chati\s*marna)\b/gi, // Repeated
  /\b(choot\s*chati\s*marna)\b/gi, // Repeated
  /\b(gand\s*chati\s*marna)\b/gi, // Repeated
  /\b(gand\s*mein\s*danda\s*marna)\b/gi, // Repeated
  /\b(lund\s*ka\s*baal\s*marna)\b/gi, // Repeated
  /\b(choot\s*ka\s*baal\s*marna)\b/gi, // Repeated
  /\b(gand\s*ka\s*baal\s*marna)\b/gi, // Repeated
  /\b(bhosdi\s*wala\s*marna)\b/gi, // Repeated
  /\b(lund\s*wala\s*marna)\b/gi, // Repeated
  /\b(choot\s*wala\s*marna)\b/gi, // Repeated
  /\b(gand\s*wala\s*marna)\b/gi, // Repeated
  /\b(chutiya\s*pana\s*marna)\b/gi, // Repeated
  /\b(gandu\s*pana\s*marna)\b/gi, // Repeated
  /\b(randi\s*pana\s*marna)\b/gi, // Repeated
  /\b(haramipana\s*marna)\b/gi, // Repeated
  /\b(bakchodi\s*mat\s*kar\s*marna)\b/gi, // Repeated
  /\b(maa\s*chod\s*marna)\b/gi, // Repeated
  /\b(behen\s*chod\s*marna)\b/gi, // Repeated
  // Bhosdi chod marna repeated
  // Gand chod marna repeated
  // Lund chod marna repeated
  // Choot chod marna repeated
  /\b(teri\s*maa\s*ki\s*kasam\s*marna)\b/gi, // Repeated
  /\b(teri\s*behen\s*ki\s*kasam\s*marna)\b/gi, // Repeated
  /\b(teri\s*gaand\s*maarunga\s*marna)\b/gi, // Repeated
  /\b(teri\s*maa\s*chodunga\s*marna)\b/gi, // Repeated
  /\b(teri\s*behen\s*chodunga\s*marna)\b/gi, // Repeated
  /\b(teri\s*bhosdi\s*chodunga\s*marna)\b/gi, // Repeated
  /\b(teri\s*lund\s*maarunga\s*marna)\b/gi, // Repeated
  /\b(teri\s*choot\s*maarunga\s*marna)\b/gi, // Repeated
  /\b(teri\s*maa\s*ka\s*bhonsda\s*marna)\b/gi, // Repeated variation
  /\b(teri\s*behen\s*ka\s*bhonsda\s*marna)\b/gi, // Repeated variation
  /\b(teri\s*maa\s*ka\s*lauda\s*marna)\b/gi, // Repeated variation
  /\b(teri\s*behen\s*ka\s*lauda\s*marna)\b/gi, // Repeated variation
  // Chutmaran marna repeated
  // Gandmaran marna repeated
  // Bhosdichod marna repeated
  // Lundchod marna repeated
  // Chootchod marna repeated
  // Gandchod marna repeated
  // Chutiyapanti marna repeated
  // Gand masti marna repeated
  // Lund le le marna repeated
  // Choot le le marna repeated
  // Gand le le marna repeated
  // Randi baaz marna repeated
  // Haramzada marna repeated
  // Gand phadu marna repeated
  // Lund chata marna repeated
  // Choot chata marna repeated
  // Gand chata marna repeated
  // Lund chati marna repeated
  // Choot chati marna repeated
  // Gand chati marna repeated
  // Gand mein danda marna repeated
  // Lund ka baal marna repeated
  // Choot ka baal marna repeated
  // Gand ka baal marna repeated
  // Bhosdi wala marna repeated
  // Lund wala marna repeated
  // Choot wala marna repeated
  // Gand wala marna repeated
  // Chutiya pana marna repeated
  // Gandu pana marna repeated
  // Randi pana marna repeated
  // Haramipana marna repeated
  // Bakchodi mat kar marna repeated
  // Maa chod marna repeated
  // Behen chod marna repeated
  // Bhosdi chod marna repeated
  // Gand chod marna repeated
  // Lund chod marna repeated
  // Choot chod marna repeated
  // Teri maa ki kasam marna repeated
  // Teri behen ki kasam marna repeated
  // Teri gaand maarunga marna repeated
  // Teri maa chodunga marna repeated
  // Teri behen chodunga marna repeated
  // Teri bhosdi chodunga marna repeated
  // Teri lund maarunga marna repeated
  // Teri choot maarunga marna repeated
  // Teri maa ka bhonsda marna repeated
  // Teri behen ka bhonsda marna repeated
  // Teri maa ka lauda marna repeated
  // Teri behen ka lauda marna repeated
  // Chutmaran marna repeated
  // Gandmaran marna repeated
  // Bhosdichod marna repeated
  // Lundchod marna repeated
  // Chootchod marna repeated
  // Gandchod marna repeated
  // Chutiyapanti marna repeated
  // Gand masti marna repeated
  // Lund le le marna repeated
  // Choot le le marna repeated
  // Gand le le marna repeated
  // Randi baaz marna repeated
  // Haramzada marna repeated
  // Gand phadu marna repeated
  // Lund chata marna repeated
  // Choot chata marna repeated
  // Gand chata marna repeated
  // Lund chati marna repeated
  // Choot chati marna repeated
  // Gand chati marna repeated
  // Gand mein danda marna repeated
  // Lund ka baal marna repeated
  // Choot ka baal marna repeated
  // Gand ka baal marna repeated
  // Bhosdi wala marna repeated
  // Lund wala marna repeated
  // Choot wala marna repeated
  // Gand wala marna repeated
  // Chutiya pana marna repeated
  // Gandu pana marna repeated
  // Randi pana marna repeated
  // Haramipana marna repeated
  // Bakchodi mat kar marna repeated
  // Maa chod marna repeated
  // Behen chod marna repeated
  // Bhosdi chod marna repeated
  // Gand chod marna repeated
  // Lund chod marna repeated
  // Choot chod marna repeated
  // Teri maa ki kasam marna repeated
  // Teri behen ki kasam marna repeated
  // Teri gaand maarunga marna repeated
  // Teri maa chodunga marna repeated
  // Teri behen chodunga marna repeated
  // Teri bhosdi chodunga marna repeated
  // Teri lund maarunga marna repeated
  // Teri choot maarunga marna repeated
  // Teri maa ka bhonsda marna repeated
  // Teri behen ka bhonsda marna repeated
  // Teri maa ka lauda marna repeated
  // Teri behen ka lauda marna repeated
  // Chutmaran marna repeated
  // Gandmaran marna repeated
  // Bhosdichod marna repeated
  // Lundchod marna repeated
  // Chootchod marna repeated
  // Gandchod marna repeated
  // Chutiyapanti marna repeated
  // Gand masti marna repeated
  // Lund le le marna repeated
  // Choot le le marna repeated
  // Gand le le marna repeated
  // Randi baaz marna repeated
  // Haramzada marna repeated
  // Gand phadu marna repeated
  // Lund chata marna repeated
  // Choot chata marna repeated
  // Gand chata marna repeated
  // Lund chati marna repeated
  // Choot chati marna repeated
  // Gand chati marna repeated
  // Gand mein danda marna repeated
  // Lund ka baal marna repeated
  // Choot ka baal marna repeated
  // Gand ka baal marna repeated
  // Bhosdi wala marna repeated
  // Lund wala marna repeated
  // Choot wala marna repeated
  // Gand wala marna repeated
  // Chutiya pana marna repeated
  // Gandu pana marna repeated
  // Randi pana marna repeated
  // Haramipana marna repeated
  // Bakchodi mat kar marna repeated
  // Maa chod marna repeated
  // Behen chod marna repeated
  // Bhosdi chod marna repeated
  // Gand chod marna repeated
  // Lund chod marna repeated
  // Choot chod marna repeated
  // Teri maa ki kasam marna repeated
  // Teri behen ki kasam marna repeated
  // Teri gaand maarunga marna repeated
  // Teri maa chodunga marna repeated
  // Teri behen chodunga marna repeated
  // Teri bhosdi chodunga marna repeated
  // Teri lund maarunga marna repeated
  // Teri choot maarunga marna repeated
  // Teri maa ka bhonsda marna repeated
  // Teri behen ka bhonsda marna repeated
  // Teri maa ka lauda marna repeated
  // Teri behen ka lauda marna repeated
  // Chutmaran marna repeated
  // Gandmaran marna repeated
  // Bhosdichod marna repeated
  // Lundchod marna repeated
  // Chootchod marna repeated
  // Gandchod marna repeated
  // Chutiyapanti marna repeated
  // Gand masti marna repeated
  // Lund le le marna repeated
  // Choot le le marna repeated
  // Gand le le marna repeated
  // Randi baaz marna repeated
  // Haramzada marna repeated
  // Gand phadu marna repeated
  // Lund chata marna repeated
  // Choot chata marna repeated
  // Gand chata marna repeated
  // Lund chati marna repeated
  // Choot chati marna repeated
  // Gand chati marna repeated
  // Gand mein danda marna repeated
  // Lund ka baal marna repeated
  // Choot ka baal marna repeated
  // Gand ka baal marna repeated
  // Bhosdi wala marna repeated
  // Lund wala marna repeated
  // Choot wala marna repeated
  // Gand wala marna repeated
  // Chutiya pana marna repeated
  // Gandu pana marna repeated
  // Randi pana marna repeated
  // Haramipana marna repeated
  // Bakchodi mat kar marna repeated
  // Maa chod marna repeated
  // Behen chod marna repeated
  // Bhosdi chod marna repeated
  // Gand chod marna repeated
  // Lund chod marna repeated
  // Choot chod marna repeated
  // Teri maa ki kasam marna repeated
  // Teri behen ki kasam marna repeated
  // Teri gaand maarunga marna repeated
  // Teri maa chodunga marna repeated
  // Teri behen chodunga marna repeated
  // Teri bhosdi chodunga marna repeated
  // Teri lund maarunga marna repeated
  // Teri choot maarunga marna repeated
  // Teri maa ka bhonsda marna repeated
  // Teri behen ka bhonsda marna repeated
  // Teri maa ka lauda marna repeated
  // Teri behen ka lauda marna repeated
  // Chutmaran marna repeated
  // Gandmaran marna repeated
  // Bhosdichod marna repeated
  // Lundchod marna repeated
  // Chootchod marna repeated
  // Gandchod marna repeated
  // Chutiyapanti marna repeated
  // Gand masti marna repeated
  // Lund le le marna repeated
  // Choot le le marna repeated
  // Gand le le marna repeated
  // Randi baaz marna repeated
  // Haramzada marna repeated
  // Gand phadu marna repeated
  // Lund chata marna repeated
  // Choot chata marna repeated
  // Gand chata marna repeated
  // Lund chati marna repeated
  // Choot chati marna repeated
  // Gand chati marna repeated
  // Gand mein danda marna repeated
  // Lund ka baal marna repeated
  // Choot ka baal marna repeated
  // Gand ka baal marna repeated
  // Bhosdi wala marna repeated
  // Lund wala marna repeated
  // Choot wala marna repeated
  // Gand wala marna repeated
  // Chutiya pana marna repeated
  // Gandu pana marna repeated
  // Randi pana marna repeated
  // Haramipana marna repeated
  // Bakchodi mat kar marna repeated
  // Maa chod marna repeated
  // Behen chod marna repeated
  // Bhosdi chod marna repeated
  // Gand chod marna repeated
  // Lund chod marna repeated
  // Choot chod marna repeated
  // Teri maa ki kasam marna repeated
  // Teri behen ki kasam marna repeated
  // Teri gaand maarunga marna repeated
  // Teri maa chodunga marna repeated
  // Teri behen chodunga marna repeated
  // Teri bhosdi chodunga marna repeated
  // Teri lund maarunga marna repeated
  // Teri choot maarunga marna repeated
  // Teri maa ka bhonsda marna repeated
  // Teri behen ka bhonsda marna repeated
  // Teri maa ka lauda marna repeated
  // Teri behen ka lauda marna repeated
  // Chutmaran marna repeated
  // Gandmaran marna repeated
  // Bhosdichod marna repeated
  // Lundchod marna repeated
  // Chootchod marna repeated
  // Gandchod marna repeated
  // Chutiyapanti marna repeated
  // Gand masti marna repeated
  // Lund le le marna repeated
  // Choot le le marna repeated
  // Gand le le marna repeated
  // Randi baaz marna repeated
  // Haramzada marna repeated

  // Add more specific and relevant terms for your application context
  // Consider variations, misspellings, and attempts to bypass filters
  // This list is illustrative and not exhaustive.
  // Some terms can be highly context-dependent.
];

// What to replace banned words with
export const CENSOR_REPLACEMENT = '****';

/**
 * Censors text based on the BANNED_WORDS_PATTERNS.
 * @param {string} text - The input text to censor.
 * @returns {string} - The censored text.
 */
export const censorText = (text) => {
  if (!text || typeof text !== 'string') return text;
  let censoredText = text;
  BANNED_WORDS_PATTERNS.forEach(pattern => {
    // Ensure the pattern is a valid RegExp object if it's coming from a dynamic source
    // For this static list, it's already a RegExp
    const regex = new RegExp(pattern.source, pattern.flags); // Recreate to ensure fresh state for exec if used
    censoredText = censoredText.replace(regex, CENSOR_REPLACEMENT);
  });
  return censoredText;
};

/**
 * Checks if text contains any banned words.
 * @param {string} text - The input text to check.
 * @returns {boolean} - True if banned words are found, false otherwise.
 */
export const hasBannedWords = (text) => {
  if (!text || typeof text !== 'string') return false;
  return BANNED_WORDS_PATTERNS.some(pattern => {
    const regex = new RegExp(pattern.source, pattern.flags); // Recreate for .test()
    return regex.test(text);
  });
};

/**
 * Returns an array of banned words found in the text.
 * @param {string} text - The input text to scan.
 * @returns {Array<string>} - Array of unique banned words found.
 */
export const getBannedWordsInText = (text) => {
  if (!text || typeof text !== 'string') return [];

  const foundWords = new Set(); // Use a Set to store unique words
  BANNED_WORDS_PATTERNS.forEach(pattern => {
    const regex = new RegExp(pattern.source, pattern.flags); // Recreate for .match()
    const matches = text.match(regex);
    if (matches) {
      matches.forEach(match => foundWords.add(match.toLowerCase())); // Add found matches to the Set
    }
  });

  return Array.from(foundWords); // Convert Set to array
};
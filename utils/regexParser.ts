import { CITIES_PATTERN } from './cities';

// Common list of names for regex matching
// Note: We escape the backslash for the boundary \b -> \\b
const VORNAMEN_PATTERN = "(?:Aaliyah|Aaron|Adam|Adrian|Alexander|Alfred|Alice|Andreas|Angela|Anna|Anne|Antonia|Arthur|Barbara|Ben|Benjamin|Bernhard|Bernd|Bettina|Bianca|Birgit|Brigitte|Carl|Carla|Carlos|Caroline|Carsten|Chantal|Charlotte|Christian|Christiane|Christina|Christine|Christoph|Claudia|Claus|Cornelia|Dagmar|Daniel|Daniela|David|Dennis|Dieter|Dietmar|Dirk|Dominik|Doris|Eberhard|Edith|Elisabeth|Elke|Ellen|Elfriede|Elias|Emil|Emily|Emma|Erich|Erik|Erika|Ernst|Erwin|Esther|Eva|Evelyn|Fabian|Felix|Florian|Frank|Franz|Franziska|Friedrich|Gabriele|Georg|Gerhard|Gertrud|Gisela|Gunnar|Günter|Hanna|Hannes|Hans|Harald|Heike|Heinrich|Heinz|Helga|Helmut|Herbert|Hermann|Holger|Horst|Hubert|Hugo|Ingo|Ingrid|Irene|Iris|Isabel|Jan|Jana|Jane|Janine|Jennifer|Jens|Jessica|Joachim|Johannes|John|Jolanthe|Jonas|Jonathan|Jörg|Josef|Julia|Julian|Juliane|Jürgen|Jutta|Kai|Karin|Karl|Karla|Karolin|Karsten|Katharina|Katja|Katrin|Kevin|Klaus|Konrad|Kristin|Kurt|Lara|Laura|Lea|Lena|Leon|Leonie|Lisa|Lothar|Luca|Lukas|Lutz|Manfred|Manuel|Manuela|Marc|Marcel|Marco|Marcus|Marek|Maria|Marianne|Mario|Marion|Mark|Markus|Martha|Martin|Martina|Mathias|Matthias|Max|Maximilian|Melanie|Michael|Michaela|Miriam|Monika|Moritz|Nadine|Nadja|Nicole|Niklas|Nils|Nina|Norbert|Ola|Olaf|Oliver|Olivia|Patrick|Paul|Paula|Peter|Petra|Philipp|Pia|Rainer|Ralf|Ralph|Ramona|Raphael|Rebecca|Regina|Reinhard|Renate|Rene|Richard|Rita|Robert|Roland|Rolf|Ronald|Rosemarie|Rudolf|Sabine|Sabrina|Sandra|Sara|Sarah|Sascha|Sebastian|Silke|Silvia|Simon|Simone|Sonja|Stefan|Stefanie|Steffen|Stephanie|Susanne|Sven|Svenja|Sylvia|Tanja|Thomas|Thorsten|Tim|Timo|Tobias|Tom|Torsten|Udo|Ulrich|Ulrike|Ursula|Ute|Uwe|Vanessa|Vera|Verena|Veronica|Veronika|Viktor|Viktoria|Volker|Walter|Waltraud|Werner|Wilhelm|Wolfgang|Yvonne|Zoe)\\b";

// Helper function to clean phone numbers
export const clean_number = (number: string): string => {
  let cleaned = number.toString();
  // Remove any letters (labels like Tel, Fax)
  cleaned = cleaned.replace(/[a-zA-Z]/g, "");
  // Remove colons
  cleaned = cleaned.replace(/:/g, " ");
  
  cleaned = cleaned.replace(/\+\s/, "+");
  cleaned = cleaned.replace(/\(0\)/g, "");
  cleaned = cleaned.replace(/[\-._\|\\\/\(\)\[\]\(\)\{\}]+/g, " ");
  cleaned = cleaned.replace(/\s{2,}/g, " ");
  return cleaned.trim();
};

// Helper function to trim whitespaces from beginning and end of string
const trim_whitespace_begin_end = (x: string) => {
  return x.replace(/^\s+|\s+$/gm,'');
}

// The main parser function ported from script.js
export const parseImpressumToVCard = (text: string): string => {
  let vorname = "";
  let nachname = "";
  let firma = "";
  let job_title = "";
  let strasse = "";
  let postleitzahl = "";
  let ort = "";
  let land = ""; // Country detection
  let telefon = "";
  let telefon_mobil = "";
  let fax = "";
  let email = "";
  let www = "";
  let ustid = "";
  let stnr = "";
  let note = "";

  // Pre-processing
  let processedText = text.trim();
  processedText = processedText.replace(/[^\S\r\n]+$/gm, "");

  // 1. Try to find Name via GF/Inhaber context
  let vorname_nachname_gf = "";
  try {
    const re_vorname_nachname_gf = /.*(?:Geschäftsführerin|Geschäftsführung|Geschäftsführer|GF|Inhaberin|Inhaber|(Inh.)|Vorstand|Vorstände|vertreten\sdurch)(:\s*|\s*|:)?([A-Za-zÀ-ÖØ-öø-ÿ]+\-[A-Za-zÀ-ÖØ-öø-ÿ]+|[A-Za-zÀ-ÖØ-öø-ÿ]+)(\s)([A-Za-zÀ-ÖØ-öø-ÿ]+\-[A-Za-zÀ-ÖØ-öø-ÿ]+|[A-Za-zÀ-ÖØ-öø-ÿ]+)/gi;
    const match_vorname_nachname_gf = re_vorname_nachname_gf.exec(processedText);
    if (match_vorname_nachname_gf) {
       vorname_nachname_gf = match_vorname_nachname_gf[3] + match_vorname_nachname_gf[4] + match_vorname_nachname_gf[5];
       vorname = match_vorname_nachname_gf[3] || "";
       nachname = match_vorname_nachname_gf[5] || "";
    }
  } catch (e) {
      // ignore
  }

  // 2. If no Name found, try the database
  if (!vorname && !nachname) {
    try {
        const re_vornamen_find_all = new RegExp(VORNAMEN_PATTERN, 'gim');
        // Find the first match
        const match = re_vornamen_find_all.exec(processedText);
        if (match) {
            vorname = match[0];
            
            // Try to find surname after first name
            try {
                const re_nachname_str = `${vorname}(\\s)([A-Za-zÀ-ÖØ-öø-ÿ]+\\-[A-Za-zÀ-ÖØ-öø-ÿ]+|[A-Za-zÀ-ÖØ-öø-ÿ]+)`;
                const re_nachname = new RegExp(re_nachname_str);
                const match_nachname = processedText.match(re_nachname);
                if (match_nachname) {
                    nachname = match_nachname[2];
                }
            } catch (e) { /* ignore */ }
        }
    } catch (e) { /* ignore */ }
  }

  // 3. Job Title
  try {
    const re_job_title = /Geschäftsführerin|Geschäftsführung|Geschäftsführer|Inhaberin|Inhaber|(Inh.)|Vorstand|Vorstände|Gesellschafter/gim;
    const match_job_title = re_job_title.exec(processedText);
    if (match_job_title) job_title = match_job_title[0];
  } catch (e) { /* ignore */ }

  // 4. Company (Firma)
  try {
    // Expanded regex to include more German and International forms
    const re_firma = /(?:^|\n)(.*)(AG|SE|eG|e\.K\.|e\.Kfr\.|e\.V\.|GbR|gGmbH|GmbH|KGaA|KdöR|AöR|K\.d\.ö\.R\.|KG|OHG|PartG|PartG mbB|UG|Inc\.|Ltd\.|LLC|Corp\.|Limited|Aktiengesellschaft|Eingetragene Genossenschaft|Eingetragener Kaufmann|Eingetragener Verein|Einzelkaufmann|Einzelunternehmen|Fachhochschule|Freiberufler|gesellschaft|Gesellschaft bürgerlichen Rechts|gemeinnützige GmbH|Gesellschaft mit beschränkter Haftung|GmbH & Co\. KG|GmbH & Co\. KGaA|GmbH & Co\. OHG|Ltd\. & Co\. KG|SE & Co\. KG|Kommanditgesellschaft|Kommanditgesellschaft auf Aktien|Körperschaft des öffentlichen Rechts|Anstalt des öffentlichen Rechts|Offene Handelsgesellschaft|Partnerschaftsgesellschaft|Stiftung|UG \(haftungsbeschränkt\)|Unternehmen|Universität)(?:$|\n)/gim;
    const match_firma = re_firma.exec(processedText);
    if (match_firma) {
        firma = match_firma[0].trim();
    }
  } catch (e) { /* ignore */ }

  // 4b. Fallback for Company
  if (!firma && (vorname || nachname)) {
      try {
          const lines = processedText.split(/\r\n|\r|\n/).filter(l => l.trim());
          if (lines.length > 0) {
              const firstLine = lines[0].trim();
              const nameString = `${vorname} ${nachname}`.trim();
              const looksLikeData = /[@+]|http|www|Tel|Fax/.test(firstLine);

              // If first line is not the name and doesn't look like contact data, assume it's company
              if (firstLine !== nameString && !firstLine.includes(nameString) && !looksLikeData) {
                  firma = firstLine;
              }
          }
      } catch (e) { /* ignore */ }
  }

  // 5. Address Detection (New Robust Method)
  try {
    // Strategy: Find the line with "ZIP CITY". This is our anchor.
    // The regex checks for a 5-digit zip followed by a city from our massive database.
    // Matches: Group 1 = Line content before zip (often street), Group 2 = Zip, Group 3 = City
    
    // We look for a line containing the pattern
    const re_anchor_address = new RegExp(`(?:^|\\n)(.*?)?\\b([0-9]{5})\\s+(${CITIES_PATTERN})\\b`, 'i');
    const match_anchor = re_anchor_address.exec(processedText);

    if (match_anchor) {
        // We found a German address!
        postleitzahl = match_anchor[2];
        ort = match_anchor[3];
        land = "Deutschland";
        
        // Attempt to extract street from the part before the zip in the same line, 
        // OR if that is empty/short, look at the previous line.
        let possibleStreet = match_anchor[1] ? match_anchor[1].trim() : "";
        
        // Clean up trailing commas or city names if they appeared before zip (rare but possible)
        possibleStreet = possibleStreet.replace(/,$/, '').trim();

        if (possibleStreet.length > 2) {
             strasse = possibleStreet;
        } else {
             // Look at the line immediately BEFORE the match index
             const matchIndex = match_anchor.index;
             const textBefore = processedText.substring(0, matchIndex).trim();
             const linesBefore = textBefore.split('\n');
             if (linesBefore.length > 0) {
                 const lastLine = linesBefore[linesBefore.length - 1].trim();
                 // Heuristic: Street names usually start with a letter and end with a number
                 // But strictly, we just take the line above as street if we found a solid ZIP City anchor.
                 strasse = lastLine;
             }
        }
    } else {
        // Fallback for Non-German or unknown cities (Original Logic)
        const re_postleitzahl_fallback = /(?:\s)(A-|CH-|D-|BE-|PL-|CZ-|NL-|FR-|IT-|ES-|DK-|SE-|NO-|FI-)?([0-9]{4,5})(?=\s)/i;
        const match_plz = re_postleitzahl_fallback.exec(processedText);
        if (match_plz) {
             const prefix = match_plz[1] ? match_plz[1].toUpperCase().replace('-', '') : '';
             postleitzahl = match_plz[2];
             
             // Try to find City after PLZ
             const re_ort_fallback = new RegExp(`(?:${postleitzahl})\\s+([A-Za-zÀ-ÖØ-öø-ÿ-]+)`, 'i');
             const match_ort = re_ort_fallback.exec(processedText);
             if(match_ort) ort = match_ort[1];

             // Infer Land
             switch(prefix) {
                case 'A': land = 'Österreich'; break;
                case 'CH': land = 'Schweiz'; break;
                case 'BE': land = 'Belgien'; break;
                case 'PL': land = 'Polen'; break;
                case 'NL': land = 'Niederlande'; break;
                case 'FR': land = 'Frankreich'; break;
                case 'IT': land = 'Italien'; break;
                case 'ES': land = 'Spanien'; break;
                case 'DK': land = 'Dänemark'; break;
                case 'SE': land = 'Schweden'; break;
                case 'NO': land = 'Norwegen'; break;
                case 'FI': land = 'Finnland'; break;
                default: 
                   // Heuristic checks
                   if(processedText.includes('Schweiz')) land = 'Schweiz';
                   else if(processedText.includes('Österreich')) land = 'Österreich';
                   else land = 'Deutschland'; 
             }
             
             // Attempt street detection (Line before PLZ)
             const plzIndex = match_plz.index;
             const textBefore = processedText.substring(0, plzIndex).trim();
             const lines = textBefore.split('\n');
             if(lines.length > 0) strasse = lines[lines.length - 1].trim();
        }
    }
  } catch (e) { /* ignore */ }


  // 8. Mobile Phone
  try {
    const re_telefon_mobil = /(?:\D)(((\+|00)\s*49(\s*\(0\)\s*)?\s*1)|01)(.*\d{1,14})/gim;
    const match_telefon_mobil = re_telefon_mobil.exec(processedText);
    if (match_telefon_mobil) {
        telefon_mobil = clean_number(match_telefon_mobil[0]);
    }
  } catch (e) { /* ignore */ }

  // 9. Phone
  try {
    const re_telefon = /(?:\D|\s*)(\+|0|0049).*\d{1,14}$/gim;
    const match_telefon = re_telefon.exec(processedText);
    if (match_telefon) {
        let tempTel = clean_number(match_telefon[0]);
        const re_telefon_check = /(01)|\+49\s?1|00\s?49\s?1.*/gim;
        if (!re_telefon_check.test(tempTel)) {
            telefon = tempTel;
        }
    }
  } catch (e) { /* ignore */ }

  // 10. Fax
  try {
    const re_fax = /(?:x[.\:\(\s_-]*)((\+|0|0049).*\d{1,14}$)/gim;
    const match_fax = re_fax.exec(processedText);
    if (match_fax) fax = clean_number(match_fax[1]);
  } catch (e) { /* ignore */ }

  // 11. Email
  try {
    const re_email = /([a-zA-Z0-9_.+-]+)@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/gim;
    const match_email = re_email.exec(processedText);
    if (match_email) {
        email = match_email[0];
        // 12. Web (from email domain fallback)
        www = "www." + match_email[2];
    }
  } catch (e) { /* ignore */ }

  // 13. Web (Explicit)
  try {
     const re_www = /(http|www).*/gim;
     const match_www = re_www.exec(processedText);
     if (match_www) www = match_www[0];
  } catch (e) { /* ignore */ }

  // 14. Tax IDs
  try {
    const re_ustid = /((Ust|Umsatz)\S+(\s|:))(DE(\s)?.*\d{1,9})/gim;
    const match_ustid = re_ustid.exec(processedText);
    if (match_ustid) ustid = match_ustid[4].replace(/(\/|\s)/g, "");
  } catch (e) { /* ignore */ }

  try {
      const re_stnr = /(?:Steuer+[-\s|:.A-Za-z]*)\D(.*\d{1,9})/gim;
      const match_stnr = re_stnr.exec(processedText);
      if (match_stnr) stnr = match_stnr[1];
  } catch(e) { /* ignore */ }

  // 15. Construct Note
  let notesParts = [];
  if (ustid) notesParts.push(`UStID: ${ustid}`);
  if (stnr) notesParts.push(`StNr: ${stnr}`);
  if (job_title) notesParts.push(`Position: ${job_title}`);
  note = notesParts.join(' \\n');

  // Clean values
  vorname = trim_whitespace_begin_end(vorname);
  nachname = trim_whitespace_begin_end(nachname);
  firma = trim_whitespace_begin_end(firma);
  strasse = trim_whitespace_begin_end(strasse);
  ort = trim_whitespace_begin_end(ort);

  // Construct vCard String - Condition Based
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0"
  ];

  if (nachname || vorname) {
    lines.push(`N;CHARSET=utf-8:${nachname};${vorname}`);
    lines.push(`FN;CHARSET=utf-8:${vorname} ${nachname}`);
  }
  
  if (firma) lines.push(`ORG;CHARSET=utf-8:${firma}`);
  
  // Address logic
  if (strasse || ort || postleitzahl || land) {
      lines.push(`ADR;CHARSET=utf-8;TYPE=WORK:;;${strasse};${ort};;${postleitzahl};${land}`);
  }

  if (telefon) lines.push(`TEL;CHARSET=utf-8;TYPE=WORK,VOICE:${telefon}`);
  if (telefon_mobil) lines.push(`TEL;CHARSET=utf-8;TYPE=CELL:${telefon_mobil}`);
  if (fax) lines.push(`TEL;CHARSET=utf-8;TYPE=FAX:${fax}`);
  
  if (www) lines.push(`URL;CHARSET=utf-8;TYPE=WORK:${www}`);
  if (email) lines.push(`EMAIL;CHARSET=utf-8;TYPE=WORK,INTERNET:${email}`);
  if (note) lines.push(`NOTE;CHARSET=utf-8:${note}`);
  
  lines.push("END:VCARD");

  return lines.join('\n');
};